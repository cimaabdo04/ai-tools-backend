import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ReviewClaimDto {
  @ApiPropertyOptional({ description: 'Review note explaining the decision', example: 'Approved after verifying website ownership' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
