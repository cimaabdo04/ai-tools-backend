import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag, ToolStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<Tag[]> {
    const where: Prisma.TagWhereInput = includeInactive ? {} : { isActive: true };

    return this.prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.prisma.tag.findFirst({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return tag;
  }

  async findById(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const where: Prisma.TagWhereInput = { name: dto.name };
    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    const existing = await this.prisma.tag.findFirst({ where });
    if (existing) {
      throw new ConflictException(
        dto.categoryId
          ? `Tag "${dto.name}" already exists in this category`
          : `Tag "${dto.name}" already exists`,
      );
    }

    const slug = slugify(dto.name, { lower: true, strict: true, trim: true }) || uuid();

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);

    if (dto.name && dto.name !== tag.name) {
      const where: Prisma.TagWhereInput = { name: dto.name };
      if (dto.categoryId ?? tag.categoryId) {
        where.categoryId = dto.categoryId ?? tag.categoryId!;
      }
      const existing = await this.prisma.tag.findFirst({ where });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Tag "${dto.name}" already exists`);
      }
    }

    const data: Prisma.TagUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = slugify(dto.name, { lower: true, strict: true, trim: true }) || uuid();
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    return this.prisma.tag.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.toolTag.deleteMany({ where: { tagId: id } });
    await this.prisma.tag.delete({ where: { id } });
  }

  async getToolsByTagSlug(
    slug: string,
    options: { cursor?: string; take?: number; search?: string } = {},
  ) {
    const tag = await this.prisma.tag.findFirst({
      where: { slug },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    const { cursor, take = 10, search } = options;

    const where: Prisma.ToolWhereInput = {
      tags: { some: { tagId: tag.id } },
      status: ToolStatus.APPROVED,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tagline: { contains: search } },
      ];
    }

    const [total, tools] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.findMany({
        where,
        orderBy: { rankScore: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
          toolCategories: {
            include: {
              category: { select: { id: true, name: true, slug: true, icon: true } },
            },
          },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } },
          },
          author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        },
      }),
    ]);

    const hasMore = tools.length > take;
    const data = hasMore ? tools.slice(0, take) : tools;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      tag,
      tools: data,
      meta: { cursor: nextCursor, hasMore, total },
    };
  }
}
