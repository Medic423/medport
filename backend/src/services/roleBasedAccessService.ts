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
      // Core Operations
      {
        id: 'transport-requests',
        name: 'Transport Requests',
        description: 'Create and manage transport requests',
        category: 'Core Operations',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'status-board',
        name: 'Status Board',
        description: 'View transport request status and unit assignments',
        category: 'Core Operations',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },
      {
        id: 'unit-assignment',
        name: 'Unit Assignment',
        description: 'Assign transport units to requests and optimize assignments',
        category: 'Core Operations',
        requiredPermissions: ['unit:assign', 'dispatch:manage'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },

      // Planning & Optimization
      {
        id: 'route-optimization',
        name: 'Route Optimization',
        description: 'Optimize routes for maximum efficiency and revenue',
        category: 'Planning & Optimization',
        requiredPermissions: ['route:optimize', 'route:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'distance-matrix',
        name: 'Distance Matrix',
        description: 'Calculate distances between facilities and optimize routing',
        category: 'Planning & Optimization',
        requiredPermissions: ['route:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'resource-management',
        name: 'Resource Management',
        description: 'Manage transport resources and capacity planning',
        category: 'Planning & Optimization',
        requiredPermissions: ['facility:read', 'agency:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },

      // Specialized Transport
      {
        id: 'advanced-transport',
        name: 'Advanced Transport',
        description: 'Multi-patient and specialized transport coordination',
        category: 'Specialized Transport',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'air-medical',
        name: 'Air Medical',
        description: 'Air medical transport coordination and resource management',
        category: 'Specialized Transport',
        requiredPermissions: ['transport:create', 'transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'emergency-department',
        name: 'Emergency Department',
        description: 'Emergency department optimization and coordination',
        category: 'Specialized Transport',
        requiredPermissions: ['emergency:optimize'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },

      // Tools & Utilities
      {
        id: 'qr-code-system',
        name: 'QR Code System',
        description: 'Generate and scan QR codes for transport requests',
        category: 'Tools & Utilities',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'real-time-tracking',
        name: 'Real-Time Tracking',
        description: 'Track transport units in real-time with GPS integration',
        category: 'Tools & Utilities',
        requiredPermissions: ['tracking:view'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Manage system notifications and communications',
        category: 'Tools & Utilities',
        requiredPermissions: ['notifications:manage'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
        isActive: true
      },
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        description: 'View system analytics and performance reports',
        category: 'Tools & Utilities',
        requiredPermissions: ['analytics:view', 'analytics:financial'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'BILLING_STAFF'],
        isActive: true
      },
      {
        id: 'offline-capabilities',
        name: 'Offline Capabilities',
        description: 'Access system features when offline',
        category: 'Tools & Utilities',
        requiredPermissions: ['transport:read'],
        visibleToRoles: ['ADMIN', 'COORDINATOR', 'HOSPITAL_COORDINATOR'],
        isActive: true
      },

      // Agency Portal
      {
        id: 'agency-portal',
        name: 'Agency Portal',
        description: 'Transport agency management and operations',
        category: 'Agency Operations',
        requiredPermissions: ['agency:profile', 'unit:manage'],
        visibleToRoles: ['ADMIN', 'TRANSPORT_AGENCY'],
        isActive: true
      },

      // Settings & Administration
      {
        id: 'settings',
        name: 'Settings',
        description: 'System configuration and module visibility controls',
        category: 'Administration',
        requiredPermissions: ['settings:full', 'settings:limited'],
        visibleToRoles: ['ADMIN', 'COORDINATOR'],
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
