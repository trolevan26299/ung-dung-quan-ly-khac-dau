import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  taxCode: string; // MST

  @Prop()
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agentId: Types.ObjectId; // Đại lý phụ trách

  @Prop({ required: true })
  agentName: string; // Tên đại lý (để dễ truy vấn)

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  notes: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer); 