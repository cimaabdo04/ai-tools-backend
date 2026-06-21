import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsBoolean, MaxLength, IsIn } from 'class-validator';

const CRYPTO_TYPES = ['USDT', 'USDC', 'BTC'] as const;
const CRYPTO_NETWORKS = ['TRC20', 'ERC20', 'BEP20', 'SOL', 'BTC'] as const;

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: 'PayPal email for payouts' })
  @IsOptional()
  @IsEmail()
  paypalEmail?: string;

  @ApiPropertyOptional({ enum: CRYPTO_TYPES, description: 'Cryptocurrency type' })
  @IsOptional()
  @IsString()
  @IsIn(CRYPTO_TYPES)
  cryptoType?: string;

  @ApiPropertyOptional({ description: 'Crypto wallet address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cryptoAddress?: string;

  @ApiPropertyOptional({ enum: CRYPTO_NETWORKS, description: 'Crypto network (TRC20, ERC20, BEP20, SOL, BTC)' })
  @IsOptional()
  @IsString()
  @IsIn(CRYPTO_NETWORKS)
  cryptoNetwork?: string;

  @ApiPropertyOptional({ description: 'Contact for payment instead of PayPal/Crypto' })
  @IsOptional()
  @IsBoolean()
  contactForPayment?: boolean;
}
