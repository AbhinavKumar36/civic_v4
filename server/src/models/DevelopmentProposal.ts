import { Schema, model, Document, Types } from 'mongoose';

export type ProposalCategory = 
  | 'EDUCATION'
  | 'HEALTHCARE'
  | 'WATER'
  | 'SANITATION'
  | 'ROADS'
  | 'TRANSPORT'
  | 'DRAINAGE'
  | 'HOUSING'
  | 'ENVIRONMENT'
  | 'PUBLIC_SAFETY'
  | 'DIGITAL_INFRASTRUCTURE'
  | 'OTHER';

export interface IDevelopmentProposal extends Document {
  title: string;
  description: string;
  category: ProposalCategory;
  subCategory?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  wardId?: string;
  estimatedCost: number; // in INR
  estimatedTimeline: string; // e.g. "6 months"
  beneficiaries?: number;
  targetGroups?: string[];
  dependencies?: string[];
  source: string; // e.g. "DEMO_PROPOSAL", "CITIZEN_INITIATIVE", "WARD_COUNCIL"
  status: 'DRAFT' | 'UNDER_REVIEW' | 'EVALUATED' | 'APPROVED' | 'REJECTED';
  relatedDemandIds: Types.ObjectId[];
  relatedThemeIds: Types.ObjectId[];
  relatedHotspotIds: Types.ObjectId[];
  priorityScore?: number;
  priorityRank?: number;
  socialImpactScore?: number;
  economicImpactScore?: number;
  impactConfidence?: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IDevelopmentProposal>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'EDUCATION', 'HEALTHCARE', 'WATER', 'SANITATION', 
      'ROADS', 'TRANSPORT', 'DRAINAGE', 'HOUSING', 
      'ENVIRONMENT', 'PUBLIC_SAFETY', 'DIGITAL_INFRASTRUCTURE', 'OTHER'
    ],
    index: true 
  },
  subCategory: { type: String },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  wardId: { type: String, index: true },
  estimatedCost: { type: Number, required: true, default: 0 },
  estimatedTimeline: { type: String, default: '12 months' },
  beneficiaries: { type: Number, default: 0 },
  targetGroups: [{ type: String }],
  dependencies: [{ type: String }],
  source: { type: String, default: 'DEMO_PROPOSAL' },
  status: { 
    type: String, 
    enum: ['DRAFT', 'UNDER_REVIEW', 'EVALUATED', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
    index: true 
  },
  relatedDemandIds: [{ type: Schema.Types.ObjectId, ref: 'NormalizedDemand' }],
  relatedThemeIds: [{ type: Schema.Types.ObjectId, ref: 'Theme' }],
  relatedHotspotIds: [{ type: Schema.Types.ObjectId, ref: 'DemandHotspot' }],
  priorityScore: { type: Number },
  priorityRank: { type: Number },
  socialImpactScore: { type: Number },
  economicImpactScore: { type: Number },
  impactConfidence: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

proposalSchema.index({ location: '2dsphere' });
proposalSchema.index({ priorityScore: -1 });

export const DevelopmentProposal = model<IDevelopmentProposal>('DevelopmentProposal', proposalSchema);
