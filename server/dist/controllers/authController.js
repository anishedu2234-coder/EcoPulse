"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.handleAvatarUpload = exports.updateProfile = exports.updateOnboarding = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prismaClient_1 = __importDefault(require("../models/prismaClient"));
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing');
}
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8).max(100),
    name: zod_1.z.string().max(100).optional(),
});
const register = async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const existingUser = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Registration failed. Please try a different email or sign in.' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const user = await prismaClient_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Registration failed. Please try a different email or sign in.' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().max(100),
});
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const onboardingSchema = zod_1.z.object({
    answers: zod_1.z.object({
        transport: zod_1.z.enum(['bike', 'public', 'ev', 'car']),
        diet: zod_1.z.enum(['vegan', 'vegetarian', 'pescatarian', 'meat']),
        energy: zod_1.z.enum(['renewable', 'mixed', 'fossil']),
        shopping: zod_1.z.enum(['minimalist', 'average', 'frequent']),
        waste: zod_1.z.enum(['zero', 'mixed', 'landfill']),
        location: zod_1.z.string().max(100).optional().nullable(),
    }),
    name: zod_1.z.string().max(100).optional(),
});
const updateOnboarding = async (req, res) => {
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
            case 'bike':
                transportFootprint = 0;
                break;
            case 'public':
                transportFootprint = 500;
                break;
            case 'ev':
                transportFootprint = 1200;
                break;
            case 'car':
                transportFootprint = 3000;
                break;
            default: transportFootprint = 1500;
        }
        let dietFootprint = 0;
        switch (answers.diet) {
            case 'vegan':
                dietFootprint = 1000;
                break;
            case 'vegetarian':
                dietFootprint = 1500;
                break;
            case 'pescatarian':
                dietFootprint = 1800;
                break;
            case 'meat':
                dietFootprint = 3000;
                break;
            default: dietFootprint = 2000;
        }
        let energyFootprint = 0;
        switch (answers.energy) {
            case 'renewable':
                energyFootprint = 200;
                break;
            case 'mixed':
                energyFootprint = 1500;
                break;
            case 'fossil':
                energyFootprint = 3500;
                break;
            default: energyFootprint = 1800;
        }
        let shoppingFootprint = 0;
        switch (answers.shopping) {
            case 'minimalist':
                shoppingFootprint = 200;
                break;
            case 'average':
                shoppingFootprint = 1000;
                break;
            case 'frequent':
                shoppingFootprint = 2500;
                break;
            default: shoppingFootprint = 1000;
        }
        let wasteFootprint = 0;
        switch (answers.waste) {
            case 'zero':
                wasteFootprint = 100;
                break;
            case 'mixed':
                wasteFootprint = 400;
                break;
            case 'landfill':
                wasteFootprint = 800;
                break;
            default: wasteFootprint = 400;
        }
        const baselineFootprint = transportFootprint + dietFootprint + energyFootprint + shoppingFootprint + wasteFootprint;
        const updatedUser = await prismaClient_1.default.user.update({
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
    }
    catch (error) {
        console.error('Update onboarding error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Failed to update onboarding answers' });
    }
};
exports.updateOnboarding = updateOnboarding;
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email().max(255).optional(),
    password: zod_1.z.string().min(8).max(100).optional(),
    avatar: zod_1.z.string().url().max(1000).optional().or(zod_1.z.literal('')),
    commuteMethod: zod_1.z.enum(['bike', 'public', 'ev', 'car']).optional(),
    dietType: zod_1.z.enum(['vegan', 'vegetarian', 'pescatarian', 'meat']).optional(),
    homeEnergySource: zod_1.z.enum(['renewable', 'mixed', 'fossil']).optional(),
    location: zod_1.z.string().max(100).optional().nullable(),
    shoppingHabits: zod_1.z.enum(['minimalist', 'average', 'frequent']).optional(),
    wasteHabits: zod_1.z.enum(['zero', 'mixed', 'landfill']).optional(),
});
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, email, password, avatar, commuteMethod, dietType, homeEnergySource, location, shoppingHabits, wasteHabits, } = updateProfileSchema.parse(req.body);
        // Validate email if changed
        if (email) {
            const existing = await prismaClient_1.default.user.findFirst({
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
            hashedPassword = await bcrypt_1.default.hash(password, 12);
        }
        // Re-calculate baseline footprint
        const currentUser = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
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
            case 'bike':
                transportFootprint = 0;
                break;
            case 'public':
                transportFootprint = 500;
                break;
            case 'ev':
                transportFootprint = 1200;
                break;
            case 'car':
                transportFootprint = 3000;
                break;
            default: transportFootprint = 1500;
        }
        let dietFootprint = 0;
        switch (nextDiet) {
            case 'vegan':
                dietFootprint = 1000;
                break;
            case 'vegetarian':
                dietFootprint = 1500;
                break;
            case 'pescatarian':
                dietFootprint = 1800;
                break;
            case 'meat':
                dietFootprint = 3000;
                break;
            default: dietFootprint = 2000;
        }
        let energyFootprint = 0;
        switch (nextEnergy) {
            case 'renewable':
                energyFootprint = 200;
                break;
            case 'mixed':
                energyFootprint = 1500;
                break;
            case 'fossil':
                energyFootprint = 3500;
                break;
            default: energyFootprint = 1800;
        }
        let shoppingFootprint = 0;
        switch (nextShopping) {
            case 'minimalist':
                shoppingFootprint = 200;
                break;
            case 'average':
                shoppingFootprint = 1000;
                break;
            case 'frequent':
                shoppingFootprint = 2500;
                break;
            default: shoppingFootprint = 1000;
        }
        let wasteFootprint = 0;
        switch (nextWaste) {
            case 'zero':
                wasteFootprint = 100;
                break;
            case 'mixed':
                wasteFootprint = 400;
                break;
            case 'landfill':
                wasteFootprint = 800;
                break;
            default: wasteFootprint = 400;
        }
        const baselineFootprint = transportFootprint + dietFootprint + energyFootprint + shoppingFootprint + wasteFootprint;
        const updatedUser = await prismaClient_1.default.user.update({
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMsg = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({ error: errorMsg });
            return;
        }
        res.status(500).json({ error: 'Failed to update profile settings' });
    }
};
exports.updateProfile = updateProfile;
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const userId = req.user?.userId || 'anonymous';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});
const handleAvatarUpload = (req, res, next) => {
    const uploadSingle = upload.single('avatar');
    uploadSingle(req, res, (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError) {
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
exports.handleAvatarUpload = handleAvatarUpload;
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded or file rejected by validation.' });
            return;
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ success: true, avatarUrl: fileUrl });
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
};
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=authController.js.map