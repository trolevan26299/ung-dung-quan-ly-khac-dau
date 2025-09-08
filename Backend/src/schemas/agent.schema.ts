import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  notes: string;

  @Prop()
  commissionRate: number; // Tỷ lệ hoa hồng
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

// Tạo index để tối ưu performance
AgentSchema.index({ name: 1 }); // Index cho tên đại lý
AgentSchema.index({ phone: 1 }); // Index cho số điện thoại
AgentSchema.index({ email: 1 }); // Index cho email
AgentSchema.index({ isActive: 1 }); // Index cho trạng thái

// Text index cho search
AgentSchema.index({ 
  name: 'text', 
  phone: 'text', 
  email: 'text' 
}); // Text index cho search 