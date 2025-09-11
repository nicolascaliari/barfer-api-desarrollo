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
   * This endpoint uses the private API key and automatically resolves payment_method_id from BIN
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    let paymentMethodId = createPaymentDto.payment_method_id;
    let binCode = createPaymentDto.bin;

    // If payment_method_id is not provided, we need to get it from BIN matching
    if (!paymentMethodId) {
      // First, we need to get the BIN from the token if not provided
      if (!binCode) {
        // Get BIN from token by making a test call or from token structure
        // For now, we'll require either payment_method_id or bin to be provided
        throw new HttpException(
          'Either payment_method_id or bin must be provided for automatic method resolution',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get payment methods and find matching BIN
      try {
        const paymentMethods = await this.getPaymentMethods();
        
        // Find the payment method that matches the BIN
        let foundMethod = null;
        for (const method of paymentMethods) {
          if (method.bins && Array.isArray(method.bins)) {
            const matchingBin = method.bins.find((binInfo: any) => 
              binCode.startsWith(binInfo.bin) || binInfo.bin.startsWith(binCode)
            );
            if (matchingBin) {
              foundMethod = method;
              break;
            }
          }
        }

        if (!foundMethod) {
          throw new HttpException(
            `No payment method found for BIN: ${binCode}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        paymentMethodId = foundMethod.id;
        console.log(`Auto-resolved payment_method_id: ${paymentMethodId} for BIN: ${binCode}`);
      } catch (error) {
        console.error('Error resolving payment method from BIN:', error);
        throw new HttpException(
          'Failed to resolve payment method from BIN',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const url = `${this.baseUrl}/payments`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.privateApiKey,
    };

    // Prepare payment data with resolved payment_method_id
    const paymentData = {
      ...createPaymentDto,
      payment_method_id: paymentMethodId,
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
   * Get available payment methods with their BIN ranges
   * This endpoint helps match BIN codes to payment_method_id
   */
  async getPaymentMethods(): Promise<any> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${this.baseUrl}/payment_methods`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.privateApiKey,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error getting Payway payment methods:',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        error.response?.data?.message || 'Failed to get Payway payment methods',
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
