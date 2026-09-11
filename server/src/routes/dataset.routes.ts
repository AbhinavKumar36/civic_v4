import { Router, Request, Response } from 'express';
import { datasetService } from '../services/data/DatasetService';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Authority / Admin only
router.get('/', authenticate, authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const datasets = await datasetService.getAllDatasets();
    res.json({ success: true, data: datasets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id', authenticate, authorize('AUTHORITY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const dataset = await datasetService.getDatasetById(id);
    if (!dataset) return res.status(404).json({ success: false, error: { message: 'Dataset not found' } });
    
    // Also fetch a sample of records
    const records = await datasetService.getDatasetRecords(id, 50);
    
    res.json({ success: true, data: { dataset, records } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
