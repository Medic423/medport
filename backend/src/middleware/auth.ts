import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userType: 'hospital' | 'ems' | 'center';
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
      role: 'ADMIN',
      userType: 'hospital' // Demo user gets hospital access for testing
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
    
    // Map role to userType for unified system
    let userType: 'hospital' | 'ems' | 'center';
    if (decoded.userType) {
      userType = decoded.userType;
    } else if (decoded.role) {
      // Legacy role mapping for backward compatibility
      if (decoded.role === 'ADMIN' || decoded.role === 'COORDINATOR') {
        userType = 'center';
      } else if (decoded.role === 'BILLING_STAFF' || decoded.role === 'HOSPITAL_STAFF') {
        userType = 'hospital';
      } else if (decoded.role === 'TRANSPORT_AGENCY' || decoded.role === 'EMS_PROVIDER') {
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
      role: decoded.role,
      userType: userType
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

// Freemium authorization middleware
export const requireFeatureAccess = (featureName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Import FreemiumService dynamically to avoid circular dependencies
      const { FreemiumService } = await import('../services/freemiumService');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Center users have access to all features
      if (req.user.userType === 'center') {
        return next();
      }

      // Check if user has access to the specific feature
      const hasAccess = await FreemiumService.hasFeatureAccess(req.user.id, featureName as any);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: `Feature '${featureName}' is not enabled for your account`,
          feature: featureName,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('[AUTH] Feature access check failed:', error);
      return res.status(500).json({ message: 'Failed to verify feature access' });
    }
  };
};

// User type authorization middleware
export const requireUserType = (userTypes: ('hospital' | 'ems' | 'center')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Insufficient permissions for this user type' });
    }

    next();
  };
};
