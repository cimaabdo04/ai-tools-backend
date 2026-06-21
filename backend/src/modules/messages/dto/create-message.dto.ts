import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'Question about your tool' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'Hi, I have a question about your pricing...' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ description: 'Receiver user ID' })
  @IsUUID()
  receiverId: string;
}
