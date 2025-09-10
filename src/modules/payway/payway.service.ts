import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaywayService {
  private readonly baseUrl: string;
  private readonly siteId: string;
  private readonly publicApiKey: string;
  private readonly privateApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PAYWAY_BASE_URL') || 'https://developers.decidir.com/api/v2';
    this.siteId = this.configService.get<string>('PAYWAY_SITE_ID') || '';
    this.publicApiKey = this.configService.get<string>('PAYWAY_PUBLIC_API_KEY') || '';
    this.privateApiKey = this.configService.get<string>('PAYWAY_PRIVATE_API_KEY') || '';
  }

  /**
   * Create a payment token for a credit card
   * This endpoint uses the public API key
   */
  async createToken(createTokenDto: CreateTokenDto): Promise<TokenResponseDto> {
    if (!this.publicApiKey) {
      throw new HttpException(
        'Payway public API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${this.baseUrl}/tokens`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.publicApiKey,
    };

    try {
      const response = await axios.post(url, createTokenDto, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error creating Payway token:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        error.response?.data?.message || 'Failed to create Payway token',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process a payment using a token
   * This endpoint uses the private API key
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${this.baseUrl}/payments`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.privateApiKey,
    };

    // Add site_id to the payment data if not provided
    const paymentData = {
      ...createPaymentDto,
      site_id: createPaymentDto.site_id || this.siteId,
    };

    try {
      const response = await axios.post(url, paymentData, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error creating Payway payment:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        error.response?.data?.message || 'Failed to process Payway payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get payment details by payment ID
   */
  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${this.baseUrl}/payments/${paymentId}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.privateApiKey,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error getting Payway payment:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        error.response?.data?.message || 'Failed to get Payway payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
