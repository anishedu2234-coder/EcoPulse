import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { getActivities, createActivity, deleteActivity } from './activityController';
import prisma from '../models/prismaClient';
import { authenticate } from '../middleware/authMiddleware';

vi.mock('../models/prismaClient', () => {
  return {
    default: {
      activityLog: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/activities', authenticate, getActivities);
app.post('/activities', authenticate, createActivity);
app.delete('/activities/:id', authenticate, deleteActivity);

const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'testsecret');

describe('Activities Controller Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /activities', () => {
    it('should return activities for logged in user', async () => {
      const mockActivities = [
        { id: '1', userId: 'user-123', category: 'Transport', activityDesc: 'Drive', co2e: 10, timestamp: new Date() },
        { id: '2', userId: 'user-123', category: 'Food', activityDesc: 'Meat meal', co2e: 3, timestamp: new Date() },
      ];

      vi.mocked(prisma.activityLog.findMany).mockResolvedValue(mockActivities);

      const res = await request(app)
        .get('/activities')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].activityDesc).toBe('Drive');
    });
  });

  describe('POST /activities', () => {
    it('should create a valid activity log entry', async () => {
      const mockActivity = {
        id: '123',
        userId: 'user-123',
        category: 'Transport',
        activityDesc: 'Train commute',
        co2e: 2.5,
        timestamp: new Date()
      };

      vi.mocked(prisma.activityLog.create).mockResolvedValue(mockActivity);

      const res = await request(app)
        .post('/activities')
        .set('Cookie', `token=${token}`)
        .send({
          category: 'Transport',
          activityDesc: 'Train commute',
          co2e: 2.5
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('123');
    });

    it('should reject invalid input data format', async () => {
      const res = await request(app)
        .post('/activities')
        .set('Cookie', `token=${token}`)
        .send({
          category: 'InvalidCategory',
          activityDesc: '',
          co2e: -5
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /activities/:id', () => {
    it('should delete activity if owned by user', async () => {
      const mockActivity = {
        id: 'act-1',
        userId: 'user-123',
        category: 'Food',
        activityDesc: 'Meal',
        co2e: 1.2,
        timestamp: new Date()
      };

      vi.mocked(prisma.activityLog.findUnique).mockResolvedValue(mockActivity);
      vi.mocked(prisma.activityLog.delete).mockResolvedValue(mockActivity);

      const res = await request(app)
        .delete('/activities/act-1')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Activity deleted successfully');
    });

    it('should forbid deletion if activity owned by someone else', async () => {
      const mockActivity = {
        id: 'act-1',
        userId: 'other-user',
        category: 'Food',
        activityDesc: 'Meal',
        co2e: 1.2,
        timestamp: new Date()
      };

      vi.mocked(prisma.activityLog.findUnique).mockResolvedValue(mockActivity);

      const res = await request(app)
        .delete('/activities/act-1')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(403);
    });
  });
});
