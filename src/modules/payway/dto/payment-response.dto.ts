export interface PaymentResponseDto {
  id: number;
  site_transaction_id: string;
  payment_method_id: number;
  card_brand: string;
  amount: number;
  currency: string;
  status: string;
  status_details: {
    ticket: string;
    card_authorization_code: string;
    address_validation_code: string;
    error: any;
  };
  date: string;
  customer?: {
    id: string;
    email: string;
  };
  bin: string;
  installments: number;
  first_installment_expiration_date?: string;
  payment_type: string;
  sub_payments?: any[];
  site_id: string;
  fraud_detection?: {
    status: string;
  };
  aggregate_data?: {
    indicator: string;
    identification_number: string;
    bill_to_pay: string;
    bill_to_refund: string;
    merchant_name: string;
    street: string;
    number: string;
    postal_code: string;
    category: string;
    channel: string;
    geographic_zone: string;
    city: string;
    merchant_id: string;
    country: string;
    invoice_number: string;
    establishment_name: string;
  };
}
