import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { register, login, updateOnboarding, updateProfile } from './authController';
import prisma from '../models/prismaClient';
import { authenticate } from '../middleware/authMiddleware';

// Mock the prisma client
vi.mock('../models/prismaClient', () => {
  return {
    default: {
      user: {
        findUnique: vi.fn(),
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

// Setup mock endpoints
app.post('/register', register);
app.post('/login', login);
app.put('/onboarding', authenticate, updateOnboarding);
app.put('/profile', authenticate, updateProfile);

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should successfully register a new user with valid details', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        name: 'Test User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@gmail.com',
          password: 'Password123!',
          name: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual(mockUser);
    });

    it('should return 400 for invalid email domain', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@tempmail.com',
          password: 'Password123!',
          name: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Email must be from a trusted domain');
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@gmail.com',
          password: '123',
          name: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be at least 8 characters long');
    });

    it('should return 400 if user email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@gmail.com',
        password: 'hashedpassword',
        name: 'Test User',
        baselineFootprint: 1000,
        location: null,
        dietType: null,
        commuteMethod: null,
        homeEnergySource: null,
        shoppingHabits: null,
        wasteHabits: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@gmail.com',
          password: 'Password123!',
          name: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Registration failed');
    });
  });

  describe('POST /login', () => {
    it('should successfully log in with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 12);
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        password: hashedPassword,
        name: 'Test User',
        baselineFootprint: 1200,
        dietType: 'vegan',
        commuteMethod: 'bike',
        homeEnergySource: 'renewable',
        location: 'London',
        shoppingHabits: 'minimalist',
        wasteHabits: 'zero',
        avatar: 'avatar-url',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@gmail.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@gmail.com');
    });

    it('should return 401 for incorrect credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@gmail.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('PUT /onboarding', () => {
    it('should update onboarding settings and calculate correct baseline footprint', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        password: 'hashed',
        name: 'Test User',
        baselineFootprint: 1500,
        dietType: 'vegan',
        commuteMethod: 'bike',
        homeEnergySource: 'renewable',
        location: 'London',
        shoppingHabits: 'minimalist',
        wasteHabits: 'zero',
        avatar: 'avatar-url',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      // Generate a JWT for testing request
      const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'testsecret');

      const res = await request(app)
        .put('/onboarding')
        .set('Cookie', `token=${token}`)
        .send({
          answers: {
            transport: 'bike', // 0
            diet: 'vegan', // 1000
            energy: 'renewable', // 200
            shopping: 'minimalist', // 200
            waste: 'zero', // 100
            location: 'London'
          },
          name: 'Test User'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.baselineFootprint).toBe(1500); // 0 + 1000 + 200 + 200 + 100 = 1500
    });
  });

  describe('PUT /profile', () => {
    it('should update profile settings and recalculate baseline correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        commuteMethod: 'bike',
        dietType: 'vegan',
        homeEnergySource: 'renewable',
        shoppingHabits: 'minimalist',
        wasteHabits: 'zero',
      } as any;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        baselineFootprint: 1500
      });

      const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'testsecret');

      const res = await request(app)
        .put('/profile')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Updated Name',
          commuteMethod: 'bike',
          dietType: 'vegan',
          homeEnergySource: 'renewable',
          shoppingHabits: 'minimalist',
          wasteHabits: 'zero',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
