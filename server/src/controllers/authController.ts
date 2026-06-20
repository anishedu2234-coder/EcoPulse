import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../models/prismaClient';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import path from 'path';


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

const trustedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com', 'zoho.com', 'aol.com'];
const disposableDomains = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'sharklasers.com', 'dispostable.com'];

const emailValidator = z.string().email().max(255).refine((val) => {
  const domain = val.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  if (disposableDomains.includes(domain)) return false;
  // Allow trusted domains or custom corporate domains (avoiding keywords common in temporary emails)
  return trustedDomains.includes(domain) || (!domain.includes('temp') && !domain.includes('disposable'));
}, {
  message: "Email must be from a trusted domain (e.g. gmail.com, outlook.com) and not a disposable email provider."
});

const passwordValidator = z.string()
  .min(8, "Password must be at least 8 characters long")
  .max(100)
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  name: z.string().max(100).optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Registration failed. Please try a different email or sign in.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Registration failed. Please try a different email or sign in.' });
        return;
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().max(100),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        baselineFootprint: user.baselineFootprint,
        dietType: user.dietType,
        commuteMethod: user.commuteMethod,
        homeEnergySource: user.homeEnergySource,
        location: user.location,
        shoppingHabits: user.shoppingHabits,
        wasteHabits: user.wasteHabits
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};


const onboardingSchema = z.object({
  answers: z.object({
    transport: z.enum(['bike', 'public', 'ev', 'car']),
    diet: z.enum(['vegan', 'vegetarian', 'pescatarian', 'meat']),
    energy: z.enum(['renewable', 'mixed', 'fossil']),
    shopping: z.enum(['minimalist', 'average', 'frequent']),
    waste: z.enum(['zero', 'mixed', 'landfill']),
    location: z.string().max(100).optional().nullable(),
  }),
  name: z.string().max(100).optional(),
});

export const updateOnboarding = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { answers, name } = onboardingSchema.parse(req.body);

    // Calculate footprint estimate
    let transportFootprint = 0;
    switch (answers.transport) {
      case 'bike': transportFootprint = 0; break;
      case 'public': transportFootprint = 500; break;
      case 'ev': transportFootprint = 1200; break;
      case 'car': transportFootprint = 3000; break;
      default: transportFootprint = 1500;
    }

    let dietFootprint = 0;
    switch (answers.diet) {
      case 'vegan': dietFootprint = 1000; break;
      case 'vegetarian': dietFootprint = 1500; break;
      case 'pescatarian': dietFootprint = 1800; break;
      case 'meat': dietFootprint = 3000; break;
      default: dietFootprint = 2000;
    }

    let energyFootprint = 0;
    switch (answers.energy) {
      case 'renewable': energyFootprint = 200; break;
      case 'mixed': energyFootprint = 1500; break;
      case 'fossil': energyFootprint = 3500; break;
      default: energyFootprint = 1800;
    }

    let shoppingFootprint = 0;
    switch (answers.shopping) {
      case 'minimalist': shoppingFootprint = 200; break;
      case 'average': shoppingFootprint = 1000; break;
      case 'frequent': shoppingFootprint = 2500; break;
      default: shoppingFootprint = 1000;
    }

    let wasteFootprint = 0;
    switch (answers.waste) {
      case 'zero': wasteFootprint = 100; break;
      case 'mixed': wasteFootprint = 400; break;
      case 'landfill': wasteFootprint = 800; break;
      default: wasteFootprint = 400;
    }

    const baselineFootprint = transportFootprint + dietFootprint + energyFootprint + shoppingFootprint + wasteFootprint;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        baselineFootprint,
        commuteMethod: answers.transport,
        dietType: answers.diet,
        homeEnergySource: answers.energy,
        shoppingHabits: answers.shopping,
        wasteHabits: answers.waste,
        location: answers.location,
        ...(name !== undefined ? { name } : {}),
      },
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        baselineFootprint: updatedUser.baselineFootprint,
        commuteMethod: updatedUser.commuteMethod,
        dietType: updatedUser.dietType,
        homeEnergySource: updatedUser.homeEnergySource,
        location: updatedUser.location,
        shoppingHabits: updatedUser.shoppingHabits,
        wasteHabits: updatedUser.wasteHabits
      }
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }
    res.status(500).json({ error: 'Failed to update onboarding answers' });
  }
};

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).max(100).optional(),
  avatar: z.string().url().max(1000).optional().or(z.literal('')),
  commuteMethod: z.enum(['bike', 'public', 'ev', 'car']).optional(),
  dietType: z.enum(['vegan', 'vegetarian', 'pescatarian', 'meat']).optional(),
  homeEnergySource: z.enum(['renewable', 'mixed', 'fossil']).optional(),
  location: z.string().max(100).optional().nullable(),
  shoppingHabits: z.enum(['minimalist', 'average', 'frequent']).optional(),
  wasteHabits: z.enum(['zero', 'mixed', 'landfill']).optional(),
});

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      name,
      email,
      password,
      avatar,
      commuteMethod,
      dietType,
      homeEnergySource,
      location,
      shoppingHabits,
      wasteHabits,
    } = updateProfileSchema.parse(req.body);

    // Validate email if changed
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Re-calculate baseline footprint
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const nextCommute = commuteMethod !== undefined ? commuteMethod : currentUser.commuteMethod;
    const nextDiet = dietType !== undefined ? dietType : currentUser.dietType;
    const nextEnergy = homeEnergySource !== undefined ? homeEnergySource : currentUser.homeEnergySource;
    const nextShopping = shoppingHabits !== undefined ? shoppingHabits : currentUser.shoppingHabits;
    const nextWaste = wasteHabits !== undefined ? wasteHabits : currentUser.wasteHabits;

    let transportFootprint = 0;
    switch (nextCommute) {
      case 'bike': transportFootprint = 0; break;
      case 'public': transportFootprint = 500; break;
      case 'ev': transportFootprint = 1200; break;
      case 'car': transportFootprint = 3000; break;
      default: transportFootprint = 1500;
    }

    let dietFootprint = 0;
    switch (nextDiet) {
      case 'vegan': dietFootprint = 1000; break;
      case 'vegetarian': dietFootprint = 1500; break;
      case 'pescatarian': dietFootprint = 1800; break;
      case 'meat': dietFootprint = 3000; break;
      default: dietFootprint = 2000;
    }

    let energyFootprint = 0;
    switch (nextEnergy) {
      case 'renewable': energyFootprint = 200; break;
      case 'mixed': energyFootprint = 1500; break;
      case 'fossil': energyFootprint = 3500; break;
      default: energyFootprint = 1800;
    }

    let shoppingFootprint = 0;
    switch (nextShopping) {
      case 'minimalist': shoppingFootprint = 200; break;
      case 'average': shoppingFootprint = 1000; break;
      case 'frequent': shoppingFootprint = 2500; break;
      default: shoppingFootprint = 1000;
    }

    let wasteFootprint = 0;
    switch (nextWaste) {
      case 'zero': wasteFootprint = 100; break;
      case 'mixed': wasteFootprint = 400; break;
      case 'landfill': wasteFootprint = 800; break;
      default: wasteFootprint = 400;
    }

    const baselineFootprint = transportFootprint + dietFootprint + energyFootprint + shoppingFootprint + wasteFootprint;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(hashedPassword !== undefined ? { password: hashedPassword } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(commuteMethod !== undefined ? { commuteMethod } : {}),
        ...(dietType !== undefined ? { dietType } : {}),
        ...(homeEnergySource !== undefined ? { homeEnergySource } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(shoppingHabits !== undefined ? { shoppingHabits } : {}),
        ...(wasteHabits !== undefined ? { wasteHabits } : {}),
        baselineFootprint
      }
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        baselineFootprint: updatedUser.baselineFootprint,
        commuteMethod: updatedUser.commuteMethod,
        dietType: updatedUser.dietType,
        homeEnergySource: updatedUser.homeEnergySource,
        location: updatedUser.location,
        shoppingHabits: updatedUser.shoppingHabits,
        wasteHabits: updatedUser.wasteHabits
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }
    res.status(500).json({ error: 'Failed to update profile settings' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.userId || 'anonymous';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

export const handleAvatarUpload = (req: any, res: Response, next: any) => {
  const uploadSingle = upload.single('avatar');
  uploadSingle(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'File size exceeds the 2MB limit.' });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
};

export const uploadAvatar = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded or file rejected by validation.' });
      return;
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, avatarUrl: fileUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
};




