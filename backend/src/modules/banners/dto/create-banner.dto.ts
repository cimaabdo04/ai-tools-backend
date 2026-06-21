import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner name', example: 'Summer Sale' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Banner type', enum: ['banner', 'sidebar', 'popup', 'inline'], example: 'banner' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'HTML content (alternative to image)' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: 'Click-through URL' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ description: 'Placement', example: 'home', enum: ['home', 'sidebar', 'top', 'bottom', 'tool_detail', 'category'] })
  @IsString()
  placement: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Whether the banner is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
