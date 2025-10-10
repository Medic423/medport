import { Request, Response } from 'express';
import { healthcareLocationsService } from '../services/healthcare-locations.service';

export class HealthcareLocationsController {
  /**
   * POST /api/healthcare/locations
   * Create a new location
   */
  async createLocation(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        locationName,
        address,
        city,
        state,
        zipCode,
        phone,
        facilityType,
        isActive,
        isPrimary,
      } = req.body;

      // Validation
      if (!locationName || !address || !city || !state || !zipCode || !facilityType) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['locationName', 'address', 'city', 'state', 'zipCode', 'facilityType'],
        });
      }

      const location = await healthcareLocationsService.createLocation(healthcareUserId, {
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
    } catch (error) {
      console.error('MULTI_LOC: Error creating location:', error);
      res.status(500).json({ error: 'Failed to create location' });
    }
  }

  /**
   * GET /api/healthcare/locations
   * Get all locations for the logged-in user
   */
  async getLocations(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const locations = await healthcareLocationsService.getLocationsByUserId(healthcareUserId);
      res.json({ success: true, data: locations });
    } catch (error) {
      console.error('MULTI_LOC: Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  }

  /**
   * GET /api/healthcare/locations/active
   * Get only active locations for dropdowns
   */
  async getActiveLocations(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const locations = await healthcareLocationsService.getActiveLocations(healthcareUserId);
      res.json({ success: true, data: locations });
    } catch (error) {
      console.error('MULTI_LOC: Error fetching active locations:', error);
      res.status(500).json({ error: 'Failed to fetch active locations' });
    }
  }

  /**
   * GET /api/healthcare/locations/statistics
   * Get location statistics for analytics
   */
  async getLocationStatistics(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const statistics = await healthcareLocationsService.getLocationStatistics(healthcareUserId);
      res.json(statistics);
    } catch (error) {
      console.error('MULTI_LOC: Error fetching location statistics:', error);
      res.status(500).json({ error: 'Failed to fetch location statistics' });
    }
  }

  /**
   * GET /api/healthcare/locations/:id
   * Get a specific location
   */
  async getLocationById(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;
      const { id } = req.params;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const location = await healthcareLocationsService.getLocationById(id, healthcareUserId);
      res.json(location);
    } catch (error: any) {
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
  async updateLocation(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;
      const { id } = req.params;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateData = req.body;
      const location = await healthcareLocationsService.updateLocation(
        id,
        healthcareUserId,
        updateData
      );

      res.json(location);
    } catch (error: any) {
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
  async deleteLocation(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;
      const { id } = req.params;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await healthcareLocationsService.deleteLocation(id, healthcareUserId);
      res.json(result);
    } catch (error: any) {
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
  async setPrimaryLocation(req: Request, res: Response) {
    try {
      const healthcareUserId = (req as any).user?.id;
      const { id } = req.params;

      if (!healthcareUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const location = await healthcareLocationsService.setPrimaryLocation(id, healthcareUserId);
      res.json(location);
    } catch (error: any) {
      console.error('MULTI_LOC: Error setting primary location:', error);
      if (error.message === 'Location not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to set primary location' });
    }
  }
}

export const healthcareLocationsController = new HealthcareLocationsController();

