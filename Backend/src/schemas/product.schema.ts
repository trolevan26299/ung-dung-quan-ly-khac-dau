import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  code: string; // Mã hàng (C20 XANH, C20 ĐỎ, etc.)

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  stockQuantity: number; // Số lượng tồn kho

  @Prop({ default: 0 })
  avgImportPrice: number; // Giá nhập trung bình

  @Prop({ default: 0 })
  currentPrice: number; // Giá bán hiện tại

  @Prop()
  category: string; // Loại sản phẩm

  @Prop()
  color: string; // Màu sắc

  @Prop()
  size: string; // Kích thước

  @Prop()
  unit: string; // Đơn vị tính

  @Prop({ default: 0 })
  minStock: number; // Số lượng tồn kho tối thiểu

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  notes: string;

  @Prop()
  imageUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product); 