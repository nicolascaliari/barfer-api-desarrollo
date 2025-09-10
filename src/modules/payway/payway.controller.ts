import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaywayService } from './payway.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

@Controller('payway')
export class PaywayController {
  constructor(private readonly paywayService: PaywayService) {}

  /**
   * Endpoint 1: Create a payment token
   * This is the first step in the payment process - tokenize the card
   */
  @Post('token')
  @Auth(Roles.User)
  async createToken(@Body() createTokenDto: CreateTokenDto) {
    return this.paywayService.createToken(createTokenDto);
  }

  /**
   * Endpoint 2: Process payment using the token
   * This is the second step - actually process the payment
   */
  @Post('payment')
  @Auth(Roles.User)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paywayService.createPayment(createPaymentDto);
  }

  /**
   * Additional endpoint: Get payment details
   * Useful for checking payment status
   */
  @Get('payment/:id')
  // @Auth(Roles.User)
  async getPayment(@Param('id') paymentId: string) {
    return this.paywayService.getPayment(paymentId);
  }
}
