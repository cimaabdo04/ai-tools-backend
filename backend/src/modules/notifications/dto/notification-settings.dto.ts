import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsObject } from 'class-validator';

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Receive email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Receive push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Per-type notification preferences',
    example: { REVIEW: true, MESSAGE: false, SYSTEM: true },
  })
  @IsOptional()
  @IsObject()
  typePreferences?: Record<string, boolean>;
}
