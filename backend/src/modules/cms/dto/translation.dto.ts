import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslationEntryDto {
  @ApiProperty({ example: 'home.hero.title' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  locale: string;

  @ApiProperty({ example: 'Welcome to AI Tools Directory' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'common' })
  @IsOptional()
  @IsString()
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkUpdateTranslationsDto {
  @ApiProperty({ type: [TranslationEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationEntryDto)
  translations: TranslationEntryDto[];
}
