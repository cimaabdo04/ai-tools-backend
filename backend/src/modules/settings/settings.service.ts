import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      return this.prisma.siteSettings.create({ data: {} });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({ data: {} });
    }

    const data: Record<string, unknown> = {};
    const fields: (keyof UpdateSettingsDto)[] = [
      'siteName', 'siteDescription', 'supportEmail', 'logo',
      'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'smtpSecure',
      'metaTitle', 'metaDescription', 'metaKeywords', 'ogImage', 'canonicalUrl',
      'googleAnalyticsId', 'googleTagManagerId', 'googleAdsId', 'googleAdsLabel', 'facebookPixelId',
      'rateLimitingEnabled', 'rateLimitingMax', 'rateLimitingWindow',
      'maintenanceEnabled', 'maintenanceMessage',
      'headerHtml', 'footerHtml',
      'navLinks', 'footerLinks',
    ];

    for (const field of fields) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }

    return this.prisma.siteSettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
