import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ description: 'Collection name', example: 'Best AI Writing Tools', maxLength: 200 })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Collection description', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the collection is public', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;
}
