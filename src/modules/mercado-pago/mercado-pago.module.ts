import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoController } from './mercado-pago.controller';

@Module({
  controllers: [MercadoPagoController],
  exports: [MercadoPagoService],
  providers: [MercadoPagoService],
})
export class MercadoPagoModule {}
