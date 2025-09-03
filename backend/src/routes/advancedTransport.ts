import express from 'express';
import { authenticateToken } from '../middleware/auth';
import advancedTransportService from '../services/advancedTransportService';

const router = express.Router();

// Demo mode middleware for GET requests
const demoOrAuth = (req: any, res: any, next: any) => {
  // Allow demo access for GET requests
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.includes('demo-token')) {
      // Set demo user for GET requests
      req.user = { id: 'demo-user', email: 'demo@medport.com', role: 'COORDINATOR' };
      return next();
    }
  }
  // For all other requests, require proper authentication
  return authenticateToken(req, res, next);
};

// Apply demo or auth middleware to all routes
router.use(demoOrAuth);

/**
 * @route POST /api/advanced-transport/multi-patient
 * @desc Create a new multi-patient transport
 * @access Private (COORDINATOR, ADMIN)
 */
router.post('/multi-patient', async (req, res) => {
  try {
    const { facilityId, coordinatorId, patientTransports, plannedStartTime, plannedEndTime } = req.body;

    if (!facilityId || !coordinatorId || !patientTransports || !plannedStartTime || !plannedEndTime) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'facilityId, coordinatorId, patientTransports, plannedStartTime, and plannedEndTime are required'
      });
    }

    if (!Array.isArray(patientTransports) || patientTransports.length === 0) {
      return res.status(400).json({
        message: 'Invalid patient transports',
        error: 'patientTransports must be a non-empty array'
      });
    }

    const result = await advancedTransportService.createMultiPatientTransport({
      facilityId,
      coordinatorId,
      patientTransports,
      plannedStartTime,
      plannedEndTime
    });

    res.status(201).json({
      message: 'Multi-patient transport created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error creating multi-patient transport:', error);
    res.status(500).json({
      message: 'Failed to create multi-patient transport',
      error: error.message
    });
  }
});

/**
 * @route POST /api/advanced-transport/long-distance
 * @desc Create a new long-distance transport
 * @access Private (COORDINATOR, ADMIN)
 */
router.post('/long-distance', async (req, res) => {
  try {
    const { facilityId, destinationFacilityId, coordinatorId, transportLegs, weatherConditions } = req.body;

    if (!facilityId || !destinationFacilityId || !coordinatorId || !transportLegs) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'facilityId, destinationFacilityId, coordinatorId, and transportLegs are required'
      });
    }

    if (!Array.isArray(transportLegs) || transportLegs.length === 0) {
      return res.status(400).json({
        message: 'Invalid transport legs',
        error: 'transportLegs must be a non-empty array'
      });
    }

    const result = await advancedTransportService.createLongDistanceTransport({
      facilityId,
      destinationFacilityId,
      coordinatorId,
      transportLegs,
      weatherConditions
    });

    res.status(201).json({
      message: 'Long-distance transport created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error creating long-distance transport:', error);
    res.status(500).json({
      message: 'Failed to create long-distance transport',
      error: error.message
    });
  }
});

/**
 * @route POST /api/advanced-transport/optimize-route
 * @desc Optimize route for multiple patient transports
 * @access Private (COORDINATOR, ADMIN)
 */
router.post('/optimize-route', async (req, res) => {
  try {
    const { patientTransports, constraints, optimizationGoals } = req.body;

    if (!patientTransports || !constraints || !optimizationGoals) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'patientTransports, constraints, and optimizationGoals are required'
      });
    }

    if (!Array.isArray(patientTransports) || patientTransports.length === 0) {
      return res.status(400).json({
        message: 'Invalid patient transports',
        error: 'patientTransports must be a non-empty array'
      });
    }

    const optimizedRoute = await advancedTransportService.optimizeRoute({
      patientTransports,
      constraints,
      optimizationGoals
    });

    res.status(200).json({
      message: 'Route optimization completed successfully',
      data: optimizedRoute
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error optimizing route:', error);
    res.status(500).json({
      message: 'Failed to optimize route',
      error: error.message
    });
  }
});

/**
 * @route GET /api/advanced-transport/multi-patient/:id
 * @desc Get multi-patient transport by ID
 * @access Private (COORDINATOR, ADMIN)
 */
router.get('/multi-patient/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await advancedTransportService.getMultiPatientTransportById(id);

    if (!transport) {
      return res.status(404).json({
        message: 'Multi-patient transport not found',
        error: 'Transport with specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Multi-patient transport retrieved successfully',
      data: transport
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error retrieving multi-patient transport:', error);
    res.status(500).json({
      message: 'Failed to retrieve multi-patient transport',
      error: error.message
    });
  }
});

/**
 * @route GET /api/advanced-transport/long-distance/:id
 * @desc Get long-distance transport by ID
 * @access Private (COORDINATOR, ADMIN)
 */
router.get('/long-distance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await advancedTransportService.getLongDistanceTransportById(id);

    if (!transport) {
      return res.status(404).json({
        message: 'Long-distance transport not found',
        error: 'Transport with specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Long-distance transport retrieved successfully',
      data: transport
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error retrieving long-distance transport:', error);
    res.status(500).json({
      message: 'Failed to retrieve long-distance transport',
      error: error.message
    });
  }
});

/**
 * @route GET /api/advanced-transport/multi-patient
 * @desc Get all multi-patient transports with optional filtering
 * @access Private (COORDINATOR, ADMIN)
 */
router.get('/multi-patient', async (req, res) => {
  try {
    const filters = req.query;
    const transports = await advancedTransportService.getMultiPatientTransports(filters);

    res.status(200).json({
      message: 'Multi-patient transports retrieved successfully',
      data: transports,
      total: transports.length
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error retrieving multi-patient transports:', error);
    res.status(500).json({
      message: 'Failed to retrieve multi-patient transports',
      error: error.message
    });
  }
});

/**
 * @route GET /api/advanced-transport/long-distance
 * @desc Get all long-distance transports with optional filtering
 * @access Private (COORDINATOR, ADMIN)
 */
router.get('/long-distance', async (req, res) => {
  try {
    const filters = req.query;
    const transports = await advancedTransportService.getLongDistanceTransports(filters);

    res.status(200).json({
      message: 'Long-distance transports retrieved successfully',
      data: transports,
      total: transports.length
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error retrieving long-distance transports:', error);
    res.status(500).json({
      message: 'Failed to retrieve long-distance transports',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/advanced-transport/multi-patient/:id/status
 * @desc Update multi-patient transport status
 * @access Private (COORDINATOR, ADMIN)
 */
router.put('/multi-patient/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedAgencyId, assignedUnitId } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Missing required field',
        error: 'status is required'
      });
    }

    const updatedTransport = await advancedTransportService.updateMultiPatientTransportStatus(
      id,
      status,
      assignedAgencyId,
      assignedUnitId
    );

    res.status(200).json({
      message: 'Multi-patient transport status updated successfully',
      data: updatedTransport
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error updating multi-patient transport status:', error);
    res.status(500).json({
      message: 'Failed to update multi-patient transport status',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/advanced-transport/long-distance/:id/status
 * @desc Update long-distance transport status
 * @access Private (COORDINATOR, ADMIN)
 */
router.put('/long-distance/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedAgencyId, assignedUnitId } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Missing required field',
        error: 'status is required'
      });
    }

    const updatedTransport = await advancedTransportService.updateLongDistanceTransportStatus(
      id,
      status,
      assignedAgencyId,
      assignedUnitId
    );

    res.status(200).json({
      message: 'Long-distance transport status updated successfully',
      data: updatedTransport
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error updating long-distance transport status:', error);
    res.status(500).json({
      message: 'Failed to update long-distance transport status',
      error: error.message
    });
  }
});

/**
 * @route POST /api/advanced-transport/long-distance/:id/weather
 * @desc Add weather update to long-distance transport
 * @access Private (COORDINATOR, ADMIN)
 */
router.post('/long-distance/:id/weather', async (req, res) => {
  try {
    const { id } = req.params;
    const { conditions, impact, recommendations } = req.body;

    if (!conditions || !impact || !recommendations) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'conditions, impact, and recommendations are required'
      });
    }

    const weatherUpdate = await advancedTransportService.addWeatherUpdate(id, {
      conditions,
      impact,
      recommendations
    });

    res.status(201).json({
      message: 'Weather update added successfully',
      data: weatherUpdate
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error adding weather update:', error);
    res.status(500).json({
      message: 'Failed to add weather update',
      error: error.message
    });
  }
});

/**
 * @route GET /api/advanced-transport/statistics
 * @desc Get transport statistics for dashboard
 * @access Private (COORDINATOR, ADMIN)
 */
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await advancedTransportService.getTransportStatistics();

    res.status(200).json({
      message: 'Transport statistics retrieved successfully',
      data: statistics
    });
  } catch (error: any) {
    console.error('[MedPort:AdvancedTransport] Error retrieving transport statistics:', error);
    res.status(500).json({
      message: 'Failed to retrieve transport statistics',
      error: error.message
    });
  }
});

export default router;
