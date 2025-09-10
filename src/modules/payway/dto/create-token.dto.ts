import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CardHolderIdentificationDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'dni', 'passport', etc.

  @IsString()
  @IsNotEmpty()
  number: string;
}

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @IsString()
  @IsNotEmpty()
  card_expiration_month: string;

  @IsString()
  @IsNotEmpty()
  card_expiration_year: string;

  @IsString()
  @IsNotEmpty()
  security_code: string;

  @IsString()
  @IsNotEmpty()
  card_holder_name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardHolderIdentificationDto)
  card_holder_identification?: CardHolderIdentificationDto;
}
