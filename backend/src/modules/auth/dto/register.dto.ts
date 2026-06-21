import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'SecureP@ss1',
    description: 'Password with uppercase, lowercase, and number/special char',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and a number or special character',
  })
  password: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Display name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'abc123xyz', description: 'Affiliate referral code' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  ref?: string;

  @ApiPropertyOptional({ example: 'uuid-click-id', description: 'Affiliate click ID from cookie' })
  @IsString()
  @IsOptional()
  clickId?: string;

  @ApiPropertyOptional({ example: 'token-xyz', description: 'Affiliate click token from cookie' })
  @IsString()
  @IsOptional()
  token?: string;
}
