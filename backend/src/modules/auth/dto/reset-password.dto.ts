import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token received via email' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewSecureP@ss1',
    description: 'New password',
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
}
