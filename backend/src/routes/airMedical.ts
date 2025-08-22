import express from 'express';
import { authenticateToken } from '../middleware/auth';
import airMedicalService from '../services/airMedicalService';

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
 * @route GET /api/air-medical/resources
 * @desc Get all active air medical resources
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = await airMedicalService.getActiveAirMedicalResources();
    
    res.status(200).json({
      message: 'Air medical resources retrieved successfully',
      data: resources,
      total: resources.length
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving resources:', error);
    res.status(500).json({
      message: 'Failed to retrieve air medical resources',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/resources/:id
 * @desc Get air medical resource by ID
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await airMedicalService.getAirMedicalResourceById(id);

    if (!resource) {
      return res.status(404).json({
        message: 'Air medical resource not found',
        error: 'Resource with specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Air medical resource retrieved successfully',
      data: resource
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving resource:', error);
    res.status(500).json({
      message: 'Failed to retrieve air medical resource',
      error: error.message
    });
  }
});

/**
 * @route POST /api/air-medical/resources
 * @desc Create a new air medical resource
 * @access Private (with valid JWT)
 */
router.post('/resources', async (req, res) => {
  try {
    const resourceData = req.body;
    const resource = await airMedicalService.createAirMedicalResource(resourceData);

    res.status(201).json({
      message: 'Air medical resource created successfully',
      data: resource
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error creating resource:', error);
    res.status(500).json({
      message: 'Failed to create air medical resource',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/air-medical/resources/:id
 * @desc Update an air medical resource
 * @access Private (with valid JWT)
 */
router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const resource = await airMedicalService.updateAirMedicalResource(id, updateData);

    res.status(200).json({
      message: 'Air medical resource updated successfully',
      data: resource
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error updating resource:', error);
    res.status(500).json({
      message: 'Failed to update air medical resource',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/air-medical/resources/:id
 * @desc Deactivate an air medical resource
 * @access Private (with valid JWT)
 */
router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await airMedicalService.deactivateAirMedicalResource(id);

    res.status(200).json({
      message: 'Air medical resource deactivated successfully',
      data: resource
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error deactivating resource:', error);
    res.status(500).json({
      message: 'Failed to deactivate air medical resource',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/transports
 * @desc Get all air medical transports with optional filtering
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/transports', async (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.resourceType) filters.resourceType = req.query.resourceType;
    if (req.query.startDate && req.query.endDate) {
      filters.dateRange = {
        start: new Date(req.query.startDate as string),
        end: new Date(req.query.endDate as string)
      };
    }

    const transports = await airMedicalService.getAirMedicalTransports(filters);
    
    res.status(200).json({
      message: 'Air medical transports retrieved successfully',
      data: transports,
      total: transports.length
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving transports:', error);
    res.status(500).json({
      message: 'Failed to retrieve air medical transports',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/transports/:id
 * @desc Get air medical transport by ID
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/transports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await airMedicalService.getAirMedicalTransportById(id);

    if (!transport) {
      return res.status(404).json({
        message: 'Air medical transport not found',
        error: 'Transport with specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Air medical transport retrieved successfully',
      data: transport
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving transport:', error);
    res.status(500).json({
      message: 'Failed to retrieve air medical transport',
      error: error.message
    });
  }
});

/**
 * @route POST /api/air-medical/transports
 * @desc Create a new air medical transport
 * @access Private (with valid JWT)
 */
router.post('/transports', async (req, res) => {
  try {
    const transportData = req.body;
    const transport = await airMedicalService.createAirMedicalTransport(transportData);

    res.status(201).json({
      message: 'Air medical transport created successfully',
      data: transport
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error creating transport:', error);
    res.status(500).json({
      message: 'Failed to create air medical transport',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/air-medical/transports/:id/status
 * @desc Update air medical transport status
 * @access Private (with valid JWT)
 */
router.put('/transports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: 'Status is required',
        error: 'Status field must be provided'
      });
    }

    const transport = await airMedicalService.updateAirMedicalTransportStatus(id, status, additionalData);

    res.status(200).json({
      message: 'Air medical transport status updated successfully',
      data: transport
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error updating transport status:', error);
    res.status(500).json({
      message: 'Failed to update air medical transport status',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/weather/alerts
 * @desc Get active weather alerts
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/weather/alerts', async (req, res) => {
  try {
    const location = req.query.location as string;
    const alerts = await airMedicalService.getActiveWeatherAlerts(location);
    
    res.status(200).json({
      message: 'Weather alerts retrieved successfully',
      data: alerts,
      total: alerts.length
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving weather alerts:', error);
    res.status(500).json({
      message: 'Failed to retrieve weather alerts',
      error: error.message
    });
  }
});

/**
 * @route POST /api/air-medical/weather/alerts
 * @desc Create a new weather alert
 * @access Private (with valid JWT)
 */
router.post('/weather/alerts', async (req, res) => {
  try {
    const alertData = req.body;
    const alert = await airMedicalService.createWeatherAlert(alertData);

    res.status(201).json({
      message: 'Weather alert created successfully',
      data: alert
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error creating weather alert:', error);
    res.status(500).json({
      message: 'Failed to create weather alert',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/air-medical/weather/alerts/:id/status
 * @desc Update weather alert status
 * @access Private (with valid JWT)
 */
router.put('/weather/alerts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive is required and must be a boolean',
        error: 'isActive field must be provided as a boolean'
      });
    }

    const alert = await airMedicalService.updateWeatherAlertStatus(id, isActive);

    res.status(200).json({
      message: 'Weather alert status updated successfully',
      data: alert
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error updating weather alert status:', error);
    res.status(500).json({
      message: 'Failed to update weather alert status',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/weather/impact/:location
 * @desc Get weather impact assessment for a location
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/weather/impact/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const resourceType = req.query.resourceType as string;
    
    if (!resourceType) {
      return res.status(400).json({
        message: 'Resource type is required',
        error: 'resourceType query parameter must be provided'
      });
    }

    const assessment = await airMedicalService.getWeatherImpactAssessment(location, resourceType as any);

    res.status(200).json({
      message: 'Weather impact assessment retrieved successfully',
      data: assessment
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving weather impact assessment:', error);
    res.status(500).json({
      message: 'Failed to retrieve weather impact assessment',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/availability
 * @desc Get air medical resource availability
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/availability', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const location = req.query.location as string;
    
    const availability = await airMedicalService.getResourceAvailability(date, location);

    res.status(200).json({
      message: 'Resource availability retrieved successfully',
      data: availability
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving resource availability:', error);
    res.status(500).json({
      message: 'Failed to retrieve resource availability',
      error: error.message
    });
  }
});

/**
 * @route GET /api/air-medical/statistics
 * @desc Get air medical statistics
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/statistics', async (req, res) => {
  try {
    let dateRange;
    if (req.query.startDate && req.query.endDate) {
      dateRange = {
        start: new Date(req.query.startDate as string),
        end: new Date(req.query.endDate as string)
      };
    }
    
    const statistics = await airMedicalService.getAirMedicalStatistics(dateRange);

    res.status(200).json({
      message: 'Air medical statistics retrieved successfully',
      data: statistics
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error retrieving statistics:', error);
    res.status(500).json({
      message: 'Failed to retrieve air medical statistics',
      error: error.message
    });
  }
});

/**
 * @route POST /api/air-medical/coordination
 * @desc Create ground transport coordination
 * @access Private (with valid JWT)
 */
router.post('/coordination', async (req, res) => {
  try {
    const coordinationData = req.body;
    const coordination = await airMedicalService.createGroundTransportCoordination(coordinationData);

    res.status(201).json({
      message: 'Ground transport coordination created successfully',
      data: coordination
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error creating coordination:', error);
    res.status(500).json({
      message: 'Failed to create ground transport coordination',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/air-medical/coordination/:id/status
 * @desc Update coordination status
 * @access Private (with valid JWT)
 */
router.put('/coordination/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: 'Status is required',
        error: 'Status field must be provided'
      });
    }

    const coordination = await airMedicalService.updateCoordinationStatus(id, status, notes);

    res.status(200).json({
      message: 'Coordination status updated successfully',
      data: coordination
    });
  } catch (error: any) {
    console.error('[MedPort:AirMedical] Error updating coordination status:', error);
    res.status(500).json({
      message: 'Failed to update coordination status',
      error: error.message
    });
  }
});

export default router;
