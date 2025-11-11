import express from 'express';
import { healthcareDestinationService } from '../services/healthcareDestinationService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * GET /api/healthcare/destinations
 * List all destinations for the logged-in healthcare user with optional filtering
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
      type: req.query.type as string,
      city: req.query.city as string,
      state: req.query.state as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await healthcareDestinationService.getDestinationsForHealthcareUser(
      req.user!.id,
      filters
    );

    res.json({
      success: true,
      data: result.destinations,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Get healthcare destinations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve destinations',
    });
  }
});

/**
 * POST /api/healthcare/destinations
 * Create new destination for the logged-in healthcare user
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

    const destinationData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'type', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter((field) => !destinationData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const destination = await healthcareDestinationService.createDestinationForHealthcareUser(
      req.user!.id,
      destinationData
    );

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    console.error('Create healthcare destination error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create destination',
    });
  }
});

/**
 * GET /api/healthcare/destinations/:id
 * Get a single destination by ID
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

    const destination = await healthcareDestinationService.getDestinationByIdForHealthcareUser(
      id,
      req.user!.id
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found or access denied',
      });
    }

    res.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error('Get healthcare destination error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve destination',
    });
  }
});

/**
 * PUT /api/healthcare/destinations/:id
 * Update a destination
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
    const destinationData = req.body;

    const destination = await healthcareDestinationService.updateDestinationForHealthcareUser(
      id,
      req.user!.id,
      destinationData
    );

    res.json({
      success: true,
      message: 'Destination updated successfully',
      data: destination,
    });
  } catch (error: any) {
    console.error('Update healthcare destination error:', error);

    // Handle ownership error
    if (error.message === 'Destination not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update destination',
    });
  }
});

/**
 * DELETE /api/healthcare/destinations/:id
 * Soft delete a destination (set isActive = false)
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

    await healthcareDestinationService.deleteDestinationForHealthcareUser(
      id,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete healthcare destination error:', error);

    // Handle ownership error
    if (error.message === 'Destination not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete destination',
    });
  }
});

export default router;





