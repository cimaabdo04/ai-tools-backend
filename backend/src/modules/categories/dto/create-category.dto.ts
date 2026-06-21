import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Writing Assistants' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Icon class or URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color', example: '#6366f1' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'SEO title', maxLength: 70 })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;
}
