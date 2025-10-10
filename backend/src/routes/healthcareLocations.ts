import express from 'express';
import { healthcareLocationsController } from '../controllers/healthcare-locations.controller';
import { authenticateToken } from '../middleware/authenticateAdmin';

const router = express.Router();

// Apply authentication to all healthcare location routes
router.use(authenticateToken);

/**
 * POST /api/healthcare/locations
 * Create a new location
 */
router.post('/', (req, res) => healthcareLocationsController.createLocation(req, res));

/**
 * GET /api/healthcare/locations
 * Get all locations for the logged-in user
 */
router.get('/', (req, res) => healthcareLocationsController.getLocations(req, res));

/**
 * GET /api/healthcare/locations/active
 * Get only active locations for dropdowns
 * Note: This must be before /:id route to avoid conflicts
 */
router.get('/active', (req, res) => healthcareLocationsController.getActiveLocations(req, res));

/**
 * GET /api/healthcare/locations/statistics
 * Get location statistics for analytics
 */
router.get('/statistics', (req, res) => healthcareLocationsController.getLocationStatistics(req, res));

/**
 * GET /api/healthcare/locations/:id
 * Get a specific location
 */
router.get('/:id', (req, res) => healthcareLocationsController.getLocationById(req, res));

/**
 * PUT /api/healthcare/locations/:id
 * Update a location
 */
router.put('/:id', (req, res) => healthcareLocationsController.updateLocation(req, res));

/**
 * DELETE /api/healthcare/locations/:id
 * Delete a location
 */
router.delete('/:id', (req, res) => healthcareLocationsController.deleteLocation(req, res));

/**
 * PUT /api/healthcare/locations/:id/set-primary
 * Set a location as primary
 */
router.put('/:id/set-primary', (req, res) => healthcareLocationsController.setPrimaryLocation(req, res));

export default router;


