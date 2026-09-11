import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DevelopmentProposal } from '../models/DevelopmentProposal';
import { DevelopmentPortfolio, IPortfolioConstraint } from '../models/DevelopmentPortfolio';
import { DecisionRecord } from '../models/DecisionRecord';
import { PortfolioEngineService } from '../services/intelligence/PortfolioEngineService';

const router = Router();

router.use(authenticate);

/**
 * POST /api/v1/portfolios/optimize
 * Run optimization engine with constraints and save as DRAFT portfolio
 */
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { name, description, constraints } = req.body;
    
    if (!constraints || !constraints.maxBudget) {
      return res.status(400).json({ success: false, error: { message: 'Constraints with maxBudget required' } });
    }

    // 1. Fetch all EVALUATED proposals
    const proposals = await DevelopmentProposal.find({ status: 'EVALUATED' });

    // 2. Run deterministic engine
    const optimizedResult = PortfolioEngineService.optimize(proposals, constraints as IPortfolioConstraint);

    // 3. Save draft portfolio
    const portfolio = new DevelopmentPortfolio({
      name: name || `Portfolio Optimization Run ${new Date().toISOString()}`,
      description,
      constraints,
      selectedProposals: optimizedResult.selectedProposals.map(p => p._id),
      excludedProposals: optimizedResult.excludedProposals,
      metrics: optimizedResult.metrics,
      status: 'DRAFT',
      createdBy: (req as any).user?.id
    });

    await portfolio.save();

    res.status(201).json({ success: true, data: portfolio });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/portfolios/:id
 * Get single portfolio details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const portfolio = await DevelopmentPortfolio.findById(req.params.id)
      .populate('selectedProposals')
      .populate('excludedProposals.proposalId');

    if (!portfolio) {
      return res.status(404).json({ success: false, error: { message: 'Portfolio not found' } });
    }

    res.status(200).json({ success: true, data: portfolio });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/portfolios/:id/approve
 * Lock a portfolio, save manual overrides, create DecisionRecord
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approvedProposalIds, humanOverrides } = req.body;
    
    const portfolio = await DevelopmentPortfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ success: false, error: { message: 'Portfolio not found' } });
    }

    portfolio.status = 'APPROVED';
    await portfolio.save();

    const decision = new DecisionRecord({
      portfolioId: portfolio._id,
      approvedProposals: approvedProposalIds,
      humanOverrides,
      approvedBy: (req as any).user?.id,
    });

    await decision.save();

    // Optionally update proposal statuses here to 'APPROVED'
    await DevelopmentProposal.updateMany(
      { _id: { $in: approvedProposalIds } },
      { $set: { status: 'APPROVED' } }
    );

    res.status(201).json({ success: true, data: decision });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
