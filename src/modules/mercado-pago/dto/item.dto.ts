import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MpItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  unit_price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  currency_id: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  picture_url: string;

  @IsOptional()
  @IsString()
  id?: string;
}
