"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const insightsController_1 = require("../controllers/insightsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', insightsController_1.getInsights);
exports.default = router;
//# sourceMappingURL=insights.js.map