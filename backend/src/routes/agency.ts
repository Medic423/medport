import express from 'express';
import { authenticateToken } from '../middleware/authenticateAdmin';
import { tripService } from '../services/tripService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Custom authentication middleware for agency routes
const authenticateAgencyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  
  // Handle agency demo token
  if (authHeader === 'Bearer demo-agency-token') {
    console.log('AUTH: Agency demo mode authentication bypassed');
    req.user = {
      id: 'demo-agency-user',
      email: 'demo@agency.com',
      role: 'TRANSPORT_AGENCY',
      agencyId: 'demo-agency-id'
    };
    return next();
  }
  
  // Fall back to regular authentication
  return authenticateToken(req, res, next);
};

/**
 * GET /api/agency/transport-requests
 * Get available transport requests for the agency
 */
router.get('/transport-requests', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-TRANSPORT-REQUESTS] Fetching transport requests');
    
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      if ((req as any).user.role === 'ADMIN') {
        // Return demo data for ADMIN users
        const adminDemoRequests = [
          {
            id: 'admin-transport-1',
            patientId: 'PAT-001',
            originFacility: { 
              name: 'UPMC Altoona Hospital',
              address: '620 Howard Ave',
              city: 'Altoona',
              state: 'PA'
            },
            destinationFacility: { 
              name: 'Penn State Health Milton S. Hershey Medical Center',
              address: '500 University Dr',
              city: 'Hershey',
              state: 'PA'
            },
            transportLevel: 'CCT',
            priority: 'HIGH',
            specialRequirements: 'Ventilator support, ICU nurse required',
            estimatedDistance: 45.2,
            estimatedDuration: 65,
            revenuePotential: 580,
            status: 'PENDING',
            createdAt: '2025-08-27T08:00:00Z'
          },
          {
            id: 'admin-transport-2',
            patientId: 'PAT-002',
            originFacility: { 
              name: 'Mount Nittany Medical Center',
              address: '1800 E Park Ave',
              city: 'State College',
              state: 'PA'
            },
            destinationFacility: { 
              name: 'Geisinger Medical Center',
              address: '100 N Academy Ave',
              city: 'Danville',
              state: 'PA'
            },
            transportLevel: 'ALS',
            priority: 'MEDIUM',
            specialRequirements: 'Cardiac monitoring',
            estimatedDistance: 32.8,
            estimatedDuration: 45,
            revenuePotential: 420,
            status: 'PENDING',
            createdAt: '2025-08-27T09:30:00Z'
          }
        ];
        
        return res.json({
          success: true,
          message: 'Admin demo transport requests retrieved successfully',
          requests: adminDemoRequests
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo transport request data
      const demoRequests = [
        {
          id: 'transport-1',
          patientId: 'PAT-001',
          originFacility: { 
            name: 'UPMC Altoona Hospital',
            address: '620 Howard Ave',
            city: 'Altoona',
            state: 'PA'
          },
          destinationFacility: { 
            name: 'Penn State Health Milton S. Hershey Medical Center',
            address: '500 University Dr',
            city: 'Hershey',
            state: 'PA'
          },
          transportLevel: 'CCT',
          priority: 'HIGH',
          specialRequirements: 'Ventilator support, ICU nurse required',
          estimatedDistance: 45.2,
          estimatedDuration: 65,
          revenuePotential: 580,
          status: 'PENDING',
          createdAt: '2025-08-27T08:00:00Z'
        }
      ];
      
      return res.json({
        success: true,
        message: 'Demo transport requests retrieved successfully',
        requests: demoRequests
      });
    }
    
    // For real implementation, get transport requests from database
    // Filter by agency capabilities and availability
    const requests = await prisma.transportRequest.findMany({
      where: {
        status: 'PENDING',
        // Add additional filters based on agency capabilities
      },
      include: {
        originFacility: true,
        destinationFacility: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform the data to match expected format
    const formattedRequests = requests.map(req => ({
      id: req.id,
      patientId: req.patientId,
      originFacility: req.originFacility || {
        name: req.fromLocation || 'Unknown',
        address: '',
        city: '',
        state: ''
      },
      destinationFacility: {
        name: req.toLocation || 'Unknown',
        address: '',
        city: '',
        state: ''
      },
      transportLevel: req.transportLevel,
      priority: req.priority,
      specialRequirements: req.specialRequirements,
      estimatedDistance: 0, // Calculate if needed
      estimatedDuration: 0, // Calculate if needed
      revenuePotential: 0, // Calculate if needed
      status: req.status,
      createdAt: req.createdAt.toISOString()
    }));
    
    res.json({
      success: true,
      message: 'Transport requests retrieved successfully',
      requests: formattedRequests
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transport requests'
    });
  }
});

/**
 * POST /api/agency/transport-requests/:requestId/accept
 * Accept a transport request
 */
router.post('/transport-requests/:requestId/accept', authenticateAgencyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('[AGENCY-TRANSPORT-REQUESTS] Accepting transport request:', requestId);
    
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      if ((req as any).user.role === 'ADMIN') {
        // For ADMIN users, return demo acceptance
        return res.json({
          success: true,
          message: 'Admin demo: Transport request accepted successfully',
          requestId,
          acceptedBy: 'ADMIN_USER',
          acceptedAt: new Date().toISOString()
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    // For now, use the existing agency response system
    const result = await tripService.createAgencyResponse({
      tripId: requestId,
      agencyId,
      response: 'ACCEPTED',
      responseNotes: 'Accepted via transport request endpoint'
    });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to accept transport request'
      });
    }
    
    res.json({
      success: true,
      message: 'Transport request accepted successfully',
      requestId,
      data: result.data
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept transport request'
    });
  }
});

/**
 * POST /api/agency/transport-requests/:requestId/reject
 * Reject a transport request
 */
router.post('/transport-requests/:requestId/reject', authenticateAgencyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    console.log('[AGENCY-TRANSPORT-REQUESTS] Rejecting transport request:', requestId, 'Reason:', reason);
    
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      if ((req as any).user.role === 'ADMIN') {
        // For ADMIN users, return demo rejection
        return res.json({
          success: true,
          message: 'Admin demo: Transport request rejected successfully',
          requestId,
          rejectedBy: 'ADMIN_USER',
          rejectedAt: new Date().toISOString(),
          reason: reason || 'No reason provided'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    // Use the existing agency response system
    const result = await tripService.createAgencyResponse({
      tripId: requestId,
      agencyId,
      response: 'DECLINED',
      responseNotes: reason || 'No reason provided'
    });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to reject transport request'
      });
    }
    
    res.json({
      success: true,
      message: 'Transport request rejected successfully',
      requestId,
      reason: reason || 'No reason provided',
      data: result.data
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject transport request'
    });
  }
});

export default router;
