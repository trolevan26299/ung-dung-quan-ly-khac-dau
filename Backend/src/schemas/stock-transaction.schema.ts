import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockTransactionDocument = StockTransaction & Document;

@Schema({ timestamps: true })
export class StockTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productCode: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, enum: ['import', 'export', 'adjustment'] })
  transactionType: string; // import: nhập kho, export: xuất kho, adjustment: điều chỉnh

  @Prop({ required: true })
  quantity: number; // Số lượng (âm cho xuất kho)

  @Prop({ default: 0 })
  unitPrice: number; // Giá đơn vị (cho nhập kho)

  @Prop({ default: 0 })
  vat: number; // VAT (%) áp dụng cho nhập kho

  @Prop({ default: 0 })
  totalValue: number; // Tổng giá trị

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId; // Liên kết với đơn hàng (nếu có)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Người thực hiện

  @Prop()
  userName: string;

  @Prop()
  reason: string; // Lý do giao dịch

  @Prop()
  notes: string;

  @Prop({ default: Date.now })
  transactionDate: Date;

  @Prop()
  stockBefore: number; // Tồn kho trước giao dịch

  @Prop()
  stockAfter: number; // Tồn kho sau giao dịch
}

export const StockTransactionSchema = SchemaFactory.createForClass(StockTransaction); 