import express from 'express';
import { tripService } from '../services/tripService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';

const prisma = databaseManager.getPrismaClient();

const router = express.Router();

/**
 * POST /api/agency-responses
 * Create a new agency response
 */
router.post('/', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Create agency response request received:', req.body);
    
    const {
      tripId,
      agencyId,
      response,
      responseNotes,
      estimatedArrival
    } = req.body;

    console.log('TCC_DEBUG: Parsed fields:', { tripId, agencyId, response, responseNotes, estimatedArrival });

    // Validation
    if (!tripId || !agencyId || !response) {
      console.log('TCC_DEBUG: Validation failed - missing required fields:', { tripId: !!tripId, agencyId: !!agencyId, response: !!response });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tripId, agencyId, response'
      });
    }

    if (!['ACCEPTED', 'DECLINED'].includes(response)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid response. Must be ACCEPTED or DECLINED'
      });
    }

    const result = await tripService.createAgencyResponse({
      tripId,
      agencyId,
      response,
      responseNotes,
      estimatedArrival
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Agency response created successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Create agency response error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/agency-responses/:id
 * Update an existing agency response
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Update agency response request:', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const {
      response,
      responseNotes,
      estimatedArrival
    } = req.body;

    if (response && !['ACCEPTED', 'DECLINED'].includes(response)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid response. Must be ACCEPTED or DECLINED'
      });
    }

    const result = await tripService.updateAgencyResponse(id, {
      response,
      responseNotes,
      estimatedArrival
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Agency response updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update agency response error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/agency-responses
 * Get agency responses with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get agency responses request with query:', req.query);
    
    const filters = {
      tripId: req.query.tripId as string,
      agencyId: req.query.agencyId as string,
      response: req.query.response as 'ACCEPTED' | 'DECLINED' | 'PENDING',
      isSelected: req.query.isSelected ? req.query.isSelected === 'true' : undefined,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    const result = await tripService.getAgencyResponses(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get agency responses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/agency-responses/:id
 * Get a single agency response by ID
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get agency response by ID request:', req.params.id);
    
    const { id } = req.params;
    const result = await tripService.getAgencyResponseById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get agency response by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/agency-responses/:responseId/select
 * Select an agency response (mark as selected)
 */
router.post('/:responseId/select', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Select agency response request:', { responseId: req.params.responseId, body: req.body });
    
    const { responseId } = req.params;
    const { selectionNotes } = req.body;

    // Get the agency response to find the trip ID
    const agencyResponse = await prisma.agencyResponse.findUnique({
      where: { id: responseId }
    });

    if (!agencyResponse) {
      return res.status(404).json({
        success: false,
        error: 'Agency response not found'
      });
    }

    const result = await tripService.selectAgencyForTrip(responseId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Agency selected successfully for trip',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Select agency for trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/agency-responses/trip/:tripId
 * Get all responses for a specific trip
 */
router.get('/trip/:tripId', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get trip with responses request:', req.params.tripId);
    
    const { tripId } = req.params;
    const result = await tripService.getTripWithResponses(tripId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get trip with responses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/agency-responses/summary/:tripId
 * Get response summary for a trip
 */
router.get('/summary/:tripId', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get response summary request:', req.params.tripId);
    
    const { tripId } = req.params;
    const result = await tripService.getTripResponseSummary(tripId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get response summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/agency-responses/:id/select
 * Select an agency for a trip (mark as selected and update trip status)
 */
router.post('/:id/select', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Select agency request for response:', req.params.id);
    
    const { id } = req.params;
    const result = await tripService.selectAgencyForTrip(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Agency selected successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Select agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;