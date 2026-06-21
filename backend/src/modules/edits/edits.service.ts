import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateEditDto } from './dto/create-edit.dto';
import { ReviewEditDto } from './dto/review-edit.dto';
import { Prisma, PendingEdit, EditStatus } from '@prisma/client';

const editInclude = {
  user: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
  tool: {
    select: { id: true, name: true, slug: true, logoUrl: true },
  },
  reviewer: {
    select: { id: true, name: true, username: true },
  },
};

@Injectable()
export class EditsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEditDto, userId: string): Promise<PendingEdit> {
    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    if (!dto.changes || typeof dto.changes !== 'object' || Object.keys(dto.changes).length === 0) {
      throw new BadRequestException('Changes must be a non-empty object');
    }

    return this.prisma.pendingEdit.create({
      data: {
        toolId: dto.toolId,
        userId,
        changes: dto.changes,
      },
      include: editInclude,
    });
  }

  async findUserEdits(userId: string): Promise<PendingEdit[]> {
    return this.prisma.pendingEdit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: editInclude,
    });
  }

  async findPending(query: {
    cursor?: string;
    take?: number;
    search?: string;
    toolId?: string;
  }): Promise<{ data: PendingEdit[]; meta: { cursor: string | null; hasMore: boolean; total: number } }> {
    const { cursor, take = 10, search, toolId } = query;

    const where: Prisma.PendingEditWhereInput = {
      status: EditStatus.PENDING,
    };

    if (search) {
      where.tool = { name: { contains: search } };
    }

    if (toolId) where.toolId = toolId;

    const [total, edits] = await Promise.all([
      this.prisma.pendingEdit.count({ where }),
      this.prisma.pendingEdit.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: editInclude,
      }),
    ]);

    const hasMore = edits.length > take;
    const data = hasMore ? edits.slice(0, take) : edits;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { cursor: nextCursor, hasMore, total } };
  }

  async findById(id: string): Promise<PendingEdit> {
    const edit = await this.prisma.pendingEdit.findUnique({
      where: { id },
      include: editInclude,
    });

    if (!edit) {
      throw new NotFoundException(`Pending edit with ID "${id}" not found`);
    }

    return edit;
  }

  async approve(id: string, dto: ReviewEditDto, reviewerId: string): Promise<PendingEdit> {
    const edit = await this.findById(id);

    if (edit.status !== EditStatus.PENDING) {
      throw new BadRequestException(`Cannot approve an edit with status "${edit.status}"`);
    }

    const changes = edit.changes as Record<string, unknown>;

    return this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};

      if ('categoryId' in changes || 'categoryIds' in changes) {
        const newIds: string[] = changes['categoryIds']
          ? (changes['categoryIds'] as string[])
          : changes['categoryId']
            ? [changes['categoryId'] as string]
            : (await tx.toolCategory.findMany({
                where: { toolId: edit.toolId },
                select: { categoryId: true },
              })).map((tc) => tc.categoryId);

        await tx.toolCategory.deleteMany({ where: { toolId: edit.toolId } });
        for (const catId of newIds) {
          await tx.toolCategory.create({
            data: { toolId: edit.toolId, categoryId: catId },
          });
        }
      }

      for (const [key, value] of Object.entries(changes)) {
        if (key === 'categoryId' || key === 'categoryIds') continue;
        updateData[key] = value;
      }

      await tx.tool.update({
        where: { id: edit.toolId },
        data: updateData,
      });

      return tx.pendingEdit.update({
        where: { id },
        data: {
          status: EditStatus.APPROVED,
          reviewNote: dto.reviewNote,
          reviewedBy: reviewerId,
          decidedAt: new Date(),
        },
        include: editInclude,
      });
    });
  }

  async reject(id: string, dto: ReviewEditDto, reviewerId: string): Promise<PendingEdit> {
    const edit = await this.findById(id);

    if (edit.status !== EditStatus.PENDING) {
      throw new BadRequestException(`Cannot reject an edit with status "${edit.status}"`);
    }

    return this.prisma.pendingEdit.update({
      where: { id },
      data: {
        status: EditStatus.REJECTED,
        reviewNote: dto.reviewNote,
        reviewedBy: reviewerId,
        decidedAt: new Date(),
      },
      include: editInclude,
    });
  }
}
