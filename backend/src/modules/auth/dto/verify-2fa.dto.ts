import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code from authenticator app' })
  @IsString()
  @Length(6, 6, { message: 'Token must be exactly 6 characters' })
  token: string;
}
