import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl, IsArray, IsObject, MinLength } from 'class-validator';

export class ApiImportDto {
  @ApiProperty({ description: 'External API URL to fetch tools from', example: 'https://api.example.com/tools' })
  @IsUrl()
  @IsString()
  sourceUrl: string;

  @ApiPropertyOptional({ description: 'HTTP method', default: 'GET' })
  @IsOptional()
  @IsString()
  method?: string = 'GET';

  @ApiPropertyOptional({ description: 'Request headers', example: { Authorization: 'Bearer token' } })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'JSONPath or key to the array of tools in response', example: 'data.tools' })
  @IsOptional()
  @IsString()
  responsePath?: string;

  @ApiPropertyOptional({ description: 'Field mapping from API response to tool fields', example: { name: 'title', description: 'desc', websiteUrl: 'url' } })
  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

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
