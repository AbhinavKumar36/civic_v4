import { Schema, model, Document } from 'mongoose';

export interface IDataset extends Document {
  name: string;
  description: string;
  category: string;
  source: string;
  sourceUrl?: string;
  publisher: string;
  datasetVersion: string;
  license?: string;
  geographyType?: string;
  refreshDate?: Date;
  importedAt: Date;
  recordCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const datasetSchema = new Schema<IDataset>({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: [
      'DEMOGRAPHICS', 'EDUCATION', 'HEALTH', 'TRANSPORT', 
      'WATER', 'SANITATION', 'INFRASTRUCTURE', 'DEVELOPMENT', 
      'ENVIRONMENT', 'OTHER'
    ]
  },
  source: { type: String, required: true },
  sourceUrl: { type: String },
  publisher: { type: String, required: true },
  datasetVersion: { type: String, required: true },
  license: { type: String },
  geographyType: { type: String },
  refreshDate: { type: Date },
  importedAt: { type: Date, default: Date.now },
  recordCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED'],
    default: 'PENDING'
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Dataset = model<IDataset>('Dataset', datasetSchema);
