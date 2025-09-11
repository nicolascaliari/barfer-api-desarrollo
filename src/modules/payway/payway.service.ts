import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
// Note: Using sdk-node-payway instead of the official decidir-sdk-nodejs
// If you want to use the official SDK, install: npm install decidir-sdk-nodejs
const SDK = require('sdk-node-payway');

@Injectable()
export class PaywayService {
  private readonly sdk: any;
  private readonly siteId: string;
  private readonly publicApiKey: string;
  private readonly privateApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.siteId = this.configService.get<string>('PAYWAY_SITE_ID') || '';
    this.publicApiKey = this.configService.get<string>('PAYWAY_PUBLIC_API_KEY') || '';
    this.privateApiKey = this.configService.get<string>('PAYWAY_PRIVATE_API_KEY') || '';
    
    // Initialize Payway SDK
    const environment = this.configService.get<string>('NODE_ENV') === 'production' ? 'production' : 'developer';
    this.sdk = new SDK(environment, this.publicApiKey, this.privateApiKey);
  }

  /**
   * Create a payment token for a credit card using Payway SDK
   */
  async createToken(createTokenDto: CreateTokenDto): Promise<TokenResponseDto> {
    if (!this.publicApiKey) {
      throw new HttpException(
        'Payway public API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const tokenData = {
        card_number: createTokenDto.card_number,
        card_expiration_month: createTokenDto.card_expiration_month,
        card_expiration_year: createTokenDto.card_expiration_year,
        security_code: createTokenDto.security_code,
        card_holder_name: createTokenDto.card_holder_name,
        card_holder_identification: createTokenDto.card_holder_identification
      };

      // Try using the SDK with Promise-based approach
      const result = await this.sdk.tokens(tokenData);
      return result;
    } catch (error) {
      console.error('Error creating Payway token:', error);
      throw new HttpException(
        'Failed to create Payway token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process a payment using a token with Payway SDK
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const paymentData = {
        site_transaction_id: createPaymentDto.site_transaction_id,
        token: createPaymentDto.token,
        payment_method_id: createPaymentDto.payment_method_id,
        bin: createPaymentDto.bin,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        installments: createPaymentDto.installments || 1,
        description: createPaymentDto.description || '',
        payment_type: createPaymentDto.payment_type || 'single',
        sub_payments: createPaymentDto.sub_payments || [],
        site_id: createPaymentDto.site_id || this.siteId
      };

      // Try using the SDK with Promise-based approach
      const result = await this.sdk.payment(paymentData);
      return result;
    } catch (error) {
      console.error('Error creating Payway payment:', error);
      throw new HttpException(
        'Failed to process Payway payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get payment methods using Payway SDK
   */
  async getPaymentMethods(): Promise<any> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Try using the SDK with Promise-based approach
      const result = await this.sdk.getPaymentMethods();
      return result;
    } catch (error) {
      console.error('Error getting Payway payment methods:', error);
      throw new HttpException(
        'Failed to get Payway payment methods',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get payment details by payment ID using Payway SDK
   */
  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    if (!this.privateApiKey) {
      throw new HttpException(
        'Payway private API key is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Try using the SDK with Promise-based approach
      const result = await this.sdk.getPayment(paymentId);
      return result;
    } catch (error) {
      console.error('Error getting Payway payment:', error);
      throw new HttpException(
        'Failed to get Payway payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
