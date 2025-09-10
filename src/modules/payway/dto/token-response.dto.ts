export interface TokenResponseDto {
  id: string;
  status: string;
  card_number_length: number;
  date_created: string;
  bin: string;
  last_four_digits: string;
  security_code_length: number;
  expiration_month: number;
  expiration_year: number;
  date_due: string;
  cardholder?: {
    identification?: {
      type: string;
      number: string;
    };
    name: string;
  };
}
