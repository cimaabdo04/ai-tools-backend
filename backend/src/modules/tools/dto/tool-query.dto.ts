import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsArray,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ToolStatus } from '@prisma/client';
import { PaginationDto } from '@common/dto/pagination.dto';

export enum ToolSortBy {
  RATING = 'rating',
  VIEWS = 'views',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME = 'name',
  RANK_SCORE = 'rank_score',
  REVIEW_COUNT = 'review_count',
  BOOKMARK_COUNT = 'bookmark_count',
}

export class ToolQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by tag slugs (comma-separated)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  tags?: string;

  @ApiPropertyOptional({ description: 'Filter by pricing type', example: 'free' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  pricingType?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ToolStatus })
  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @ApiPropertyOptional({ description: 'Filter featured tools' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Filter sponsored tools' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  sponsored?: boolean;

  @ApiPropertyOptional({ description: 'Filter verified tools' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: 'Filter by author ID' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Sort by', enum: ToolSortBy, default: ToolSortBy.RANK_SCORE })
  @IsOptional()
  @IsEnum(ToolSortBy)
  sortBy?: ToolSortBy = ToolSortBy.RANK_SCORE;

  @ApiPropertyOptional({ description: 'Minimum rating filter', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;
}
