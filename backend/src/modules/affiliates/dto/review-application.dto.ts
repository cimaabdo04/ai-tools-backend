import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';

export class ReviewApplicationDto {
  @ApiProperty({ enum: ['approved', 'rejected', 'incomplete'], description: 'Review decision' })
  @IsString()
  @IsIn(['approved', 'rejected', 'incomplete'])
  status: string;

  @ApiPropertyOptional({ description: 'Admin note (especially for rejection reason)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;

  @ApiPropertyOptional({ description: 'Max manual links allowed (default 3)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxManualLinks?: number;
}

export class UpdateLinkLimitDto {
  @ApiProperty({ description: 'New max manual links limit' })
  @IsInt()
  @Min(1)
  maxManualLinks: number;
}
