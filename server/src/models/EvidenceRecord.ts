import { Schema, model, Document, Types } from 'mongoose';

export interface IEvidenceRecord extends Document {
  demandId?: Types.ObjectId;
  hotspotId?: Types.ObjectId;
  datasetId: Types.ObjectId;
  dataRecordIds: Types.ObjectId[];
  evidenceType: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL' | 'INSUFFICIENT_DATA';
  indicator: string;
  observedValue: string | number;
  comparisonValue?: string | number;
  unit?: string;
  relationship: string;
  geographicDistance?: number;
  evidenceStrength: number;
  confidence: number;
  source: string;
  explanation: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const evidenceRecordSchema = new Schema<IEvidenceRecord>({
  demandId: { type: Schema.Types.ObjectId, ref: 'NormalizedDemand', index: true },
  hotspotId: { type: Schema.Types.ObjectId, ref: 'DemandHotspot', index: true },
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  dataRecordIds: [{ type: Schema.Types.ObjectId, ref: 'DataRecord' }],
  evidenceType: { 
    type: String, 
    enum: ['SUPPORTING', 'CONTRADICTING', 'NEUTRAL', 'INSUFFICIENT_DATA'],
    required: true 
  },
  indicator: { type: String, required: true },
  observedValue: { type: Schema.Types.Mixed, required: true },
  comparisonValue: { type: Schema.Types.Mixed },
  unit: { type: String },
  relationship: { type: String, required: true },
  geographicDistance: { type: Number },
  evidenceStrength: { type: Number, required: true, default: 0 },
  confidence: { type: Number, required: true, default: 0 },
  source: { type: String, required: true },
  explanation: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const EvidenceRecord = model<IEvidenceRecord>('EvidenceRecord', evidenceRecordSchema);
