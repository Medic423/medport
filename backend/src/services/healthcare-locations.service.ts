import { PrismaClient } from '@prisma/client';
import { GeocodingService } from '../utils/geocodingService';

const prisma = new PrismaClient();

interface CreateLocationData {
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  facilityType: string;
  isActive?: boolean;
  isPrimary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface UpdateLocationData {
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  facilityType?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export class HealthcareLocationsService {
  /**
   * Create a new healthcare location
   */
  async createLocation(healthcareUserId: string, locationData: CreateLocationData) {
    console.log('MULTI_LOC: Creating location for user:', healthcareUserId, locationData);

    // If this location is marked as primary, unset any existing primary locations
    if (locationData.isPrimary) {
      await prisma.healthcareLocation.updateMany({
        where: { healthcareUserId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // ✅ NEW: Auto-geocode if coordinates not provided
    let latitude = locationData.latitude;
    let longitude = locationData.longitude;

    if (!latitude || !longitude) {
      console.log('MULTI_LOC: No coordinates provided, attempting geocoding...');
      const geocodeResult = await GeocodingService.geocodeAddress(
        locationData.address,
        locationData.city,
        locationData.state,
        locationData.zipCode,
        locationData.locationName
      );
      
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        console.log('MULTI_LOC: Geocoding successful:', { latitude, longitude });
      } else {
        console.warn('MULTI_LOC: Geocoding failed:', geocodeResult.error);
      }
    }

    const location = await prisma.healthcareLocation.create({
      data: {
        healthcareUserId,
        locationName: locationData.locationName,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zipCode,
        phone: locationData.phone,
        facilityType: locationData.facilityType,
        isActive: locationData.isActive ?? true,
        isPrimary: locationData.isPrimary ?? false,
        latitude: latitude,
        longitude: longitude,
      },
    });

    console.log('MULTI_LOC: Location created successfully:', location.id);
    return location;
  }

  /**
   * Get all locations for a healthcare user
   */
  async getLocationsByUserId(healthcareUserId: string) {
    console.log('MULTI_LOC: Fetching locations for user:', healthcareUserId);

    const locations = await prisma.healthcareLocation.findMany({
      where: { healthcareUserId },
      orderBy: [
        { isPrimary: 'desc' }, // Primary location first
        { locationName: 'asc' }, // Then alphabetically
      ],
    });

    console.log('MULTI_LOC: Found', locations.length, 'locations');
    return locations;
  }

  /**
   * Get only active locations for a healthcare user (for dropdowns)
   */
  async getActiveLocations(healthcareUserId: string) {
    console.log('MULTI_LOC: Fetching active locations for user:', healthcareUserId);

    const locations = await prisma.healthcareLocation.findMany({
      where: {
        healthcareUserId,
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { locationName: 'asc' },
      ],
    });

    console.log('MULTI_LOC: Found', locations.length, 'active locations');
    return locations;
  }

  /**
   * Get a specific location by ID
   */
  async getLocationById(locationId: string, healthcareUserId: string) {
    console.log('MULTI_LOC: Fetching location:', locationId, 'for user:', healthcareUserId);

    const location = await prisma.healthcareLocation.findFirst({
      where: {
        id: locationId,
        healthcareUserId, // Ensure user can only access their own locations
      },
    });

    if (!location) {
      throw new Error('Location not found or access denied');
    }

    return location;
  }

  /**
   * Update a location
   */
  async updateLocation(
    locationId: string,
    healthcareUserId: string,
    updateData: UpdateLocationData
  ) {
    console.log('MULTI_LOC: Updating location:', locationId, updateData);

    // Verify ownership
    await this.getLocationById(locationId, healthcareUserId);

    // If setting as primary, unset other primary locations
    if (updateData.isPrimary) {
      await prisma.healthcareLocation.updateMany({
        where: {
          healthcareUserId,
          isPrimary: true,
          id: { not: locationId },
        },
        data: { isPrimary: false },
      });
    }

    // ✅ NEW: Auto-geocode if address fields changed but no new coordinates provided
    let latitude = updateData.latitude;
    let longitude = updateData.longitude;

    // Check if address fields are being updated
    const addressFieldsChanged = updateData.address || updateData.city || updateData.state || updateData.zipCode;
    
    if (addressFieldsChanged && (!latitude && !longitude)) {
      // Fetch existing values to build complete address
      const existing = await this.getLocationById(locationId, healthcareUserId);
      const address = updateData.address || existing.address;
      const city = updateData.city || existing.city;
      const state = updateData.state || existing.state;
      const zipCode = updateData.zipCode || existing.zipCode;
      const locationName = updateData.locationName || existing.locationName;

      console.log('MULTI_LOC: Address fields changed, attempting geocoding...');
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
        console.log('MULTI_LOC: Geocoding successful:', { latitude, longitude });
        // Add to updateData so it gets saved
        updateData.latitude = latitude;
        updateData.longitude = longitude;
      } else {
        console.warn('MULTI_LOC: Geocoding failed:', geocodeResult.error);
      }
    }

    const location = await prisma.healthcareLocation.update({
      where: { id: locationId },
      data: updateData,
    });

    console.log('MULTI_LOC: Location updated successfully');
    return location;
  }

  /**
   * Delete a location (with validation)
   */
  async deleteLocation(locationId: string, healthcareUserId: string) {
    console.log('MULTI_LOC: Deleting location:', locationId);

    // Verify ownership
    await this.getLocationById(locationId, healthcareUserId);

    // Check if there are any trips associated with this location
    const tripsCount = await prisma.transportRequest.count({
      where: { fromLocationId: locationId },
    });

    if (tripsCount > 0) {
      throw new Error(
        `Cannot delete location. There are ${tripsCount} trip(s) associated with this location.`
      );
    }

    await prisma.healthcareLocation.delete({
      where: { id: locationId },
    });

    console.log('MULTI_LOC: Location deleted successfully');
    return { success: true, message: 'Location deleted successfully' };
  }

  /**
   * Set a location as primary
   */
  async setPrimaryLocation(locationId: string, healthcareUserId: string) {
    console.log('MULTI_LOC: Setting location as primary:', locationId);

    // Verify ownership
    await this.getLocationById(locationId, healthcareUserId);

    // Unset all other primary locations for this user
    await prisma.healthcareLocation.updateMany({
      where: {
        healthcareUserId,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    // Set this location as primary
    const location = await prisma.healthcareLocation.update({
      where: { id: locationId },
      data: { isPrimary: true },
    });

    console.log('MULTI_LOC: Primary location set successfully');
    return location;
  }

  /**
   * Get location statistics for analytics
   */
  async getLocationStatistics(healthcareUserId: string) {
    const locations = await this.getLocationsByUserId(healthcareUserId);
    
    const statistics = await Promise.all(
      locations.map(async (location) => {
        const tripCount = await prisma.transportRequest.count({
          where: { fromLocationId: location.id },
        });

        const pendingTrips = await prisma.transportRequest.count({
          where: {
            fromLocationId: location.id,
            status: 'PENDING',
          },
        });

        const completedTrips = await prisma.transportRequest.count({
          where: {
            fromLocationId: location.id,
            status: 'COMPLETED',
          },
        });

        return {
          ...location,
          statistics: {
            totalTrips: tripCount,
            pendingTrips,
            completedTrips,
          },
        };
      })
    );

    return statistics;
  }
}

export const healthcareLocationsService = new HealthcareLocationsService();

