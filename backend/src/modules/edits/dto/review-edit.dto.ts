import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ReviewEditDto {
  @ApiPropertyOptional({ description: 'Review note', example: 'Changes look accurate' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
