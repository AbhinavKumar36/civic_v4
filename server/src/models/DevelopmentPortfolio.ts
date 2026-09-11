import { Schema, model, Document, Types } from 'mongoose';

export interface IPortfolioConstraint {
  maxBudget: number; // in INR
  minWards: number; // minimum geographic spread
  categoryLimits: Array<{
    category: string;
    maxCount: number;
    minCount: number;
  }>;
}

export interface IDevelopmentPortfolio extends Document {
  name: string;
  description?: string;
  constraints: IPortfolioConstraint;
  selectedProposals: Types.ObjectId[]; // Ref to DevelopmentProposal
  excludedProposals: Array<{
    proposalId: Types.ObjectId;
    reason: string;
  }>;
  metrics: {
    totalCost: number;
    totalPriorityScore: number;
    totalSocialImpactScore: number;
    selectedCount: number;
  };
  status: 'DRAFT' | 'OPTIMIZED' | 'APPROVED';
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const constraintSchema = new Schema<IPortfolioConstraint>({
  maxBudget: { type: Number, required: true },
  minWards: { type: Number, default: 0 },
  categoryLimits: [{
    category: { type: String, required: true },
    maxCount: { type: Number, required: true },
    minCount: { type: Number, default: 0 }
  }]
}, { _id: false });

const portfolioSchema = new Schema<IDevelopmentPortfolio>({
  name: { type: String, required: true },
  description: { type: String },
  constraints: { type: constraintSchema, required: true },
  selectedProposals: [{ type: Schema.Types.ObjectId, ref: 'DevelopmentProposal' }],
  excludedProposals: [{
    proposalId: { type: Schema.Types.ObjectId, ref: 'DevelopmentProposal' },
    reason: { type: String, required: true }
  }],
  metrics: {
    totalCost: { type: Number, default: 0 },
    totalPriorityScore: { type: Number, default: 0 },
    totalSocialImpactScore: { type: Number, default: 0 },
    selectedCount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['DRAFT', 'OPTIMIZED', 'APPROVED'],
    default: 'DRAFT'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const DevelopmentPortfolio = model<IDevelopmentPortfolio>('DevelopmentPortfolio', portfolioSchema);
