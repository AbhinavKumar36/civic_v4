import { Schema, model, Document, Types } from 'mongoose';

export interface ISocialFactor {
  label: string;
  rawValue: number | string;
  normalizedValue: number; // 0 - 100
  weight: number;
  contribution: number;
  unit?: string;
  explanation?: string;
}

export interface IEconomicFactor {
  label: string;
  status: 'CALCULATED' | 'NOT_AVAILABLE';
  rawValue?: number | string;
  normalizedValue?: number; // 0 - 100
  weight: number;
  contribution?: number;
  unit?: string;
  note?: string;
}

export interface IScenario {
  beneficiaries: number;
  description: string;
  economicBenefitLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_AVAILABLE';
}

export interface IImpactAssessment extends Document {
  proposalId: Types.ObjectId;
  socialImpactScore: number; // 0 - 100
  economicImpactScore?: number; // 0 - 100 or undefined if data unavailable
  economicImpactLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_AVAILABLE';
  socialFactors: {
    beneficiaryReach: ISocialFactor;
    accessibilityImprovement: ISocialFactor;
    serviceCoverage: ISocialFactor;
    equityImpact: ISocialFactor;
    qualityOfLife: ISocialFactor;
    vulnerablePopulationBenefit: ISocialFactor;
  };
  economicFactors: {
    directBeneficiaryReach: IEconomicFactor;
    employmentPotential: IEconomicFactor;
    travelTimeSavings: IEconomicFactor;
    productivityImprovement: IEconomicFactor;
    localEconomicActivity: IEconomicFactor;
    serviceEfficiency: IEconomicFactor;
  };
  scenarios: {
    conservative: IScenario;
    baseline: IScenario;
    optimistic: IScenario;
  };
  assumptions: string[];
  uncertainty: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertaintyReasons: string[];
  confidence: number; // 0.0 - 1.0
  methodology: string;
  evidenceIds: Types.ObjectId[];
  explanation: {
    summary: string;
    socialDrivers: string[];
    economicDrivers: string[];
    uncertaintyExplanation: string;
  };
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const socialFactorSchema = new Schema({
  label: { type: String, required: true },
  rawValue: { type: Schema.Types.Mixed, required: true },
  normalizedValue: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, required: true },
  contribution: { type: Number, required: true },
  unit: { type: String },
  explanation: { type: String }
}, { _id: false });

const economicFactorSchema = new Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ['CALCULATED', 'NOT_AVAILABLE'], required: true },
  rawValue: { type: Schema.Types.Mixed },
  normalizedValue: { type: Number, min: 0, max: 100 },
  weight: { type: Number, required: true },
  contribution: { type: Number },
  unit: { type: String },
  note: { type: String }
}, { _id: false });

const scenarioSchema = new Schema({
  beneficiaries: { type: Number, required: true },
  description: { type: String, required: true },
  economicBenefitLevel: { 
    type: String, 
    enum: ['HIGH', 'MEDIUM', 'LOW', 'NOT_AVAILABLE'], 
    required: true 
  }
}, { _id: false });

const impactAssessmentSchema = new Schema<IImpactAssessment>({
  proposalId: { type: Schema.Types.ObjectId, ref: 'DevelopmentProposal', required: true, index: true },
  socialImpactScore: { type: Number, required: true, min: 0, max: 100 },
  economicImpactScore: { type: Number, min: 0, max: 100 },
  economicImpactLevel: { 
    type: String, 
    enum: ['HIGH', 'MEDIUM', 'LOW', 'NOT_AVAILABLE'], 
    default: 'NOT_AVAILABLE' 
  },
  socialFactors: {
    beneficiaryReach: { type: socialFactorSchema, required: true },
    accessibilityImprovement: { type: socialFactorSchema, required: true },
    serviceCoverage: { type: socialFactorSchema, required: true },
    equityImpact: { type: socialFactorSchema, required: true },
    qualityOfLife: { type: socialFactorSchema, required: true },
    vulnerablePopulationBenefit: { type: socialFactorSchema, required: true }
  },
  economicFactors: {
    directBeneficiaryReach: { type: economicFactorSchema, required: true },
    employmentPotential: { type: economicFactorSchema, required: true },
    travelTimeSavings: { type: economicFactorSchema, required: true },
    productivityImprovement: { type: economicFactorSchema, required: true },
    localEconomicActivity: { type: economicFactorSchema, required: true },
    serviceEfficiency: { type: economicFactorSchema, required: true }
  },
  scenarios: {
    conservative: { type: scenarioSchema, required: true },
    baseline: { type: scenarioSchema, required: true },
    optimistic: { type: scenarioSchema, required: true }
  },
  assumptions: [{ type: String }],
  uncertainty: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  uncertaintyReasons: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  methodology: { type: String, required: true },
  evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'EvidenceRecord' }],
  explanation: {
    summary: { type: String, required: true },
    socialDrivers: [{ type: String }],
    economicDrivers: [{ type: String }],
    uncertaintyExplanation: { type: String, required: true }
  },
  calculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const ImpactAssessment = model<IImpactAssessment>('ImpactAssessment', impactAssessmentSchema);
