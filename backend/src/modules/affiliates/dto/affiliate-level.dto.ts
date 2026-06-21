import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, Min, Max, MaxLength, IsOptional } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ description: 'Level number', example: 1 })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Level name', example: 'برونزي' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Minimum conversions to reach this level', default: 0 })
  @IsInt()
  @Min(0)
  minConversions?: number;

  @ApiProperty({ description: 'Minimum earnings (USD) to reach this level', default: 0 })
  @IsNumber()
  @Min(0)
  minEarnings?: number;

  @ApiProperty({ description: 'Commission rate for this level', default: 0.20 })
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  commissionRate?: number;
}

export class UpdateLevelDto {
  @ApiPropertyOptional({ description: 'Level name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Minimum conversions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minConversions?: number;

  @ApiPropertyOptional({ description: 'Minimum earnings (USD)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minEarnings?: number;

  @ApiPropertyOptional({ description: 'Commission rate' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  commissionRate?: number;
}
