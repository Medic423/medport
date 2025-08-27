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

      // Ambulance Operations - Agency-specific transport operations and management
      {
        id: 'unit-management',
        name: 'Unit Management',
        description: 'Manage transport units and availability',
        category: 'Ambulance Operations',
        requiredPermissions: ['unit:manage', 'unit:read'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'bid-management',
        name: 'Bid Management',
        description: 'Manage transport bids and assignments',
        category: 'Ambulance Operations',
        requiredPermissions: ['bid:manage', 'bid:read'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'matching-system',
        name: 'Matching System',
        description: 'Transport request matching and coordination',
        category: 'Ambulance Operations',
        requiredPermissions: ['matching:view', 'matching:manage'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'crew-scheduling',
        name: 'Crew Scheduling',
        description: 'Schedule and manage transport crew assignments',
        category: 'Ambulance Operations',
        requiredPermissions: ['crew:schedule', 'crew:manage'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'trip-acceptance',
        name: 'Trip Acceptance',
        description: 'Accept and manage transport trip assignments',
        category: 'Ambulance Operations',
        requiredPermissions: ['trip:accept', 'trip:manage'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'revenue-opportunities',
        name: 'Revenue Opportunities',
        description: 'View and manage revenue optimization opportunities',
        category: 'Ambulance Operations',
        requiredPermissions: ['revenue:view', 'revenue:optimize'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
        isActive: true
      },
      {
        id: 'agency-analytics',
        name: 'Agency Analytics',
        description: 'Agency-specific performance and financial analytics',
        category: 'Ambulance Operations',
        requiredPermissions: ['analytics:agency', 'analytics:view'],
        visibleToRoles: ['TRANSPORT_AGENCY'],
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
        category: 'System Administration',
        requiredPermissions: ['settings:full'],
        visibleToRoles: ['ADMIN'],
        isActive: true
      },

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
  static getModuleVisibilitySettings(): Record<string, { visible: boolean; roles: string[]; category: string; parentCategory?: string }> {
    const modules = this.getAvailableModules();
    const settings: Record<string, { visible: boolean; roles: string[]; category: string; parentCategory?: string }> = {};

    modules.forEach(module => {
      settings[module.id] = {
        visible: module.isActive,
        roles: module.visibleToRoles,
        category: module.category,
        parentCategory: undefined // No parent categories in current structure, but field is available for future use
      };
    });

    return settings;
  }

  /**
   * Get category-level visibility settings
   * Returns a map of categories with their visibility status and associated modules
   */
  static getCategoryVisibilitySettings(): Record<string, { 
    visible: boolean; 
    modules: string[]; 
    moduleCount: number;
    visibleModuleCount: number;
  }> {
    const modules = this.getAvailableModules();
    const categoryMap: Record<string, { 
      visible: boolean; 
      modules: string[]; 
      moduleCount: number;
      visibleModuleCount: number;
    }> = {};

    // Group modules by category
    modules.forEach(module => {
      if (!categoryMap[module.category]) {
        categoryMap[module.category] = {
          visible: true, // Default to visible
          modules: [],
          moduleCount: 0,
          visibleModuleCount: 0
        };
      }
      
      categoryMap[module.category].modules.push(module.id);
      categoryMap[module.category].moduleCount++;
      
      if (module.isActive) {
        categoryMap[module.category].visibleModuleCount++;
      }
    });

    // Determine category visibility based on module visibility
    Object.keys(categoryMap).forEach(category => {
      const cat = categoryMap[category];
      // Category is visible if at least one module is visible
      cat.visible = cat.visibleModuleCount > 0;
    });

    return categoryMap;
  }

  /**
   * Get modules by category
   * Returns a map of categories with their associated modules
   */
  static getModulesByCategory(): Record<string, ModuleAccess[]> {
    const modules = this.getAvailableModules();
    const categoryMap: Record<string, ModuleAccess[]> = {};

    modules.forEach(module => {
      if (!categoryMap[module.category]) {
        categoryMap[module.category] = [];
      }
      categoryMap[module.category].push(module);
    });

    return categoryMap;
  }

  /**
   * Update category visibility (affects all modules in the category)
   */
  static async updateCategoryVisibility(
    category: string, 
    visible: boolean, 
    roles: string[]
  ): Promise<void> {
    const modules = this.getAvailableModules();
    const categoryModules = modules.filter(module => module.category === category);
    
    // Update visibility for all modules in the category
    for (const module of categoryModules) {
      await this.updateModuleVisibility(module.id, visible, roles);
    }

    console.log(`[ROLE_BASED_ACCESS] Category ${category} visibility updated:`, {
      visible,
      roles,
      affectedModules: categoryModules.length
    });
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

  /**
   * Get the appropriate landing page for a user role
   * This determines where users land after successful login
   */
  static getLandingPageForRole(role: string, userPermissions: string[]): string {
    const accessibleModules = this.getUserAccessibleModules(role, userPermissions);
    
    if (accessibleModules.length === 0) {
      return 'help'; // Fallback to help page if no modules accessible
    }

    // Define priority order for landing pages by role
    const roleLandingPriorities: Record<string, string[]> = {
      'ADMIN': [
        'status-board',      // Primary: System overview
        'transport-requests', // Secondary: Transport management
        'analytics',         // Tertiary: Financial overview
        'settings'           // Quaternary: System configuration
      ],
      'COORDINATOR': [
        'status-board',      // Primary: Operational overview
        'transport-requests', // Secondary: Transport coordination
        'unit-assignment',   // Tertiary: Unit management
        'analytics'          // Quaternary: Performance metrics
      ],
      'HOSPITAL_COORDINATOR': [
        'transport-requests', // Primary: Transport request management
        'status-board',      // Secondary: Request status overview
        'emergency-department', // Tertiary: ED optimization
        'help'               // Quaternary: Documentation
      ],
      'TRANSPORT_AGENCY': [
        'agency-portal',     // Primary: Agency dashboard
        'unit-management',   // Secondary: Unit operations
        'bid-management',    // Tertiary: Bid management
        'matching-system'    // Quaternary: Request matching
      ],
      'BILLING_STAFF': [
        'analytics',         // Primary: Financial reports
        'resource-management', // Secondary: Resource overview
        'help'               // Tertiary: Documentation
      ]
    };

    // Get priority list for this role
    const priorities = roleLandingPriorities[role] || ['help'];
    
    // Find the first accessible module from the priority list
    for (const moduleId of priorities) {
      const module = accessibleModules.find(m => m.id === moduleId);
      if (module) {
        console.log(`[ROLE_BASED_ACCESS] Landing page for ${role}: ${moduleId}`);
        return moduleId;
      }
    }

    // If no priority modules are accessible, return the first accessible module
    const firstModule = accessibleModules[0];
    console.log(`[ROLE_BASED_ACCESS] Fallback landing page for ${role}: ${firstModule.id}`);
    return firstModule.id;
  }

  /**
   * Get user's first accessible module for landing page
   * This is a simpler version that just returns the first accessible module
   */
  static getFirstAccessibleModule(role: string, userPermissions: string[]): string {
    const accessibleModules = this.getUserAccessibleModules(role, userPermissions);
    
    if (accessibleModules.length === 0) {
      console.warn(`[ROLE_BASED_ACCESS] No accessible modules found for role: ${role}`);
      return 'status-board'; // Default to status-board instead of help
    }

    return accessibleModules[0].id;
  }
}
