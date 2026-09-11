import { IDevelopmentProposal } from '../../models/DevelopmentProposal';
import { IPortfolioConstraint } from '../../models/DevelopmentPortfolio';
import { Types } from 'mongoose';

export interface ExcludedProposalInfo {
  proposalId: Types.ObjectId;
  reason: string;
}

export interface PortfolioOptimizationResult {
  selectedProposals: IDevelopmentProposal[];
  excludedProposals: ExcludedProposalInfo[];
  metrics: {
    totalCost: number;
    totalPriorityScore: number;
    totalSocialImpactScore: number;
    selectedCount: number;
    wardsCovered: number;
  };
}

export class PortfolioEngineService {
  /**
   * Deterministically optimizes the portfolio selection based on the given constraints.
   * Uses a Greedy approach prioritizing Value/Cost ratio, while respecting Category and Budget limits.
   */
  public static optimize(
    proposals: IDevelopmentProposal[],
    constraints: IPortfolioConstraint
  ): PortfolioOptimizationResult {
    // 1. Filter out proposals that don't have required scores or cost
    const validProposals = proposals.filter(p => p.priorityScore !== undefined && p.estimatedCost !== undefined);
    const invalidProposals = proposals.filter(p => p.priorityScore === undefined || p.estimatedCost === undefined);

    const excluded: ExcludedProposalInfo[] = invalidProposals.map(p => ({
      proposalId: p._id as Types.ObjectId,
      reason: 'Missing evaluation scores or estimated cost.'
    }));

    // 2. Sort by Value/Cost ratio descending
    // Value = priorityScore + (socialImpactScore || 0)
    // To avoid division by zero, use a minimal cost of 1 if cost is 0
    const sorted = [...validProposals].sort((a, b) => {
      const valA = (a.priorityScore || 0) + (a.socialImpactScore || 0);
      const costA = Math.max(a.estimatedCost, 1);
      const ratioA = valA / costA;

      const valB = (b.priorityScore || 0) + (b.socialImpactScore || 0);
      const costB = Math.max(b.estimatedCost, 1);
      const ratioB = valB / costB;

      // Secondary sort by raw priority score to break ties deterministically
      if (ratioB === ratioA) {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      return ratioB - ratioA;
    });

    const selected: IDevelopmentProposal[] = [];
    let currentCost = 0;
    const categoryCounts: Record<string, number> = {};
    const selectedWards = new Set<string>();

    // Initialize category counts
    constraints.categoryLimits.forEach(limit => {
      categoryCounts[limit.category] = 0;
    });

    // 3. Greedily select proposals
    for (const proposal of sorted) {
      const cat = proposal.category;
      const cost = proposal.estimatedCost;

      // Check Budget Constraint
      if (currentCost + cost > constraints.maxBudget) {
        excluded.push({
          proposalId: proposal._id as Types.ObjectId,
          reason: `Exceeds remaining budget (Cost: ₹${cost.toLocaleString()}, Remaining: ₹${(constraints.maxBudget - currentCost).toLocaleString()})`
        });
        continue;
      }

      // Check Category Limit Constraint
      const limit = constraints.categoryLimits.find(l => l.category === cat);
      if (limit && categoryCounts[cat] >= limit.maxCount) {
        excluded.push({
          proposalId: proposal._id as Types.ObjectId,
          reason: `Category limit reached for ${cat} (Max: ${limit.maxCount})`
        });
        continue;
      }

      // Select the proposal
      selected.push(proposal);
      currentCost += cost;
      if (categoryCounts[cat] === undefined) {
        categoryCounts[cat] = 0;
      }
      categoryCounts[cat]++;
      
      if (proposal.wardId) {
        selectedWards.add(proposal.wardId);
      }
    }

    // Note: minWards and minCount for categories are soft constraints in this greedy model 
    // for Phase 6. We report the metrics so authorities can see if they were met.
    
    // 4. Calculate final metrics
    const totalPriorityScore = selected.reduce((sum, p) => sum + (p.priorityScore || 0), 0);
    const totalSocialImpactScore = selected.reduce((sum, p) => sum + (p.socialImpactScore || 0), 0);

    return {
      selectedProposals: selected,
      excludedProposals: excluded,
      metrics: {
        totalCost: currentCost,
        totalPriorityScore,
        totalSocialImpactScore,
        selectedCount: selected.length,
        wardsCovered: selectedWards.size
      }
    };
  }
}
