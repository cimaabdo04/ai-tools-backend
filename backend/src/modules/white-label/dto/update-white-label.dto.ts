import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateWhiteLabelDto {
  @ApiPropertyOptional({ description: 'Brand name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional({ description: 'Primary color (hex)', example: '#6366f1' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary color (hex)' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Font family' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ description: 'Custom domain' })
  @IsOptional()
  @IsString()
  customDomain?: string;

  @ApiPropertyOptional({ description: 'Custom CSS' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ description: 'Footer HTML' })
  @IsOptional()
  @IsString()
  footerHtml?: string;

  @ApiPropertyOptional({ description: 'Whether this config is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
