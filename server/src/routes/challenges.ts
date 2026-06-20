import { Router } from 'express';
import { getChallenges, joinChallenge, logChallengeProgress } from '../controllers/challengesController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getChallenges);
router.post('/join', joinChallenge);
router.post('/log', logChallengeProgress);

export default router;
