import { Router } from 'express';
import { getActivities, createActivity, deleteActivity } from '../controllers/activityController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/:id', deleteActivity);

export default router;
