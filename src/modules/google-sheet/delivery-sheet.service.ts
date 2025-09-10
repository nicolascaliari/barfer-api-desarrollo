import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { GoogleAuthService } from './google-auth.service';
import { sheets_v4 } from '@googleapis/sheets';

@Injectable()
export class DeliverySheetService {
  private sheets: sheets_v4.Sheets;

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {
    this.initializeGoogleSheets();
  }

  private async initializeGoogleSheets() {
    this.sheets = await this.googleAuthService.getAuthClient();
  }

  private async addHeadersToSheet(spreadsheetId: string, sheetName: string) {
    const headers = [
      'Fecha de pedido',
      'Nota de pedido',
      '$ de envío',
      'Estado de envío',
      'Cliente',
      'Dirección',
      'Es departamento?',
      'Piso y Departamento',
      'Entre calles',
      'Teléfono',
      'Email',
      'Productos',
      'Total',
      'Medio de Pago',
      'Estado de pago',
      'Comprobante',
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:P1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
  }

  async updateZoneSheetName(oldZoneName: string, newZoneName: string): Promise<void> {
    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SHEET_SAME_DAY_ID',
    );

    try {
      // Obtener el ID de la hoja actual
      const sheetId = await this.getSheetId(spreadsheetId, oldZoneName);

      // Actualizar el nombre de la hoja
      const requests = [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: newZoneName,
            },
            fields: 'title',
          },
        },
      ];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        // Si la hoja no existe, no hacemos nada
        return;
      }
      throw error;
    }
  }

  async addOrderToZoneSheet(order: any, pageName: string): Promise<void> {
    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SHEET_SAME_DAY_ID',
    );

    // Asegurarse de que existe la hoja para la zona
    await this.createSheetForZone(pageName);

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${pageName}!A:P`,
    });

    const nextRow = (response.data.values?.length || 1) + 1;
    const orderValues = this.formatOrderValues(order);

    // Actualizar valores y aplicar validaciones en una sola operación
    const requests = [
      {
        updateCells: {
          rows: [
            {
              values: [
                ...orderValues.slice(0, -1).map((value) => ({
                  userEnteredValue: { stringValue: value?.toString() || '' },
                })),
                {
                  userEnteredValue: {
                    formulaValue:
                      '=HIPERVINCULO("Insertar link", "Ver comprobante")',
                  },
                },
              ],
            },
          ],
          fields: 'userEnteredValue',
          range: {
            sheetId: await this.getSheetId(spreadsheetId, pageName),
            startRowIndex: nextRow - 1,
            endRowIndex: nextRow,
            startColumnIndex: 0,
            endColumnIndex: orderValues.length,
          },
        },
      },
      // Estado de envío dropdown
      {
        repeatCell: {
          range: {
            sheetId: await this.getSheetId(spreadsheetId, pageName),
            startRowIndex: nextRow - 1,
            endRowIndex: nextRow,
            startColumnIndex: 3,
            endColumnIndex: 4,
          },
          cell: {
            dataValidation: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Pendiente' },
                  { userEnteredValue: 'Pidiendo' },
                  { userEnteredValue: 'En viaje' },
                  { userEnteredValue: 'Listo' },
                ],
              },
              strict: true,
              showCustomUi: true,
            },
          },
          fields: 'dataValidation',
        },
      },
      // Estado de pago dropdown
      {
        repeatCell: {
          range: {
            sheetId: await this.getSheetId(spreadsheetId, pageName),
            startRowIndex: nextRow - 1,
            endRowIndex: nextRow,
            startColumnIndex: 14,
            endColumnIndex: 15,
          },
          cell: {
            dataValidation: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Pendiente' },
                  { userEnteredValue: 'Confirmado' },
                ],
              },
              strict: true,
              showCustomUi: true,
            },
          },
          fields: 'dataValidation',
        },
      },
    ];

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    // Actualizar el formato de fecha y agregar el hipervínculo
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${pageName}!A${nextRow}:P${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            moment(order.createdAt).format('DD/MM/YY'),
            ...orderValues.slice(1, -1),
            '=HIPERVINCULO("Insertar link", "Ver comprobante")',
          ],
        ],
      },
    });
  }

  private async getSheetId(
    spreadsheetId: string,
    sheetName: string,
  ): Promise<number> {
    const sheetsResponse = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = sheetsResponse.data.sheets.find(
      (s: any) => s.properties.title === sheetName,
    );

    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    return sheet.properties.sheetId;
  }

  private formatOrderValues(order: any): any[] {
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

    // Combinar piso y departamento
    const pisoYDepartamento = [
      order.address.floorNumber ? `Piso ${order.address.floorNumber}` : '',
      order.address.departmentNumber
        ? `Depto ${order.address.departmentNumber}`
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Combinar notas del pedido y notas de dirección
    const notes = [order.notes, order.address.reference]
      .filter(Boolean)
      .join('\n');

    return [
      '', // La fecha se agregará después con formato
      notes,
      '', // $ de envío (vacío para que lo complete el cliente)
      'Pendiente',
      `${order.user.name} ${order.user.lastName}`,
      address,
      order.address.floorNumber ? 'Sí' : 'No',
      pisoYDepartamento || ' ',
      order.address.betweenStreets || ' ',
      order.user.phoneNumber || order.address.phone || ' ',
      order.user.email,
      products,
      order.total.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }),
      'Transferencia',
      'Pendiente',
      '', // El hipervínculo se agregará después
    ];
  }

  async createSheetForZone(zoneName: string): Promise<string> {
    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SHEET_SAME_DAY_ID',
    );

    // Crear una nueva hoja para la zona
    const requests = [
      {
        addSheet: {
          properties: {
            title: zoneName,
          },
        },
      },
    ];

    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });

      // Agregar encabezados a la nueva hoja
      await this.addHeadersToSheet(spreadsheetId, zoneName);

      return zoneName;
    } catch (error) {
      if (error.message.includes('already exists')) {
        return zoneName; // La hoja ya existe
      }
      throw error;
    }
  }

  async getOrdersByZone(zoneName: string): Promise<any[]> {
    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SHEET_SAME_DAY_ID',
    );

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${zoneName}!A2:P`,
      });

      return response.data.values || [];
    } catch (error) {
      if (error.message.includes('not found')) {
        return [];
      }
      throw error;
    }
  }
}
