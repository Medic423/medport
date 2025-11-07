import express from 'express';
import { agencyService } from '../services/agencyService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = express.Router();

// Test endpoint without authentication for debugging
router.get('/test', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Test agencies endpoint called');
    const agencyService = require('../services/agencyService').agencyService;
    const result = await agencyService.getAgencies({});
    console.log('TCC_DEBUG: Test agencies result:', result);
    res.json({
      success: true,
      data: result.agencies,
      total: result.total,
      message: 'Test endpoint - authentication bypassed'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Test agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed: ' + (error as Error).message
    });
  }
});

// Temporarily disable authentication for testing
// router.use(authenticateAdmin);

/**
 * GET /api/tcc/agencies
 * List all EMS agencies with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      name: req.query.name as string,
      city: req.query.city as string,
      state: req.query.state as string,
      capabilities: req.query.capabilities ? (req.query.capabilities as string).split(',') : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await agencyService.getAgencies(filters);

    res.json({
      success: true,
      data: result.agencies,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: filters.limit
      }
    });

  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agencies'
    });
  }
});

/**
 * POST /api/tcc/agencies
 * Create new EMS agency
 */
router.post('/', async (req, res) => {
  try {
    const agencyData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'contactName', 'phone', 'email', 'address', 'city', 'state', 'zipCode', 'capabilities'];
    const missingFields = requiredFields.filter(field => !agencyData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const agency = await agencyService.createAgency(agencyData);

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency
    });

  } catch (error) {
    console.error('Create agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agency'
    });
  }
});

/**
 * GET /api/tcc/agencies/:id
 * Get agency by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await agencyService.getAgencyById(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: 'Agency not found'
      });
    }

    res.json({
      success: true,
      data: agency
    });

  } catch (error) {
    console.error('Get agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency'
    });
  }
});

/**
 * PUT /api/tcc/agencies/:id
 * Update agency
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const agency = await agencyService.updateAgency(id, updateData);

    res.json({
      success: true,
      message: 'Agency updated successfully',
      data: agency
    });

  } catch (error) {
    console.error('Update agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agency'
    });
  }
});

/**
 * DELETE /api/tcc/agencies/:id
 * Delete agency
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await agencyService.deleteAgency(id);

    res.json({
      success: true,
      message: 'Agency deleted successfully'
    });

  } catch (error) {
    console.error('Delete agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agency'
    });
  }
});

/**
 * GET /api/tcc/agencies/search
 * Search agencies
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const agencies = await agencyService.searchAgencies(q);

    res.json({
      success: true,
      data: agencies
    });

  } catch (error) {
    console.error('Search agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search agencies'
    });
  }
});

export default router;
