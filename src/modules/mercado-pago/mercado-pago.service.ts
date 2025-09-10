import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MpOrderDto } from './dto/order-mp.dto';

@Injectable()
export class MercadoPagoService {
  private accessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
  }

  async create(createMercadoPagoDto: MpOrderDto) {
    const url = this.configService.get<string>('MP_BASE_URL');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.post(url, createMercadoPagoDto, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error creating Mercado Pago order:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        'Failed to create Mercado Pago order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPayment(paymentId: string) {
    const url = `${this.configService.get<string>('MP_PAYMENT_URL')}/${paymentId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error getting Mercado Pago payment:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        'Failed to get Mercado Pago payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
