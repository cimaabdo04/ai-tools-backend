import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentDetails?: string;
}
