import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import 'moment/locale/es';
import { formatPrice } from '../../common/utils/formatPrice';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class GoogleSheetsService {
  private sheets: any;

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {
    this.initializeGoogleSheets();
  }

  async initializeGoogleSheets() {
    this.sheets = await this.googleAuthService.getAuthClient();
  }

  async addOrderToSheet(order: any): Promise<void> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A1';

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const existingValues = response.data.values;
    const [deliveryDate, time] = order.deliveryDate.split(' de ');

    const STATUS = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      canceled: 'Cancelado',
    };

    const PAYMENT_METHOD = {
      cash: 'Efectivo',
      'mercado-pago': 'MercadoPago',
    };

    const values =
      existingValues && existingValues.length > 0
        ? this.getOrderValues(order, deliveryDate, time, STATUS, PAYMENT_METHOD)
        : this.getHeaderValues(
            order,
            deliveryDate,
            time,
            STATUS,
            PAYMENT_METHOD,
          );

    const resource = { values };
    const newRange = `hoja!A${existingValues ? existingValues.length + 1 : 1}`;

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: newRange,
      valueInputOption: 'RAW',
      requestBody: resource,
    });
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A2:Z'; // Comienza en A2 para evitar la fila de encabezado

    // Obtener todos los valores del rango
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // Buscar la fila correspondiente al orderId
    const rowIndex = rows.findIndex((row) => row[0] === orderId);

    if (rowIndex === -1) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    // Actualizar el estado de la orden
    const statusColumnIndex = 15; // La columna de "Estado" es la columna 15, así que su índice es 14
    rows[rowIndex][statusColumnIndex] = newStatus;

    // +2 porque A1 es encabezado y +1 porque la fila empieza desde 1 en la hoja
    const updatedRange = `hoja!A${rowIndex + 2}:Z${rowIndex + 2}`;
    const resource = {
      values: [rows[rowIndex]],
    };

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updatedRange,
      valueInputOption: 'RAW',
      requestBody: resource,
    });
  }

  async verifyDataInSheet(): Promise<any[]> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A1:Z';

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  }

  private getOrderValues(
    order: any,
    deliveryDate: string,
    time: string,
    STATUS: any,
    PAYMENT_METHOD: any,
  ) {
    const products = order.items
      .map(
        (item: any) =>
          `${item.name} - ${item.options[0]?.name} - ${item.options[0]?.quantity}`,
      )
      .join('\n');

    let address = order.address.address;

    if (order.address.city) {
      address += `, ${order.address.city}`;
    }

    return [
      [
        order._id,
        moment(order.createdAt).locale('es').format('DD/MM'),
        deliveryDate,
        `${time}`,
        `${order.user.name} ${order.user.lastName}`,
        `${order.address.floorNumber ? 'Sí' : 'No'}`,
        address,
        `${order.address.reference !== undefined ? order.address.reference : ' '}`,
        `${
          order.address.floorNumber !== undefined &&
          order.address.floorNumber !== 'null' &&
          order.address.floorNumber !== null
            ? order.address.floorNumber
            : ' '
        }`,
        `${
          order.address.departmentNumber !== undefined &&
          order.address.departmentNumber !== 'null' &&
          order.address.departmentNumber !== null
            ? order.address.departmentNumber
            : ' '
        }`,
        `${order.user.phoneNumber || order.address.phone || ' '}`,
        order.user.email,
        products,
        formatPrice(order.total),
        PAYMENT_METHOD[order.paymentMethod],
        STATUS[order.status],
        order.notes !== undefined && order.notes.trim() !== ''
          ? order.notes
          : ' ',
        `${
          order.address.betweenStreets !== undefined &&
          order.address.betweenStreets.trim() !== ''
            ? `Entre calles: ${order.address.betweenStreets}`
            : ' '
        }`,
      ],
    ];
  }

  private getHeaderValues(
    order: any,
    deliveryDate: string,
    time: string,
    STATUS: any,
    PAYMENT_METHOD: any,
  ) {
    return [
      [
        'ID de pedido',
        'Fecha de pedido',
        'Fecha de entrega',
        'Horario de entrega',
        'Cliente',
        'Es departamento?',
        'Dirección',
        'Nota de dirección',
        'Piso',
        'Departamento',
        'Teléfono',
        'Email',
        'Productos',
        'Total',
        'Medio de Pago',
        'Estado',
        'Nota del pedido',
        'Entre calles',
      ],
      ...this.getOrderValues(order, deliveryDate, time, STATUS, PAYMENT_METHOD),
    ];
  }
}
