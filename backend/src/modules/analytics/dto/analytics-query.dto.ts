import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Granularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export enum GroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CATEGORY = 'category',
  STATUS = 'status',
  TYPE = 'type',
  ROLE = 'role',
  COUNTRY = 'country',
  SOURCE = 'source',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: Granularity, default: Granularity.DAY })
  @IsOptional()
  @IsEnum(Granularity)
  granularity?: Granularity;

  @ApiPropertyOptional({ enum: GroupBy })
  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;

  @ApiPropertyOptional({ description: 'Number of top items to return' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
