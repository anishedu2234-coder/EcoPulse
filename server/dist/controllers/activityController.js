"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivity = exports.createActivity = exports.getActivities = void 0;
const zod_1 = require("zod");
const prismaClient_1 = __importDefault(require("../models/prismaClient"));
const activitySchema = zod_1.z.object({
    category: zod_1.z.enum(['Transport', 'Food', 'Energy', 'Shopping', 'Waste']),
    activityDesc: zod_1.z.string().min(1).max(500),
    co2e: zod_1.z.number().min(0).max(100000),
});
const getActivities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const activities = await prismaClient_1.default.activityLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 50, // basic pagination/limit
        });
        res.json(activities);
    }
    catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};
exports.getActivities = getActivities;
const createActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { category, activityDesc, co2e } = activitySchema.parse(req.body);
        const activity = await prismaClient_1.default.activityLog.create({
            data: {
                userId,
                category,
                activityDesc,
                co2e,
            },
        });
        res.status(201).json(activity);
    }
    catch (error) {
        console.error('Create activity error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Failed to create activity' });
    }
};
exports.createActivity = createActivity;
const deleteActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const activity = await prismaClient_1.default.activityLog.findUnique({ where: { id } });
        if (!activity) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }
        if (activity.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to delete this activity' });
            return;
        }
        await prismaClient_1.default.activityLog.delete({ where: { id } });
        res.json({ message: 'Activity deleted successfully' });
    }
    catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
};
exports.deleteActivity = deleteActivity;
//# sourceMappingURL=activityController.js.map