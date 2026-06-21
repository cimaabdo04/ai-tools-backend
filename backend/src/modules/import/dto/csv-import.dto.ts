import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CsvImportDto {
  @ApiProperty({ description: 'CSV content as string (header + rows)', example: 'name,tagline,description,websiteUrl,pricingType,category\n...' })
  @IsString()
  @MinLength(10)
  csvContent: string;

  @ApiPropertyOptional({ description: 'Whether to skip duplicate detection', default: false })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @ApiPropertyOptional({ description: 'Default status for imported tools', default: 'PENDING_REVIEW' })
  @IsOptional()
  @IsString()
  defaultStatus?: string;

  @ApiPropertyOptional({ description: 'Category ID to assign to all imported tools' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
