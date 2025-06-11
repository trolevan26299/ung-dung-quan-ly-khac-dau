import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ maxlength: 500 })
  notes?: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent' })
  agentId?: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ min: 0, max: 100, default: 0 })
  vatRate: number;

  @Prop({ min: 0, default: 0 })
  vatAmount: number;

  @Prop({ min: 0, default: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING })
  paymentStatus: string;

  @Prop({ min: 0, default: 0 })
  paidAmount: number;

  @Prop({ min: 0, default: 0 })
  debtAmount: number;

  @Prop({ type: Date })
  deliveryDate?: Date;

  @Prop({ maxlength: 500 })
  deliveryAddress?: string;

  @Prop({ maxlength: 1000 })
  notes?: string;

  @Prop({ required: true, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.ACTIVE })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 