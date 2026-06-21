import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  IsUUID,
  ArrayMaxSize,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Review title', example: 'Great AI tool for productivity', maxLength: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Review content', example: 'I have been using this tool for months...' })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  content: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Pros list', example: ['Easy to use', 'Great support', 'Affordable'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  pros?: string[];

  @ApiPropertyOptional({ description: 'Cons list', example: ['Limited integrations', 'Steep learning curve'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  cons?: string[];

  @ApiProperty({ description: 'Tool ID' })
  @IsUUID()
  toolId: string;
}
