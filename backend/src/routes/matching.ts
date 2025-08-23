import { Router } from 'express';
import { z } from 'zod';
import matchingService from '../services/matchingService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const matchingCriteriaSchema = z.object({
  transportLevel: z.enum(['BLS', 'ALS', 'CCT']),
  originFacilityId: z.string().uuid(),
  destinationFacilityId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  specialRequirements: z.string().optional(),
  estimatedDistance: z.number().positive().optional(),
  timeWindow: z.object({
    earliest: z.string().datetime(),
    latest: z.string().datetime()
  }).optional()
});

const preferencesSchema = z.object({
  preferredServiceAreas: z.array(z.string().uuid()),
  preferredTransportLevels: z.array(z.enum(['BLS', 'ALS', 'CCT'])),
  maxDistance: z.number().positive(),
  preferredTimeWindows: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  })),
  revenueThreshold: z.number().positive()
});

// Find matching agencies for a transport request
router.post('/find-matches', authenticateToken, async (req, res) => {
  try {
    console.log('[MATCHING-API] Finding matches for request:', req.body);
    
    const validatedData = matchingCriteriaSchema.parse(req.body);
    
    // Note: timeWindow remains as strings for the service layer
    // The service will convert to Date objects as needed
    
    // For demo purposes, create a mock transport request
    const mockRequest = {
      id: 'mock-request-id',
      originFacilityId: validatedData.originFacilityId,
      destinationFacilityId: validatedData.destinationFacilityId,
      transportLevel: validatedData.transportLevel,
      priority: validatedData.priority,
      specialRequirements: validatedData.specialRequirements,
      estimatedDistance: validatedData.estimatedDistance
    } as any;
    
    const matches = await matchingService.findMatchingAgencies(mockRequest, validatedData);
    
    console.log('[MATCHING-API] Found matches:', matches.length);
    
    res.json({
      success: true,
      data: {
        matches,
        totalMatches: matches.length,
        requestCriteria: validatedData
      }
    });
  } catch (error) {
    console.error('[MATCHING-API] Error finding matches:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get agency matching preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    console.log('[MATCHING-API] Getting preferences for agency:', agencyId);
    
    const preferences = await matchingService.getAgencyPreferences(agencyId);
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Agency preferences not found'
      });
    }
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('[MATCHING-API] Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update agency matching preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    console.log('[MATCHING-API] Updating preferences for agency:', agencyId);
    
    const validatedData = preferencesSchema.parse(req.body);
    
    const updatedPreferences = await matchingService.updateAgencyPreferences(agencyId, validatedData);
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    console.error('[MATCHING-API] Error updating preferences:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get match history and analytics
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    
    console.log('[MATCHING-API] Getting match history for agency:', agencyId, 'limit:', limit);
    
    const history = await matchingService.getMatchHistory(agencyId, limit);
    
    // Calculate analytics
    const totalBids = history.length;
    const acceptedBids = history.filter(bid => bid.status === 'ACCEPTED').length;
    const totalRevenue = history
      .filter(bid => bid.status === 'ACCEPTED')
      .reduce((sum, bid) => sum + bid.revenue, 0);
    const acceptanceRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        history,
        analytics: {
          totalBids,
          acceptedBids,
          totalRevenue,
          acceptanceRate: Math.round(acceptanceRate * 100) / 100,
          averageRevenue: acceptedBids > 0 ? Math.round(totalRevenue / acceptedBids) : 0
        }
      }
    });
  } catch (error) {
    console.error('[MATCHING-API] Error getting match history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo endpoint for testing matching without authentication
router.post('/demo/find-matches', async (req, res) => {
  try {
    console.log('[MATCHING-API] Demo: Finding matches for request:', req.body);
    
    const validatedData = matchingCriteriaSchema.parse(req.body);
    
    // Simple test response
    res.json({
      success: true,
      message: 'Demo endpoint working',
      data: {
        matches: [],
        totalMatches: 0,
        requestCriteria: validatedData
      }
    });
  } catch (error) {
    console.error('[MATCHING-API] Demo error finding matches:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
