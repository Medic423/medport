/**
 * Distance Calculation Service
 * Calculates distances between hospitals and EMS agencies for filtering
 */
export interface Location {
    latitude: number;
    longitude: number;
}
export interface AgencyWithDistance {
    id: string;
    name: string;
    distance: number;
    availableUnits: number;
    totalUnits: number;
    capabilities: string[];
    contactInfo: {
        phone: string;
        email: string;
        city: string;
        state: string;
    };
}
export declare class DistanceService {
    /**
     * Calculate distance between two points using Haversine formula
     * @param point1 First location
     * @param point2 Second location
     * @returns Distance in miles
     */
    static calculateDistance(point1: Location, point2: Location): number;
    /**
     * Convert degrees to radians
     */
    private static toRadians;
    /**
     * Filter agencies within specified radius
     * @param hospitalLocation Hospital location
     * @param agencies Array of agencies with location data
     * @param radiusMiles Radius in miles (default: 100)
     * @returns Agencies within radius, sorted by distance
     */
    static filterAgenciesByDistance(hospitalLocation: Location, agencies: Array<{
        id: string;
        name: string;
        latitude: number | null;
        longitude: number | null;
        availableUnits: number;
        totalUnits: number;
        capabilities: string[];
        phone: string;
        email: string;
        city: string;
        state: string;
    }>, radiusMiles?: number): AgencyWithDistance[];
    /**
     * Get agencies within radius for a specific hospital
     * @param hospitalId Hospital ID
     * @param radiusMiles Radius in miles
     * @returns Promise of agencies within radius
     */
    static getAgenciesForHospital(hospitalId: string, radiusMiles?: number): Promise<AgencyWithDistance[]>;
}
//# sourceMappingURL=distanceService.d.ts.map