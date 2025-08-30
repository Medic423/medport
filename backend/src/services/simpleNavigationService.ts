import { SimpleAuthRequest } from '../middleware/simpleAuth';

export interface SimpleNavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  category: string;
}

export interface SimpleNavigation {
  userType: 'hospital' | 'ems' | 'center';
  menu: SimpleNavigationItem[];
}

export class SimpleNavigationService {
  static getNavigationForUserType(userType: 'hospital' | 'ems' | 'center'): SimpleNavigation {
    switch (userType) {
      case 'hospital':
        return {
          userType: 'hospital',
          menu: [
            {
              id: 'dashboard',
              name: 'Trip Dashboard',
              path: 'dashboard',
              icon: 'dashboard',
              category: 'Main'
            },
            {
              id: 'new-trip',
              name: 'New Trip Request',
              path: 'trips/new',
              icon: 'add',
              category: 'Main'
            },
            {
              id: 'notifications',
              name: 'Notifications',
              path: 'notifications',
              icon: 'notifications',
              category: 'Main'
            },
            {
              id: 'settings',
              name: 'Settings',
              path: 'settings',
              icon: 'settings',
              category: 'Main'
            }
          ]
        };

      case 'ems':
        return {
          userType: 'ems',
          menu: [
            {
              id: 'available-trips',
              name: 'Available Trips',
              path: 'trips/available',
              icon: 'list',
              category: 'Main'
            },
            {
              id: 'my-assignments',
              name: 'My Assignments',
              path: 'trips/assigned',
              icon: 'assignment',
              category: 'Main'
            },
            {
              id: 'route-optimization',
              name: 'Route Optimization',
              path: 'optimization',
              icon: 'route',
              category: 'Main'
            },
            {
              id: 'ems-tools',
              name: 'EMS Tools',
              path: 'ems',
              icon: 'business',
              category: 'Main'
            },
            {
              id: 'settings',
              name: 'Settings',
              path: 'settings',
              icon: 'settings',
              category: 'Main'
            }
          ]
        };

      case 'center':
        return {
          userType: 'center',
          menu: [
            {
              id: 'overview',
              name: 'Status Dashboard',
              path: 'overview',
              icon: 'dashboard',
              category: 'Main'
            },
            {
              id: 'all-trips',
              name: 'All Trips',
              path: 'trips/all',
              icon: 'list',
              category: 'Main'
            },
            {
              id: 'hospitals',
              name: 'Hospitals',
              path: 'hospitals',
              icon: 'local_hospital',
              category: 'Management'
            },
            {
              id: 'ems-agencies',
              name: 'EMS Agencies',
              path: 'ems-agencies',
              icon: 'local_shipping',
              category: 'Management'
            },
            {
              id: 'system-settings',
              name: 'System Settings',
              path: 'settings',
              icon: 'settings',
              category: 'Admin'
            },
            {
              id: 'feature-toggles',
              name: 'Feature Toggles',
              path: 'features',
              icon: 'toggle_on',
              category: 'Admin'
            }
          ]
        };

      default:
        return {
          userType: 'hospital',
          menu: []
        };
    }
  }

  static getLandingPageForUserType(userType: 'hospital' | 'ems' | 'center'): string {
    switch (userType) {
      case 'hospital':
        return 'dashboard';
      case 'ems':
        return 'trips/available';
      case 'center':
        return 'overview';
      default:
        return 'dashboard';
    }
  }
}
