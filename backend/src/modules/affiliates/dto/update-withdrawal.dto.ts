import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateWithdrawalDto {
  @IsString()
  @IsIn(['APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
