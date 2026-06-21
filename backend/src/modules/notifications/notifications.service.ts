import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateNotificationDto, BulkCreateNotificationDto } from './dto/create-notification.dto';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    params: {
      cursor?: string;
      take?: number;
      unreadOnly?: boolean;
      type?: string;
    },
  ): Promise<{ data: Notification[]; meta: { cursor: string | null; hasMore: boolean; total: number; unreadCount: number } }> {
    const { cursor, take = 20, unreadOnly, type } = params;

    const where: Prisma.NotificationWhereInput = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type as any;

    const [total, unreadCount, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      }),
    ]);

    const hasMore = notifications.length > take;
    const data = hasMore ? notifications.slice(0, take) : notifications;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      meta: { cursor: nextCursor, hasMore, total, unreadCount },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { count: result.count };
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    await this.prisma.notification.delete({ where: { id } });
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data ?? Prisma.JsonNull,
        userId: dto.userId,
      },
    });
  }

  async bulkCreate(dto: BulkCreateNotificationDto): Promise<{ count: number }> {
    const { userIds, type, title, message, data } = dto;

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        type,
        title,
        message,
        data: data ?? Prisma.JsonNull,
        userId,
      })),
    });

    return { count: userIds.length };
  }

  async updateSettings(userId: string, settings: Record<string, unknown>): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...(await this.getCurrentMetadata(userId)),
          notificationSettings: settings,
        },
      },
    });
    return { message: 'Notification settings updated successfully' };
  }

  async getSettings(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true },
    });
    return ((user?.metadata as any)?.notificationSettings as Record<string, unknown>) ?? {};
  }

  private async getCurrentMetadata(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true },
    });
    return (user?.metadata as Record<string, unknown>) ?? {};
  }
}
