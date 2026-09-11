import { Router } from 'express';
import { 
  processIntelligence,
  getThemes,
  getThemeById,
  getHotspots,
  getHotspotById
} from '../modules/intelligence/intelligence.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Authority / Admin only
router.post('/process', authenticate, authorize('AUTHORITY', 'ADMIN'), processIntelligence);
router.get('/themes', authenticate, authorize('AUTHORITY', 'ADMIN'), getThemes);
router.get('/themes/:id', authenticate, authorize('AUTHORITY', 'ADMIN'), getThemeById);
router.get('/hotspots', authenticate, authorize('AUTHORITY', 'ADMIN'), getHotspots);
router.get('/hotspots/:id', authenticate, authorize('AUTHORITY', 'ADMIN'), getHotspotById);

export default router;
