import { IsNotEmpty, IsString } from 'class-validator';

export class BackUrlsDto {
  @IsString()
  @IsNotEmpty()
  success: string;

  @IsString()
  @IsNotEmpty()
  failure: string;

  @IsString()
  @IsNotEmpty()
  pending: string;
}
