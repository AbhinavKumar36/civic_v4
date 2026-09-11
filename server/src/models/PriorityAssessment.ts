import { Schema, model, Document, Types } from 'mongoose';

export interface IPriorityFactor {
  label: string;
  rawValue: number | string;
  normalizedValue: number; // 0 - 100
  weight: number; // e.g. 0.15
  contribution: number; // normalizedValue * weight
  unit?: string;
  explanation?: string;
}

export interface IPriorityAssessment extends Document {
  proposalId: Types.ObjectId;
  demandIds: Types.ObjectId[];
  themeIds: Types.ObjectId[];
  hotspotIds: Types.ObjectId[];
  evidenceIds: Types.ObjectId[];
  factors: {
    demandStrength: IPriorityFactor;
    uniqueCitizenReach: IPriorityFactor;
    recurrence: IPriorityFactor;
    geographicConcentration: IPriorityFactor;
    contextualEvidence: IPriorityFactor;
    infrastructureGap: IPriorityFactor;
    urgency: IPriorityFactor;
    severity: IPriorityFactor;
    affectedPopulation: IPriorityFactor;
    equityVulnerability: IPriorityFactor;
    evidenceConfidence: IPriorityFactor;
  };
  weights: Record<string, number>;
  totalScore: number; // 0 - 100
  rank: number;
  explanation: {
    summary: string;
    topStrengths: string[];
    limitations: string[];
  };
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const factorSubSchema = new Schema({
  label: { type: String, required: true },
  rawValue: { type: Schema.Types.Mixed, required: true },
  normalizedValue: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, required: true },
  contribution: { type: Number, required: true },
  unit: { type: String },
  explanation: { type: String }
}, { _id: false });

const priorityAssessmentSchema = new Schema<IPriorityAssessment>({
  proposalId: { type: Schema.Types.ObjectId, ref: 'DevelopmentProposal', required: true, index: true },
  demandIds: [{ type: Schema.Types.ObjectId, ref: 'NormalizedDemand' }],
  themeIds: [{ type: Schema.Types.ObjectId, ref: 'Theme' }],
  hotspotIds: [{ type: Schema.Types.ObjectId, ref: 'DemandHotspot' }],
  evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'EvidenceRecord' }],
  factors: {
    demandStrength: { type: factorSubSchema, required: true },
    uniqueCitizenReach: { type: factorSubSchema, required: true },
    recurrence: { type: factorSubSchema, required: true },
    geographicConcentration: { type: factorSubSchema, required: true },
    contextualEvidence: { type: factorSubSchema, required: true },
    infrastructureGap: { type: factorSubSchema, required: true },
    urgency: { type: factorSubSchema, required: true },
    severity: { type: factorSubSchema, required: true },
    affectedPopulation: { type: factorSubSchema, required: true },
    equityVulnerability: { type: factorSubSchema, required: true },
    evidenceConfidence: { type: factorSubSchema, required: true }
  },
  weights: { type: Schema.Types.Mixed, required: true },
  totalScore: { type: Number, required: true, min: 0, max: 100, index: true },
  rank: { type: Number, default: 0 },
  explanation: {
    summary: { type: String, required: true },
    topStrengths: [{ type: String }],
    limitations: [{ type: String }]
  },
  calculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const PriorityAssessment = model<IPriorityAssessment>('PriorityAssessment', priorityAssessmentSchema);
