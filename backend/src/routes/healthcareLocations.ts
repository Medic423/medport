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
 * GET /api/healthcare/locations/all
 * Get ALL locations (TCC command staff only)
 * Must be before / route to avoid conflicts
 */
router.get('/all', async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Only TCC command staff can see all locations
    if (user?.userType !== 'ADMIN' && user?.userType !== 'USER') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. TCC command staff only.' 
      });
    }
    
    console.log('TCC_COMMAND: Fetching all healthcare locations for:', user.email);
    
    const { databaseManager } = require('../services/databaseManager');
    const db = databaseManager.getPrismaClient();
    
    // Include inactive locations so admins can see pending facilities for approval
    // Include healthcareUser to get email address
    const locations = await db.healthcareLocation.findMany({
      include: {
        healthcareUser: {
          select: {
            email: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' }, // Active locations first
        { state: 'asc' },
        { city: 'asc' },
        { locationName: 'asc' }
      ]
    });
    
    console.log('TCC_COMMAND: Found', locations.length, 'active healthcare locations');
    
    res.json({ 
      success: true, 
      data: locations 
    });
  } catch (error) {
    console.error('TCC_COMMAND: Error fetching all healthcare locations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch healthcare locations' 
    });
  }
});

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
 * PUT /api/healthcare/locations/:id/admin
 * Update a location (Admin only - no ownership check)
 */
router.put('/:id/admin', async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Only TCC command staff can update any location
    if (user?.userType !== 'ADMIN' && user?.userType !== 'USER') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. TCC command staff only.' 
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('TCC_COMMAND: Admin updating healthcare location:', id);
    console.log('TCC_COMMAND: Update data received:', JSON.stringify(updateData, null, 2));
    console.log('TCC_COMMAND: isActive value:', updateData.isActive, 'type:', typeof updateData.isActive);
    
    const { databaseManager } = require('../services/databaseManager');
    const db = databaseManager.getPrismaClient();
    
    // Get the location to verify it exists and get healthcareUserId
    const location = await db.healthcareLocation.findUnique({
      where: { id },
      include: {
        healthcareUser: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!location) {
      return res.status(404).json({ 
        success: false,
        error: 'Location not found' 
      });
    }
    
    // For admin updates, directly update the database (bypass ownership check)
    // Auto-geocode if address fields changed but no new coordinates provided
    let latitude = updateData.latitude;
    let longitude = updateData.longitude;
    
    const addressFieldsChanged = updateData.address || updateData.city || updateData.state || updateData.zipCode;
    if (addressFieldsChanged && (!latitude && !longitude)) {
      const { GeocodingService } = require('../utils/geocodingService');
      const address = updateData.address || location.address;
      const city = updateData.city || location.city;
      const state = updateData.state || location.state;
      const zipCode = updateData.zipCode || location.zipCode;
      const locationName = updateData.locationName || location.locationName;
      
      const geocodeResult = await GeocodingService.geocodeAddress(
        address,
        city,
        state,
        zipCode,
        locationName
      );
      
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        updateData.latitude = latitude;
        updateData.longitude = longitude;
      }
    }
    
    // Update the location directly (admin bypass)
    // Ensure isActive is explicitly set as boolean
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date()
    };
    
    // Remove email from location update (it's stored in healthcareUser)
    const { email, ...locationUpdateData } = updatePayload;
    
    // Explicitly handle isActive to ensure it's a boolean
    if ('isActive' in locationUpdateData) {
      locationUpdateData.isActive = Boolean(locationUpdateData.isActive);
      console.log('TCC_COMMAND: Setting isActive to:', locationUpdateData.isActive);
    }
    
    const updatedLocation = await db.healthcareLocation.update({
      where: { id },
      data: locationUpdateData
    });
    
    // Update healthcareUser email if provided
    if (email && email !== location.healthcareUser.email) {
      console.log('TCC_COMMAND: Updating healthcareUser email from', location.healthcareUser.email, 'to', email);
      await db.healthcareUser.update({
        where: { id: location.healthcareUserId },
        data: { email, updatedAt: new Date() }
      });
    }
    
    console.log('TCC_COMMAND: Location updated successfully. New isActive:', updatedLocation.isActive);
    
    res.json({ 
      success: true, 
      data: updatedLocation 
    });
  } catch (error: any) {
    console.error('TCC_COMMAND: Error updating healthcare location:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update healthcare location' 
    });
  }
});

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


