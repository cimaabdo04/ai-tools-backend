import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ToolStatus, Prisma } from '@prisma/client';

interface ToolWithScore {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string | null;
  averageRating: number;
  reviewCount: number;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; icon: string | null } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  score: number;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async forTool(toolId: string, take: number = 6) {
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        tags: { select: { tagId: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!tool) {
      return { data: [] };
    }

    const tagIds = tool.tags.map((t) => t.tagId);
    const categoryId = tool.categoryId;

    const similarTools = await this.prisma.$queryRaw<any[]>`
      WITH tool_scores AS (
        SELECT
          t.id,
          t.name,
          t.slug,
          t.tagline,
          t."logoUrl",
          t."averageRating",
          t."reviewCount",
          t."categoryId",
          t."rankScore",
          (
            CASE WHEN t."categoryId" = ${categoryId}::uuid THEN 3 ELSE 0 END
            +
            COALESCE((
              SELECT COUNT(*)::int * 2
              FROM tool_tags tt
              WHERE tt."toolId" = t.id AND tt."tagId" = ANY(${tagIds}::uuid[])
            ), 0)
            +
            COALESCE(t."averageRating", 0) * 0.5
            +
            LEAST(COALESCE(t."reviewCount", 0) * 0.3, 5)
          ) as score
        FROM tools t
        WHERE t.status = ${ToolStatus.APPROVED}::text::tool_status
          AND t.id != ${toolId}::uuid
      )
      SELECT *
      FROM tool_scores
      WHERE score > 0
      ORDER BY score DESC, "rankScore" DESC
      LIMIT ${take}
    `;

    const data = similarTools.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      logoUrl: t.logoUrl,
      averageRating: t.averageRating ? Number(t.averageRating) : 0,
      reviewCount: t.reviewCount,
      score: Number(t.score),
    }));

    return { data };
  }

  async forUser(userId: string, take: number = 10) {
    const [userBookmarks, userReviews] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId },
        include: {
          tool: {
            include: {
              tags: { select: { tagId: true } },
              category: { select: { id: true } },
            },
          },
        },
      }),
      this.prisma.review.findMany({
        where: { userId, rating: { gte: 4 } },
        include: {
          tool: {
            include: {
              tags: { select: { tagId: true } },
              category: { select: { id: true } },
            },
          },
        },
      }),
    ]);

    if (userBookmarks.length === 0 && userReviews.length === 0) {
      return this.trending(8);
    }

    const interactedTools = [...userBookmarks.map((b) => b.tool), ...userReviews.map((r) => r.tool)];
    const interactedIds = new Set(interactedTools.map((t) => t.id));
    const tagFrequency = new Map<string, number>();
    const categoryFrequency = new Map<string, number>();

    for (const tool of interactedTools) {
      if (tool.categoryId) {
        categoryFrequency.set(tool.categoryId, (categoryFrequency.get(tool.categoryId) ?? 0) + 1);
      }
      for (const tt of tool.tags) {
        tagFrequency.set(tt.tagId, (tagFrequency.get(tt.tagId) ?? 0) + 1);
      }
    }

    const preferredTagIds = [...tagFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const preferredCategoryIds = [...categoryFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const recommended = await this.prisma.$queryRaw<any[]>`
      WITH user_tags AS (
        SELECT UNNEST(${preferredTagIds}::uuid[]) AS tag_id
      ),
      user_categories AS (
        SELECT UNNEST(${preferredCategoryIds}::uuid[]) AS cat_id
      ),
      scored_tools AS (
        SELECT
          t.id,
          t.name,
          t.slug,
          t.tagline,
          t."logoUrl",
          t."averageRating",
          t."reviewCount",
          t."rankScore",
          (
            CASE WHEN t."categoryId" IN (SELECT cat_id FROM user_categories) THEN 4 ELSE 0 END
            +
            COALESCE((
              SELECT COUNT(*)::int * 3
              FROM tool_tags tt
              WHERE tt."toolId" = t.id AND tt."tagId" IN (SELECT tag_id FROM user_tags)
            ), 0)
            +
            COALESCE(t."averageRating", 0) * 0.5
            +
            LEAST(COALESCE(t."reviewCount", 0) * 0.2, 3)
          ) as score
        FROM tools t
        WHERE t.status = ${ToolStatus.APPROVED}::text::tool_status
          AND t.id != ALL(${[...interactedIds]}::uuid[])
      )
      SELECT *
      FROM scored_tools
      WHERE score > 0
      ORDER BY score DESC, "rankScore" DESC
      LIMIT ${take}
    `;

    const data = recommended.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      logoUrl: t.logoUrl,
      averageRating: t.averageRating ? Number(t.averageRating) : 0,
      reviewCount: t.reviewCount,
      score: Number(t.score),
    }));

    return { data };
  }

  async trending(take: number = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tools = await this.prisma.$queryRaw<any[]>`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.tagline,
        t."logoUrl",
        t."averageRating",
        t."reviewCount",
        COALESCE(ev.recent_events, 0) as recent_events,
        t."rankScore"
      FROM tools t
      LEFT JOIN (
        SELECT "toolId", COUNT(*)::int as recent_events
        FROM analytic_events
        WHERE "timestamp" >= ${sevenDaysAgo}
          AND "eventType" IN ('view', 'click')
          AND "toolId" IS NOT NULL
        GROUP BY "toolId"
      ) ev ON ev."toolId" = t.id
      WHERE t.status = ${ToolStatus.APPROVED}::text::tool_status
      ORDER BY recent_events DESC NULLS LAST, t."rankScore" DESC
      LIMIT ${take}
    `;

    const data = tools.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      logoUrl: t.logoUrl,
      averageRating: t.averageRating ? Number(t.averageRating) : 0,
      reviewCount: t.reviewCount,
      recentEvents: t.recent_events,
    }));

    return { data };
  }

  async popular(take: number = 10) {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.APPROVED },
      orderBy: { rankScore: 'desc' },
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logoUrl: true,
        averageRating: true,
        reviewCount: true,
        viewCount: true,
        bookmarkCount: true,
      },
    });

    const data = tools.map((t) => ({
      ...t,
      averageRating: t.averageRating ? Number(t.averageRating) : 0,
    }));

    return { data };
  }
}
