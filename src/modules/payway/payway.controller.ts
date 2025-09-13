import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaywayService } from './payway.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

@Controller('payway')
export class PaywayController {
  constructor(private readonly paywayService: PaywayService) {}

  @Post('payment')
  @Auth(Roles.User)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paywayService.createPayment(createPaymentDto);
  }

}
