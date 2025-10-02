import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
const sdkModulo = require('sdk-node-payway');

@Injectable()
export class PaywayService {
  private readonly sdkInstance: any;
  private readonly siteId: string;
  private readonly publicApiKey: string;
  private readonly privateApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.siteId = this.configService.get<string>('PAYWAY_SITE_ID') || '';
    this.publicApiKey = this.configService.get<string>('PAYWAY_PUBLIC_API_KEY') || '';
    this.privateApiKey = this.configService.get<string>('PAYWAY_PRIVATE_API_KEY') || '';

    // Initialize Payway SDK (class, not function)
    const environment = this.configService.get<string>('NODE_ENV') === 'production' ? 'production' : 'developer';
    const company = 'Barfer'; // Puedes personalizar este valor
    const user = 'Backend';   // Puedes personalizar este valor
    this.sdkInstance = new sdkModulo.sdk(environment, this.publicApiKey, this.privateApiKey, company, user);
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
    const paymentData = {
      site_transaction_id: createPaymentDto.site_transaction_id,
      token: createPaymentDto.token,
      payment_method_id: createPaymentDto.payment_method_id,
      bin: createPaymentDto.bin,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency,
      installments: createPaymentDto.installments,
      description: createPaymentDto.description,
      payment_type: 'single',
      sub_payments: createPaymentDto.sub_payments,
      site_id: createPaymentDto.site_id,
      fraud_detection: createPaymentDto.fraud_detection, // Este campo debe venir del frontend
      apiKey: this.privateApiKey,
      'Content-Type': 'application/json'
    };

    // Verificar que la instancia tiene el método payment
    if (!this.sdkInstance || typeof this.sdkInstance.payment !== 'function') {
      // console.error('Payway SDK instance is invalid:', this.sdkInstance);
      throw new HttpException('Payway SDK not initialized correctly', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Adapt callback a promise
    return new Promise((resolve, reject) => {
      this.sdkInstance.payment(paymentData, (err: any, result: any) => {
        // Si el resultado está en result y es aprobado
        if (result && result.status === 'approved') {
          resolve(result);
          return;
        }
        // Si el resultado está en err y es aprobado (bug del SDK)
        if (err && err.status === 'approved' && (!result || result === "")) {
          resolve(err);
          return;
        }
        if (err) {
          // Solo loguear errores reales
          // console.error('Error creando Payway payment:', err);
          reject(new HttpException('Failed to process Payway payment', HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          resolve(result);
        }
      });
    });
  }

}
