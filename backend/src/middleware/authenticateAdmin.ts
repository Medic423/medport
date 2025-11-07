import { Request, Response, NextFunction } from 'express';
import { authService, User } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    console.log('TCC_DEBUG: authenticateAdmin - authHeader:', authHeader);
    console.log('TCC_DEBUG: authenticateAdmin - cookies:', (req as any).cookies);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('TCC_DEBUG: authenticateAdmin - token from header:', token ? token.substring(0, 20) + '...' : 'none');
    } else if ((req as any).cookies && (req as any).cookies.tcc_token) {
      token = (req as any).cookies.tcc_token;
      console.log('TCC_DEBUG: authenticateAdmin - token from cookie:', token ? token.substring(0, 20) + '...' : 'none');
    }
    
    if (!token) {
      console.log('TCC_DEBUG: authenticateAdmin - no token found');
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const user = await authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Alias for EMS users
export const authenticateToken = authenticateAdmin;
