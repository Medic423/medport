"use strict";
/**
 * Distance Calculation Service
 * Calculates distances between hospitals and EMS agencies for filtering
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceService = void 0;
class DistanceService {
    /**
     * Calculate distance between two points using Haversine formula
     * @param point1 First location
     * @param point2 Second location
     * @returns Distance in miles
     */
    static calculateDistance(point1, point2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(point2.latitude - point1.latitude);
        const dLon = this.toRadians(point2.longitude - point1.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Convert degrees to radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Filter agencies within specified radius
     * @param hospitalLocation Hospital location
     * @param agencies Array of agencies with location data
     * @param radiusMiles Radius in miles (default: 100)
     * @returns Agencies within radius, sorted by distance
     */
    static filterAgenciesByDistance(hospitalLocation, agencies, radiusMiles = 100) {
        return agencies
            .filter(agency => agency.latitude !== null &&
            agency.longitude !== null &&
            agency.availableUnits > 0)
            .map(agency => {
            const distance = this.calculateDistance(hospitalLocation, { latitude: agency.latitude, longitude: agency.longitude });
            return {
                id: agency.id,
                name: agency.name,
                distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
                availableUnits: agency.availableUnits,
                totalUnits: agency.totalUnits,
                capabilities: agency.capabilities,
                contactInfo: {
                    phone: agency.phone,
                    email: agency.email,
                    city: agency.city,
                    state: agency.state
                }
            };
        })
            .filter(agency => agency.distance <= radiusMiles)
            .sort((a, b) => a.distance - b.distance);
    }
    /**
     * Get agencies within radius for a specific hospital
     * @param hospitalId Hospital ID
     * @param radiusMiles Radius in miles
     * @returns Promise of agencies within radius
     */
    static async getAgenciesForHospital(hospitalId, radiusMiles = 100) {
        // This would be implemented with actual database queries
        // For now, returning empty array as placeholder
        return [];
    }
}
exports.DistanceService = DistanceService;
//# sourceMappingURL=distanceService.js.map