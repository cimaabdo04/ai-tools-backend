import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'About Us' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'about-us' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: { blocks: [] }, description: 'JSON page content' })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

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
  @IsObject()
  metadata?: Record<string, unknown>;
}
