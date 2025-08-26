import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { RoleBasedAccessService } from '../services/roleBasedAccessService';
import { SessionService } from '../services/sessionService';
import jwt from 'jsonwebtoken';

const router = Router();

// Get navigation for current user's role
router.get('/navigation', authenticateToken, async (req: any, res: Response) => {
  try {
    const userRole = req.user.role;
    const userPermissions = SessionService.getUserPermissions(userRole);
    
    const navigation = RoleBasedAccessService.getNavigationForRole(userRole, userPermissions);
    
    res.json({
      success: true,
      data: {
        role: userRole,
        permissions: userPermissions,
        navigation: navigation
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Navigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get navigation data'
    });
  }
});

// Get user's accessible modules
router.get('/modules', authenticateToken, async (req: any, res: Response) => {
  try {
    const userRole = req.user.role;
    const userPermissions = SessionService.getUserPermissions(userRole);
    
    const modules = RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions);
    
    res.json({
      success: true,
      data: {
        role: userRole,
        permissions: userPermissions,
        modules: modules
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get module data'
    });
  }
});

// Get user's landing page based on role and permissions
router.get('/landing-page', authenticateToken, async (req: any, res: Response) => {
  try {
    const userRole = req.user.role;
    const userPermissions = SessionService.getUserPermissions(userRole);
    
    const landingPage = RoleBasedAccessService.getLandingPageForRole(userRole, userPermissions);
    
    res.json({
      success: true,
      data: {
        role: userRole,
        permissions: userPermissions,
        landingPage: landingPage,
        accessibleModules: RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions)
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Landing page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get landing page data'
    });
  }
});

// Check if user has access to a specific feature
router.get('/access/:feature', authenticateToken, async (req: any, res: Response) => {
  try {
    const { feature } = req.params;
    const userRole = req.user.role;
    const userPermissions = SessionService.getUserPermissions(userRole);
    
    const hasAccess = RoleBasedAccessService.hasFeatureAccess(userRole, userPermissions, feature);
    
    res.json({
      success: true,
      data: {
        feature,
        hasAccess,
        role: userRole,
        requiredPermissions: RoleBasedAccessService.getAvailableModules()
          .find(m => m.id === feature)?.requiredPermissions || []
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature access'
    });
  }
});

// Get module visibility settings (Transport Command only)
router.get('/settings', authenticateToken, async (req: any, res: Response) => {
  try {
    const userRole = req.user.role;
    
    // Only ADMIN (Transport Command) can view settings
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view settings'
      });
    }
    
    const settings = RoleBasedAccessService.getModuleVisibilitySettings();
    
    res.json({
      success: true,
      data: {
        settings,
        availableRoles: ['ADMIN', 'COORDINATOR', 'BILLING_STAFF', 'TRANSPORT_AGENCY', 'HOSPITAL_COORDINATOR']
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings data'
    });
  }
});

// Update module visibility settings (Transport Command only)
router.put('/settings/:moduleId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { visible, roles } = req.body;
    const userRole = req.user.role;
    
    // Only ADMIN (Transport Command) can update settings
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update settings'
      });
    }
    
    // Validate input
    if (typeof visible !== 'boolean' || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: visible must be boolean, roles must be array'
      });
    }
    
    await RoleBasedAccessService.updateModuleVisibility(moduleId, visible, roles);
    
    res.json({
      success: true,
      message: 'Module visibility updated successfully',
      data: {
        moduleId,
        visible,
        roles
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module visibility'
    });
  }
});

// Get operational settings (Transport Center Coordinators)
router.get('/operational-settings', authenticateToken, async (req: any, res: Response) => {
  try {
    const userRole = req.user.role;
    
    // Only ADMIN and COORDINATOR can view operational settings
    if (!['ADMIN', 'COORDINATOR'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view operational settings'
      });
    }
    
    const settings = RoleBasedAccessService.getOperationalSettings();
    const accessLevel = RoleBasedAccessService.getSettingsAccessLevel(userRole);
    
    res.json({
      success: true,
      data: {
        settings,
        accessLevel,
        role: userRole
      }
    });
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Operational settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get operational settings'
    });
  }
});

// Demo mode support - handles both demo-token and JWT tokens from demo login
router.get('/demo/navigation', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader === 'Bearer demo-token') {
      // Legacy demo-token support
      const userRole = 'ADMIN';
      const userPermissions = SessionService.getUserPermissions(userRole);
      const navigation = RoleBasedAccessService.getNavigationForRole(userRole, userPermissions);
      
      res.json({
        success: true,
        data: {
          role: userRole,
          permissions: userPermissions,
          navigation: navigation,
          isDemo: true
        }
      });
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT token from demo login
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.isDemo) {
          const userRole = decoded.role;
          const userPermissions = SessionService.getUserPermissions(userRole);
          const navigation = RoleBasedAccessService.getNavigationForRole(userRole, userPermissions);
          
          res.json({
            success: true,
            data: {
              role: userRole,
              permissions: userPermissions,
              navigation: navigation,
              isDemo: true
            }
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Demo token required'
          });
        }
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Invalid demo token'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Demo navigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo navigation data'
    });
  }
});

// Demo mode modules support - handles both demo-token and JWT tokens from demo login
router.get('/demo/modules', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader === 'Bearer demo-token') {
      // Legacy demo-token support
      const userRole = 'ADMIN';
      const userPermissions = SessionService.getUserPermissions(userRole);
      const modules = RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions);
      
      res.json({
        success: true,
        data: {
          role: userRole,
          permissions: userPermissions,
          modules: modules,
          isDemo: true
        }
      });
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT token from demo login
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.isDemo) {
          const userRole = decoded.role;
          const userPermissions = SessionService.getUserPermissions(userRole);
          const modules = RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions);
          
          res.json({
            success: true,
            data: {
              role: userRole,
              permissions: userPermissions,
              modules: modules,
              isDemo: true
            }
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Demo token required'
          });
        }
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Invalid demo token'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Demo modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo modules data'
    });
  }
});

// Demo mode operational settings support - handles both demo-token and JWT tokens from demo login
router.get('/demo/operational-settings', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader === 'Bearer demo-token') {
      // Legacy demo-token support
      const userRole = 'ADMIN';
      const settings = RoleBasedAccessService.getOperationalSettings();
      const accessLevel = RoleBasedAccessService.getSettingsAccessLevel(userRole);
      
      res.json({
        success: true,
        data: {
          settings,
          accessLevel,
          role: userRole,
          isDemo: true
        }
      });
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT token from demo login
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.isDemo) {
          const userRole = decoded.role;
          const settings = RoleBasedAccessService.getOperationalSettings();
          const accessLevel = RoleBasedAccessService.getSettingsAccessLevel(userRole);
          
          res.json({
            success: true,
            data: {
              settings,
              accessLevel,
              role: userRole,
              isDemo: true
            }
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Demo token required'
          });
        }
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Invalid demo token'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Demo operational settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo operational settings data'
    });
  }
});

// Demo mode settings support
router.get('/demo/settings', (req: Request, res: Response) => {
  try {
    if (req.headers.authorization === 'Bearer demo-token') {
      const userRole = 'ADMIN';
      const settings = RoleBasedAccessService.getModuleVisibilitySettings();
      
      res.json({
        success: true,
        data: {
          settings,
          availableRoles: ['ADMIN', 'COORDINATOR', 'BILLING_STAFF', 'TRANSPORT_AGENCY', 'HOSPITAL_COORDINATOR'],
          isDemo: true
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Demo settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo settings data'
    });
  }
});

// Demo mode landing page support - handles both demo-token and JWT tokens from demo login
router.get('/demo/landing-page', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader === 'Bearer demo-token') {
      // Legacy demo-token support
      const userRole = 'ADMIN';
      const userPermissions = SessionService.getUserPermissions(userRole);
      const landingPage = RoleBasedAccessService.getLandingPageForRole(userRole, userPermissions);
      
      res.json({
        success: true,
        data: {
          role: userRole,
          permissions: userPermissions,
          landingPage: landingPage,
          accessibleModules: RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions),
          isDemo: true
        }
      });
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT token from demo login
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.isDemo) {
          const userRole = decoded.role;
          const userPermissions = SessionService.getUserPermissions(userRole);
          const landingPage = RoleBasedAccessService.getLandingPageForRole(userRole, userPermissions);
          
          res.json({
            success: true,
            data: {
              role: userRole,
              permissions: userPermissions,
              landingPage: landingPage,
              accessibleModules: RoleBasedAccessService.getUserAccessibleModules(userRole, userPermissions),
              isDemo: true
            }
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Demo token required'
          });
        }
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Invalid demo token'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[ROLE_BASED_ACCESS] Demo landing page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo landing page data'
    });
  }
});

export default router;
