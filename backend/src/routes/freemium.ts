import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { FreemiumService } from '../services/freemiumService';

const router = Router();

// Get user's freemium settings
router.get('/settings', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const settings = await FreemiumService.getUserSettings(userId);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('[FREEMIUM] Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get freemium settings'
    });
  }
});

// Check if user has access to a specific feature
router.get('/feature/:featureName', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const featureName = req.params.featureName as keyof FreemiumService['features'];
    
    const hasAccess = await FreemiumService.hasFeatureAccess(userId, featureName);
    
    res.json({
      success: true,
      data: {
        feature: featureName,
        hasAccess
      }
    });
  } catch (error) {
    console.error('[FREEMIUM] Feature access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature access'
    });
  }
});

// Get all available features
router.get('/features', authenticateToken, async (req: any, res: Response) => {
  try {
    const features = FreemiumService.getAvailableFeatures();
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('[FREEMIUM] Get features error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available features'
    });
  }
});

// Get plan information
router.get('/plans', authenticateToken, async (req: any, res: Response) => {
  try {
    const { planType } = req.query;
    
    if (planType) {
      const planInfo = FreemiumService.getPlanInfo(planType as any);
      res.json({
        success: true,
        data: planInfo
      });
    } else {
      // Return all plans
      const allPlans = {
        free: FreemiumService.getPlanInfo('free'),
        premium: FreemiumService.getPlanInfo('premium'),
        enterprise: FreemiumService.getPlanInfo('enterprise')
      };
      
      res.json({
        success: true,
        data: allPlans
      });
    }
  } catch (error) {
    console.error('[FREEMIUM] Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan information'
    });
  }
});

// Update user settings (admin only - simplified for now)
router.put('/settings', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // For now, only allow center users to update settings
    const userType = req.user.userType || req.user.role;
    if (userType !== 'center') {
      return res.status(403).json({
        success: false,
        message: 'Only center users can update freemium settings'
      });
    }
    
    const updatedSettings = await FreemiumService.updateUserSettings(userId, updates);
    
    if (!updatedSettings) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update settings'
      });
    }

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('[FREEMIUM] Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update freemium settings'
    });
  }
});

export default router;
