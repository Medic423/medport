import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ModuleAccess {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredPermissions: string[];
  visibleToRoles: string[];
  isActive: boolean;
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  category: string;
  icon?: string;
  children?: NavigationItem[];
  requiredPermissions: string[];
  visibleToRoles: string[];
}

export interface RoleBasedNavigation {
  role: string;
  navigation: NavigationItem[];
}

export class RoleBasedAccessService {
  /**
   * Get all available modules with their access requirements
   */
  static getAvailableModules(): ModuleAccess[] {
    return [
      // Dispatch Operations - Core transport coordination and management
      {
        id: 'transport-requests',
        name: 'Transport Requests',
        description: 'Create and manage transport requests',
        category: 'Dispatch Operations',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'status-board',
        name: 'Status Board',
        description: 'View transport request status and unit assignments',
        category: 'Dispatch Operations',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'unit-assignment',
        name: 'Unit Assignment',
        description: 'Assign transport units to requests and optimize assignments',
        category: 'Dispatch Operations',
        requiredPermissions: ['unit:assign', 'dispatch:manage'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'route-optimization',
        name: 'Route Optimization',
        description: 'Optimize routes for maximum efficiency and revenue',
        category: 'Dispatch Operations',
        requiredPermissions: ['route:optimize', 'route:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'distance-matrix',
        name: 'Distance Matrix',
        description: 'Calculate distances between facilities and optimize routing',
        category: 'Dispatch Operations',
        requiredPermissions: ['route:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'real-time-tracking',
        name: 'Real-Time Tracking',
        description: 'Track transport units in real-time with GPS integration',
        category: 'Dispatch Operations',
        requiredPermissions: ['tracking:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Manage system notifications and communications',
        category: 'Dispatch Operations',
        requiredPermissions: ['notifications:manage'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },

      // Financial Planning - Revenue optimization, cost analysis, and financial management
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        description: 'View system analytics and performance reports',
        category: 'Financial Planning',
        requiredPermissions: ['analytics:view', 'analytics:financial'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'BILLING_STAFF'],
        isActive: true
      },
      {
        id: 'resource-management',
        name: 'Resource Management',
        description: 'Manage transport resources and capacity planning',
        category: 'Financial Planning',
        requiredPermissions: ['facility:read', 'agency:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'agency-portal',
        name: 'Agency Portal',
        description: 'Transport agency management and operations',
        category: 'Financial Planning',
        requiredPermissions: ['agency:profile', 'unit:manage'],
        visibleToRoles: ['ADMIN', 'TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'unit-management',
        name: 'Unit Management',
        description: 'Manage transport units and availability',
        category: 'Financial Planning',
        requiredPermissions: ['unit:manage', 'unit:read'],
        visibleToRoles: ['ADMIN', 'TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'bid-management',
        name: 'Bid Management',
        description: 'Manage transport bids and assignments',
        category: 'Financial Planning',
        requiredPermissions: ['bid:manage', 'bid:read'],
        visibleToRoles: ['ADMIN', 'TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'matching-system',
        name: 'Matching System',
        description: 'Transport request matching and coordination',
        category: 'Financial Planning',
        requiredPermissions: ['matching:view', 'matching:manage'],
        visibleToRoles: ['ADMIN', 'TRANSPORT_AGENCY'],
        isActive: true
      },

      // Tools and Utilities - Supporting tools and system administration
      {
        id: 'advanced-transport',
        name: 'Advanced Transport',
        description: 'Multi-patient and specialized transport coordination',
        category: 'Tools and Utilities',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'air-medical',
        name: 'Air Medical',
        description: 'Air medical transport coordination and resource management',
        category: 'Tools and Utilities',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'emergency-department',
        name: 'Emergency Department',
        description: 'Emergency department optimization and coordination',
        category: 'Tools and Utilities',
        requiredPermissions: ['emergency:optimize'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'qr-code-system',
        name: 'QR Code System',
        description: 'Generate and scan QR codes for transport requests',
        category: 'Tools and Utilities',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'offline-capabilities',
        name: 'Offline Capabilities',
        description: 'Access system features when offline',
        category: 'Tools and Utilities',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'settings',
        name: 'Settings',
        description: 'System configuration and module visibility controls',
        category: 'Tools and Utilities',
        requiredPermissions: ['settings:full', 'settings:limited'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'help',
        name: 'Help & Documentation',
        description: 'System help, documentation, and feature overview',
        category: 'Tools and Utilities',
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR', 'BILLING_STAFF', 'TRANSPORT_AGENCY'],
        requiredPermissions: ['module:help'],
        isActive: true
      }
    ];
  }

  /**
   * Get navigation structure for a specific role
   */
  static getNavigationForRole(role: string, userPermissions: string[]): NavigationItem[] {
    const modules = this.getAvailableModules();
    const navigation: NavigationItem[] = [];

    // Group modules by category
    const categories = new Map<string, NavigationItem[]>();

    modules.forEach(module => {
      // Check if user has access to this module
      if (!this.canAccessModule(role, userPermissions, module)) {
        return;
      }

      const category = module.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category)!.push({
        id: module.id,
        name: module.name,
        path: `/${module.id}`,
        category: module.category,
        requiredPermissions: module.requiredPermissions,
        visibleToRoles: module.visibleToRoles
      });
    });

    // Convert categories to navigation structure
    categories.forEach((items, category) => {
      if (items.length > 0) {
        navigation.push({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          path: '#',
          category: 'category',
          children: items,
          requiredPermissions: [],
          visibleToRoles: []
        });
      }
    });

    return navigation;
  }

  /**
   * Check if a user can access a specific module
   */
  static canAccessModule(role: string, userPermissions: string[], module: ModuleAccess): boolean {
    // Check role visibility
    if (!module.visibleToRoles.includes(role)) {
      return false;
    }

    // Check if module is active
    if (!module.isActive) {
      return false;
    }

    // Check required permissions
    const hasAllPermissions = module.requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    return hasAllPermissions;
  }

  /**
   * Get user's accessible modules
   */
  static getUserAccessibleModules(role: string, userPermissions: string[]): ModuleAccess[] {
    const modules = this.getAvailableModules();
    return modules.filter(module => 
      this.canAccessModule(role, userPermissions, module)
    );
  }

  /**
   * Check if a user has access to a specific feature
   */
  static hasFeatureAccess(role: string, userPermissions: string[], feature: string): boolean {
    const modules = this.getAvailableModules();
    const module = modules.find(m => m.id === feature);
    
    if (!module) {
      return false;
    }

    return this.canAccessModule(role, userPermissions, module);
  }

  /**
   * Get module visibility settings for Transport Command
   */
  static getModuleVisibilitySettings(): Record<string, { visible: boolean; roles: string[] }> {
    const modules = this.getAvailableModules();
    const settings: Record<string, { visible: boolean; roles: string[] }> = {};

    modules.forEach(module => {
      settings[module.id] = {
        visible: module.isActive,
        roles: module.visibleToRoles
      };
    });

    return settings;
  }

  /**
   * Get settings access level for a user role
   */
  static getSettingsAccessLevel(role: string): 'full' | 'limited' | 'none' {
    switch (role) {
      case 'ADMIN':
        return 'full';
      case 'COORDINATOR':
        return 'limited';
      default:
        return 'none';
    }
  }

  /**
   * Get operational settings for Transport Center Coordinators
   */
  static getOperationalSettings(): Record<string, any> {
    return {
      systemName: 'MedPort',
      demoMode: true,
      theme: 'light',
      language: 'en',
      apiRateLimit: 100,
      sessionTimeout: 30,
      notifications: {
        email: true,
        sms: true,
        push: false
      },
      transport: {
        autoAssignment: true,
        conflictResolution: 'automatic',
        revenueOptimization: true
      }
    };
  }

  /**
   * Update module visibility settings
   */
  static async updateModuleVisibility(
    moduleId: string, 
    visible: boolean, 
    roles: string[]
  ): Promise<void> {
    // In a real implementation, this would update the database
    // For now, we'll just log the change
    console.log(`[ROLE_BASED_ACCESS] Module ${moduleId} visibility updated:`, {
      visible,
      roles
    });
  }
}
