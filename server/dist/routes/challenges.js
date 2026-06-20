"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengesController_1 = require("../controllers/challengesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', challengesController_1.getChallenges);
router.post('/join', challengesController_1.joinChallenge);
router.post('/log', challengesController_1.logChallengeProgress);
exports.default = router;
//# sourceMappingURL=challenges.js.map