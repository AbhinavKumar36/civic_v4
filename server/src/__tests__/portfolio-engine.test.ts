import mongoose from 'mongoose';
import { PortfolioEngineService } from '../services/intelligence/PortfolioEngineService';
import { IDevelopmentProposal } from '../models/DevelopmentProposal';

describe('PortfolioEngineService', () => {
  const dummyProposals: Partial<IDevelopmentProposal>[] = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'High Score, Low Cost',
      category: 'ROADS',
      estimatedCost: 1000000, // 10 Lakh
      priorityScore: 90,
      socialImpactScore: 80,
      wardId: 'Ward 1'
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Medium Score, High Cost',
      category: 'HEALTHCARE',
      estimatedCost: 5000000, // 50 Lakh
      priorityScore: 70,
      socialImpactScore: 60,
      wardId: 'Ward 2'
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Low Score, Med Cost',
      category: 'ROADS',
      estimatedCost: 2000000, // 20 Lakh
      priorityScore: 40,
      socialImpactScore: 40,
      wardId: 'Ward 1'
    }
  ];

  it('should deterministically select proposals based on budget constraint', () => {
    const result = PortfolioEngineService.optimize(dummyProposals as IDevelopmentProposal[], {
      maxBudget: 4000000, // 40 Lakh
      minWards: 1,
      categoryLimits: [
        { category: 'ROADS', maxCount: 2, minCount: 0 },
        { category: 'HEALTHCARE', maxCount: 2, minCount: 0 }
      ]
    });

    expect(result.selectedProposals.length).toBe(2);
    // Should select 'High Score, Low Cost' and 'Low Score, Med Cost' since 'Medium Score, High Cost' exceeds budget
    expect(result.selectedProposals.map((p: any) => p.title)).toContain('High Score, Low Cost');
    expect(result.selectedProposals.map((p: any) => p.title)).toContain('Low Score, Med Cost');
    
    expect(result.excludedProposals.length).toBe(1);
    expect(result.excludedProposals[0].reason).toContain('Exceeds remaining budget');
    expect(result.metrics.totalCost).toBe(3000000); // 10 + 20
  });

  it('should enforce category limits', () => {
    const result = PortfolioEngineService.optimize(dummyProposals as IDevelopmentProposal[], {
      maxBudget: 10000000, // 1 Crore
      minWards: 1,
      categoryLimits: [
        { category: 'ROADS', maxCount: 1, minCount: 0 }, // Only 1 road allowed
        { category: 'HEALTHCARE', maxCount: 2, minCount: 0 }
      ]
    });

    expect(result.selectedProposals.length).toBe(2);
    // Should select 'High Score, Low Cost' (Road) and 'Medium Score, High Cost' (Healthcare)
    expect(result.selectedProposals.map((p: any) => p.title)).toContain('High Score, Low Cost');
    expect(result.selectedProposals.map((p: any) => p.title)).toContain('Medium Score, High Cost');
    
    expect(result.excludedProposals.length).toBe(1);
    expect(result.excludedProposals[0].reason).toContain('Category limit reached for ROADS');
  });
});
