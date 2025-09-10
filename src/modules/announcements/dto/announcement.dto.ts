import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnnouncementDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
