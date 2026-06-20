import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAnalytics);

export default router;
