"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsights = void 0;
const prismaClient_1 = __importDefault(require("../models/prismaClient"));
const generateInsights = async (userId) => {
    const activities = await prismaClient_1.default.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
    });
    if (activities.length === 0) {
        return {
            message: "You haven't logged any activities yet. Start logging to get personalized insights!",
            type: 'info'
        };
    }
    const categoryBreakdown = activities.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.co2e;
        return acc;
    }, {});
    // Find max category
    let maxCategory = '';
    let maxCo2 = 0;
    for (const [category, co2] of Object.entries(categoryBreakdown)) {
        if (co2 > maxCo2) {
            maxCo2 = co2;
            maxCategory = category;
        }
    }
    const suggestions = {
        Transport: "Your transport emissions are your biggest contributor. Consider swapping your next 3 car trips for public transit or carpooling.",
        Food: "Food is your largest emission source right now. Trying one extra plant-based meal this week could make a noticeable difference.",
        Energy: "Home energy use is currently your top category. Try lowering your thermostat by 1 degree or unplugging idle devices.",
        Shopping: "Shopping is your main source of emissions. Consider buying second-hand or delaying non-essential purchases for a week.",
        Waste: "Waste is your highest category. Check if your local area supports composting to divert food waste from landfills."
    };
    return {
        message: suggestions[maxCategory] || "Keep tracking your footprint to find areas for improvement!",
        type: 'actionable',
        topCategory: maxCategory
    };
};
exports.generateInsights = generateInsights;
//# sourceMappingURL=insightsService.js.map