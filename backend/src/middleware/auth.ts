import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userType?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  console.log('[AUTH] Processing authentication request:', { 
    hasAuthHeader: !!authHeader, 
    authHeaderType: typeof authHeader,
    userAgent: req.headers['user-agent']
  });
  
  // Demo mode support - handle both formats
  if (authHeader === 'demo-token' || authHeader === 'Bearer demo-token') {
    console.log('[AUTH] Demo mode authentication bypassed');
    req.user = {
      id: 'cmf2mdpnx0000ccuti77tb3s9', // Use actual demo user ID from database
      email: 'demo@medport.com',
      role: 'ADMIN'
    };
    return next();
  }
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.error('[AUTH] No token provided in authorization header');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    console.log('[AUTH] Token decoded successfully:', { 
      userId: decoded.id, 
      userEmail: decoded.email, 
      userRole: decoded.role,
      userType: decoded.userType
    });
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      userType: decoded.userType
    };
    
    // Validate user object was set
    if (!req.user || !req.user.role) {
      console.error('[AUTH] Failed to set user object:', req.user);
      return res.status(500).json({ message: 'Authentication failed' });
    }
    
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// requireRole function removed - using simple user type system instead
