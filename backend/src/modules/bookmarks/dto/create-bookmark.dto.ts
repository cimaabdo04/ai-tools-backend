import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ description: 'Tool ID to bookmark' })
  @IsUUID()
  toolId: string;

  @ApiPropertyOptional({ description: 'Personal note for the bookmark', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
