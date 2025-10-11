import { Request, Response, NextFunction } from 'express';
import { User } from '../services/authService';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const authenticateAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authenticateAdmin.d.ts.map