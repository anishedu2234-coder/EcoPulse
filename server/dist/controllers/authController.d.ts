import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const updateOnboarding: (req: any, res: Response) => Promise<void>;
export declare const updateProfile: (req: any, res: Response) => Promise<void>;
export declare const handleAvatarUpload: (req: any, res: Response, next: any) => void;
export declare const uploadAvatar: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map