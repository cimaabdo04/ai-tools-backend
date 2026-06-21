import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({ description: 'Number of items to return', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
