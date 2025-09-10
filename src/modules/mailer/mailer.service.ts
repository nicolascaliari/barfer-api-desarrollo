import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../../schemas/order.schema';
import { formatPrice } from '../../common/utils/formatPrice';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}

  async sendMail(to: string, subject: string, text?: string, html?: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_FROM'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: any = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject,
    };

    if (text) mailOptions.text = text;
    if (html) mailOptions.html = html;

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  async sendPasswordResetEmail(userEmail: string, resetPasswordToken: string) {
    const subject = 'Reestablecer contraseña';
    const text = `Hola, has solicitado restablecer tu contraseña. Para hacerlo, haz click en el siguiente enlace: ${this.configService.get<string>('FRONTEND_BASE_URL')}/autenticacion/cambiar-contrasena/restablecer/${resetPasswordToken}`;

    await this.sendMail(userEmail, subject, text);
  }

  async sendOrderConfirmationEmail(userEmail: string, order: Order) {
    const subject = 'Confirmación de Pedido';
    const deliveryDate = order.deliveryDate || 'Fecha no especificada';

    const quantityTotal = order.items.reduce(
      (prev, acc) => acc.options[0].quantity + prev,
      0,
    );

    const productsHtml = order.items
      .map((product) => {
        const subTotal =
          product.options[0]?.price * product.options[0]?.quantity;
        const cashDiscount =
          order.paymentMethod === 'cash'
            ? (product.options[0]?.price * product.options[0]?.quantity * 10) /
              100
            : 0;
        const totalDiscount = (product.discountApplied || 0) + cashDiscount;
        const discountedPrice = subTotal - totalDiscount;

        return `
        <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
          <img src="${product.images[0]}" alt="Product Image" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px; background-color: #fff;" />
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: bold;">${product.options[0]?.quantity} ${product.name} - ${product.options[0]?.name}</p>
            <p style="margin: 0; color: #666;">${product.options[0]?.description}</p>
          </div>
          <div style="text-align: right; margin-left: 1rem;">
            <p style="margin: 0; ${totalDiscount > 0 ? 'text-decoration: line-through;' : ''}">${formatPrice(subTotal)}</p>
            ${totalDiscount > 0 ? `<p style="margin: 0; color: #e63946;">${formatPrice(discountedPrice)}</p>` : ''}
          </div>
        </div>
      `;
      })
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #265ba7; border-radius: 10px; color: #FFFFD9;">
        <div style="text-align: center;">
         <img src="https://res.cloudinary.com/maurov069/image/upload/v1732128835/4_czbc1z.png" alt="Brand Logo" style="width: 100px; height: auto; border-radius: 999px; background-color: #ffffd9;" />
        </div>
        <h1 style="text-align: center; color: #FFFFD9;">¡Gracias por tu compra!</h1>
        <div style="background-color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: #333;">
          <h2 style="margin-bottom: 10px;">${quantityTotal} productos en tu compra (${formatPrice(order.total)})</h2>
          ${productsHtml}
        </div>
        <div style="background-color: #fff; padding: 20px; border-radius: 10px; color: #333;">
          <h2 style="margin-bottom: 10px;">Detalles de envío</h2>
          <p><strong>Fecha de entrega:</strong> ${deliveryDate}</p>
          <p><strong>Dirección:</strong> ${order.address?.address}</p>
          <p><strong>Teléfono:</strong> ${order.address?.phone}</p>
          <p><strong>Método de pago:</strong> ${order.paymentMethod === 'cash' ? 'A pagar en efectivo' : 'Pago con Mercado Pago'}</p>
        </div>
      </div>
    `;

    await this.sendMail(userEmail, subject, undefined, html);
  }
}
