import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  siteName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  siteDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  smtpUser?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  smtpPass?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  smtpFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  googleTagManagerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  googleAdsId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  googleAdsLabel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  rateLimitingEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rateLimitingMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rateLimitingWindow?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maintenanceMessage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  headerHtml?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  footerHtml?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  navLinks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  footerLinks?: string;
}
