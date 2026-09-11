import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name?: string;
  role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN';
  language: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  role: { 
    type: String, 
    enum: ['CITIZEN', 'AUTHORITY', 'ADMIN'], 
    default: 'CITIZEN' 
  },
  language: { type: String, default: 'en' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
