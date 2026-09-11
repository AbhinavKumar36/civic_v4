import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  email?: string;
  password?: string;
  name?: string;
  dob?: string;
  role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN' | 'WORKER';
  language: string;
  isVerified: boolean;
  identityStatus: 'NOT_VERIFIED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'VERIFICATION_FAILED';
  verifiedVia?: 'AADHAAR' | 'MANUAL';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true, index: true },
  email: { type: String, sparse: true, index: true },
  password: { type: String },
  name: { type: String },
  dob: { type: String },
  role: { 
    type: String, 
    enum: ['CITIZEN', 'AUTHORITY', 'ADMIN', 'WORKER'], 
    default: 'CITIZEN' 
  },
  language: { type: String, default: 'en' },
  isVerified: { type: Boolean, default: false },
  identityStatus: {
    type: String,
    enum: ['NOT_VERIFIED', 'VERIFICATION_PENDING', 'VERIFIED', 'VERIFICATION_FAILED'],
    default: 'NOT_VERIFIED'
  },
  verifiedVia: { type: String, enum: ['AADHAAR', 'MANUAL'] }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
