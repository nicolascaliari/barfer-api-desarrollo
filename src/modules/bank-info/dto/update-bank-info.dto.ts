import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBankInfoDto {
  @IsString()
  @IsNotEmpty()
  cvu: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsNotEmpty()
  cuit: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;
} 