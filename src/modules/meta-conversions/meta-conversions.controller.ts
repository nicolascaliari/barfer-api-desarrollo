import { Controller, Post, Body, Req } from '@nestjs/common';
import { MetaConversionsService } from './meta-conversions.service';
import { Request } from 'express';

@Controller('meta-conversions')
export class MetaConversionsController {
  constructor(
    private readonly metaConversionsService: MetaConversionsService,
  ) {}

  @Post('add-to-cart')
  async addToCart(
    @Body()
    body: { productId: string; value: number; currency: string; email: string },
    @Req() req: Request,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.metaConversionsService.trackAddToCart(
      body.productId,
      body.value,
      body.email,
      ip as string,
      userAgent,
    );
  }

  @Post('view-content')
  async viewContent(
    @Body()
    body: { productId: string; value: number; currency: string; email: string },
    @Req() req: Request,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.metaConversionsService.trackViewContent(
      body.productId,
      body.value,
      body.currency,
      body.email,
      ip as string,
      userAgent,
    );
  }

  @Post('purchase')
  async purchase(
    @Body()
    body: {
      transactionId: string;
      value: number;
      email: string;
    },
    @Req() req: Request,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Llamar al servicio para emitir el evento de compra a Meta
    return this.metaConversionsService.trackPurchase(
      body.transactionId, // Usar el ID de la transacción como event_id
      body.value, // El valor de la compra
      body.email, // El email del usuario
      ip as string, // Dirección IP del cliente
      userAgent, // El User-Agent del cliente
    );
  }
}
