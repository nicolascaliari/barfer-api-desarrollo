import { Controller, Get, Put, Body } from '@nestjs/common';
import { BankInfoService } from './bank-info.service';
import { UpdateBankInfoDto } from './dto/update-bank-info.dto';
import { BankInfo } from '../../schemas/bank-info.schema';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

@Controller('bank-info')
export class BankInfoController {
  constructor(private readonly bankInfoService: BankInfoService) {}

  @Get()
  getBankInfo(): Promise<BankInfo> {
    return this.bankInfoService.getBankInfo();
  }

  @Put()
  @Auth(Roles.Admin)
  updateBankInfo(@Body() updateBankInfoDto: UpdateBankInfoDto): Promise<BankInfo> {
    return this.bankInfoService.updateBankInfo(updateBankInfoDto);
  }
} 