import { Schema, model, Document } from 'mongoose';

export interface IOTPRequest extends Document {
  phone: string;
  requestId: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

const otpRequestSchema = new Schema<IOTPRequest>({
  phone: { type: String, required: true },
  requestId: { type: String, required: true, unique: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '5m' } },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export const OTPRequest = model<IOTPRequest>('OTPRequest', otpRequestSchema);
