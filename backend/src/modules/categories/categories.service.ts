import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, ToolStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = includeInactive ? {} : { isActive: true };

    return this.prisma.category.findMany({
      where,
      include: {
        tags: {
          select: { id: true, name: true, slug: true },
          where: { isActive: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, toolCount: true, icon: true },
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          select: { id: true, name: true, slug: true },
          where: { isActive: true },
        },
        _count: {
          select: { toolCategories: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: { id: true, name: true, slug: true, toolCount: true, icon: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    const slug = slugify(dto.name, { lower: true, strict: true, trim: true }) || uuid();

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.category.findUnique({ where: { name: dto.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;

    if (dto.parentId !== undefined) {
      data.parent = dto.parentId
        ? { connect: { id: dto.parentId } }
        : { disconnect: true };
    }

    if (dto.name && dto.name !== category.name) {
      data.slug = slugify(dto.name, { lower: true, strict: true, trim: true }) || uuid();
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.toolCategory.deleteMany({
      where: { categoryId: id },
    });

    await this.prisma.category.delete({ where: { id } });
  }

  async getToolsByCategorySlug(
    slug: string,
    options: { cursor?: string; take?: number; search?: string } = {},
  ) {
    const category = await this.findBySlug(slug);
    const { cursor, take = 10, search } = options;

    const where: Prisma.ToolWhereInput = {
      toolCategories: { some: { categoryId: category.id } },
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
            include: { category: { select: { id: true, name: true, slug: true, icon: true } } },
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
      category,
      tools: data,
      meta: { cursor: nextCursor, hasMore, total },
    };
  }
}
