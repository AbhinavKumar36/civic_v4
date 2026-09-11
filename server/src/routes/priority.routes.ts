import { Router, Request, Response } from 'express';
import { PriorityAssessment } from '../models/PriorityAssessment';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/priorities
 * List all priority assessments ranked by total score
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const assessments = await PriorityAssessment.find()
      .populate('proposalId')
      .sort({ rank: 1, totalScore: -1 });

    res.status(200).json({ success: true, data: assessments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/priorities/:id
 * Get single priority assessment by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assessment = await PriorityAssessment.findById(req.params.id)
      .populate('proposalId')
      .populate('demandIds')
      .populate('themeIds')
      .populate('hotspotIds')
      .populate('evidenceIds');

    if (!assessment) {
      return res.status(404).json({ success: false, error: { message: 'Priority assessment not found' } });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
