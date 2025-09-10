import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PayerDto } from './payer.dto';
import { BackUrlsDto } from './back-urls.dto';
import { MpItemDto } from './item.dto';

export class MpOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: MpItemDto[];

  @IsOptional()
  payer: PayerDto;

  @IsOptional()
  back_urls: BackUrlsDto;

  @IsOptional()
  @IsString()
  auto_return: string;

  @IsOptional()
  @IsString()
  picture_url: string;

  @IsString()
  @IsNotEmpty()
  notification_url: string;

  @IsString()
  @IsNotEmpty()
  external_reference: string;
}
