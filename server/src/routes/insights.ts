import { Router } from 'express';
import { getInsights } from '../controllers/insightsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getInsights);

export default router;
