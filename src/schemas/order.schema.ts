import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AddressDto } from '../modules/address/dto/address.dto';
import { UserDto } from '../modules/users/dto/user.dto';
import { ProductDto } from '../modules/products/dto/product.dto';
import { DeliveryAreaDto } from '../modules/delivery-areas/dto/delivery-area.dto';

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    required: true,
  })
  status: string;

  @Prop({
    required: true,
  })
  total: number;

  @Prop({
    required: true,
  })
  items: ProductDto[];

  @Prop({
    required: true,
  })
  subTotal: number;

  @Prop({
    required: false,
    default: 0,
  })
  shippingPrice?: number;

  @Prop({
    required: true,
  })
  notes: string;

  @Prop({
    required: true,
  })
  address: AddressDto;

  @Prop({
    required: true,
  })
  user: UserDto;

  @Prop({
    required: true,
  })
  paymentMethod: string;

  @Prop({
    required: false,
  })
  paymentMethodDiscount: number;

  @Prop({
    isOptional: true,
  })
  coupon?: string;

  @Prop({
    required: false,
    default: 0,
  })
  couponDiscount?: number;

  @Prop({
    isOptional: true,
  })
  deliveryArea?: DeliveryAreaDto;

  // New field: deliveryDate
  @Prop({
    required: false,
  })
  deliveryDate?: string;

  // New field: deliveryDay as Date format
  @Prop({
    required: false,
  })
  deliveryDay?: Date;

  // New field: orderType
  @Prop({
    required: false,
  })
  orderType?: string;

  // New field: whatsappContactedAt
  @Prop({
    required: false,
  })
  whatsappContactedAt?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
