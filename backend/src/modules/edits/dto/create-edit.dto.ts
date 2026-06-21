import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsObject, MaxLength } from 'class-validator';

export class CreateEditDto {
  @ApiProperty({ description: 'Tool ID to suggest edits for' })
  @IsUUID()
  toolId: string;

  @ApiProperty({
    description: 'JSON diff of proposed changes',
    example: { name: 'New Name', tagline: 'New tagline', description: 'Updated description' },
  })
  @IsObject()
  changes: Record<string, unknown>;
}
