import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  site_transaction_id: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNumber()
  @IsNotEmpty()
  payment_method_id: number;

  @IsString()
  @IsNotEmpty()
  bin: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number; // Amount in cents

  @IsString()
  @IsNotEmpty()
  currency: string; // 'ARS', 'USD', etc.

  @IsNumber()
  @IsOptional()
  installments?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  payment_type?: string; // 'single', 'distributed'

  @IsArray()
  @IsOptional()
  sub_payments?: any[];

  @IsString()
  @IsOptional()
  site_id?: string;
}
