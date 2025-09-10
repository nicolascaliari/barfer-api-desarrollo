import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import { sheets_v4, sheets } from '@googleapis/sheets';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  async getAuthClient(): Promise<sheets_v4.Sheets> {
    const auth = new GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
        private_key: this.configService
          .get<string>('GOOGLE_CLIENT_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return sheets({ version: 'v4', auth });
  }
}
