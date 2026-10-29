import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientAccountDocument = ClientAccount & Document & {
  createdAt: Date;
  updatedAt: Date;
};

// Tài khoản đăng nhập web đại lý (khacdau-client) — tách riêng khỏi User nội bộ,
// không có quyền gọi API nội bộ.
@Schema({ timestamps: true, collection: 'client_accounts' })
export class ClientAccount {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, maxlength: 50 })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  displayName: string; // Tên đại lý / người dùng, điền sẵn vào mục ủy quyền

  @Prop({ trim: true, maxlength: 20 })
  phone?: string;

  @Prop({ trim: true, maxlength: 300 })
  address?: string;

  @Prop({ trim: true, maxlength: 500 })
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const ClientAccountSchema = SchemaFactory.createForClass(ClientAccount);
