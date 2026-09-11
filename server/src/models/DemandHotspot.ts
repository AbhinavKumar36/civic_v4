import { Schema, model, Document, Types } from 'mongoose';

export interface IDemandHotspot extends Document {
  themeId: Types.ObjectId;
  center: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  radius: number;
  demandCount: number;
  uniqueCitizenCount: number;
  coherenceScore: number;
  intensity: number;
  firstObservedAt: Date;
  lastObservedAt: Date;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const hotspotSchema = new Schema<IDemandHotspot>({
  themeId: { type: Schema.Types.ObjectId, ref: 'Theme', required: true, index: true },
  center: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  radius: { type: Number, required: true },
  demandCount: { type: Number, required: true },
  uniqueCitizenCount: { type: Number, required: true },
  coherenceScore: { type: Number, required: true },
  intensity: { type: Number, required: true },
  firstObservedAt: { type: Date, required: true },
  lastObservedAt: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' }
}, { timestamps: true });

// Create a 2dsphere index for location queries
hotspotSchema.index({ center: '2dsphere' });

export const DemandHotspot = model<IDemandHotspot>('DemandHotspot', hotspotSchema);
