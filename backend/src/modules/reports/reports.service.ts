import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { Prisma, Report, ReportStatus } from '@prisma/client';

const reportInclude = {
  reporter: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
  tool: {
    select: { id: true, name: true, slug: true, logoUrl: true, status: true },
  },
  reviewer: {
    select: { id: true, name: true, username: true },
  },
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto, reporterId: string): Promise<Report> {
    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    return this.prisma.report.create({
      data: {
        reason: dto.reason,
        description: dto.description,
        toolId: dto.toolId,
        reporterId,
      },
      include: reportInclude,
    });
  }

  async findAll(query: ReportQueryDto): Promise<PaginatedResult<Report>> {
    const { cursor, take = 10, search, status, toolId, reporterId, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.ReportWhereInput = {};

    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (toolId) where.toolId = toolId;
    if (reporterId) where.reporterId = reporterId;

    const orderBy = { [sortBy]: sortOrder };

    const [total, reports] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.findMany({
        where,
        orderBy,
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: reportInclude,
      }),
    ]);

    const hasMore = reports.length > take;
    const data = hasMore ? reports.slice(0, take) : reports;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { cursor: nextCursor, hasMore, total } };
  }

  async findById(id: string): Promise<Report> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        ...reportInclude,
        tool: {
          select: {
            id: true, name: true, slug: true, logoUrl: true, tagline: true,
            websiteUrl: true, status: true, description: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    return report;
  }

  async updateStatus(id: string, dto: UpdateReportStatusDto, reviewerId: string): Promise<Report> {
    const report = await this.findById(id);

    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.DISMISSED) {
      throw new ForbiddenException('Cannot change status of a resolved or dismissed report');
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote !== undefined ? dto.reviewNote : report.reviewNote,
        reviewedBy: reviewerId,
        resolvedAt: [ReportStatus.RESOLVED, ReportStatus.DISMISSED].includes(dto.status) ? new Date() : null,
      },
      include: reportInclude,
    });
  }

  async addReviewNote(id: string, reviewNote: string, reviewerId: string): Promise<Report> {
    const report = await this.findById(id);

    return this.prisma.report.update({
      where: { id },
      data: {
        reviewNote,
        reviewedBy: reviewerId,
      },
      include: reportInclude,
    });
  }

  async getStats() {
    const [byStatus, total, resolvedToday] = await Promise.all([
      this.prisma.report.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.report.count(),
      this.prisma.report.count({
        where: {
          resolvedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total,
      resolvedToday,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
