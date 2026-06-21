import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name', example: 'Machine Learning' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Tag description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
