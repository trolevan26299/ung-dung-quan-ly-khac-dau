import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string; // Tên danh mục

  @Prop()
  description: string; // Mô tả danh mục

  @Prop({ default: true })
  isActive: boolean; // Trạng thái hoạt động
}

export const CategorySchema = SchemaFactory.createForClass(Category); 