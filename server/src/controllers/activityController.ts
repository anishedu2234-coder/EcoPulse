import { Response } from 'express';
import { z } from 'zod';
import prisma from '../models/prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';

const activitySchema = z.object({
  category: z.enum(['Transport', 'Food', 'Energy', 'Shopping', 'Waste']),
  activityDesc: z.string().min(1).max(500),
  co2e: z.number().min(0).max(100000),
});

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50, // basic pagination/limit
    });

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { category, activityDesc, co2e } = activitySchema.parse(req.body);

    const activity = await prisma.activityLog.create({
      data: {
        userId,
        category,
        activityDesc,
        co2e,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const activity = await prisma.activityLog.findUnique({ where: { id } });

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    if (activity.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this activity' });
      return;
    }

    await prisma.activityLog.delete({ where: { id } });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

