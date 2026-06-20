import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware';
export declare const DEFAULT_CHALLENGES: {
    id: string;
    title: string;
    objective: string;
    category: string;
    impact: string;
    reward: string;
    target: number;
    icon: string;
}[];
export declare const getChallenges: (req: AuthRequest, res: Response) => Promise<void>;
export declare const joinChallenge: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logChallengeProgress: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=challengesController.d.ts.map