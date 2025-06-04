import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceCode: string; // Mã hóa đơn (HD000001)

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId; // Liên kết với đơn hàng

  @Prop({ required: true })
  orderCode: string; // Mã đơn hàng

  @Prop({ required: true })
  customerName: string;

  @Prop()
  customerPhone: string;

  @Prop()
  customerAddress: string;

  @Prop()
  customerTaxCode: string;

  @Prop()
  agentName: string;

  @Prop({ required: true })
  employeeName: string; // Nhân viên tạo hóa đơn

  @Prop({ required: true })
  invoiceDate: Date; // Ngày xuất hóa đơn

  @Prop({ required: true })
  subtotal: number; // Tổng tiền hàng

  @Prop({ default: 0 })
  vat: number; // VAT

  @Prop({ default: 0 })
  shippingFee: number; // Phí vận chuyển

  @Prop({ required: true })
  totalAmount: number; // Tổng tiền

  @Prop({ required: true, enum: ['pending', 'completed', 'debt'] })
  paymentStatus: string; // Trạng thái thanh toán

  @Prop()
  notes: string;

  @Prop({ default: false })
  isPrinted: boolean; // Đã in chưa

  @Prop()
  printedAt: Date; // Thời gian in

  @Prop()
  printedBy: string; // Người in
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice); 