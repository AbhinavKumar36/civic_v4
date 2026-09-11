import { Schema, model, Document, Types } from 'mongoose';

export interface IDecisionRecord extends Document {
  portfolioId: Types.ObjectId;
  approvedProposals: Types.ObjectId[]; // Snapshot of final list
  humanOverrides: Array<{
    proposalId: Types.ObjectId;
    action: 'ADDED' | 'REMOVED';
    justification: string;
  }>;
  approvedBy?: Types.ObjectId; // User Ref
  approvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const decisionRecordSchema = new Schema<IDecisionRecord>({
  portfolioId: { type: Schema.Types.ObjectId, ref: 'DevelopmentPortfolio', required: true },
  approvedProposals: [{ type: Schema.Types.ObjectId, ref: 'DevelopmentProposal' }],
  humanOverrides: [{
    proposalId: { type: Schema.Types.ObjectId, ref: 'DevelopmentProposal', required: true },
    action: { type: String, enum: ['ADDED', 'REMOVED'], required: true },
    justification: { type: String, required: true }
  }],
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const DecisionRecord = model<IDecisionRecord>('DecisionRecord', decisionRecordSchema);
