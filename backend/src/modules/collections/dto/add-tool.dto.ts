import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class AddToolDto {
  @ApiProperty({ description: 'Tool ID to add to collection' })
  @IsUUID()
  toolId: string;

  @ApiPropertyOptional({ description: 'Optional sort order position' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
