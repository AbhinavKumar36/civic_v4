import { Router, Request, Response } from 'express';
import { evidenceService } from '../services/intelligence/EvidenceService';
import { EvidenceRecord } from '../models/EvidenceRecord';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Authority / Admin only
router.post('/demand/:id/generate', authenticate, authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const evidence = await evidenceService.generateEvidenceForDemand(id);
    res.json({ success: true, data: evidence });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/demand/:id', authenticate, authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const evidence = await EvidenceRecord.find({ demandId: id }).populate('datasetId').sort({ createdAt: -1 });
    res.json({ success: true, data: evidence });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
