import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum SubscriptionProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PADDLE = 'PADDLE',
  LEMONSQUEEZY = 'LEMONSQUEEZY',
}

export class CreateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionProvider, example: 'STRIPE' })
  @IsEnum(SubscriptionProvider)
  provider: SubscriptionProvider;

  @ApiProperty({ example: 'pro-plan' })
  @IsString()
  planSlug: string;

  @ApiPropertyOptional({ example: 'monthly' })
  @IsOptional()
  @IsString()
  interval?: 'monthly' | 'yearly';

  @ApiPropertyOptional({ example: 'pm_123456' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: 'sub_123456' })
  @IsOptional()
  @IsString()
  providerSubscriptionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerCustomerId?: string;

  @ApiPropertyOptional({ example: { trial: false } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
