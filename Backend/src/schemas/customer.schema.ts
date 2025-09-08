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

// Tạo index để tối ưu performance
CustomerSchema.index({ name: 1 }); // Index cho tên khách hàng
CustomerSchema.index({ phone: 1 }); // Index cho số điện thoại
CustomerSchema.index({ agentId: 1 }); // Index cho đại lý
CustomerSchema.index({ agentName: 1 }); // Index cho tên đại lý
CustomerSchema.index({ email: 1 }); // Index cho email
CustomerSchema.index({ isActive: 1 }); // Index cho trạng thái

// Compound index để tối ưu search
CustomerSchema.index({ 
  name: 'text', 
  phone: 'text', 
  email: 'text', 
  agentName: 'text' 
}); // Text index cho search 