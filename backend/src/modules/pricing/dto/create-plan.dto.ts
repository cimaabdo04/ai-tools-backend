import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'pro-plan' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Best for professionals' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['Unlimited tools', 'API access', 'Priority support'] })
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiPropertyOptional({ example: { tools: 100, reviews: 1000, apiCalls: 50000 } })
  @IsOptional()
  @IsObject()
  limits?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @ApiPropertyOptional({ example: 299.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearlyPrice?: number;

  @ApiPropertyOptional({ default: 'USD', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeYearlyPriceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paypalPlanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paddlePriceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lemonsqueezyVariantId?: string;

  @ApiPropertyOptional({ example: { trialDays: 14 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
