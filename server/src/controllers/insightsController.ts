import { Response } from 'express';
import { generateInsights } from '../services/insightsService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const insights = await generateInsights(userId);
    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};
