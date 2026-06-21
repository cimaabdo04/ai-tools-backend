import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum CancelProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PADDLE = 'PADDLE',
  LEMONSQUEEZY = 'LEMONSQUEEZY',
}

export class CancelSubscriptionDto {
  @ApiProperty({ enum: CancelProvider, example: 'STRIPE' })
  @IsEnum(CancelProvider)
  provider: CancelProvider;

  @ApiProperty({ example: 'sub_123456' })
  @IsString()
  subscriptionId: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  atPeriodEnd?: boolean;

  @ApiPropertyOptional({ example: 'Switching to another plan' })
  @IsOptional()
  @IsString()
  reason?: string;
}
