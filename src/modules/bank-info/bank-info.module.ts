import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankInfoController } from './bank-info.controller';
import { BankInfoService } from './bank-info.service';
import { BankInfo, BankInfoSchema } from '../../schemas/bank-info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankInfo.name, schema: BankInfoSchema },
    ]),
  ],
  controllers: [BankInfoController],
  providers: [BankInfoService],
  exports: [BankInfoService],
})
export class BankInfoModule {} 