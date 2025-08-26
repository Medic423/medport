import { useState, useEffect, useCallback } from 'react';

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
  permissions: string[];
  navigation: NavigationItem[];
}

export interface ModuleAccess {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredPermissions: string[];
  visibleToRoles: string[];
  isActive: boolean;
}

export const useRoleBasedAccess = () => {
  const [navigation, setNavigation] = useState<RoleBasedNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleAccess[]>([]);

  // Get navigation for current user
  const fetchNavigation = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/role-based-access/navigation', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch navigation: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setNavigation(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch navigation');
      }
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Navigation fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's accessible modules
  const fetchModules = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/role-based-access/modules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setModules(result.data.modules);
      } else {
        throw new Error(result.message || 'Failed to fetch modules');
      }
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Modules fetch error:', err);
      // Don't set error for modules fetch as it's not critical
    }
  }, []);

  // Check if user has access to a specific feature
  const hasFeatureAccess = useCallback(async (token: string, feature: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/role-based-access/access/${feature}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.data.hasAccess;
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Feature access check error:', err);
      return false;
    }
  }, []);

  // Demo mode navigation fetch
  const fetchDemoNavigation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure demo mode is set in localStorage
      localStorage.setItem('demoMode', 'true');

      const response = await fetch('/api/role-based-access/demo/navigation', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch demo navigation: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('[ROLE_BASED_ACCESS] Demo navigation data:', result.data);
        setNavigation(result.data);
        
        // Also fetch modules for demo mode
        const modulesResponse = await fetch('/api/role-based-access/demo/modules', {
          headers: {
            'Authorization': 'Bearer demo-token',
            'Content-Type': 'application/json'
          }
        });

        if (modulesResponse.ok) {
          const modulesResult = await modulesResponse.json();
          if (modulesResult.success) {
            console.log('[ROLE_BASED_ACCESS] Demo modules data:', modulesResult.data);
            setModules(modulesResult.data.modules);
          }
        }
      } else {
        throw new Error(result.message || 'Failed to fetch demo navigation');
      }
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Demo navigation fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize based on authentication state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const demoMode = localStorage.getItem('demoMode');

    if (demoMode === 'true') {
      fetchDemoNavigation();
    } else if (token) {
      fetchNavigation(token);
      fetchModules(token);
    } else {
      setLoading(false);
    }
  }, [fetchNavigation, fetchModules, fetchDemoNavigation]);

  // Check if user can access a specific module
  const canAccessModule = useCallback((moduleId: string): boolean => {
    console.log('[ROLE_BASED_ACCESS] Checking access for module:', moduleId);
    console.log('[ROLE_BASED_ACCESS] Navigation state:', navigation);
    console.log('[ROLE_BASED_ACCESS] Modules state:', modules);
    
    if (!navigation) {
      console.log('[ROLE_BASED_ACCESS] No navigation data available');
      return false;
    }
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) {
      console.log('[ROLE_BASED_ACCESS] Module not found:', moduleId);
      return false;
    }

    console.log('[ROLE_BASED_ACCESS] Module found:', module);
    console.log('[ROLE_BASED_ACCESS] User role:', navigation.role);
    console.log('[ROLE_BASED_ACCESS] Module visible to roles:', module.visibleToRoles);
    console.log('[ROLE_BASED_ACCESS] User permissions:', navigation.permissions);
    console.log('[ROLE_BASED_ACCESS] Module required permissions:', module.requiredPermissions);

    // Check if module is visible to user's role
    if (!module.visibleToRoles.includes(navigation.role)) {
      console.log('[ROLE_BASED_ACCESS] Module not visible to user role');
      return false;
    }

    // Check if user has required permissions
    const hasAllPermissions = module.requiredPermissions.every(permission => {
      const hasPermission = navigation.permissions.includes(permission);
      console.log(`[ROLE_BASED_ACCESS] Permission ${permission}: ${hasPermission ? 'YES' : 'NO'}`);
      return hasPermission;
    });

    console.log('[ROLE_BASED_ACCESS] Final access result:', hasAllPermissions);
    return hasAllPermissions;
  }, [navigation, modules]);

  // Get navigation items for a specific category
  const getNavigationForCategory = useCallback((category: string): NavigationItem[] => {
    if (!navigation) return [];
    
    const categoryItem = navigation.navigation.find(item => 
      item.name.toLowerCase() === category.toLowerCase()
    );
    
    return categoryItem?.children || [];
  }, [navigation]);

  // Get all available categories
  const getAvailableCategories = useCallback((): string[] => {
    if (!navigation) return [];
    
    return navigation.navigation.map(item => item.name);
  }, [navigation]);

  // Get user's landing page based on role and permissions
  const getLandingPage = useCallback(async (token: string): Promise<string> => {
    try {
      const response = await fetch('/api/role-based-access/landing-page', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch landing page: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('[ROLE_BASED_ACCESS] Landing page data:', result.data);
        return result.data.landingPage;
      } else {
        throw new Error(result.message || 'Failed to fetch landing page');
      }
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Landing page fetch error:', err);
      return 'status-board'; // Fallback to status-board instead of help
    }
  }, []);

  // Demo mode landing page fetch
  const getDemoLandingPage = useCallback(async (): Promise<string> => {
    try {
      // Ensure demo mode is set in localStorage
      localStorage.setItem('demoMode', 'true');

      const response = await fetch('/api/role-based-access/demo/landing-page', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch demo landing page: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('[ROLE_BASED_ACCESS] Demo landing page data:', result.data);
        return result.data.landingPage;
      } else {
        throw new Error(result.message || 'Failed to fetch demo landing page');
      }
    } catch (err) {
      console.error('[ROLE_BASED_ACCESS] Demo landing page fetch error:', err);
      return 'status-board'; // Fallback to status-board instead of help
    }
  }, []);

  return {
    navigation,
    modules,
    loading,
    error,
    hasFeatureAccess,
    canAccessModule,
    getNavigationForCategory,
    getAvailableCategories,
    fetchNavigation,
    fetchDemoNavigation,
    getLandingPage,
    getDemoLandingPage,
    refreshNavigation: () => {
      const token = localStorage.getItem('token');
      const demoMode = localStorage.getItem('demoMode');
      
      if (demoMode === 'true') {
        fetchDemoNavigation();
      } else if (token) {
        fetchNavigation(token);
        fetchModules(token);
      }
    }
  };
};
