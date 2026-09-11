import { Router } from 'express';
import { 
  submitInput, 
  getMyInputs, 
  retryInput, 
  getNormalizedDemands, 
  getNormalizedDemandById,
  getNormalizedResultForInput
} from '../modules/civic-inputs/civic-inputs.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../services/storage/LocalStorageProvider';

const router = Router();

// Citizen routes
router.post('/', authenticate, authorize('CITIZEN', 'ADMIN'), uploadMiddleware.array('images', 3), submitInput);
router.get('/', authenticate, authorize('CITIZEN', 'ADMIN'), getMyInputs);
router.post('/:id/retry', authenticate, authorize('CITIZEN', 'ADMIN'), retryInput);
router.get('/:id/normalized-result', authenticate, authorize('CITIZEN', 'ADMIN'), getNormalizedResultForInput);

// Authority routes (can be in a separate normalized-demands.routes.ts but grouped for simplicity)
router.get('/normalized-demands', authenticate, authorize('AUTHORITY', 'ADMIN'), getNormalizedDemands);
router.get('/normalized-demands/:id', authenticate, authorize('AUTHORITY', 'ADMIN'), getNormalizedDemandById);

export default router;
