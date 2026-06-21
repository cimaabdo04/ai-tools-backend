import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ApplyAffiliateDto } from './dto/apply-affiliate.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ReviewApplicationDto, UpdateLinkLimitDto } from './dto/review-application.dto';
import { CreateCountryRateDto, UpdateCountryRateDto } from './dto/country-rate.dto';
import { CreateLevelDto, UpdateLevelDto } from './dto/affiliate-level.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { AffiliateLink, AffiliateApplication, AffiliateLevel } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const [links, user] = await Promise.all([
      this.prisma.affiliateLink.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          affiliateLevel: { select: { name: true, level: true, commissionRate: true } },
        },
      }),
    ]);
    return {
      totalLinks: links.length,
      totalClicks: links.reduce((sum, l) => sum + l.totalClicks, 0),
      totalConversions: links.reduce((sum, l) => sum + l.totalConversions, 0),
      totalEarned: links.reduce((sum, l) => sum + Number(l.totalEarned), 0),
      affiliateLevel: user?.affiliateLevel ?? null,
      links,
    };
  }

  async getReports(userId: string, from?: string, to?: string) {
    const links = await this.prisma.affiliateLink.findMany({
      where: { userId },
      select: { id: true, code: true },
    });
    const linkIds = links.map((l) => l.id);
    const linkCodes = links.map((l) => l.code);

    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.gte = new Date(from);
      if (to) dateFilter.createdAt.lte = new Date(to);
    }

    const [clicks, rawSourceStats, rawDeviceStats, referringUsers] = await Promise.all([
      this.prisma.affiliateClick.findMany({
        where: { linkId: { in: linkIds }, ...dateFilter },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['source'],
        where: { linkId: { in: linkIds }, ...dateFilter },
        _count: { id: true },
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['deviceType'],
        where: { linkId: { in: linkIds }, ...dateFilter },
        _count: { id: true },
      }),
      this.prisma.user.findMany({
        where: { referredBy: { in: linkCodes }, ...(from || to ? {
          referredAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        } : {}) },
        select: { referredBy: true, referredAt: true },
      }),
    ]);

    const totalClicks = clicks.length;
    const totalConversions = referringUsers.length;
    const totalEarned = clicks.reduce((s, c) => s + Number(c.clickValue), 0);
    const avgCommission = totalConversions > 0 ? totalEarned / totalConversions : 0;

    const sourceBreakdown = rawSourceStats.map((s) => ({
      source: s.source || 'unknown',
      count: s._count.id,
      percentage: totalClicks > 0 ? Number(((s._count.id / totalClicks) * 100).toFixed(1)) : 0,
    }));

    const deviceBreakdown = rawDeviceStats.map((d) => ({
      device: d.deviceType || 'unknown',
      count: d._count.id,
      percentage: totalClicks > 0 ? Number(((d._count.id / totalClicks) * 100).toFixed(1)) : 0,
    }));

    return {
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
      totalEarned: Number(totalEarned.toFixed(2)),
      avgCommission: Number(avgCommission.toFixed(2)),
      sourceBreakdown,
      deviceBreakdown,
    };
  }

  async recordClick(code: string, token?: string, ip?: string, userAgent?: string, referer?: string) {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } });
    if (!link) {
      throw new NotFoundException(`Affiliate link with code "${code}" not found`);
    }
    const clickToken = token || this.generateToken();
    const click = await this.prisma.affiliateClick.create({
      data: {
        linkId: link.id, ip, country: null, userAgent,
        deviceType: this.parseDeviceType(userAgent),
        referer,
        source: this.parseSource(referer),
        token: clickToken,
      },
    });
    await this.prisma.affiliateLink.update({
      where: { code },
      data: { totalClicks: { increment: 1 } },
    });
    return { clickId: click.id, token: clickToken };
  }

  private parseDeviceType(userAgent?: string): string | null {
    if (!userAgent) return null;
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet';
    if (/(mobile|iphone|ipod|android|blackberry|windows phone)/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private parseSource(referer?: string): string | null {
    if (!referer) return 'direct';
    try {
      const url = new URL(referer);
      const host = url.hostname.replace(/^www\./, '');
      if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('fb.me')) return 'facebook';
      if (host.includes('twitter.com') || host.includes('x.com') || host.includes('t.co')) return 'twitter';
      if (host.includes('instagram.com')) return 'instagram';
      if (host.includes('linkedin.com')) return 'linkedin';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
      if (host.includes('tiktok.com')) return 'tiktok';
      if (host.includes('pinterest.com')) return 'pinterest';
      if (host.includes('whatsapp.com') || host.includes('wa.me')) return 'whatsapp';
      if (host.includes('telegram.org') || host.includes('t.me')) return 'telegram';
      if (host.includes('google.com') || host.includes('google.')) return 'google';
      if (host.includes('bing.com') || host.includes('search.')) return 'search';
      if (host.includes('yahoo.com')) return 'search';
      if (host.includes('mail.google.com')) return 'email';
      if (host.includes('outlook.com') || host.includes('hotmail.com') || host.includes('mail.yahoo.com')) return 'email';
      if (host.includes('reddit.com')) return 'reddit';
      if (host.includes('discord.com') || host.includes('discord.gg')) return 'discord';
      return 'other';
    } catch {
      return 'other';
    }
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async apply(dto: ApplyAffiliateDto, userId: string): Promise<AffiliateApplication> {
    const existing = await this.prisma.affiliateApplication.findUnique({ where: { userId } });
    if (existing && existing.status === 'pending') {
      throw new ConflictException('You already have a pending application');
    }
    if (existing && existing.status === 'approved') {
      throw new ConflictException('Your application has already been approved');
    }
    const data: any = {
      userId,
      platforms: JSON.stringify(dto.platforms),
      note: dto.note,
    };
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.phone) data.phone = dto.phone;
    if (dto.country) data.country = dto.country;
    if (dto.paypalEmail) data.paypalEmail = dto.paypalEmail;
    if (dto.cryptoType) data.cryptoType = dto.cryptoType;
    if (dto.cryptoAddress) data.cryptoAddress = dto.cryptoAddress;
    if (dto.cryptoNetwork) data.cryptoNetwork = dto.cryptoNetwork;
    if (dto.contactForPayment !== undefined) data.contactForPayment = dto.contactForPayment;
    if (existing && existing.status === 'rejected') {
      return this.prisma.affiliateApplication.update({
        where: { userId },
        data: { ...data, status: 'pending', adminNote: null, approvedAt: null },
      });
    }
    return this.prisma.affiliateApplication.create({ data });
  }

  async getMyApplication(userId: string): Promise<AffiliateApplication | null> {
    return this.prisma.affiliateApplication.findUnique({ where: { userId } });
  }

  async getAllApplications(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [applications, total] = await Promise.all([
      this.prisma.affiliateApplication.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.affiliateApplication.count({ where }),
    ]);
    return { applications, total, page, totalPages: Math.ceil(total / limit) };
  }

  async approveApplication(id: string): Promise<AffiliateApplication> {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { id }, include: { user: true } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.status !== 'pending') throw new BadRequestException('Application is not pending');

    const code = `${app.userId.slice(0, 8)}${this.generateCode(4)}`;
    const defaultLevel = await this.prisma.affiliateLevel.findFirst({ where: { level: 1 } });

    await this.prisma.affiliateLink.create({
      data: {
        code,
        userId: app.userId,
        commissionRate: defaultLevel?.commissionRate ?? 0.2,
        isAutoGenerated: true,
      },
    });
    if (defaultLevel) {
      await this.prisma.user.update({
        where: { id: app.userId },
        data: { affiliateLevelId: defaultLevel.id },
      });
    }
    return this.prisma.affiliateApplication.update({
      where: { id },
      data: { status: 'approved', approvedAt: new Date() },
    });
  }

  async rejectApplication(id: string, adminNote?: string): Promise<AffiliateApplication> {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.status !== 'pending') throw new BadRequestException('Application is not pending');
    return this.prisma.affiliateApplication.update({
      where: { id },
      data: { status: 'rejected', adminNote: adminNote ?? null },
    });
  }

  async markApplicationIncomplete(id: string, adminNote?: string): Promise<AffiliateApplication> {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return this.prisma.affiliateApplication.update({
      where: { id },
      data: { status: 'incomplete', adminNote: adminNote ?? null },
    });
  }

  async updateLinkLimit(userId: string, dto: UpdateLinkLimitDto): Promise<AffiliateApplication> {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { userId } });
    if (!app) throw new NotFoundException('Application not found for this user');
    return this.prisma.affiliateApplication.update({
      where: { userId },
      data: { maxManualLinks: dto.maxManualLinks },
    });
  }

  async recordConversion(code: string, referredUserId: string, country?: string, clickId?: string) {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } });
    if (!link) throw new NotFoundException(`Affiliate link with code "${code}" not found`);

    const rate = country
      ? await this.prisma.affiliateCountryRate.findUnique({ where: { countryCode: country } })
      : null;
    const conversionValue = rate?.conversionValue ?? 1.0;
    const earned = conversionValue * Number(link.commissionRate);

    const clickUpdate: any = {};
    if (clickId) {
      clickUpdate.where = { id: clickId };
      clickUpdate.data = { converted: true, convertedAt: new Date(), clickValue: earned };
    } else {
      clickUpdate.where = { linkId: link.id, converted: false };
      clickUpdate.data = { converted: true, convertedAt: new Date(), clickValue: earned };
    }

    await this.prisma.$transaction([
      this.prisma.affiliateLink.update({
        where: { code },
        data: {
          totalConversions: { increment: 1 },
          totalEarned: { increment: earned },
        },
      }),
      this.prisma.user.update({
        where: { id: referredUserId },
        data: {
          referredBy: code,
          referredAt: new Date(),
          referredCountry: country,
          referredClickId: clickId || null,
        },
      }),
      clickId
        ? this.prisma.affiliateClick.update({ where: { id: clickId }, data: { converted: true, convertedAt: new Date(), clickValue: earned } })
        : this.prisma.affiliateClick.updateMany({
            where: { linkId: link.id, converted: false },
            data: { converted: true, convertedAt: new Date(), clickValue: earned },
          }),
    ]);

    await this.calculateAndUpdateLevel(link.userId);

    return { earned, conversionValue, clickValue: earned, country };
  }

  async updatePayment(userId: string, dto: UpdatePaymentDto): Promise<AffiliateApplication> {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { userId } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.status === 'approved') throw new BadRequestException('Cannot change payment methods after approval');
    const data: any = {};
    if (dto.paypalEmail !== undefined) data.paypalEmail = dto.paypalEmail;
    if (dto.cryptoType !== undefined) data.cryptoType = dto.cryptoType;
    if (dto.cryptoAddress !== undefined) data.cryptoAddress = dto.cryptoAddress;
    if (dto.cryptoNetwork !== undefined) data.cryptoNetwork = dto.cryptoNetwork;
    if (dto.contactForPayment !== undefined) data.contactForPayment = dto.contactForPayment;
    return this.prisma.affiliateApplication.update({ where: { userId }, data });
  }

  async calculateAndUpdateLevel(userId: string): Promise<AffiliateLevel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { affiliateLinks: true },
    });
    if (!user) return null;

    const totalConversions = user.affiliateLinks.reduce((s, l) => s + l.totalConversions, 0);
    const totalEarned = user.affiliateLinks.reduce((s, l) => s + Number(l.totalEarned), 0);

    const levels = await this.prisma.affiliateLevel.findMany({
      orderBy: { level: 'desc' },
    });

    for (const level of levels) {
      if (totalConversions >= level.minConversions && totalEarned >= level.minEarnings) {
        if (user.affiliateLevelId !== level.id) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { affiliateLevelId: level.id },
          });
        }
        return level;
      }
    }
    return null;
  }

  async getAffiliateClicks(
    userId: string,
    page = 1,
    limit = 20,
    filters?: { country?: string; deviceType?: string; source?: string; from?: string; to?: string },
  ) {
    const links = await this.prisma.affiliateLink.findMany({
      where: { userId },
      select: { id: true },
    });
    const linkIds = links.map((l) => l.id);

    if (linkIds.length === 0) {
      return { clicks: [], total: 0, page, totalPages: 0, breakdowns: { country: [], source: [], device: [] } };
    }

    const where: any = { linkId: { in: linkIds } };
    if (filters?.country) where.country = filters.country;
    if (filters?.deviceType) where.deviceType = filters.deviceType;
    if (filters?.source) where.source = filters.source;
    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    const [clicks, total, countryStats, sourceStats, deviceStats] = await Promise.all([
      this.prisma.affiliateClick.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { link: { select: { code: true } } },
      }),
      this.prisma.affiliateClick.count({ where }),
      this.prisma.affiliateClick.groupBy({
        by: ['country'],
        where: { linkId: { in: linkIds } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['source'],
        where: { linkId: { in: linkIds } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['deviceType'],
        where: { linkId: { in: linkIds } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const totalAll = (await this.prisma.affiliateClick.count({ where: { linkId: { in: linkIds } } })) || 1;

    return {
      clicks: clicks.map((c) => ({
        id: c.id,
        ip: c.ip,
        country: c.country,
        deviceType: c.deviceType,
        source: c.source,
        token: c.token,
        converted: c.converted,
        convertedAt: c.convertedAt,
        clickValue: Number(c.clickValue),
        createdAt: c.createdAt,
        linkCode: c.link.code,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      breakdowns: {
        country: countryStats.map((b) => ({
          country: b.country || 'unknown',
          count: b._count.id,
          percentage: Number(((b._count.id / totalAll) * 100).toFixed(1)),
        })),
        source: sourceStats.map((b) => ({
          source: b.source || 'unknown',
          count: b._count.id,
          percentage: Number(((b._count.id / totalAll) * 100).toFixed(1)),
        })),
        device: deviceStats.map((b) => ({
          device: b.deviceType || 'unknown',
          count: b._count.id,
          percentage: Number(((b._count.id / totalAll) * 100).toFixed(1)),
        })),
      },
    };
  }

  async getReferrals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { affiliateLinks: { select: { code: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const linkCodes = user.affiliateLinks.map((l) => l.code);

    const referredUsers = await this.prisma.user.findMany({
      where: { referredBy: { in: linkCodes } },
      select: {
        id: true, name: true, email: true, createdAt: true, referredCountry: true, referredClickId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const clickIds = referredUsers.filter((u) => u.referredClickId).map((u) => u.referredClickId!);
    const clicks = clickIds.length > 0
      ? await this.prisma.affiliateClick.findMany({
          where: { id: { in: clickIds } },
          select: { id: true, ip: true, country: true, createdAt: true, link: { select: { code: true } } },
        })
      : [];
    const clickMap = new Map(clicks.map((c) => [c.id, c]));

    return referredUsers.map((u) => {
      const click = u.referredClickId ? clickMap.get(u.referredClickId) : undefined;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        registeredAt: u.createdAt,
        country: u.referredCountry,
        linkCode: click?.link?.code ?? '',
        clickIp: click?.ip ?? null,
        clickCountry: click?.country ?? null,
        clickedAt: click?.createdAt ?? null,
      };
    });
  }

  async getAllAffiliates(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { affiliateApplication: { status: 'approved' } } as any,
        select: {
          id: true, name: true, email: true, affiliateLinks: true,
          affiliateApplication: { select: { maxManualLinks: true, paypalEmail: true, cryptoType: true, cryptoAddress: true, cryptoNetwork: true, contactForPayment: true } },
          affiliateLevel: { select: { name: true, level: true, commissionRate: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where: { affiliateApplication: { status: 'approved' } } as any }),
    ]);

    const allLinkCodes = users.flatMap((u) => u.affiliateLinks.map((l) => l.code));
    const referralCounts = allLinkCodes.length > 0
      ? (await this.prisma.user.groupBy({
          by: ['referredBy'],
          where: { referredBy: { in: allLinkCodes } },
          _count: { id: true },
        })).reduce((acc, r) => ({ ...acc, [r.referredBy]: r._count.id }), {} as Record<string, number>)
      : {};

    const affiliates = users.map((u) => {
      const linkCodes = u.affiliateLinks.map((l) => l.code);
      const totalReferrals = linkCodes.reduce((s, code) => s + (referralCounts[code] || 0), 0);
      const totalClicks = u.affiliateLinks.reduce((s, l) => s + l.totalClicks, 0);
      const totalConversions = u.affiliateLinks.reduce((s, l) => s + l.totalConversions, 0);
      return {
        id: u.id,
        user: { id: u.id, name: u.name, email: u.email },
        code: u.affiliateLinks.find((l) => l.isAutoGenerated)?.code ?? '',
        commissionRate: u.affiliateLevel?.commissionRate ?? 0.2,
        totalLinks: u.affiliateLinks.length,
        totalEarnings: u.affiliateLinks.reduce((s, l) => s + Number(l.totalEarned), 0),
        totalClicks,
        totalConversions,
        totalReferrals,
        conversionRate: totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
        maxManualLinks: u.affiliateApplication?.maxManualLinks ?? 3,
        paypalEmail: u.affiliateApplication?.paypalEmail,
        cryptoType: u.affiliateApplication?.cryptoType,
        cryptoAddress: u.affiliateApplication?.cryptoAddress,
        cryptoNetwork: u.affiliateApplication?.cryptoNetwork,
        contactForPayment: u.affiliateApplication?.contactForPayment,
        status: 'active',
        createdAt: '',
      };
    });
    return { affiliates, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateCommission(affiliateUserId: string, commissionRate: number) {
    const app = await this.prisma.affiliateApplication.findUnique({ where: { userId: affiliateUserId } });
    if (!app) throw new NotFoundException('Affiliate not found');
    const level = await this.prisma.affiliateLevel.findFirst({ where: { level: 1 } });
    if (!level) throw new NotFoundException('No affiliate level configured');
    return this.prisma.affiliateLevel.update({
      where: { id: level.id },
      data: { commissionRate },
    });
  }

  async getCountryRates() {
    return this.prisma.affiliateCountryRate.findMany({ orderBy: { countryName: 'asc' } });
  }

  async upsertCountryRate(dto: CreateCountryRateDto) {
    const data: any = {
      countryName: dto.countryName,
      clickValue: dto.clickValue ?? 0.001,
      conversionValue: dto.conversionValue ?? 1.0,
    };
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.affiliateCountryRate.upsert({
      where: { countryCode: dto.countryCode },
      create: { ...data, countryCode: dto.countryCode },
      update: data,
    });
  }

  async updateCountryRate(id: string, dto: UpdateCountryRateDto) {
    const rate = await this.prisma.affiliateCountryRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Country rate not found');
    return this.prisma.affiliateCountryRate.update({ where: { id }, data: dto as any });
  }

  async deleteCountryRate(id: string) {
    const rate = await this.prisma.affiliateCountryRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Country rate not found');
    return this.prisma.affiliateCountryRate.delete({ where: { id } });
  }

  async getLevels() {
    return this.prisma.affiliateLevel.findMany({ orderBy: { level: 'asc' } });
  }

  async upsertLevel(dto: CreateLevelDto) {
    return this.prisma.affiliateLevel.upsert({
      where: { level: dto.level },
      create: {
        level: dto.level,
        name: dto.name,
        minConversions: dto.minConversions ?? 0,
        minEarnings: dto.minEarnings ?? 0,
        commissionRate: dto.commissionRate ?? 0.2,
      },
      update: {
        name: dto.name,
        minConversions: dto.minConversions ?? 0,
        minEarnings: dto.minEarnings ?? 0,
        commissionRate: dto.commissionRate ?? 0.2,
      },
    });
  }

  async updateLevel(id: string, dto: UpdateLevelDto) {
    const level = await this.prisma.affiliateLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Affiliate level not found');
    return this.prisma.affiliateLevel.update({ where: { id }, data: dto as any });
  }

  async deleteLevel(id: string) {
    const level = await this.prisma.affiliateLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Affiliate level not found');
    await this.prisma.user.updateMany({
      where: { affiliateLevelId: id },
      data: { affiliateLevelId: null },
    });
    return this.prisma.affiliateLevel.delete({ where: { id } });
  }

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    const links = await this.prisma.affiliateLink.findMany({ where: { userId } });
    const totalEarned = links.reduce((s, l) => s + Number(l.totalEarned), 0);

    const withdrawals = await this.prisma.affiliateWithdrawal.findMany({
      where: { affiliateUserId: userId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalWithdrawn;

    if (dto.amount > available) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${available.toFixed(2)}, requested: ${dto.amount.toFixed(2)}`,
      );
    }

    return this.prisma.affiliateWithdrawal.create({
      data: {
        affiliateUserId: userId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentDetails: dto.paymentDetails,
      },
    });
  }

  async getMyWithdrawals(userId: string) {
    return this.prisma.affiliateWithdrawal.findMany({
      where: { affiliateUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllWithdrawals(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [withdrawals, total] = await Promise.all([
      this.prisma.affiliateWithdrawal.findMany({
        where,
        include: { affiliate: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.affiliateWithdrawal.count({ where }),
    ]);
    return { withdrawals, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateWithdrawal(id: string, dto: UpdateWithdrawalDto) {
    const withdrawal = await this.prisma.affiliateWithdrawal.findUnique({ where: { id } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('Withdrawal is not pending');
    }

    const data: any = { status: dto.status, adminNote: dto.adminNote };
    if (dto.status === 'APPROVED') {
      data.processedAt = new Date();
    }
    return this.prisma.affiliateWithdrawal.update({ where: { id }, data });
  }

  private generateCode(length = 8): string {
    if (length <= 4) return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    return crypto.randomBytes(4).toString('hex');
  }
}
