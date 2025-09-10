import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsService } from './google-sheet.service';
import { DeliverySheetService } from './delivery-sheet.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleSheetsService, GoogleAuthService, DeliverySheetService],
  exports: [GoogleSheetsService, DeliverySheetService],
})
export class GoogleSheetModule {}
