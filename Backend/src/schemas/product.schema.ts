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

// Tạo index để tối ưu performance
ProductSchema.index({ code: 1 }); // Index cho mã hàng (unique)
ProductSchema.index({ name: 1 }); // Index cho tên sản phẩm
ProductSchema.index({ category: 1 }); // Index cho loại sản phẩm
ProductSchema.index({ color: 1 }); // Index cho màu sắc
ProductSchema.index({ isActive: 1 }); // Index cho trạng thái
ProductSchema.index({ stockQuantity: 1 }); // Index cho tồn kho

// Compound index cho search và filter
ProductSchema.index({ 
  name: 'text', 
  code: 'text', 
  category: 'text',
  color: 'text' 
}); // Text index cho search

// Index cho low stock query
ProductSchema.index({ stockQuantity: 1, minStock: 1, isActive: 1 }); 