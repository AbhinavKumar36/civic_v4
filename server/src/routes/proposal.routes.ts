import { Router, Request, Response } from 'express';
import { DevelopmentProposal } from '../models/DevelopmentProposal';
import { PriorityAssessment } from '../models/PriorityAssessment';
import { ImpactAssessment } from '../models/ImpactAssessment';
import { priorityEngineService } from '../services/intelligence/PriorityEngineService';
import { impactEngineService } from '../services/intelligence/ImpactEngineService';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all proposal routes
router.use(authenticate);

/**
 * POST /api/v1/proposals
 * Create a new Development Proposal (Authority/Admin only)
 */
router.post('/', authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      subCategory,
      location,
      wardId,
      estimatedCost,
      estimatedTimeline,
      beneficiaries,
      targetGroups,
      dependencies,
      source
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title, description, and category are required' }
      });
    }

    const proposal = await DevelopmentProposal.create({
      title,
      description,
      category,
      subCategory,
      location,
      wardId,
      estimatedCost: estimatedCost || 0,
      estimatedTimeline: estimatedTimeline || '12 months',
      beneficiaries: beneficiaries || 0,
      targetGroups: targetGroups || [],
      dependencies: dependencies || [],
      source: source || 'MANUAL_ENTRY',
      status: 'DRAFT',
      createdBy: (req as any).user?._id
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/proposals
 * List all proposals with optional category filter and sorting
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, wardId, status, sort = 'rank' } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (wardId) filter.wardId = wardId;
    if (status) filter.status = status;

    let query = DevelopmentProposal.find(filter);

    if (sort === 'priority' || sort === 'rank') {
      query = query.sort({ priorityRank: 1, priorityScore: -1 });
    } else if (sort === 'cost') {
      query = query.sort({ estimatedCost: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const proposals = await query.exec();
    res.status(200).json({ success: true, data: proposals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/proposals/evaluate-all
 * Batch evaluates all proposals, calculates priority & impact, and re-ranks them.
 */
router.post('/evaluate-all', authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const proposals = await DevelopmentProposal.find();
    const results = [];

    for (const p of proposals) {
      const priority = await priorityEngineService.evaluateProposal(p._id.toString(), req.body.weights);
      const impact = await impactEngineService.evaluateImpact(p._id.toString());
      results.push({ proposalId: p._id, priorityScore: priority.totalScore, socialImpactScore: impact.socialImpactScore });
    }

    // Recalculate rankings across all evaluated proposals
    const rankedAssessments = await priorityEngineService.recalculateRankings();

    res.status(200).json({
      success: true,
      data: {
        totalEvaluated: results.length,
        rankings: rankedAssessments
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/proposals/:id
 * Get single proposal by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const proposal = await DevelopmentProposal.findById(req.params.id)
      .populate('relatedDemandIds')
      .populate('relatedThemeIds')
      .populate('relatedHotspotIds');

    if (!proposal) {
      return res.status(404).json({ success: false, error: { message: 'Proposal not found' } });
    }

    res.status(200).json({ success: true, data: proposal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/proposals/:id/evaluate
 * Run priority evaluation for single proposal
 */
router.post('/:id/evaluate', authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const proposalId = String(req.params.id);
    const assessment = await priorityEngineService.evaluateProposal(proposalId, req.body.weights);
    await priorityEngineService.recalculateRankings();

    res.status(200).json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/proposals/:id/priority
 * Get priority assessment for proposal
 */
router.get('/:id/priority', async (req: Request, res: Response) => {
  try {
    const assessment = await PriorityAssessment.findOne({ proposalId: req.params.id })
      .populate('demandIds')
      .populate('themeIds')
      .populate('hotspotIds')
      .populate('evidenceIds');

    if (!assessment) {
      return res.status(404).json({ success: false, error: { message: 'Priority assessment not found for proposal' } });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/proposals/:id/impact
 * Run impact evaluation for single proposal
 */
router.post('/:id/impact', authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const proposalId = String(req.params.id);
    const assessment = await impactEngineService.evaluateImpact(proposalId);
    res.status(200).json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/proposals/:id/impact
 * Get impact assessment for proposal
 */
router.get('/:id/impact', async (req: Request, res: Response) => {
  try {
    const assessment = await ImpactAssessment.findOne({ proposalId: req.params.id })
      .populate('evidenceIds');

    if (!assessment) {
      return res.status(404).json({ success: false, error: { message: 'Impact assessment not found for proposal' } });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/proposals/:id/analysis
 * Full unified proposal analysis (Proposal + Priority + Impact + Traceability Lineage)
 */
router.get('/:id/analysis', async (req: Request, res: Response) => {
  try {
    const proposal = await DevelopmentProposal.findById(req.params.id)
      .populate('relatedDemandIds')
      .populate('relatedThemeIds')
      .populate('relatedHotspotIds');

    if (!proposal) {
      return res.status(404).json({ success: false, error: { message: 'Proposal not found' } });
    }

    let priority: any = await PriorityAssessment.findOne({ proposalId: req.params.id })
      .populate('evidenceIds');

    // If not evaluated yet, auto-evaluate
    if (!priority) {
      priority = await priorityEngineService.evaluateProposal(proposal._id.toString());
      await priorityEngineService.recalculateRankings();
      priority = await PriorityAssessment.findOne({ proposalId: req.params.id }).populate('evidenceIds');
    }

    let impact: any = await ImpactAssessment.findOne({ proposalId: req.params.id })
      .populate('evidenceIds');

    if (!impact) {
      impact = await impactEngineService.evaluateImpact(proposal._id.toString());
      impact = await ImpactAssessment.findOne({ proposalId: req.params.id }).populate('evidenceIds');
    }

    res.status(200).json({
      success: true,
      data: {
        proposal,
        priority,
        impact,
        traceabilityLineage: {
          proposalId: proposal._id,
          title: proposal.title,
          category: proposal.category,
          demandsCount: proposal.relatedDemandIds?.length || 0,
          themesCount: proposal.relatedThemeIds?.length || 0,
          hotspotsCount: proposal.relatedHotspotIds?.length || 0,
          evidenceRecordsCount: priority?.evidenceIds?.length || 0
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
