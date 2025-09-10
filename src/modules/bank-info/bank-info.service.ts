import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankInfo, BankInfoDocument } from '../../schemas/bank-info.schema';
import { UpdateBankInfoDto } from './dto/update-bank-info.dto';

@Injectable()
export class BankInfoService {
  constructor(
    @InjectModel(BankInfo.name)
    private bankInfoModel: Model<BankInfoDocument>,
  ) {}

  async getBankInfo(): Promise<BankInfo> {
    let bankInfo = await this.bankInfoModel.findOne().exec();

    if (!bankInfo) {
      bankInfo = await this.bankInfoModel.create({
        cvu: 'Escribir el cvu',
        alias: 'Escribir el alias',
        cuit: 'Escribir el cuit',
        businessName: 'Escribir el nombre del negocio',
      });
    }

    return bankInfo;
  }

  async updateBankInfo(
    updateBankInfoDto: UpdateBankInfoDto,
  ): Promise<BankInfo> {
    const bankInfo = await this.bankInfoModel.findOne().exec();

    if (!bankInfo) {
      return this.bankInfoModel.create(updateBankInfoDto);
    }

    return this.bankInfoModel
      .findByIdAndUpdate(bankInfo._id, updateBankInfoDto, { new: true })
      .exec();
  }
}
