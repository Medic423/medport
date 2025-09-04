import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { SimpleNavigationService } from '../services/simpleNavigationService';

const router = Router();

// Get navigation for current user's type
router.get('/navigation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userType) {
      console.error('[SIMPLE_NAVIGATION] Missing user or user type:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Invalid user session'
      });
    }

    const userType = req.user.userType;
    console.log('[SIMPLE_NAVIGATION] Fetching navigation for user type:', userType);
    
    const navigation = SimpleNavigationService.getNavigationForUserType(userType);
    
    console.log('[SIMPLE_NAVIGATION] Generated navigation:', navigation);
    
    res.json({
      success: true,
      data: {
        userType: userType,
        navigation: navigation.navigation
      }
    });
  } catch (error) {
    console.error('[SIMPLE_NAVIGATION] Navigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get navigation data'
    });
  }
});

// Get user's landing page based on user type
router.get('/landing-page', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userType) {
      console.error('[SIMPLE_NAVIGATION] Missing user or user type for landing page:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Invalid user session'
      });
    }

    const userType = req.user.userType;
    console.log('[SIMPLE_NAVIGATION] Fetching landing page for user type:', userType);
    
    const landingPage = SimpleNavigationService.getLandingPageForUserType(userType);
    
    res.json({
      success: true,
      data: {
        userType: userType,
        landingPage: landingPage
      }
    });
  } catch (error) {
    console.error('[SIMPLE_NAVIGATION] Landing page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get landing page data'
    });
  }
});

// Get user type information
router.get('/user-type', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userType) {
      console.error('[SIMPLE_NAVIGATION] Missing user or user type for user type info:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Invalid user session'
      });
    }

    const userType = req.user.userType;
    console.log('[SIMPLE_NAVIGATION] Returning user type info:', userType);
    
    res.json({
      success: true,
      data: {
        userType: userType,
        id: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('[SIMPLE_NAVIGATION] User type info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user type information'
    });
  }
});

export default router;
