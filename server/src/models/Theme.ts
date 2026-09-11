import { Schema, model, Document, Types } from 'mongoose';

export interface ITheme extends Document {
  name: string;
  summary: string;
  category: string;
  subCategory?: string;
  representativeDemandId?: Types.ObjectId;
  demandCount: number;
  uniqueCitizenCount: number;
  languageDistribution: Record<string, number>;
  recurrenceStatus: 'RECURRING' | 'EMERGING' | 'ISOLATED';
  coherenceScore: number;
  geographicSpread: number;
  firstObservedAt: Date;
  lastObservedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const themeSchema = new Schema<ITheme>({
  name: { type: String, required: true },
  summary: { type: String, required: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String },
  representativeDemandId: { type: Schema.Types.ObjectId, ref: 'NormalizedDemand' },
  demandCount: { type: Number, default: 0 },
  uniqueCitizenCount: { type: Number, default: 0 },
  languageDistribution: { type: Schema.Types.Mixed, default: {} },
  recurrenceStatus: { type: String, enum: ['RECURRING', 'EMERGING', 'ISOLATED'], default: 'ISOLATED', index: true },
  coherenceScore: { type: Number, default: 0 },
  geographicSpread: { type: Number, default: 0 },
  firstObservedAt: { type: Date },
  lastObservedAt: { type: Date }
}, { timestamps: true });

export const Theme = model<ITheme>('Theme', themeSchema);
