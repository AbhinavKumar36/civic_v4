import { Schema, model, Document, Types } from 'mongoose';

export interface IDataRecord extends Document {
  datasetId: Types.ObjectId;
  externalRecordId?: string;
  category: string;
  entityType: string;
  name: string;
  attributes: Record<string, any>;
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  geography?: Record<string, any>;
  sourceReference?: string;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dataRecordSchema = new Schema<IDataRecord>({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  externalRecordId: { type: String, index: true },
  category: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  name: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  geography: { type: Schema.Types.Mixed },
  sourceReference: { type: String },
  lastUpdated: { type: Date }
}, { timestamps: true });

// 2dsphere index for geographic normalization and querying
dataRecordSchema.index({ location: '2dsphere' });

export const DataRecord = model<IDataRecord>('DataRecord', dataRecordSchema);
