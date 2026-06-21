import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateReportStatusDto {
  @ApiProperty({ description: 'New status', enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({ description: 'Review note', example: 'Reviewed and dismissed as invalid' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
