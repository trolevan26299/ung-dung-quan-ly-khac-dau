import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_ROLES } from '../constants';

export type UserDocument = User & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, maxlength: 100 })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Object.values(USER_ROLES), default: USER_ROLES.EMPLOYEE })
  role: string;

  @Prop({ required: true, maxlength: 100 })
  fullName: string;

  @Prop({ maxlength: 11 })
  phone?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLogin?: Date;

  // Timestamps được tự động thêm bởi MongoDB
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes (username KHÔNG unique để tránh lỗi build index trên dữ liệu cũ; vẫn tăng tốc lookup đăng nhập)
UserSchema.index({ username: 1 }); // Lookup đăng nhập: findOne({ username, isActive })
UserSchema.index({ role: 1 }); // Lọc theo vai trò