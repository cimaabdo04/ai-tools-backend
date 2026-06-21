import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { Prisma, AuditLog } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AuditQueryDto): Promise<{ data: AuditLog[]; meta: { cursor: string | null; hasMore: boolean; total: number } }> {
    const {
      cursor, take = 10, search, action, entity, entityId,
      userId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc',
    } = query;

    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
      ];
    }

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy = { [sortBy]: sortOrder };

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
          user: {
            select: { id: true, name: true, username: true, email: true },
          },
        },
      }),
    ]);

    const hasMore = logs.length > take;
    const data = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { cursor: nextCursor, hasMore, total } };
  }

  async findById(id: string): Promise<AuditLog> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
    });

    if (!log) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Audit log with ID "${id}" not found`);
    }

    return log;
  }

  async exportCsv(query: AuditQueryDto): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      where: this.buildWhere(query),
      orderBy: { createdAt: 'desc' },
      take: 10000,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const header = 'ID,Action,Entity,Entity ID,User,User Email,IP Address,Timestamp';
    const rows = logs.map((log) =>
      [
        log.id,
        log.action,
        log.entity,
        log.entityId || '',
        log.user?.name || '',
        log.user?.email || '',
        log.ipAddress || '',
        log.createdAt.toISOString(),
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(','),
    );

    return [header, ...rows].join('\n');
  }

  async getStats(): Promise<{
    total: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    recentActivity: { date: string; count: number }[];
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [byAction, byEntity, total, recentActivity] = await Promise.all([
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.auditLog.count(),
      this.prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM audit_logs
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return {
      total,
      byAction: byAction.reduce((acc, curr) => {
        acc[curr.action] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      byEntity: byEntity.reduce((acc, curr) => {
        acc[curr.entity] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentActivity.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };
  }

  private buildWhere(query: AuditQueryDto): Prisma.AuditLogWhereInput {
    const {
      action, entity, entityId, userId, startDate, endDate, search,
    } = query;

    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
      ];
    }

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return where;
  }
}
