import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsBoolean, MaxLength, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class PlatformDto {
  @ApiProperty({ description: 'Platform name', example: 'YouTube' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Profile/page URL on the platform', example: 'https://youtube.com/@myChannel' })
  @IsString()
  @MaxLength(500)
  url: string;
}

const CRYPTO_TYPES = ['USDT', 'USDC', 'BTC'] as const;
const CRYPTO_NETWORKS = ['TRC20', 'ERC20', 'BEP20', 'SOL', 'BTC'] as const;

export class ApplyAffiliateDto {
  @ApiProperty({ type: [PlatformDto], description: 'Platforms and their URLs' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformDto)
  platforms: PlatformDto[];

  @ApiPropertyOptional({ description: 'Full name of the applicant' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

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

  @ApiPropertyOptional({ description: 'Optional note from the applicant' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
