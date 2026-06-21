import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'API key name', example: 'Production' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Permissions',
    example: ['read:tools', 'write:tools'],
    default: ['read:tools'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Expiration date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'IP whitelist', example: ['127.0.0.1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  ipWhitelist?: string[];
}
