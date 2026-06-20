"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityController_1 = require("../controllers/activityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', activityController_1.getActivities);
router.post('/', activityController_1.createActivity);
router.delete('/:id', activityController_1.deleteActivity);
exports.default = router;
//# sourceMappingURL=activities.js.map