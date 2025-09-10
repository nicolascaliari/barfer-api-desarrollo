import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankInfoDocument = BankInfo & Document;

@Schema({ timestamps: true })
export class BankInfo {
  @Prop({ required: true })
  cvu: string;

  @Prop({ required: true })
  alias: string;

  @Prop({ required: true })
  cuit: string;

  @Prop({ required: true })
  businessName: string;
}

export const BankInfoSchema = SchemaFactory.createForClass(BankInfo); 