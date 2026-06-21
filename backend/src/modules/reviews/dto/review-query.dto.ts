import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryDto {
  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to return', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  take?: number = 10;

  @ApiPropertyOptional({ description: 'Minimum rating filter', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Sort by', enum: ['newest', 'oldest', 'highest', 'lowest'], default: 'newest' })
  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';
}
