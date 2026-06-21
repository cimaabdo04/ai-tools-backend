import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ReportStatus } from '@prisma/client';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ReportQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ description: 'Filter by tool ID' })
  @IsOptional()
  @IsUUID()
  toolId?: string;

  @ApiPropertyOptional({ description: 'Filter by reporter ID' })
  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
