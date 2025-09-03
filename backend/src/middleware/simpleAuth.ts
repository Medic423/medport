import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface SimpleAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: 'hospital' | 'ems' | 'center';
  };
}

export const simpleAuthenticateToken = (req: SimpleAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  console.log('[SIMPLE_AUTH] Processing authentication request:', { 
    hasAuthHeader: !!authHeader, 
    authHeaderType: typeof authHeader,
    userAgent: req.headers['user-agent']
  });
  
  // Demo mode support - handle both formats
  if (authHeader === 'demo-token' || authHeader === 'Bearer demo-token') {
    console.log('[SIMPLE_AUTH] Demo mode authentication bypassed');
    req.user = {
      id: 'cmf2mdpnx0000ccuti77tb3s9', // Use actual demo user ID from database
      email: 'demo@medport.com',
      userType: 'hospital' // Demo user gets hospital access for testing
    };
    return next();
  }
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.error('[SIMPLE_AUTH] No token provided in authorization header');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('[SIMPLE_AUTH] JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    console.log('[SIMPLE_AUTH] Token decoded successfully:', { 
      userId: decoded.id, 
      userEmail: decoded.email, 
      userType: decoded.userType 
    });
    
    // Map old role system to new user type system for backward compatibility
    let userType: 'hospital' | 'ems' | 'center';
    
    // First, try to use the new userType field if available
    if (decoded.userType) {
      userType = decoded.userType;
    } else if (decoded.role) {
      // Legacy role mapping for backward compatibility
      if (decoded.role === 'ADMIN' || decoded.role === 'MANAGER' || decoded.role === 'COORDINATOR') {
        userType = 'center';
      } else if (decoded.role === 'HOSPITAL_STAFF' || decoded.role === 'NURSE' || decoded.role === 'HOSPITAL_COORDINATOR') {
        userType = 'hospital';
      } else if (decoded.role === 'EMS_PROVIDER' || decoded.role === 'DRIVER' || decoded.role === 'TRANSPORT_AGENCY') {
        userType = 'ems';
      } else {
        userType = 'hospital'; // Default fallback
      }
    } else {
      userType = 'hospital'; // Default fallback
    }
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: userType
    };
    
    // Validate user object was set
    if (!req.user || !req.user.userType) {
      console.error('[SIMPLE_AUTH] Failed to set user object:', req.user);
      return res.status(500).json({ message: 'Authentication failed' });
    }
    
    next();
  } catch (error) {
    console.error('[SIMPLE_AUTH] Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireUserType = (userTypes: ('hospital' | 'ems' | 'center')[]) => {
  return (req: SimpleAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Insufficient permissions for this user type' });
    }

    next();
  };
};
