import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findConversations(userId: string) {
    const sentMessages = await this.prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map<
      string,
      {
        user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
        lastMessage: Message;
        unreadCount: number;
        messages: Message[];
      }
    >();

    for (const msg of receivedMessages) {
      const otherUserId = msg.sender.id;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: msg.sender,
          lastMessage: msg,
          unreadCount: msg.isRead ? 0 : 1,
          messages: [],
        });
      } else {
        const conv = conversationMap.get(otherUserId)!;
        if (!msg.isRead) conv.unreadCount++;
        if (msg.createdAt > conv.lastMessage.createdAt) {
          conv.lastMessage = msg;
        }
      }
    }

    for (const msg of sentMessages) {
      const otherUserId = msg.receiver.id;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: msg.receiver,
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        });
      } else {
        const conv = conversationMap.get(otherUserId)!;
        if (msg.createdAt > conv.lastMessage.createdAt) {
          conv.lastMessage = msg;
        }
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
    );
  }

  async findConversation(
    userId: string,
    otherUserId: string,
    params: { cursor?: string; take?: number },
  ): Promise<{ data: Message[]; meta: { cursor: string | null; hasMore: boolean } }> {
    const { cursor, take = 50 } = params;

    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });

    const hasMore = messages.length > take;
    const data = hasMore ? messages.slice(0, take) : messages;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.reverse(),
      meta: { cursor: nextCursor, hasMore },
    };
  }

  async sendMessage(dto: CreateMessageDto, senderId: string): Promise<Message> {
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`User with ID "${dto.receiverId}" not found`);
    }

    if (senderId === dto.receiverId) {
      throw new ForbiddenException('Cannot send a message to yourself');
    }

    return this.prisma.message.create({
      data: {
        subject: dto.subject,
        content: dto.content,
        senderId,
        receiverId: dto.receiverId,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.prisma.message.delete({ where: { id } });
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({
      where: { id, receiverId: userId },
    });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found or not addressed to you`);
    }

    return this.prisma.message.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    return { count };
  }
}
