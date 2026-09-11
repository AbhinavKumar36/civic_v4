import { Schema, model, Document, Types } from 'mongoose';

export interface INormalizedDemand extends Document {
  civicInputId: Types.ObjectId;
  category: string;
  subCategory?: string;
  title: string;
  summary: string;
  demandStatement: string;
  problemStatement?: string;
  affectedGroups?: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  language: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  entities?: string[];
  evidence?: any;
  confidence: number;
  aiProvider: string;
  aiModel: string;
  processingStatus: 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

const normalizedDemandSchema = new Schema<INormalizedDemand>({
  civicInputId: { type: Schema.Types.ObjectId, ref: 'CivicInput', required: true, index: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  demandStatement: { type: String, required: true },
  problemStatement: { type: String },
  affectedGroups: [{ type: String }],
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true, index: true },
  urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true, index: true },
  language: { type: String, required: true, index: true },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  entities: [{ type: String }],
  evidence: { type: Schema.Types.Mixed },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  aiProvider: { type: String, required: true },
  aiModel: { type: String, required: true },
  processingStatus: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' },
}, { timestamps: true });

normalizedDemandSchema.index({ location: '2dsphere' });

export const NormalizedDemand = model<INormalizedDemand>('NormalizedDemand', normalizedDemandSchema);
