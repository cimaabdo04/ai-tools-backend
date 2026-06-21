import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'NewSecureP@ss1', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and a number or special character',
  })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores and hyphens',
  })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Updated bio' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  locale?: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  timezone?: string;

  // Role and status can only be set by admins via dedicated endpoints
  // They are excluded here to prevent self-promotion via mass assignment

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
