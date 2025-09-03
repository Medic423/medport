import { databaseManager } from './databaseManager';

export interface FreemiumSettings {
  userId: string;
  userType: 'center' | 'hospital' | 'ems';
  features: {
    revenueOptimization: boolean;
    advancedAnalytics: boolean;
    customReporting: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
    multiAgencyCoordination: boolean;
  };
  planType: 'free' | 'premium' | 'enterprise';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class FreemiumService {
  /**
   * Get freemium settings for a user
   */
  static async getUserSettings(userId: string): Promise<FreemiumSettings | null> {
    try {
      // For now, return default settings based on user type
      // In a real implementation, this would query a freemium_settings table
      const centerDB = databaseManager.getCenterDB();
      const user = await centerDB.user.findUnique({
        where: { id: userId },
        select: { role: true, userType: true }
      });

      if (!user) return null;

      // Map database userType to service user types
      const userTypeMap: Record<string, 'center' | 'hospital' | 'ems'> = {
        'CENTER': 'center',
        'HOSPITAL': 'hospital', 
        'EMS': 'ems'
      };

      const userType = userTypeMap[user.userType] || 'hospital';

      // Default feature settings based on user type
      const defaultSettings: FreemiumSettings = {
        userId,
        userType,
        features: {
          revenueOptimization: userType === 'center', // Only center users get this by default
          advancedAnalytics: userType === 'center',
          customReporting: userType === 'center',
          prioritySupport: userType === 'center',
          apiAccess: userType === 'center',
          multiAgencyCoordination: userType === 'center'
        },
        planType: userType === 'center' ? 'premium' : 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return defaultSettings;
    } catch (error) {
      console.error('[FREEMIUM] Error getting user settings:', error);
      return null;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeatureAccess(userId: string, feature: keyof FreemiumSettings['features']): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) return false;

      return settings.features[feature];
    } catch (error) {
      console.error('[FREEMIUM] Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Update user's freemium settings (admin only)
   */
  static async updateUserSettings(userId: string, updates: Partial<FreemiumSettings>): Promise<FreemiumSettings | null> {
    try {
      // In a real implementation, this would update a freemium_settings table
      // For now, we'll just return the updated settings
      const currentSettings = await this.getUserSettings(userId);
      if (!currentSettings) return null;

      const updatedSettings: FreemiumSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date()
      };

      return updatedSettings;
    } catch (error) {
      console.error('[FREEMIUM] Error updating user settings:', error);
      return null;
    }
  }

  /**
   * Get all available features
   */
  static getAvailableFeatures(): Array<{ id: keyof FreemiumSettings['features']; name: string; description: string }> {
    return [
      {
        id: 'revenueOptimization',
        name: 'Revenue Optimization',
        description: 'Advanced algorithms to maximize revenue and minimize empty miles'
      },
      {
        id: 'advancedAnalytics',
        name: 'Advanced Analytics',
        description: 'Detailed performance metrics and trend analysis'
      },
      {
        id: 'customReporting',
        name: 'Custom Reporting',
        description: 'Create custom reports and export data in various formats'
      },
      {
        id: 'prioritySupport',
        name: 'Priority Support',
        description: '24/7 priority customer support with faster response times'
      },
      {
        id: 'apiAccess',
        name: 'API Access',
        description: 'Full API access for integrations and custom applications'
      },
      {
        id: 'multiAgencyCoordination',
        name: 'Multi-Agency Coordination',
        description: 'Coordinate across multiple EMS agencies and optimize region-wide'
      }
    ];
  }

  /**
   * Get plan information
   */
  static getPlanInfo(planType: FreemiumSettings['planType']) {
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        description: 'Basic transport management features',
        features: ['Basic trip management', 'Standard notifications', 'Basic reporting']
      },
      premium: {
        name: 'Premium',
        price: 99,
        description: 'Advanced features for growing operations',
        features: ['Revenue optimization', 'Advanced analytics', 'Custom reporting', 'Priority support']
      },
      enterprise: {
        name: 'Enterprise',
        price: 299,
        description: 'Full-featured solution for large operations',
        features: ['All premium features', 'API access', 'Multi-agency coordination', 'Custom integrations']
      }
    };

    return plans[planType];
  }
}
