"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthcareLocationsService = exports.HealthcareLocationsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class HealthcareLocationsService {
    /**
     * Create a new healthcare location
     */
    async createLocation(healthcareUserId, locationData) {
        console.log('MULTI_LOC: Creating location for user:', healthcareUserId, locationData);
        // If this location is marked as primary, unset any existing primary locations
        if (locationData.isPrimary) {
            await prisma.healthcareLocation.updateMany({
                where: { healthcareUserId, isPrimary: true },
                data: { isPrimary: false },
            });
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
            },
        });
        console.log('MULTI_LOC: Location created successfully:', location.id);
        return location;
    }
    /**
     * Get all locations for a healthcare user
     */
    async getLocationsByUserId(healthcareUserId) {
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
    async getActiveLocations(healthcareUserId) {
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
    async getLocationById(locationId, healthcareUserId) {
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
    async updateLocation(locationId, healthcareUserId, updateData) {
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
    async deleteLocation(locationId, healthcareUserId) {
        console.log('MULTI_LOC: Deleting location:', locationId);
        // Verify ownership
        await this.getLocationById(locationId, healthcareUserId);
        // Check if there are any trips associated with this location
        const tripsCount = await prisma.transportRequest.count({
            where: { fromLocationId: locationId },
        });
        if (tripsCount > 0) {
            throw new Error(`Cannot delete location. There are ${tripsCount} trip(s) associated with this location.`);
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
    async setPrimaryLocation(locationId, healthcareUserId) {
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
    async getLocationStatistics(healthcareUserId) {
        const locations = await this.getLocationsByUserId(healthcareUserId);
        const statistics = await Promise.all(locations.map(async (location) => {
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
        }));
        return statistics;
    }
}
exports.HealthcareLocationsService = HealthcareLocationsService;
exports.healthcareLocationsService = new HealthcareLocationsService();
//# sourceMappingURL=healthcare-locations.service.js.map