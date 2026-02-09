import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticateAdmin';
import { databaseManager } from '../services/databaseManager';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  daysRemaining?: number;
  trialEndDate?: Date;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string, userType: string): Promise<SubscriptionInfo> {
  const db = databaseManager.getPrismaClient();
  const now = new Date();

  try {
    let user: any = null;
    let subscriptionPlan: any = null;

    // Fetch user with subscription info based on userType
    if (userType === 'HEALTHCARE') {
      user = await db.healthcareUser.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlanId: true,
          subscriptionStatus: true,
          trialStartDate: true,
          trialEndDate: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
        }
      });
    } else if (userType === 'EMS') {
      user = await db.eMSUser.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlanId: true,
          subscriptionStatus: true,
          trialStartDate: true,
          trialEndDate: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
        }
      });
    } else if (userType === 'ADMIN' || userType === 'USER') {
      user = await db.centerUser.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlanId: true,
          subscriptionStatus: true,
          trialStartDate: true,
          trialEndDate: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
        }
      });
    }

    if (!user) {
      return { status: 'EXPIRED' };
    }

    // If user has active paid subscription
    if (user.subscriptionStatus === 'ACTIVE' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > now) {
      return {
        status: 'ACTIVE',
        subscriptionPlanId: user.subscriptionPlanId || undefined,
      };
    }

    // If subscription was cancelled
    if (user.subscriptionStatus === 'CANCELLED') {
      return { status: 'CANCELLED' };
    }

    // Check trial status
    if (user.trialEndDate) {
      const trialEndDate = new Date(user.trialEndDate);
      if (now > trialEndDate) {
        return {
          status: 'EXPIRED',
          trialEndDate: trialEndDate,
        };
      } else {
        // Calculate days remaining
        const diffTime = trialEndDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Fetch plan name if available
        if (user.subscriptionPlanId) {
          subscriptionPlan = await db.subscriptionPlan.findUnique({
            where: { id: user.subscriptionPlanId },
            select: { name: true, displayName: true }
          });
        }

        return {
          status: 'TRIAL',
          daysRemaining,
          trialEndDate: trialEndDate,
          subscriptionPlanId: user.subscriptionPlanId || undefined,
          subscriptionPlanName: subscriptionPlan?.displayName || subscriptionPlan?.name || undefined,
        };
      }
    }

    // Default to expired if no trial date
    return { status: 'EXPIRED' };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    // On error, allow access but log the issue
    return { status: 'TRIAL' };
  }
}

/**
 * Middleware to check subscription status and block expired trials
 * Use this after authenticateAdmin/authenticateToken middleware
 */
export const checkSubscriptionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const subscriptionInfo = await getSubscriptionStatus(req.user.id, req.user.userType);

    // Block access if trial expired and no active subscription
    if (subscriptionInfo.status === 'EXPIRED') {
      return res.status(403).json({
        success: false,
        error: 'Your free trial has expired. Please upgrade to a paid account to continue using TRACC.',
        subscriptionStatus: 'EXPIRED',
        upgradeUrl: '/pricing',
        daysRemaining: 0
      });
    }

    // Add subscription info to request for use in routes
    (req as any).subscriptionInfo = subscriptionInfo;

    // Add trial days remaining to response headers for frontend display
    if (subscriptionInfo.status === 'TRIAL' && subscriptionInfo.daysRemaining !== undefined) {
      res.setHeader('X-Trial-Days-Remaining', subscriptionInfo.daysRemaining.toString());
    }

    next();
  } catch (error) {
    console.error('Subscription status check error:', error);
    // On error, allow access but log
    next();
  }
};
