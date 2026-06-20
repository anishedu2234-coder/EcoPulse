import { Router } from 'express';
import { register, login, updateOnboarding, updateProfile, handleAvatarUpload, uploadAvatar } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/onboarding', authenticate, updateOnboarding);
router.put('/profile', authenticate, updateProfile);
router.post('/upload-avatar', authenticate, handleAvatarUpload, uploadAvatar);

export default router;


