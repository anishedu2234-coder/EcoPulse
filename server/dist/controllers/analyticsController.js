"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prismaClient_1 = __importDefault(require("../models/prismaClient"));
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        // In a real app, we'd use grouping or raw queries for performance,
        // but here we can just fetch and aggregate for simplicity.
        const activities = await prismaClient_1.default.activityLog.findMany({
            where: { userId },
        });
        const totalCo2e = activities.reduce((sum, act) => sum + act.co2e, 0);
        const categoryBreakdown = activities.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.co2e;
            return acc;
        }, {});
        // Simple weekly trend logic (dummy implementation based on fetched logs)
        // Normally you'd group by Date(timestamp)
        const weeklyTrend = activities.slice(-7).map(a => ({
            day: new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
            co2: a.co2e,
        }));
        res.json({
            totalCo2e,
            categoryBreakdown,
            weeklyTrend,
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=analyticsController.js.map