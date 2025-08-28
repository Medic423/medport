import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import transportRequestService from '../services/transportRequestService';
import facilityService from '../services/facilityService';
import { TransportLevel, Priority, RequestStatus } from '@prisma/client';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * POST /api/transport-requests
 * Create a new transport request
 */
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      patientId,
      originFacilityId,
      destinationFacilityId,
      transportLevel,
      priority,
      specialRequirements
    } = req.body;

    // Validate required fields
    if (!originFacilityId || !destinationFacilityId || !transportLevel || !priority) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['originFacilityId', 'destinationFacilityId', 'transportLevel', 'priority']
      });
    }

    // Validate transport level
    if (!Object.values(TransportLevel).includes(transportLevel)) {
      return res.status(400).json({
        error: 'Invalid transport level',
        validLevels: Object.values(TransportLevel)
      });
    }

    // Validate priority
    if (!Object.values(Priority).includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority level',
        validPriorities: Object.values(Priority)
      });
    }

    // Create transport request
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const transportRequest = await transportRequestService.createTransportRequest({
      patientId,
      originFacilityId,
      destinationFacilityId,
      transportLevel,
      priority,
      specialRequirements,
      createdById: req.user.id
    });

    res.status(201).json({
      message: 'Transport request created successfully',
      transportRequest
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error creating transport request:', error);
    res.status(500).json({
      error: 'Failed to create transport request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests
 * Get transport requests with filtering and pagination
 */
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      status,
      priority,
      transportLevel,
      originFacilityId,
      destinationFacilityId,
      createdById,
      page = '1',
      limit = '50'
    } = req.query;

    // Parse and validate pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100 per page

    // Build filters
    const filters: any = {};
    if (status && Object.values(RequestStatus).includes(status as RequestStatus)) {
      filters.status = status as RequestStatus;
    }
    if (priority && Object.values(Priority).includes(priority as Priority)) {
      filters.priority = priority as Priority;
    }
    if (transportLevel && Object.values(TransportLevel).includes(transportLevel as TransportLevel)) {
      filters.transportLevel = transportLevel as TransportLevel;
    }
    if (originFacilityId) filters.originFacilityId = originFacilityId as string;
    if (destinationFacilityId) filters.destinationFacilityId = destinationFacilityId as string;
    if (createdById) filters.createdById = createdById as string;

    const result = await transportRequestService.getTransportRequests({
      ...filters,
      page: pageNum,
      limit: limitNum
    });

    res.json({
      message: 'Transport requests retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving transport requests:', error);
    res.status(500).json({
      error: 'Failed to retrieve transport requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/:id
 * Get transport request by ID
 */
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const transportRequest = await transportRequestService.getTransportRequestById(id);

    if (!transportRequest) {
      return res.status(404).json({
        error: 'Transport request not found'
      });
    }

    res.json({
      message: 'Transport request retrieved successfully',
      transportRequest
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving transport request:', error);
    res.status(500).json({
      error: 'Failed to retrieve transport request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/transport-requests/:id
 * Update transport request
 */
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate status if provided
    if (updateData.status && !Object.values(RequestStatus).includes(updateData.status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses: Object.values(RequestStatus)
      });
    }

    // Validate transport level if provided
    if (updateData.transportLevel && !Object.values(TransportLevel).includes(updateData.transportLevel)) {
      return res.status(400).json({
        error: 'Invalid transport level',
        validLevels: Object.values(TransportLevel)
      });
    }

    // Validate priority if provided
    if (updateData.priority && !Object.values(Priority).includes(updateData.priority)) {
      return res.status(400).json({
        error: 'Invalid priority level',
        validPriorities: Object.values(Priority)
      });
    }

    const updatedRequest = await transportRequestService.updateTransportRequest(id, updateData);

    res.json({
      message: 'Transport request updated successfully',
      transportRequest: updatedRequest
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error updating transport request:', error);
    res.status(500).json({
      error: 'Failed to update transport request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/transport-requests/:id
 * Cancel transport request
 */
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cancelledRequest = await transportRequestService.cancelTransportRequest(id, reason);

    res.json({
      message: 'Transport request cancelled successfully',
      transportRequest: cancelledRequest
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error cancelling transport request:', error);
    res.status(500).json({
      error: 'Failed to cancel transport request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/transport-requests/:id/duplicate
 * Duplicate transport request
 */
router.post('/:id/duplicate', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const modifications = req.body;

    const duplicatedRequest = await transportRequestService.duplicateTransportRequest(id, modifications);

    res.status(201).json({
      message: 'Transport request duplicated successfully',
      transportRequest: duplicatedRequest
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error duplicating transport request:', error);
    res.status(500).json({
      error: 'Failed to duplicate transport request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/transport-requests/bulk-update
 * Bulk update transport requests
 */
router.post('/bulk-update', async (req: AuthRequest, res: express.Response) => {
  try {
    const { ids, updates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'IDs array is required and must not be empty'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        error: 'Updates object is required'
      });
    }

    const result = await transportRequestService.bulkUpdateTransportRequests(ids, updates);

    res.json({
      message: 'Bulk update completed',
      ...result
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error bulk updating transport requests:', error);
    res.status(500).json({
      error: 'Failed to bulk update transport requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/stats/overview
 * Get transport request statistics
 */
router.get('/stats/overview', async (req: AuthRequest, res: express.Response) => {
  try {
    const stats = await transportRequestService.getTransportRequestStats();

    res.json({
      message: 'Transport request statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve transport request statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/facilities/search
 * Search facilities for transport request form
 */
router.get('/facilities/search', async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      name,
      type,
      city,
      state,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);

    const result = await facilityService.searchFacilities({
      name: name as string,
      type: type as any,
      city: city as string,
      state: state as string,
      page: pageNum,
      limit: limitNum
    });

    res.json({
      message: 'Facilities retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error searching facilities:', error);
    res.status(500).json({
      error: 'Failed to search facilities',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/facilities/types
 * Get facility types for filtering
 */
router.get('/facilities/types', async (req: AuthRequest, res: express.Response) => {
  try {
    const types = await facilityService.getFacilityTypes();

    res.json({
      message: 'Facility types retrieved successfully',
      types
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving facility types:', error);
    res.status(500).json({
      error: 'Failed to retrieve facility types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/facilities/cities
 * Get cities with facilities
 */
router.get('/facilities/cities', async (req: AuthRequest, res: express.Response) => {
  try {
    const cities = await facilityService.getCitiesWithFacilities();

    res.json({
      message: 'Cities retrieved successfully',
      cities
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving cities:', error);
    res.status(500).json({
      error: 'Failed to retrieve cities',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/transport-requests/facilities/states
 * Get states with facilities
 */
router.get('/facilities/states', async (req: AuthRequest, res: express.Response) => {
  try {
    const states = await facilityService.getStatesWithFacilities();

    res.json({
      message: 'States retrieved successfully',
      states
    });
  } catch (error) {
    console.error('[MedPort:TransportRequest] Error retrieving states:', error);
    res.status(500).json({
      error: 'Failed to retrieve states',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
