"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logChallengeProgress = exports.joinChallenge = exports.getChallenges = exports.DEFAULT_CHALLENGES = void 0;
const zod_1 = require("zod");
const prismaClient_1 = __importDefault(require("../models/prismaClient"));
exports.DEFAULT_CHALLENGES = [
    {
        id: 'walk-commute',
        title: 'Walk Instead of Drive',
        objective: 'Replace 5 short car trips (under 2 miles) with active commuting (walking/cycling).',
        category: 'Transport',
        impact: '15 kg CO₂e / month',
        reward: 'Active Commuter Badge',
        target: 5,
        icon: 'directions_walk'
    },
    {
        id: 'plant-week',
        title: 'Plant-Based Week',
        objective: 'Consume only plant-based meals for 7 consecutive days.',
        category: 'Food',
        impact: '8.2 kg CO₂e / week',
        reward: 'Green Palate Award',
        target: 7,
        icon: 'restaurant'
    },
    {
        id: 'energy-saver',
        title: 'Peak Energy Saver',
        objective: 'Shift electricity and heating loads to off-peak hours for 14 days.',
        category: 'Energy',
        impact: '12 kg CO₂e / period',
        reward: 'Off-Peak Master Certificate',
        target: 14,
        icon: 'bolt'
    },
    {
        id: 'zero-waste',
        title: 'Zero Waste Grocery',
        objective: 'Purchase fresh grocery products entirely packaging and plastic-free.',
        category: 'Waste',
        impact: '3 kg CO₂e / week',
        reward: 'Zero-Waste Pioneer Badge',
        target: 1,
        icon: 'shopping_bag'
    },
    {
        id: 'cold-wash',
        title: 'Cold Wash Commitment',
        objective: 'Complete all laundry loads on cold settings for 30 consecutive days.',
        category: 'Energy',
        impact: '25 kg CO₂e / month',
        reward: 'Ocean Saver Medal',
        target: 30,
        icon: 'water_drop'
    }
];
const challengeActionSchema = zod_1.z.object({
    challengeId: zod_1.z.string().max(100),
});
const getChallenges = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userChallenges = await prismaClient_1.default.challenge.findMany({
            where: { userId }
        });
        const mappedChallenges = exports.DEFAULT_CHALLENGES.map((def) => {
            const userChal = userChallenges.find(uc => uc.challengeId === def.id);
            if (userChal) {
                return {
                    id: def.id,
                    title: def.title,
                    objective: def.objective,
                    category: def.category,
                    impact: def.impact,
                    reward: def.reward,
                    progress: userChal.progress,
                    target: def.target,
                    status: userChal.status === 'COMPLETED' ? 'completed' : 'active',
                    icon: def.icon,
                    completedAt: userChal.completedAt
                };
            }
            return {
                id: def.id,
                title: def.title,
                objective: def.objective,
                category: def.category,
                impact: def.impact,
                reward: def.reward,
                progress: 0,
                target: def.target,
                status: 'not_joined',
                icon: def.icon
            };
        });
        res.json(mappedChallenges);
    }
    catch (error) {
        console.error('Get challenges error:', error);
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
};
exports.getChallenges = getChallenges;
const joinChallenge = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { challengeId } = challengeActionSchema.parse(req.body);
        const defaultChal = exports.DEFAULT_CHALLENGES.find(c => c.id === challengeId);
        if (!defaultChal) {
            res.status(404).json({ error: 'Challenge definition not found' });
            return;
        }
        // Check if user has already joined
        const existing = await prismaClient_1.default.challenge.findFirst({
            where: { userId, challengeId }
        });
        if (existing) {
            res.status(400).json({ error: 'Already committed to this challenge' });
            return;
        }
        const challenge = await prismaClient_1.default.challenge.create({
            data: {
                userId,
                challengeId,
                title: defaultChal.title,
                objective: defaultChal.objective,
                category: defaultChal.category,
                impact: defaultChal.impact,
                reward: defaultChal.reward,
                target: defaultChal.target,
                icon: defaultChal.icon,
                progress: 0,
                status: 'ACTIVE'
            }
        });
        res.status(201).json(challenge);
    }
    catch (error) {
        console.error('Join challenge error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Failed to join challenge' });
    }
};
exports.joinChallenge = joinChallenge;
const logChallengeProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { challengeId } = challengeActionSchema.parse(req.body);
        const userChal = await prismaClient_1.default.challenge.findFirst({
            where: { userId, challengeId, status: 'ACTIVE' }
        });
        if (!userChal) {
            res.status(404).json({ error: 'Active commitment not found' });
            return;
        }
        const nextProgress = userChal.progress + 1;
        const isCompleted = nextProgress >= userChal.target;
        const updated = await prismaClient_1.default.challenge.update({
            where: { id: userChal.id },
            data: {
                progress: Math.min(nextProgress, userChal.target),
                status: isCompleted ? 'COMPLETED' : 'ACTIVE',
                completedAt: isCompleted ? new Date() : null
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Log challenge progress error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Failed to update challenge progress' });
    }
};
exports.logChallengeProgress = logChallengeProgress;
//# sourceMappingURL=challengesController.js.map