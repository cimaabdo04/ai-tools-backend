import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Top 10 AI Tools for 2026' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'top-10-ai-tools-2026' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<h1>Full HTML content</h1>' })
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ example: ['AI', 'productivity'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'YouTube أو رابط فيديو مرفوع' })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
