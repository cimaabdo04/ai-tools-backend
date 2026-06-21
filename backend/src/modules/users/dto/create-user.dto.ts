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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecureP@ss1', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and a number or special character',
  })
  password: string;

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

  @ApiPropertyOptional({ example: 'A short bio about the user' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
