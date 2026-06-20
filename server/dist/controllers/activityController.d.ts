import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getActivities: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createActivity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteActivity: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=activityController.d.ts.map