import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ToolStatus } from '@prisma/client';

export class ToolStatusDto {
  @ApiProperty({ description: 'New status', enum: ToolStatus, example: ToolStatus.APPROVED })
  @IsEnum(ToolStatus)
  status: ToolStatus;
}
