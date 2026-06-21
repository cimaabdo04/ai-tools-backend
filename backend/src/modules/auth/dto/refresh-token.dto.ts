import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid JWT refresh token' })
  @IsString()
  refreshToken: string;
}
