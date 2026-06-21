import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddToolDto } from './dto/add-tool.dto';
import { Collection, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';

const collectionInclude = {
  user: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
  _count: {
    select: { tools: true },
  },
} as const;

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where: Prisma.CollectionWhereInput = userId
      ? { OR: [{ isPublic: true }, { userId }] }
      : { isPublic: true };

    const collections = await this.prisma.collection.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: collectionInclude,
    });

    return { data: collections };
  }

  async findBySlug(slug: string, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      include: {
        ...collectionInclude,
        tools: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tool: {
              select: {
                id: true,
                name: true,
                slug: true,
                tagline: true,
                logoUrl: true,
                pricingTypes: true,
                pricingMin: true,
                averageRating: true,
                reviewCount: true,
                toolCategories: {
                  include: {
                    category: {
                      select: { id: true, name: true, slug: true, icon: true },
                    },
                  },
                },
                tags: {
                  include: {
                    tag: { select: { id: true, name: true, slug: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with slug "${slug}" not found`);
    }

    if (!collection.isPublic && collection.userId !== userId) {
      throw new ForbiddenException('This collection is private');
    }

    return { data: collection };
  }

  async create(dto: CreateCollectionDto, userId: string): Promise<Collection> {
    const slug = await this.generateUniqueSlug(dto.name);

    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        coverUrl: dto.coverUrl,
        userId,
      },
      include: collectionInclude,
    });

    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto, userId: string): Promise<Collection> {
    const collection = await this.findById(id);

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only update your own collections');
    }

    const data: Prisma.CollectionUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
      if (dto.name !== collection.name) {
        data.slug = await this.generateUniqueSlug(dto.name);
      }
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic;
    if (dto.coverUrl !== undefined) data.coverUrl = dto.coverUrl;

    return this.prisma.collection.update({
      where: { id },
      data,
      include: collectionInclude,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const collection = await this.findById(id);

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only delete your own collections');
    }

    await this.prisma.collection.delete({ where: { id } });
  }

  async addTool(id: string, dto: AddToolDto, userId: string) {
    const collection = await this.findById(id);

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only modify your own collections');
    }

    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    const existing = await this.prisma.collectionTool.findUnique({
      where: { collectionId_toolId: { collectionId: id, toolId: dto.toolId } },
    });

    if (existing) {
      throw new ConflictException('Tool is already in this collection');
    }

    const maxSortOrder = await this.prisma.collectionTool.aggregate({
      where: { collectionId: id },
      _max: { sortOrder: true },
    });

    const sortOrder = dto.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1;

    await this.prisma.collectionTool.create({
      data: {
        collectionId: id,
        toolId: dto.toolId,
        sortOrder,
      },
    });

    return this.findBySlug(collection.slug, userId);
  }

  async removeTool(id: string, toolId: string, userId: string) {
    const collection = await this.findById(id);

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only modify your own collections');
    }

    const entry = await this.prisma.collectionTool.findUnique({
      where: { collectionId_toolId: { collectionId: id, toolId } },
    });

    if (!entry) {
      throw new NotFoundException('Tool not found in this collection');
    }

    await this.prisma.collectionTool.delete({
      where: { collectionId_toolId: { collectionId: id, toolId } },
    });

    return this.findBySlug(collection.slug, userId);
  }

  async reorderTools(
    id: string,
    toolOrder: { toolId: string; sortOrder: number }[],
    userId: string,
  ) {
    const collection = await this.findById(id);

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only modify your own collections');
    }

    await Promise.all(
      toolOrder.map(({ toolId, sortOrder }) =>
        this.prisma.collectionTool.updateMany({
          where: { collectionId: id, toolId },
          data: { sortOrder },
        }),
      ),
    );

    return this.findBySlug(collection.slug, userId);
  }

  async findById(id: string): Promise<Collection> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: collectionInclude,
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID "${id}" not found`);
    }

    return collection;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true, trim: true });
    if (!slug) slug = uuid().slice(0, 8);

    const existing = await this.prisma.collection.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${uuid().slice(0, 8)}`;
    }

    return slug;
  }
}
