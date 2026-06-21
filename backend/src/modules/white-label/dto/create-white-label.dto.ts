import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateWhiteLabelDto {
  @ApiPropertyOptional({ description: 'Brand name', default: 'AI Tools Directory' })
  @IsOptional()
  @IsString()
  @MinLength(1)
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

  @ApiPropertyOptional({ description: 'Secondary color (hex)', example: '#8b5cf6' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Font family', example: 'Inter' })
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

  @ApiPropertyOptional({ description: 'Whether this config is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
