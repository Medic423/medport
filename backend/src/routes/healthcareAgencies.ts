import express from 'express';
import { healthcareAgencyService } from '../services/healthcareAgencyService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { healthcareTripDispatchService } from '../services/healthcareTripDispatchService';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * GET /api/healthcare/agencies/available
 * Get only available EMS agencies (marked as available by EMS users)
 * Query params:
 *   - radius: Filter by distance in miles (default: 50, null/undefined: show all)
 */
router.get('/available', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    // Parse radius parameter (default: 50 miles, null means show all)
    let radiusMiles: number | null = 50; // Default radius
    if (req.query.radius !== undefined) {
      if (req.query.radius === 'null' || req.query.radius === 'all' || req.query.radius === '') {
        radiusMiles = null; // Show all agencies
      } else {
        const parsed = parseFloat(req.query.radius as string);
        if (!isNaN(parsed) && parsed > 0) {
          radiusMiles = parsed;
        }
      }
    }

    const agencies = await healthcareAgencyService.getAvailableAgenciesForHealthcareUser(
      req.user!.id,
      radiusMiles
    );

    res.json({
      success: true,
      data: agencies,
      count: agencies.length,
      radiusMiles: radiusMiles,
    });
  } catch (error) {
    console.error('Get available healthcare agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available agencies',
    });
  }
});

/**
 * GET /api/healthcare/agencies
 * List all EMS agencies for the logged-in healthcare user with optional filtering
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const filters = {
      name: req.query.search as string,
      city: req.query.city as string,
      state: req.query.state as string,
      capabilities: req.query.capabilities ? (req.query.capabilities as string).split(',') : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      status: (req.query.status as string) || 'all', // preferred, regular, or all
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await healthcareAgencyService.getAgenciesForHealthcareUser(
      req.user!.id,
      filters
    );

    res.json({
      success: true,
      data: result.agencies,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Get healthcare agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agencies',
    });
  }
});

/**
 * POST /api/healthcare/agencies
 * Create new EMS agency for the logged-in healthcare user
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const agencyData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'contactName', 'phone', 'email', 'address', 'city', 'state', 'zipCode', 'capabilities'];
    const missingFields = requiredFields.filter((field) => !agencyData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const agency = await healthcareAgencyService.createAgencyForHealthcareUser(
      req.user!.id,
      agencyData
    );

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency,
    });
  } catch (error) {
    console.error('Create healthcare agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agency',
    });
  }
});

/**
 * GET /api/healthcare/agencies/trip-agencies?tripId=xxx
 * Get available agencies for a specific trip (Phase 3)
 * MUST come before /:id route to avoid route conflicts
 */
router.get('/trip-agencies', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  console.log('🚨 ROUTE HIT: GET /trip-agencies', req.query);
  console.log('🚨 User from token:', { id: req.user?.id, email: req.user?.email, userType: req.user?.userType });
  try {
    const tripId = req.query.tripId as string;
    const mode = req.query.mode as 'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID' | undefined;
    const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
    console.log('🚨 Processing trip-agencies request:', { tripId, mode, radius });

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'tripId query parameter is required',
      });
    }

    // For all users, we need to resolve the healthcareUserId for the trip
    // This determines which healthcare user's agencies to use
    let healthcareUserId: string | null = null;
    const prisma = (await import('../services/databaseManager')).databaseManager.getPrismaClient();
    
    if (req.user!.userType === 'HEALTHCARE') {
      // For HEALTHCARE users, use the trip's creator if it exists, otherwise use their own ID
      healthcareUserId = req.user!.id;
      const trip = await prisma.transportRequest.findUnique({
        where: { id: tripId },
        select: { healthcareCreatedById: true }
      });
      
      if (trip?.healthcareCreatedById && trip.healthcareCreatedById !== healthcareUserId) {
        console.log('🚨 HEALTHCARE user accessing trip created by different user:', {
          tripCreator: trip.healthcareCreatedById,
          currentUser: healthcareUserId
        });
        // Use the trip's creator ID instead
        healthcareUserId = trip.healthcareCreatedById;
        console.log('🚨 Using trip creator ID:', healthcareUserId);
      }
    } else {
      // For ADMIN, USER, EMS, or any other user type, use the trip's healthcareCreatedById
      const trip = await prisma.transportRequest.findUnique({
        where: { id: tripId },
        select: { healthcareCreatedById: true, fromLocationId: true }
      });
      
      if (trip?.healthcareCreatedById) {
        healthcareUserId = trip.healthcareCreatedById;
        console.log('🚨 Non-HEALTHCARE user accessing trip, using healthcareCreatedById:', healthcareUserId);
      } else if (trip?.fromLocationId) {
        // For old trips without healthcareCreatedById, try to find a healthcare user from the location
        const location = await prisma.healthcareLocation.findUnique({
          where: { id: trip.fromLocationId },
          select: { healthcareUserId: true }
        });
        if (location?.healthcareUserId) {
          healthcareUserId = location.healthcareUserId;
          console.log('🚨 Non-HEALTHCARE user accessing old trip, using location healthcareUserId:', healthcareUserId);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Trip does not have a healthcare creator assigned and could not determine from location',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Trip does not have a healthcare creator assigned',
        });
      }
    }
    
    if (!healthcareUserId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine healthcare user for trip agencies',
      });
    }

    const result = await healthcareTripDispatchService.getTripAgencies(
      tripId,
      healthcareUserId,
      mode,
      radius
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get trip agencies error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve trip agencies',
    });
  }
});

/**
 * GET /api/healthcare/agencies/search/:query
 * Search agencies for the logged-in healthcare user
 * MUST come before /:id route to avoid route conflicts
 */
router.get('/search/:query', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const { query } = req.params;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const agencies = await healthcareAgencyService.searchAgenciesForHealthcareUser(
      req.user!.id,
      query
    );

    res.json({
      success: true,
      data: agencies,
    });
  } catch (error) {
    console.error('Search healthcare agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search agencies',
    });
  }
});

/**
 * GET /api/healthcare/agencies/:id
 * Get agency by ID (only if owned by the logged-in healthcare user)
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const { id } = req.params;
    const agency = await healthcareAgencyService.getAgencyByIdForHealthcareUser(
      id,
      req.user!.id
    );

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: 'Agency not found or access denied',
      });
    }

    // Transform to include isPreferred
    const transformedAgency = {
      ...agency,
      isPreferred: agency.healthcarePreferences?.[0]?.isPreferred || false,
      healthcarePreferences: undefined,
    };

    res.json({
      success: true,
      data: transformedAgency,
    });
  } catch (error) {
    console.error('Get healthcare agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency',
    });
  }
});

/**
 * PUT /api/healthcare/agencies/:id
 * Update agency (only if owned by the logged-in healthcare user)
 */
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const agency = await healthcareAgencyService.updateAgencyForHealthcareUser(
      id,
      req.user!.id,
      updateData
    );

    res.json({
      success: true,
      message: 'Agency updated successfully',
      data: agency,
    });
  } catch (error: any) {
    console.error('Update healthcare agency error:', error);
    
    // Handle ownership error
    if (error.message === 'Agency not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update agency',
    });
  }
});

/**
 * PATCH /api/healthcare/agencies/:id/preferred
 * Toggle preferred status for an agency
 */
router.patch('/:id/preferred', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const { id } = req.params;
    const { isPreferred } = req.body;

    if (typeof isPreferred !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isPreferred must be a boolean',
      });
    }

    const preference = await healthcareAgencyService.togglePreferredStatus(
      req.user!.id,
      id,
      isPreferred
    );

    res.json({
      success: true,
      message: `Agency marked as ${isPreferred ? 'preferred' : 'regular'}`,
      data: preference,
    });
  } catch (error: any) {
    console.error('Toggle preferred status error:', error);
    
    // Handle ownership error
    if (error.message === 'Agency not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update preferred status',
    });
  }
});

/**
 * DELETE /api/healthcare/agencies/:id
 * Soft delete agency (only if owned by the logged-in healthcare user)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    // Verify user is healthcare type
    if (req.user?.userType !== 'HEALTHCARE') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Healthcare users only',
      });
    }

    const { id } = req.params;
    await healthcareAgencyService.deleteAgencyForHealthcareUser(id, req.user!.id);

    res.json({
      success: true,
      message: 'Agency deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete healthcare agency error:', error);
    
    // Handle ownership error
    if (error.message === 'Agency not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete agency',
    });
  }
});

export default router;

