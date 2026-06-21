import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { Bookmark } from '@prisma/client';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByUser(
    userId: string,
    options: { cursor?: string; take?: number } = {},
  ) {
    const { cursor, take = 20 } = options;

    const where = { userId };

    const [total, bookmarks] = await Promise.all([
      this.prisma.bookmark.count({ where }),
      this.prisma.bookmark.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              slug: true,
              tagline: true,
              logoUrl: true,
              pricingType: true,
              averageRating: true,
              reviewCount: true,
            },
          },
        },
      }),
    ]);

    const hasMore = bookmarks.length > take;
    const data = hasMore ? bookmarks.slice(0, take) : bookmarks;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      meta: { cursor: nextCursor, hasMore, total },
    };
  }

  async create(dto: CreateBookmarkDto, userId: string): Promise<Bookmark> {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_toolId: { userId, toolId: dto.toolId } },
    });

    if (existing) {
      throw new ConflictException('Tool is already bookmarked');
    }

    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        toolId: dto.toolId,
        note: dto.note,
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            tagline: true,
          },
        },
      },
    });

    await this.prisma.tool.update({
      where: { id: dto.toolId },
      data: { bookmarkCount: { increment: 1 } },
    });

    return bookmark;
  }

  async remove(toolId: string, userId: string): Promise<void> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_toolId: { userId, toolId } },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { userId_toolId: { userId, toolId } },
    });

    await this.prisma.tool.update({
      where: { id: toolId },
      data: { bookmarkCount: { decrement: 1 } },
    });
  }

  async check(toolId: string, userId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_toolId: { userId, toolId } },
    });
    return {
      bookmarked: !!bookmark,
      bookmarkId: bookmark?.id ?? null,
    };
  }

  async updateNote(
    toolId: string,
    dto: UpdateBookmarkDto,
    userId: string,
  ): Promise<Bookmark> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_toolId: { userId, toolId } },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.prisma.bookmark.update({
      where: { userId_toolId: { userId, toolId } },
      data: { note: dto.note },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });
  }
}
