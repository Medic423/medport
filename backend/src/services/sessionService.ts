import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: Date;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export class SessionService {
  /**
   * Validate JWT token and return user data
   */
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive) {
        return {
          isValid: false,
          error: 'User not found or inactive'
        };
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          isValid: false,
          error: 'Token expired'
        };
      }
      
      return {
        isValid: false,
        error: 'Invalid token'
      };
    }
  }

  /**
   * Create a new session for a user
   */
  static async createSession(userId: string, deviceInfo?: string, ipAddress?: string): Promise<SessionData> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const session: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      lastActivity: new Date(),
      deviceInfo,
      ipAddress
    };

    // In a production environment, you might want to store sessions in Redis or database
    // For now, we'll return the session data
    return session;
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(userId: string): Promise<void> {
    // Update last activity timestamp
    // In production, this would update the session in Redis/database
    console.log(`[MedPort] Session activity updated for user: ${userId}`);
  }

  /**
   * Invalidate user session (logout)
   */
  static async invalidateSession(userId: string): Promise<void> {
    // In production, this would remove the session from Redis/database
    // For JWT tokens, we can't invalidate them server-side, but we can track them
    console.log(`[MedPort] Session invalidated for user: ${userId}`);
  }

  /**
   * Get active sessions for a user
   */
  static async getActiveSessions(userId: string): Promise<SessionData[]> {
    // In production, this would query Redis/database for active sessions
    // For now, return empty array
    return [];
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    // In production, this would remove expired sessions from Redis/database
    console.log('[MedPort] Cleaned up expired sessions');
  }

  /**
   * Generate offline session token for PWA
   */
  static generateOfflineToken(userId: string): string {
    // Generate a longer-lived token for offline use
    const payload = {
      id: userId,
      type: 'offline',
      timestamp: Date.now()
    };

    const expiresIn = '30d'; // 30 days for offline use
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
  }

  /**
   * Validate offline token
   */
  static async validateOfflineToken(token: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'offline') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive) {
        return {
          isValid: false,
          error: 'User not found or inactive'
        };
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: 'Invalid offline token'
      };
    }
  }

  /**
   * Get user permissions based on role
   */
  static getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      ADMIN: [
        // Transport Command capabilities (full system access)
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'facility:manage',
        'agency:manage',
        'route:optimize',
        'system:admin',
        'settings:full',
        'module:all',
        'role:manage',
        'system:configure',
        'analytics:full',
        'financial:full',
        'dispatch:full',
        'tracking:full',
        // Transport operations
        'transport:read',
        'transport:create',
        'transport:update',
        'transport:delete',
        // Unit operations
        'unit:assign',
        'unit:manage',
        'unit:read',
        // Route operations
        'route:view',
        // Notifications
        'notifications:manage',
        // Analytics
        'analytics:view',
        'analytics:financial',
        // Facility and agency
        'facility:read',
        'agency:read',
        'agency:profile',
        // Bidding
        'bid:manage',
        'bid:read'
      ],
      COORDINATOR: [
        // Transport Center Coordinator capabilities
        'transport:create',
        'transport:read',
        'transport:update',
        'route:view',
        'facility:read',
        'agency:read',
        'dispatch:manage',
        'unit:assign',
        'tracking:view',
        'analytics:view',
        'financial:limited',
        'settings:limited',
        'notifications:manage'
      ],
      BILLING_STAFF: [
        // Financial planning and analysis
        'billing:read',
        'billing:update',
        'reports:view',
        'facility:read',
        'financial:full',
        'analytics:financial',
        'analytics:view',
        'revenue:track',
        'cost:analyze',
        'agency:financial',
        'settings:limited',
        'module:help'
      ],
      TRANSPORT_AGENCY: [
        // Agency-specific operations
        'transport:read',
        'route:bid',
        'unit:manage',
        'agency:profile',
        'bidding:manage',
        'unit:status',
        'route:view',
        'analytics:agency'
      ],
      HOSPITAL_COORDINATOR: [
        // Hospital-specific operations
        'transport:create',
        'transport:read',
        'transport:update',
        'status:view',
        'emergency:optimize',
        'facility:read',
        'analytics:hospital'
      ]
    };

    return permissions[role] || [];
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: string, permission: string): boolean {
    const permissions = this.getUserPermissions(userRole);
    return permissions.includes(permission);
  }
}
