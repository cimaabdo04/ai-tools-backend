import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsUrl,
  IsObject,
} from 'class-validator';

export enum CheckoutProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PADDLE = 'PADDLE',
  LEMONSQUEEZY = 'LEMONSQUEEZY',
}

export class CreateCheckoutDto {
  @ApiProperty({ enum: CheckoutProvider, example: 'STRIPE' })
  @IsEnum(CheckoutProvider)
  provider: CheckoutProvider;

  @ApiProperty({ example: 'plan_01' })
  @IsString()
  planSlug: string;

  @ApiPropertyOptional({ example: 'monthly' })
  @IsOptional()
  @IsString()
  interval?: 'monthly' | 'yearly';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  toolId?: string;

  @ApiPropertyOptional({ example: 'https://example.com/success' })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cancel' })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;

  @ApiPropertyOptional({ example: { coupon: 'SAVE20' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
