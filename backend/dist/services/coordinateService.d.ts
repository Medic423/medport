export interface LocationData {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
}
export declare class CoordinateService {
    private coordinateCache;
    private cacheExpiry;
    private cacheTimestamps;
    /**
     * Get coordinates for a facility by ID
     */
    getFacilityCoordinates(facilityId: string): Promise<LocationData | null>;
    /**
     * Get coordinates for multiple facilities
     */
    getFacilitiesCoordinates(facilityIds: string[]): Promise<Map<string, LocationData>>;
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in miles
     */
    calculateDistance(point1: LocationData, point2: LocationData): number;
    /**
     * Check if cache entry is still valid
     */
    private isCacheValid;
    /**
     * Clear coordinate cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        entries: string[];
    };
    /**
     * Convert degrees to radians
     */
    private toRadians;
    /**
     * Get default coordinates (fallback)
     */
    getDefaultCoordinates(): LocationData;
    /**
     * Check if coordinates are valid
     */
    isValidCoordinates(lat: number, lng: number): boolean;
}
export declare const coordinateService: CoordinateService;
export default coordinateService;
//# sourceMappingURL=coordinateService.d.ts.map