import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({ description: 'Tool ID to claim' })
  @IsUUID()
  toolId: string;

  @ApiPropertyOptional({ description: 'Evidence supporting the claim', example: 'I am the original developer...' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  evidence?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
