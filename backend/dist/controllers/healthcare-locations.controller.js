"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthcareLocationsController = exports.HealthcareLocationsController = void 0;
const healthcare_locations_service_1 = require("../services/healthcare-locations.service");
class HealthcareLocationsController {
    /**
     * POST /api/healthcare/locations
     * Create a new location
     */
    async createLocation(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { locationName, address, city, state, zipCode, phone, facilityType, isActive, isPrimary, } = req.body;
            // Validation
            if (!locationName || !address || !city || !state || !zipCode || !facilityType) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['locationName', 'address', 'city', 'state', 'zipCode', 'facilityType'],
                });
            }
            const location = await healthcare_locations_service_1.healthcareLocationsService.createLocation(healthcareUserId, {
                locationName,
                address,
                city,
                state,
                zipCode,
                phone,
                facilityType,
                isActive,
                isPrimary,
            });
            res.status(201).json(location);
        }
        catch (error) {
            console.error('MULTI_LOC: Error creating location:', error);
            res.status(500).json({ error: 'Failed to create location' });
        }
    }
    /**
     * GET /api/healthcare/locations
     * Get all locations for the logged-in user
     */
    async getLocations(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const locations = await healthcare_locations_service_1.healthcareLocationsService.getLocationsByUserId(healthcareUserId);
            res.json({ success: true, data: locations });
        }
        catch (error) {
            console.error('MULTI_LOC: Error fetching locations:', error);
            res.status(500).json({ error: 'Failed to fetch locations' });
        }
    }
    /**
     * GET /api/healthcare/locations/active
     * Get only active locations for dropdowns
     */
    async getActiveLocations(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const locations = await healthcare_locations_service_1.healthcareLocationsService.getActiveLocations(healthcareUserId);
            res.json({ success: true, data: locations });
        }
        catch (error) {
            console.error('MULTI_LOC: Error fetching active locations:', error);
            res.status(500).json({ error: 'Failed to fetch active locations' });
        }
    }
    /**
     * GET /api/healthcare/locations/statistics
     * Get location statistics for analytics
     */
    async getLocationStatistics(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const statistics = await healthcare_locations_service_1.healthcareLocationsService.getLocationStatistics(healthcareUserId);
            res.json(statistics);
        }
        catch (error) {
            console.error('MULTI_LOC: Error fetching location statistics:', error);
            res.status(500).json({ error: 'Failed to fetch location statistics' });
        }
    }
    /**
     * GET /api/healthcare/locations/:id
     * Get a specific location
     */
    async getLocationById(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            const { id } = req.params;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const location = await healthcare_locations_service_1.healthcareLocationsService.getLocationById(id, healthcareUserId);
            res.json(location);
        }
        catch (error) {
            console.error('MULTI_LOC: Error fetching location:', error);
            if (error.message === 'Location not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to fetch location' });
        }
    }
    /**
     * PUT /api/healthcare/locations/:id
     * Update a location
     */
    async updateLocation(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            const { id } = req.params;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const updateData = req.body;
            const location = await healthcare_locations_service_1.healthcareLocationsService.updateLocation(id, healthcareUserId, updateData);
            res.json(location);
        }
        catch (error) {
            console.error('MULTI_LOC: Error updating location:', error);
            if (error.message === 'Location not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to update location' });
        }
    }
    /**
     * DELETE /api/healthcare/locations/:id
     * Delete a location
     */
    async deleteLocation(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            const { id } = req.params;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await healthcare_locations_service_1.healthcareLocationsService.deleteLocation(id, healthcareUserId);
            res.json(result);
        }
        catch (error) {
            console.error('MULTI_LOC: Error deleting location:', error);
            if (error.message?.includes('Cannot delete location')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message === 'Location not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to delete location' });
        }
    }
    /**
     * PUT /api/healthcare/locations/:id/set-primary
     * Set a location as primary
     */
    async setPrimaryLocation(req, res) {
        try {
            const healthcareUserId = req.user?.id;
            const { id } = req.params;
            if (!healthcareUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const location = await healthcare_locations_service_1.healthcareLocationsService.setPrimaryLocation(id, healthcareUserId);
            res.json(location);
        }
        catch (error) {
            console.error('MULTI_LOC: Error setting primary location:', error);
            if (error.message === 'Location not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to set primary location' });
        }
    }
}
exports.HealthcareLocationsController = HealthcareLocationsController;
exports.healthcareLocationsController = new HealthcareLocationsController();
//# sourceMappingURL=healthcare-locations.controller.js.map