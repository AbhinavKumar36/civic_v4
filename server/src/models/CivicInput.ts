import { Schema, model, Document, Types } from 'mongoose';

export interface ICivicInput extends Document {
  citizenId: Types.ObjectId;
  inputType: 'TEXT' | 'VOICE' | 'IMAGE' | 'MULTIMODAL';
  text?: string;
  originalLanguage?: string;
  media?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: 'RECEIVED' | 'PROCESSING' | 'NORMALIZED' | 'FAILED';
  normalizedDemandId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const civicInputSchema = new Schema<ICivicInput>({
  citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  inputType: { type: String, enum: ['TEXT', 'VOICE', 'IMAGE', 'MULTIMODAL'], required: true },
  text: { type: String },
  originalLanguage: { type: String },
  media: [{ type: String }],
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  status: { type: String, enum: ['RECEIVED', 'PROCESSING', 'NORMALIZED', 'FAILED'], default: 'RECEIVED', index: true },
  normalizedDemandId: { type: Schema.Types.ObjectId, ref: 'NormalizedDemand' },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Create a 2dsphere index for location
civicInputSchema.index({ location: '2dsphere' });

export const CivicInput = model<ICivicInput>('CivicInput', civicInputSchema);
