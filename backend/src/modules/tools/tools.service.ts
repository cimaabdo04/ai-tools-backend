import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolQueryDto, ToolSortBy } from './dto/tool-query.dto';
import { ToolStatusDto } from './dto/tool-status.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { Prisma, Tool, ToolStatus } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';

const toolInclude = {
  toolCategories: {
    include: {
      category: {
        select: { id: true, name: true, slug: true, icon: true, color: true },
      },
    },
  },
  tags: {
    include: {
      tag: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  author: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
};

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ToolQueryDto): Promise<PaginatedResult<Tool>> {
    const {
      cursor,
      skip = 0,
      take = 10,
      search,
      category,
      tags,
      pricingType,
      status,
      featured,
      sponsored,
      verified,
      authorId,
      sortBy = ToolSortBy.RANK_SCORE,
      minRating,
    } = query;

    const where: Prisma.ToolWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tagline: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.toolCategories = {
        some: {
          category: { slug: category },
        },
      };
    }

    if (tags) {
      const tagSlugs = tags.split(',').map((t) => t.trim());
      where.tags = {
        some: {
          tag: {
            slug: { in: tagSlugs },
          },
        },
      };
    }

    if (pricingType) {
      where.pricingTypes = { contains: pricingType };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = ToolStatus.APPROVED;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (sponsored !== undefined) {
      where.isSponsored = sponsored;
    }

    if (verified !== undefined) {
      where.isVerified = verified;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (minRating !== undefined) {
      where.averageRating = { gte: minRating };
    }

    const orderBy = this.buildOrderBy(sortBy);

    const [total, tools] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.findMany({
        where,
        orderBy,
        skip,
        take: take + 1,
        ...(cursor && !skip ? { skip: 1, cursor: { id: cursor } } : {}),
        include: toolInclude,
      }),
    ]);

    const hasMore = tools.length > take;
    const data = hasMore ? tools.slice(0, take) : tools;
    const nextCursor = hasMore ? data[data.length - 1].id : null;
    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        cursor: nextCursor,
        hasMore,
        total,
        totalPages,
        page: skip / take + 1,
        perPage: take,
      },
    };
  }

  async findBySlug(slug: string): Promise<Tool> {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      include: {
        ...toolInclude,
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, username: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    await this.incrementView(tool.id);

    return tool;
  }

  async findById(id: string): Promise<Tool> {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        ...toolInclude,
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID "${id}" not found`);
    }

    return tool;
  }

  async create(dto: CreateToolDto, authorId: string): Promise<Tool> {
    const slug = await this.generateUniqueSlug(dto.name);

    const tool = await this.prisma.tool.create({
      data: {
        name: dto.name,
        slug,
        tagline: dto.tagline,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
        logoUrl: dto.logoUrl,
        screenshotUrl: dto.screenshotUrl,
        videoUrl: dto.videoUrl,
        pricingTypes: dto.pricingTypes ? JSON.stringify(dto.pricingTypes) : '[]',
        pricingMin: dto.pricingMin ?? undefined,
        pricingMax: dto.pricingMax ?? undefined,
        useCases: dto.useCases ?? [],
        platforms: dto.platforms ?? [],
        openSource: dto.openSource ?? false,
        githubUrl: dto.githubUrl,
        twitterUrl: dto.twitterUrl,
        discordUrl: dto.discordUrl,
        status: dto.status ?? ToolStatus.PENDING_REVIEW,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        features: dto.features ? JSON.stringify(dto.features) : '[]',
        arabicSupport: dto.arabicSupport,
        pros: dto.pros ? JSON.stringify(dto.pros) : '[]',
        cons: dto.cons ? JSON.stringify(dto.cons) : '[]',
      badge: dto.badge,
      highlight: dto.highlight,
      stats: dto.stats ?? '{}',
        models: dto.models ?? '[]',
        gallery: dto.gallery ?? '[]',
        country: dto.country,
        version: dto.version,
        releases: dto.releases ?? '[]',
        useCases: dto.useCases ? JSON.stringify(dto.useCases) : '[]',
        platforms: dto.platforms ? JSON.stringify(dto.platforms) : '[]',
        pricingDetails: dto.pricingDetails ?? '{}',
        alternativesText: dto.alternativesText,
        alternativeSlugs: dto.alternativeSlugs ?? '[]',
        startSteps: dto.startSteps ?? '[]',
        conclusion: dto.conclusion,
        authorId,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
        toolCategories: dto.categoryIds?.length
          ? {
              create: dto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
      },
      include: toolInclude,
    });

    if (dto.categoryIds?.length) {
      for (const catId of dto.categoryIds) {
        await this.updateCategoryToolCount(catId);
      }
    }

    return tool;
  }

  async update(id: string, dto: UpdateToolDto): Promise<Tool> {
    const existing = await this.findById(id);

    const data: Prisma.ToolUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
      if (dto.name !== existing.name) {
        data.slug = await this.generateUniqueSlug(dto.name);
      }
    }
    if (dto.tagline !== undefined) data.tagline = dto.tagline;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.websiteUrl !== undefined) data.websiteUrl = dto.websiteUrl;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.screenshotUrl !== undefined) data.screenshotUrl = dto.screenshotUrl;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.pricingTypes !== undefined) data.pricingTypes = JSON.stringify(dto.pricingTypes);
    if (dto.pricingMin !== undefined) data.pricingMin = dto.pricingMin;
    if (dto.pricingMax !== undefined) data.pricingMax = dto.pricingMax;
    if (dto.features !== undefined) data.features = JSON.stringify(dto.features);
    if (dto.useCases !== undefined) data.useCases = dto.useCases;
    if (dto.platforms !== undefined) data.platforms = dto.platforms;
    if (dto.openSource !== undefined) data.openSource = dto.openSource;
    if (dto.githubUrl !== undefined) data.githubUrl = dto.githubUrl;
    if (dto.twitterUrl !== undefined) data.twitterUrl = dto.twitterUrl;
    if (dto.discordUrl !== undefined) data.discordUrl = dto.discordUrl;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;
    if (dto.arabicSupport !== undefined) data.arabicSupport = dto.arabicSupport;
    if (dto.pros !== undefined) data.pros = JSON.stringify(dto.pros);
    if (dto.cons !== undefined) data.cons = JSON.stringify(dto.cons);
    if (dto.badge !== undefined) data.badge = dto.badge;
    if (dto.highlight !== undefined) data.highlight = dto.highlight;
    if (dto.stats !== undefined) data.stats = dto.stats;
    if (dto.models !== undefined) data.models = dto.models;
    if (dto.gallery !== undefined) data.gallery = dto.gallery;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.version !== undefined) data.version = dto.version;
    if (dto.releases !== undefined) data.releases = dto.releases;
    if (dto.pricingDetails !== undefined) data.pricingDetails = dto.pricingDetails;
    if (dto.alternativesText !== undefined) data.alternativesText = dto.alternativesText;
    if (dto.alternativeSlugs !== undefined) data.alternativeSlugs = dto.alternativeSlugs;
    if (dto.startSteps !== undefined) data.startSteps = dto.startSteps;
    if (dto.conclusion !== undefined) data.conclusion = dto.conclusion;

    if (dto.categoryIds !== undefined) {
      const oldCategories = await this.prisma.toolCategory.findMany({
        where: { toolId: id },
        select: { categoryId: true },
      });
      const oldCatIds = oldCategories.map((c) => c.categoryId);

      await this.prisma.toolCategory.deleteMany({ where: { toolId: id } });
      data.toolCategories = dto.categoryIds.length
        ? {
            create: dto.categoryIds.map((categoryId) => ({
              categoryId,
            })),
          }
        : undefined;

      for (const catId of [...new Set([...oldCatIds, ...dto.categoryIds])]) {
        await this.updateCategoryToolCount(catId);
      }
    }

    if (dto.tagIds !== undefined) {
      await this.prisma.toolTag.deleteMany({ where: { toolId: id } });
      data.tags = dto.tagIds.length
        ? {
            create: dto.tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined;
    }

    const tool = await this.prisma.tool.update({
      where: { id },
      data,
      include: toolInclude,
    });

    return tool;
  }

  async remove(id: string): Promise<void> {
    const tool = await this.findById(id);

    const categories = await this.prisma.toolCategory.findMany({
      where: { toolId: id },
      select: { categoryId: true },
    });

    await this.prisma.tool.delete({ where: { id } });

    for (const { categoryId } of categories) {
      await this.updateCategoryToolCount(categoryId);
    }
  }

  async updateStatus(id: string, dto: ToolStatusDto): Promise<Tool> {
    const tool = await this.findById(id);

    const updated = await this.prisma.tool.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === ToolStatus.APPROVED && !tool.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
      include: toolInclude,
    });

    return updated;
  }

  async toggleFeatured(id: string): Promise<Tool> {
    const tool = await this.findById(id);

    const updated = await this.prisma.tool.update({
      where: { id },
      data: { isFeatured: !tool.isFeatured },
      include: toolInclude,
    });

    return updated;
  }

  async getFeatured(query: ToolQueryDto): Promise<PaginatedResult<Tool>> {
    return this.findAll({ ...query, featured: true, sortBy: ToolSortBy.RANK_SCORE });
  }

  async getSponsored(query: ToolQueryDto): Promise<PaginatedResult<Tool>> {
    return this.findAll({ ...query, sponsored: true, sortBy: ToolSortBy.RANK_SCORE });
  }

  async getLatest(query: ToolQueryDto): Promise<PaginatedResult<Tool>> {
    return this.findAll({ ...query, sortBy: ToolSortBy.NEWEST });
  }

  async getTrending(take: number = 10): Promise<Tool[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tools = await this.prisma.tool.findMany({
      where: {
        status: ToolStatus.APPROVED,
        publishedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { viewCount: 'desc' },
      take: Math.min(take, 50),
      include: toolInclude,
    });

    return tools;
  }

  async getAnalytics(id: string) {
    await this.findById(id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalViews,
      totalClicks,
      recentViews,
      recentClicks,
      dailyViews,
      referrers,
    ] = await Promise.all([
      this.prisma.analyticEvent.count({
        where: { toolId: id, eventType: 'view' },
      }),
      this.prisma.analyticEvent.count({
        where: { toolId: id, eventType: 'click' },
      }),
      this.prisma.analyticEvent.count({
        where: { toolId: id, eventType: 'view', timestamp: { gte: sevenDaysAgo } },
      }),
      this.prisma.analyticEvent.count({
        where: { toolId: id, eventType: 'click', timestamp: { gte: sevenDaysAgo } },
      }),
      this.prisma.$queryRaw`
        SELECT DATE("timestamp") as date, COUNT(*)::int as count
        FROM analytic_events
        WHERE "toolId" = ${id}::uuid AND "eventType" = 'view' AND "timestamp" >= ${thirtyDaysAgo}
        GROUP BY DATE("timestamp")
        ORDER BY date ASC
      `,
      this.prisma.$queryRaw`
        SELECT "referrer", COUNT(*)::int as count
        FROM analytic_events
        WHERE "toolId" = ${id}::uuid AND "eventType" = 'click' AND "referrer" IS NOT NULL
        GROUP BY "referrer"
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    return {
      totalViews,
      totalClicks,
      recentViews,
      recentClicks: recentClicks,
      dailyViews: dailyViews || [],
      topReferrers: referrers || [],
      engagementRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
    };
  }

  async recordClick(id: string, metadata?: { sessionId?: string; ipAddress?: string; userAgent?: string; referrer?: string }): Promise<void> {
    const tool = await this.prisma.tool.findUnique({ where: { id } });
    if (!tool) throw new NotFoundException(`Tool with ID "${id}" not found`);

    await Promise.all([
      this.prisma.tool.update({
        where: { id },
        data: { clickCount: { increment: 1 } },
      }),
      this.prisma.analyticEvent.create({
        data: {
          eventType: 'click',
          toolId: id,
          sessionId: metadata?.sessionId,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          referrer: metadata?.referrer,
        },
      }),
    ]);
  }

  async getComparisonData(slug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    return {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      description: tool.description,
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingTypes: tool.pricingTypes,
      pricingMin: tool.pricingMin?.toNumber(),
      pricingMax: tool.pricingMax?.toNumber(),
      categories: (tool as any).toolCategories?.map((tc: any) => tc.category) || [],
      tags: (tool as any).tags?.map((tt: any) => tt.tag) || [],
      features: tool.features,
      platforms: tool.platforms,
      useCases: tool.useCases,
      openSource: tool.openSource,
      averageRating: tool.averageRating?.toNumber(),
      reviewCount: tool.reviewCount,
      viewCount: tool.viewCount,
      clickCount: tool.clickCount,
      bookmarkCount: tool.bookmarkCount,
    };
  }

  async getSuggestions(query: string, limit: number = 8): Promise<{ name: string; slug: string; logoUrl: string | null; tagline: string }[]> {
    if (!query || query.length < 2) return [];

    const tools = await this.prisma.tool.findMany({
      where: {
        status: ToolStatus.APPROVED,
        OR: [
          { name: { contains: query } },
          { tagline: { contains: query } },
        ],
      },
      select: {
        name: true,
        slug: true,
        logoUrl: true,
        tagline: true,
        rankScore: true,
      },
      orderBy: { rankScore: 'desc' },
      take: limit,
    });

    return tools;
  }

  private async incrementView(id: string): Promise<void> {
    await this.prisma.tool
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => this.logger.error(`Failed to increment view for tool ${id}: ${err.message}`));
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true, trim: true });
    if (!slug) slug = uuid();

    const existing = await this.prisma.tool.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${uuid().slice(0, 8)}`;
    }

    return slug;
  }

  private async updateCategoryToolCount(categoryId: string): Promise<void> {
    const count = await this.prisma.tool.count({
      where: {
        status: ToolStatus.APPROVED,
        toolCategories: { some: { categoryId } },
      },
    });

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { toolCount: count },
    });
  }

  async findFaqs(toolId: string) {
    return this.prisma.toolFAQ.findMany({
      where: { toolId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createFaq(toolId: string, data: { question: string; answer: string; sortOrder?: number }) {
    return this.prisma.toolFAQ.create({
      data: {
        toolId,
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateFaq(faqId: string, data: { question?: string; answer?: string; sortOrder?: number }) {
    const faq = await this.prisma.toolFAQ.findUnique({ where: { id: faqId } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return this.prisma.toolFAQ.update({
      where: { id: faqId },
      data,
    });
  }

  async deleteFaq(faqId: string) {
    const faq = await this.prisma.toolFAQ.findUnique({ where: { id: faqId } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return this.prisma.toolFAQ.delete({ where: { id: faqId } });
  }

  async recordFeedback(toolId: string, type: 'helpful' | 'notHelpful') {
    const field = type === 'helpful' ? 'helpfulCount' : 'notHelpfulCount';
    return this.prisma.tool.update({
      where: { id: toolId },
      data: { [field]: { increment: 1 } },
      select: { helpfulCount: true, notHelpfulCount: true },
    });
  }

  private buildOrderBy(sortBy: ToolSortBy): Prisma.ToolOrderByWithRelationInput | Prisma.ToolOrderByWithRelationInput[] {
    switch (sortBy) {
      case ToolSortBy.RATING:
        return { averageRating: 'desc' };
      case ToolSortBy.VIEWS:
        return { viewCount: 'desc' };
      case ToolSortBy.NEWEST:
        return { publishedAt: 'desc' };
      case ToolSortBy.OLDEST:
        return { publishedAt: 'asc' };
      case ToolSortBy.NAME:
        return { name: 'asc' };
      case ToolSortBy.REVIEW_COUNT:
        return { reviewCount: 'desc' };
      case ToolSortBy.BOOKMARK_COUNT:
        return { bookmarkCount: 'desc' };
      case ToolSortBy.RANK_SCORE:
      default:
        return [{ isSponsored: 'desc' }, { rankScore: 'desc' }];
    }
  }
}
