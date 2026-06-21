import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ToolStatus, Prisma } from '@prisma/client';

export interface SearchQuery {
  query: string;
  cursor?: string;
  take?: number;
  category?: string;
  tags?: string;
  pricingType?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'views' | 'newest';
}

export interface SearchSuggestion {
  text: string;
  type: 'tool' | 'category' | 'tag';
  slug: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(params: SearchQuery) {
    const { query, cursor, take = 10, category, tags, pricingType, minRating, sortBy = 'relevance' } = params;

    if (!query || query.length < 2) {
      return { data: [], meta: { cursor: null, hasMore: false, total: 0 } };
    }

    const sanitizedQuery = query.replace(/[^\w\s-]/g, '').trim();
    if (!sanitizedQuery) {
      return { data: [], meta: { cursor: null, hasMore: false, total: 0 } };
    }

    const where: Prisma.ToolWhereInput = {
      status: ToolStatus.APPROVED,
      OR: [
        { name: { contains: sanitizedQuery } },
        { tagline: { contains: sanitizedQuery } },
        { description: { contains: sanitizedQuery } },
      ],
    };

    if (category) {
      where.toolCategories = { some: { category: { slug: category } } };
    }

    if (tags) {
      const tagSlugs = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagSlugs.length > 0) {
        where.tags = {
          some: { tag: { slug: { in: tagSlugs } } },
        };
      }
    }

    if (pricingType) {
      where.pricingTypes = { contains: `"${pricingType}"` };
    }

    if (minRating !== undefined) {
      where.averageRating = { gte: minRating };
    }

    let orderBy: Prisma.ToolOrderByWithRelationInput;
    switch (sortBy) {
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = { rankScore: 'desc' };
        break;
    }

    const takeNum = Math.min(take, 50);

    const [total, tools] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.findMany({
        where,
        orderBy,
        take: takeNum + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: {
          id: true, name: true, slug: true, tagline: true, description: true,
          logoUrl: true, pricingTypes: true, pricingMin: true, pricingMax: true,
          averageRating: true, reviewCount: true, viewCount: true, clickCount: true,
          isFeatured: true, isSponsored: true, isVerified: true,
          publishedAt: true, createdAt: true,
          toolCategories: {
            select: {
              category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            },
          },
          tags: {
            select: { tag: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
    ]);

    const hasMore = tools.length > takeNum;
    const data = hasMore ? tools.slice(0, takeNum) : tools;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        tagline: t.tagline,
        description: t.description?.length > 300 ? t.description.substring(0, 300) + '...' : t.description,
        logoUrl: t.logoUrl,
        pricingTypes: t.pricingTypes,
        pricingMin: t.pricingMin ? Number(t.pricingMin) : null,
        pricingMax: t.pricingMax ? Number(t.pricingMax) : null,
        averageRating: t.averageRating ? Number(t.averageRating) : 0,
        reviewCount: t.reviewCount,
        viewCount: t.viewCount,
        clickCount: t.clickCount,
        isFeatured: t.isFeatured,
        isSponsored: t.isSponsored,
        isVerified: t.isVerified,
        categories: t.toolCategories?.map((tc) => tc.category) || [],
        tags: t.tags?.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, slug: tt.tag.slug })) || [],
        publishedAt: t.publishedAt,
      })),
      meta: { cursor: nextCursor, hasMore, total },
    };
  }

  async getSuggestions(query: string, limit: number = 6): Promise<SearchSuggestion[]> {
    if (!query || query.length < 1) return [];

    const sanitized = query.replace(/[^\w\s-]/g, '').trim();
    if (!sanitized) return [];

    const [toolResults, categoryResults, tagResults] = await Promise.all([
      this.prisma.tool.findMany({
        where: {
          status: ToolStatus.APPROVED,
          name: { contains: sanitized },
        },
        select: { name: true, slug: true },
        orderBy: { rankScore: 'desc' },
        take: 4,
      }),
      this.prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: sanitized },
        },
        select: { name: true, slug: true },
        orderBy: { toolCount: 'desc' },
        take: 3,
      }),
      this.prisma.tag.findMany({
        where: {
          isActive: true,
          name: { contains: sanitized },
        },
        select: { name: true, slug: true },
        orderBy: { toolCount: 'desc' },
        take: 3,
      }),
    ]);

    const suggestions: SearchSuggestion[] = [
      ...toolResults.map((t) => ({ text: t.name, type: 'tool', slug: t.slug })),
      ...categoryResults.map((c) => ({ text: c.name, type: 'category', slug: c.slug })),
      ...tagResults.map((t) => ({ text: t.name, type: 'tag', slug: t.slug })),
    ];

    return suggestions.slice(0, limit);
  }

  async reindex(): Promise<{ indexed: number }> {
    this.logger.log('Starting search reindex...');

    const result = await this.prisma.$executeRawUnsafe(`
      UPDATE tools SET "rankScore" = (
        COALESCE("averageRating", 0) * 0.4 +
        LEAST(LOG(2, COALESCE("viewCount", 0) + 1), 10) * 0.3 +
        LEAST(LOG(2, COALESCE("clickCount", 0) + 1), 5) * 0.15 +
        LEAST(COALESCE("reviewCount", 0) * 0.5, 5) * 0.1 +
        CASE WHEN "isFeatured" THEN 5 ELSE 0 END * 0.05
      )
    `);

    this.logger.log(`Search reindex complete: ${result} tools updated`);
    return { indexed: result ?? 0 };
  }

  private formatToolResult(tool: any) {
    return tool; // now formatted inline in search()
  }
}
