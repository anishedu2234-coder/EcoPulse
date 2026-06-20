"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.put('/onboarding', authMiddleware_1.authenticate, authController_1.updateOnboarding);
router.put('/profile', authMiddleware_1.authenticate, authController_1.updateProfile);
router.post('/upload-avatar', authMiddleware_1.authenticate, authController_1.handleAvatarUpload, authController_1.uploadAvatar);
exports.default = router;
//# sourceMappingURL=auth.js.map