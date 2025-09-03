import { Router } from 'express';
import { z, ZodError } from 'zod';
import matchingService from '../services/matchingService';
import { authenticateToken } from '../middleware/auth';
import { databaseManager } from '../services/databaseManager';

const router = Router();

// Validation schemas
const matchingCriteriaSchema = z.object({
  transportLevel: z.enum(['BLS', 'ALS', 'CCT']),
  originFacilityId: z.string().min(1),
  destinationFacilityId: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  specialRequirements: z.string().optional(),
  estimatedDistance: z.number().positive().optional(),
  timeWindow: z.object({
    earliest: z.string().datetime(),
    latest: z.string().datetime()
  }).optional()
});

const preferencesSchema = z.object({
  preferredServiceAreas: z.array(z.string().min(1)),
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
      originFacility: { name: 'Demo Origin Facility' },
      destinationFacilityId: validatedData.destinationFacilityId,
      destinationFacility: { name: 'Demo Destination Facility' },
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
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: []
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
      if ((req as any).user.role === 'ADMIN') {
        // Return demo data for ADMIN users
        const adminDemoPreferences = {
          agencyId: 'admin-demo-agency',
          preferredServiceAreas: ['facility-001', 'facility-002', 'facility-003', 'facility-004', 'facility-005'],
          preferredTransportLevels: ['BLS', 'ALS', 'CCT'],
          maxDistance: 300,
          preferredTimeWindows: [
            { dayOfWeek: 0, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 6, startTime: '08:00', endTime: '18:00' }
          ],
          revenueThreshold: 150
        };
        
        return res.json({
          success: true,
          data: adminDemoPreferences
        });
      }
      
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
      if ((req as any).user.role === 'ADMIN') {
        // For ADMIN users, return the updated preferences as demo data
        const validatedData = preferencesSchema.parse(req.body);
        const adminDemoPreferences = {
          ...validatedData,
          agencyId: 'admin-demo-agency'
        };
        
        return res.json({
          success: true,
          message: 'Demo preferences updated successfully',
          data: adminDemoPreferences
        });
      }
      
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
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: []
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
      if ((req as any).user.role === 'ADMIN') {
        // Return demo data for ADMIN users
        const adminDemoHistory = [
          {
            bidId: 'admin-bid-001',
            transportRequest: {
              originFacility: { name: 'UPMC Altoona Hospital' },
              destinationFacility: { name: 'Penn Highlands Dubois' },
              transportLevel: 'ALS',
              priority: 'HIGH'
            },
            status: 'ACCEPTED',
            submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            revenue: 320
          },
          {
            bidId: 'admin-bid-002',
            transportRequest: {
              originFacility: { name: 'Conemaugh Memorial Medical Center' },
              destinationFacility: { name: 'UPMC Presbyterian' },
              transportLevel: 'CCT',
              priority: 'URGENT'
            },
            status: 'ACCEPTED',
            submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
            revenue: 580
          },
          {
            bidId: 'admin-bid-003',
            transportRequest: {
              originFacility: { name: 'Geisinger Medical Center' },
              destinationFacility: { name: 'UPMC Altoona Hospital' },
              transportLevel: 'BLS',
              priority: 'MEDIUM'
            },
            status: 'PENDING',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            revenue: 220
          },
          {
            bidId: 'admin-bid-004',
            transportRequest: {
              originFacility: { name: 'UPMC Presbyterian' },
              destinationFacility: { name: 'Penn Highlands Dubois' },
              transportLevel: 'ALS',
              priority: 'LOW'
            },
            status: 'ACCEPTED',
            submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
            revenue: 280
          }
        ];
        
        const totalBids = adminDemoHistory.length;
        const acceptedBids = adminDemoHistory.filter(bid => bid.status === 'ACCEPTED').length;
        const totalRevenue = adminDemoHistory
          .filter(bid => bid.status === 'ACCEPTED')
          .reduce((sum, bid) => sum + bid.revenue, 0);
        const acceptanceRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;
        
        return res.json({
          success: true,
          data: {
            history: adminDemoHistory,
            analytics: {
              totalBids,
              acceptedBids,
              totalRevenue,
              acceptanceRate: Math.round(acceptanceRate * 100) / 100,
              averageRevenue: acceptedBids > 0 ? Math.round(totalRevenue / acceptedBids) : 0
            }
          }
        });
      }
      
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
    
    console.log('[MATCHING-API] Demo: Validation passed, calling matching service...');
    
    // Create a mock transport request for the demo
    const mockRequest = {
      id: 'demo-request-id',
      originFacilityId: validatedData.originFacilityId,
      destinationFacilityId: validatedData.destinationFacilityId,
      transportLevel: validatedData.transportLevel,
      priority: validatedData.priority,
      specialRequirements: validatedData.specialRequirements,
      estimatedDistance: validatedData.estimatedDistance,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    console.log('[MATCHING-API] Demo: Mock request created:', mockRequest);
    
    // Use the actual matching service
    const matches = await matchingService.findMatchingAgencies(mockRequest, validatedData);
    
    console.log('[MATCHING-API] Demo: Found matches:', matches.length);
    
    res.json({
      success: true,
      message: 'Demo endpoint working',
      data: {
        matches,
        totalMatches: matches.length,
        requestCriteria: validatedData
      }
    });
  } catch (error) {
    console.error('[MATCHING-API] Demo error finding matches:', error);
    
    if (error instanceof ZodError) {
      console.log('[MATCHING-API] Demo: Zod validation error occurred');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: []
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test endpoint to check database content
router.get('/demo/test-db', async (req, res) => {
  try {
    console.log('[MATCHING-API] Demo: Testing database content...');
    
    const emsDB = databaseManager.getEMSDB();
    const hospitalDB = databaseManager.getHospitalDB();
    
    // Check agencies
    const agencies = await emsDB.transportAgency.findMany({
      include: {
        units: {
          include: {
            availability: true
          }
        }
      }
    });
    
    console.log('[MATCHING-API] Demo: Found agencies:', agencies.length);
    
    // Check facilities
    const facilities = await hospitalDB.facility.findMany({
      take: 5
    });
    
    console.log('[MATCHING-API] Demo: Found facilities:', facilities.length);
    
    // Check units
    const units = await emsDB.unit.findMany({
      include: {
        availability: true
      }
    });
    
    console.log('[MATCHING-API] Demo: Found units:', units.length);
    
    res.json({
      success: true,
      message: 'Database test completed',
      data: {
        agenciesCount: agencies.length,
        facilitiesCount: facilities.length,
        unitsCount: units.length,
        sampleAgency: agencies[0] ? {
          id: agencies[0].id,
          name: agencies[0].name,
          unitsCount: agencies[0].units?.length || 0
        } : null,
        sampleFacility: facilities[0] ? {
          id: facilities[0].id,
          name: facilities[0].name
        } : null,
        sampleUnit: units[0] ? {
          id: units[0].id,
          type: units[0].type,
          agencyId: units[0].agencyId,
          availabilityCount: units[0].availability?.length || 0
        } : null
      }
    });
  } catch (error) {
    console.error('[MATCHING-API] Demo test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple validation test endpoint
router.post('/demo/test-validation', async (req, res) => {
  try {
    console.log('[MATCHING-API] Demo: Testing validation for request:', req.body);
    
    const validatedData = matchingCriteriaSchema.parse(req.body);
    
    console.log('[MATCHING-API] Demo: Validation passed!');
    
    res.json({
      success: true,
      message: 'Validation test passed',
      data: validatedData
    });
  } catch (error) {
    console.error('[MATCHING-API] Demo validation test error:', error);
    
    if (error instanceof ZodError) {
      console.log('[MATCHING-API] Demo: Zod validation error occurred');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: []
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
