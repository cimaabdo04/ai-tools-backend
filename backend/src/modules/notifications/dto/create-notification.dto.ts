import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'New review on your tool' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'User John left a 5-star review on AI Writer Pro' })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiProperty({ description: 'Target user ID' })
  @IsUUID()
  userId: string;
}

export class BulkCreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiProperty({ description: 'Array of user IDs to notify' })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
}
