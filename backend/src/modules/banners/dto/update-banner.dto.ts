import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateBannerDto {
  @ApiPropertyOptional({ description: 'Banner name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Banner type', enum: ['banner', 'sidebar', 'popup', 'inline'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'HTML content' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: 'Click-through URL' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Placement', example: 'home' })
  @IsOptional()
  @IsString()
  placement?: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Whether the banner is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
