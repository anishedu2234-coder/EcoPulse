import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { getChallenges, joinChallenge, logChallengeProgress } from './challengesController';
import prisma from '../models/prismaClient';
import { authenticate } from '../middleware/authMiddleware';

vi.mock('../models/prismaClient', () => {
  return {
    default: {
      challenge: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/challenges', authenticate, getChallenges);
app.post('/challenges/join', authenticate, joinChallenge);
app.post('/challenges/progress', authenticate, logChallengeProgress);

const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'testsecret');

describe('Challenges Controller Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /challenges', () => {
    it('should return default challenges merged with user progress', async () => {
      const mockUserChallenges = [
        { challengeId: 'walk-commute', progress: 2, status: 'ACTIVE', completedAt: null }
      ] as any[];

      vi.mocked(prisma.challenge.findMany).mockResolvedValue(mockUserChallenges);

      const res = await request(app)
        .get('/challenges')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(5); // should map all 5 default challenges
      const walkCommute = res.body.find((c: any) => c.id === 'walk-commute');
      expect(walkCommute.progress).toBe(2);
      expect(walkCommute.status).toBe('active');
    });
  });

  describe('POST /challenges/join', () => {
    it('should join an unjoined challenge successfully', async () => {
      vi.mocked(prisma.challenge.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.challenge.create).mockResolvedValue({
        id: '1',
        challengeId: 'walk-commute',
        userId: 'user-123',
        title: 'Walk Instead of Drive',
        progress: 0,
        status: 'ACTIVE'
      } as any);

      const res = await request(app)
        .post('/challenges/join')
        .set('Cookie', `token=${token}`)
        .send({ challengeId: 'walk-commute' });

      expect(res.status).toBe(201);
      expect(res.body.challengeId).toBe('walk-commute');
    });

    it('should return 400 if user already joined', async () => {
      vi.mocked(prisma.challenge.findFirst).mockResolvedValue({ id: '1' } as any);

      const res = await request(app)
        .post('/challenges/join')
        .set('Cookie', `token=${token}`)
        .send({ challengeId: 'walk-commute' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Already committed to this challenge');
    });
  });

  describe('POST /challenges/progress', () => {
    it('should log progress and complete challenge if target reached', async () => {
      const activeChallenge = {
        id: 'user-chal-123',
        challengeId: 'walk-commute',
        progress: 4,
        target: 5,
        status: 'ACTIVE'
      };

      vi.mocked(prisma.challenge.findFirst).mockResolvedValue(activeChallenge as any);
      vi.mocked(prisma.challenge.update).mockImplementation(async ({ data }: any) => {
        return {
          ...activeChallenge,
          progress: data.progress,
          status: data.status
        } as any;
      });

      const res = await request(app)
        .post('/challenges/progress')
        .set('Cookie', `token=${token}`)
        .send({ challengeId: 'walk-commute' });

      expect(res.status).toBe(200);
      expect(res.body.progress).toBe(5);
      expect(res.body.status).toBe('COMPLETED');
    });
  });
});
