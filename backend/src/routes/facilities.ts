import express from 'express';
import { authenticateToken } from '../middleware/auth';
import facilityService from '../services/facilityService';

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
 * @route GET /api/facilities
 * @desc Get all facilities with optional filtering
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const facilities = await facilityService.searchFacilities(filters);

    res.status(200).json({
      message: 'Facilities retrieved successfully',
      data: facilities.facilities,
      total: facilities.total
    });
  } catch (error: any) {
    console.error('[MedPort:Facilities] Error retrieving facilities:', error);
    res.status(500).json({
      message: 'Failed to retrieve facilities',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facilities/:id
 * @desc Get facility by ID
 * @access Public (with demo token) or Private (with valid JWT)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilityService.getFacilityById(id);

    if (!facility) {
      return res.status(404).json({
        message: 'Facility not found',
        error: 'Facility with specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Facility retrieved successfully',
      data: facility
    });
  } catch (error: any) {
    console.error('[MedPort:Facilities] Error retrieving facility:', error);
    res.status(500).json({
      message: 'Failed to retrieve facility',
      error: error.message
    });
  }
});

/**
 * @route POST /api/facilities
 * @desc Create a new facility (demo mode only)
 * @access Demo mode only
 */
router.post('/', async (req, res) => {
  try {
    // Only allow in demo mode
    if (!req.headers.authorization || !req.headers.authorization.includes('demo-token')) {
      return res.status(403).json({
        message: 'Facility creation only available in demo mode'
      });
    }

    const facilityData = req.body;
    const facility = await facilityService.createFacility(facilityData);

    res.status(201).json({
      message: 'Facility created successfully',
      data: facility
    });
  } catch (error: any) {
    console.error('[MedPort:Facilities] Error creating facility:', error);
    res.status(500).json({
      message: 'Failed to create facility',
      error: error.message
    });
  }
});



export default router;
