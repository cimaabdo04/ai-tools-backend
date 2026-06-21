import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ description: 'Reason for the report', example: 'Spam or misleading' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Detailed description', example: 'This tool appears to be fake...' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Tool ID being reported' })
  @IsUUID()
  toolId: string;
}
