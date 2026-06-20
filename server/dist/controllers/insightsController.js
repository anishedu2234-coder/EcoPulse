"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsights = void 0;
const insightsService_1 = require("../services/insightsService");
const getInsights = async (req, res) => {
    try {
        const userId = req.user.userId;
        const insights = await (0, insightsService_1.generateInsights)(userId);
        res.json(insights);
    }
    catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
};
exports.getInsights = getInsights;
//# sourceMappingURL=insightsController.js.map