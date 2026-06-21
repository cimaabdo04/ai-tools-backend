import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateCountryRateDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code', example: 'US' })
  @IsString()
  @MaxLength(2)
  countryCode: string;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  @IsString()
  @MaxLength(100)
  countryName: string;

  @ApiProperty({ description: 'Value per click in USD', default: 0.001 })
  @IsNumber()
  @Min(0)
  clickValue?: number;

  @ApiProperty({ description: 'Value per conversion in USD', default: 1.0 })
  @IsNumber()
  @Min(0)
  conversionValue?: number;

  @ApiPropertyOptional({ description: 'Whether this rate is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCountryRateDto {
  @ApiPropertyOptional({ description: 'Country name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryName?: string;

  @ApiPropertyOptional({ description: 'Value per click in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  clickValue?: number;

  @ApiPropertyOptional({ description: 'Value per conversion in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  conversionValue?: number;

  @ApiPropertyOptional({ description: 'Whether this rate is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
