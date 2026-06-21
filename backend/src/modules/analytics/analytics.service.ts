import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AnalyticsQueryDto, Granularity } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);

    const [
      totalTools,
      totalUsers,
      totalReviews,
      totalPayments,
      mrr,
      arr,
      activeSubscriptions,
      pendingTools,
    ] = await Promise.all([
      this.prisma.tool.count(),
      this.prisma.user.count(),
      this.prisma.review.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          createdAt: { gte: dateFrom, lte: dateTo },
        },
      }),
      this.calculateMRR(),
      this.calculateARR(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.tool.count({
        where: { status: 'PENDING_REVIEW' },
      }),
    ]);

    return {
      totalTools,
      totalUsers,
      totalReviews,
      revenue: {
        total: totalPayments._sum.amount?.toNumber() || 0,
        mrr: mrr,
        arr: arr,
        activeSubscriptions,
      },
      moderation: {
        pendingTools,
      },
    };
  }

  async getToolAnalytics(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);
    const limit = query.limit || 10;

    const [topViewed, topClicked, categoryBreakdown, statusBreakdown] =
      await Promise.all([
        this.prisma.tool.findMany({
          orderBy: { viewCount: 'desc' },
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            viewCount: true,
            clickCount: true,
            averageRating: true,
            reviewCount: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        this.prisma.tool.findMany({
          orderBy: { clickCount: 'desc' },
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            viewCount: true,
            clickCount: true,
          },
        }),
        this.prisma.category.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            toolCount: true,
          },
          orderBy: { toolCount: 'desc' },
        }),
        this.prisma.tool.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
      ]);

    const totalViews = topViewed.reduce((s, t) => s + t.viewCount, 0);
    const totalClicks = topClicked.reduce((s, t) => s + t.clickCount, 0);

    const withCtr = topViewed.map((t) => ({
      ...t,
      averageRating: t.averageRating?.toNumber() || 0,
      ctr: t.viewCount > 0 ? ((t.clickCount / t.viewCount) * 100).toFixed(2) : '0.00',
    }));

    return {
      topTools: withCtr,
      topClicked: topClicked.map((t) => ({
        ...t,
        ctr: t.viewCount > 0 ? ((t.clickCount / t.viewCount) * 100).toFixed(2) : '0.00',
      })),
      categoryBreakdown,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      totals: {
        totalViews,
        totalClicks,
        overallCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00',
      },
    };
  }

  async getUserAnalytics(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);
    const granularity = query.granularity || Granularity.DAY;

    const [totalUsers, roleDistribution, registrationTrend, statusDistribution] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
        this.getUserGrowth(dateFrom, dateTo, granularity),
        this.prisma.user.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
      ]);

    return {
      totalUsers,
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count.id,
      })),
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      registrationTrend,
    };
  }

  async getRevenueAnalytics(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);

    const [mrr, arr, subscriptions, oneTimePayments, revenueByPeriod, revenueByProvider] =
      await Promise.all([
        this.calculateMRR(),
        this.calculateARR(),
        this.prisma.subscription.count({
          where: { status: 'ACTIVE' },
        }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          _count: { id: true },
          where: {
            status: 'succeeded',
            subscriptionId: null,
            createdAt: { gte: dateFrom, lte: dateTo },
          },
        }),
        this.prisma.$queryRawUnsafe<Array<{ period: string; revenue: number; count: number }>>(
          `SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as period,
                  SUM("amount")::float as revenue,
                  COUNT(*)::int as count
           FROM payments
           WHERE "status" = 'succeeded'
             AND "createdAt" >= $1::timestamp AND "createdAt" <= $2::timestamp
           GROUP BY period
           ORDER BY period ASC`,
          dateFrom.toISOString(),
          dateTo.toISOString(),
        ),
        this.prisma.payment.groupBy({
          by: ['provider'],
          _sum: { amount: true },
          _count: { id: true },
          where: {
            status: 'succeeded',
            createdAt: { gte: dateFrom, lte: dateTo },
          },
        }),
      ]);

    return {
      mrr,
      arr,
      activeSubscriptions: subscriptions,
      oneTimePayments: {
        total: oneTimePayments._sum.amount?.toNumber() || 0,
        count: oneTimePayments._count.id,
      },
      revenueByPeriod,
      revenueByProvider: revenueByProvider.map((r) => ({
        provider: r.provider,
        amount: r._sum.amount?.toNumber() || 0,
        count: r._count.id,
      })),
    };
  }

  async getTrafficAnalytics(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);

    const referrers = await this.prisma.$queryRawUnsafe<
      Array<{ referrer: string | null; count: number }>
    >(
      `SELECT
          CASE
            WHEN "referrer" IS NULL THEN 'direct'
            WHEN "referrer" LIKE '%%google.%%' THEN 'google'
            WHEN "referrer" LIKE '%%bing.%%' THEN 'bing'
            WHEN "referrer" LIKE '%%facebook.%%' THEN 'facebook'
            WHEN "referrer" LIKE '%%twitter.%%' OR "referrer" LIKE '%%x.%%' THEN 'twitter'
            WHEN "referrer" LIKE '%%linkedin.%%' THEN 'linkedin'
            WHEN "referrer" LIKE '%%reddit.%%' THEN 'reddit'
            WHEN "referrer" LIKE '%%github.%%' THEN 'github'
            ELSE 'other'
          END as referrer,
          COUNT(*)::int as count
       FROM analytic_events
       WHERE "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
       GROUP BY referrer
       ORDER BY count DESC`,
      dateFrom.toISOString(),
      dateTo.toISOString(),
    );

    const [deviceBreakdown, browserBreakdown] = await Promise.all([
      this.prisma.$queryRawUnsafe<Array<{ deviceType: string | null; count: number }>>(
        `SELECT "deviceType", COUNT(*)::int as count
         FROM analytic_events
         WHERE "deviceType" IS NOT NULL
           AND "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
         GROUP BY "deviceType"
         ORDER BY count DESC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
      ),
      this.prisma.$queryRawUnsafe<Array<{ browser: string | null; count: number }>>(
        `SELECT "browser", COUNT(*)::int as count
         FROM analytic_events
         WHERE "browser" IS NOT NULL
           AND "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
         GROUP BY "browser"
         ORDER BY count DESC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
      ),
    ]);

    const total = referrers.reduce((s, r) => s + Number(r.count), 0);

    return {
      referrers: referrers.map((r) => ({
        source: r.referrer || 'direct',
        count: Number(r.count),
        percentage: total > 0 ? ((Number(r.count) / total) * 100).toFixed(2) : '0.00',
      })),
      devices: deviceBreakdown.map((d) => ({
        deviceType: d.deviceType,
        count: Number(d.count),
      })),
      browsers: browserBreakdown.map((b) => ({
        browser: b.browser,
        count: Number(b.count),
      })),
      total,
    };
  }

  async getGeoAnalytics(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);

    const geo = await this.prisma.$queryRawUnsafe<
      Array<{ country: string | null; city: string | null; count: number }>
    >(
      `SELECT "country", "city", COUNT(*)::int as count
       FROM analytic_events
       WHERE "country" IS NOT NULL
         AND "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
       GROUP BY "country", "city"
       ORDER BY count DESC`,
      dateFrom.toISOString(),
      dateTo.toISOString(),
    );

    const countryMap = new Map<string, { country: string; count: number; cities: Array<{ city: string; count: number }> }>();
    for (const row of geo) {
      const country = row.country || 'Unknown';
      if (!countryMap.has(country)) {
        countryMap.set(country, { country, count: 0, cities: [] });
      }
      const entry = countryMap.get(country)!;
      entry.count += Number(row.count);
      if (row.city) {
        entry.cities.push({ city: row.city, count: Number(row.count) });
      }
    }

    const total = Array.from(countryMap.values()).reduce((s, c) => s + c.count, 0);

    return {
      countries: Array.from(countryMap.values())
        .map((c) => ({
          ...c,
          percentage: total > 0 ? ((c.count / total) * 100).toFixed(2) : '0.00',
        }))
        .sort((a, b) => b.count - a.count),
      total,
    };
  }

  async getTrends(query: AnalyticsQueryDto) {
    const { dateFrom, dateTo } = this.resolveDateRange(query);
    const granularity = query.granularity || Granularity.DAY;
    let format: string;
    switch (granularity) {
      case Granularity.MONTH:
        format = 'YYYY-MM';
        break;
      case Granularity.WEEK:
        format = 'YYYY-IW';
        break;
      default:
        format = 'YYYY-MM-DD';
    }

    const [views, clicks, registrations, payments] = await Promise.all([
      this.prisma.$queryRawUnsafe<Array<{ period: string; count: number }>>(
        `SELECT TO_CHAR("timestamp", $3::text) as period, COUNT(*)::int as count
         FROM analytic_events
         WHERE "eventType" = 'view'
           AND "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
         GROUP BY period
         ORDER BY period ASC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
        format,
      ),
      this.prisma.$queryRawUnsafe<Array<{ period: string; count: number }>>(
        `SELECT TO_CHAR("timestamp", $3::text) as period, COUNT(*)::int as count
         FROM analytic_events
         WHERE "eventType" = 'click'
           AND "timestamp" >= $1::timestamp AND "timestamp" <= $2::timestamp
         GROUP BY period
         ORDER BY period ASC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
        format,
      ),
      this.prisma.$queryRawUnsafe<Array<{ period: string; count: number }>>(
        `SELECT TO_CHAR("createdAt", $3::text) as period, COUNT(*)::int as count
         FROM users
         WHERE "createdAt" >= $1::timestamp AND "createdAt" <= $2::timestamp
         GROUP BY period
         ORDER BY period ASC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
        format,
      ),
      this.prisma.$queryRawUnsafe<Array<{ period: string; revenue: number; count: number }>>(
        `SELECT TO_CHAR("createdAt", $3::text) as period,
                SUM("amount")::float as revenue,
                COUNT(*)::int as count
         FROM payments
         WHERE "status" = 'succeeded'
           AND "createdAt" >= $1::timestamp AND "createdAt" <= $2::timestamp
         GROUP BY period
         ORDER BY period ASC`,
        dateFrom.toISOString(),
        dateTo.toISOString(),
        format,
      ),
    ]);

    return {
      views: views.map((v) => ({ period: v.period, count: Number(v.count) })),
      clicks: clicks.map((c) => ({ period: c.period, count: Number(c.count) })),
      registrations: registrations.map((r) => ({ period: r.period, count: Number(r.count) })),
      payments: payments.map((p) => ({ period: p.period, revenue: Number(p.revenue), count: Number(p.count) })),
    };
  }

  async exportCsv(type: string, query: AnalyticsQueryDto): Promise<string> {
    let data: Record<string, unknown>[] = [];

    switch (type) {
      case 'tools':
        const tools = await this.getToolAnalytics(query);
        data = tools.topTools.map((t: any) => ({
          Name: t.name,
          Slug: t.slug,
          Views: t.viewCount,
          Clicks: t.clickCount,
          CTR: t.ctr,
          Rating: t.averageRating,
          Reviews: t.reviewCount,
        }));
        break;
      case 'users':
        const users = await this.getUserAnalytics(query);
        data = users.registrationTrend.map((r: any) => ({
          Period: r.period,
          Registrations: r.count,
        }));
        break;
      case 'revenue':
        const revenue = await this.getRevenueAnalytics(query);
        data = revenue.revenueByPeriod.map((r: any) => ({
          Period: r.period,
          Revenue: r.revenue,
          Transactions: r.count,
        }));
        data.push({
          Period: 'MRR',
          Revenue: revenue.mrr,
          Transactions: '-',
        });
        data.push({
          Period: 'ARR',
          Revenue: revenue.arr,
          Transactions: '-',
        });
        break;
      case 'traffic':
        const traffic = await this.getTrafficAnalytics(query);
        data = traffic.referrers.map((r: any) => ({
          Source: r.source,
          Visits: r.count,
          Percentage: r.percentage,
        }));
        break;
      case 'geo':
        const geo = await this.getGeoAnalytics(query);
        data = geo.countries.flatMap((c: any) =>
          c.cities.length
            ? c.cities.map((ci: any) => ({
                Country: c.country,
                City: ci.city,
                Visits: ci.count,
                Percentage: c.percentage,
              }))
            : [{ Country: c.country, City: '-', Visits: c.count, Percentage: c.percentage }],
        );
        break;
      default:
        throw new NotFoundException(`Unknown export type: ${type}`);
    }

    return this.toCsv(data);
  }

  private async calculateMRR(): Promise<number> {
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = 0;
    for (const sub of activeSubscriptions) {
      if (sub.plan.monthlyPrice) {
        mrr += sub.plan.monthlyPrice.toNumber();
      } else if (sub.plan.yearlyPrice) {
        mrr += sub.plan.yearlyPrice.toNumber() / 12;
      }
    }

    return Math.round(mrr * 100) / 100;
  }

  private async calculateARR(): Promise<number> {
    const mrr = await this.calculateMRR();
    return Math.round(mrr * 12 * 100) / 100;
  }

  private async getUserGrowth(
    dateFrom: Date,
    dateTo: Date,
    granularity: Granularity,
  ): Promise<Array<{ period: string; count: number }>> {
    const format =
      granularity === Granularity.MONTH ? 'YYYY-MM' : granularity === Granularity.WEEK ? 'YYYY-IW' : 'YYYY-MM-DD';

    const results = await this.prisma.$queryRawUnsafe<
      Array<{ period: string; count: number }>
    >(
      `SELECT TO_CHAR("createdAt", $3::text) as period, COUNT(*)::int as count
       FROM users
       WHERE "createdAt" >= $1::timestamp AND "createdAt" <= $2::timestamp
       GROUP BY period
       ORDER BY period ASC`,
      dateFrom.toISOString(),
      dateTo.toISOString(),
      format,
    );

    return results.map((r) => ({ period: r.period, count: Number(r.count) }));
  }

  private resolveDateRange(query: AnalyticsQueryDto): { dateFrom: Date; dateTo: Date } {
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
    const dateFrom = query.dateFrom
      ? new Date(query.dateFrom)
      : new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { dateFrom, dateTo };
  }

  private toCsv(data: Record<string, unknown>[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const lines = data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val == null ? '' : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(','),
    );

    return [headers.join(','), ...lines].join('\n');
  }
}
