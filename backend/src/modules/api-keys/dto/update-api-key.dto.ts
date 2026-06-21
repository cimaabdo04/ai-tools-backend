import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdateApiKeyDto {
  @ApiPropertyOptional({ description: 'API key name', example: 'Production v2' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Updated permissions', example: ['read:tools', 'write:tools', 'admin:tools'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  permissions?: string[];

  @ApiPropertyOptional({ description: 'IP whitelist', example: ['203.0.113.0'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  ipWhitelist?: string[];
}
