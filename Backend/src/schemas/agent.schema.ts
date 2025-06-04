import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
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