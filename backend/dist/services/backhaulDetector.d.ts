import { TransportRequest, BackhaulPair } from './revenueOptimizer';
export declare class BackhaulDetector {
    private maxTimeWindow;
    private maxDistance;
    private revenueBonus;
    constructor(maxTimeWindow?: number, // 90 minutes as per reference documents
    maxDistance?: number, // 15 miles as per reference documents
    revenueBonus?: number);
    /**
     * Find all possible backhaul pairs from a list of requests
     */
    findPairs(requests: TransportRequest[]): BackhaulPair[];
    /**
     * Create a backhaul pair from two requests
     */
    private createPair;
    /**
     * Validate if a pair meets backhaul criteria
     */
    isValidPair(pair: BackhaulPair): boolean;
    /**
     * Check if two requests have compatible transport levels
     */
    private hasCompatibleTransportLevels;
    /**
     * Calculate distance between two points using Haversine formula
     */
    calculateDistance(point1: {
        lat: number;
        lng: number;
    }, point2: {
        lat: number;
        lng: number;
    }): number;
    /**
     * Calculate time window between two requests
     */
    private calculateTimeWindow;
    /**
     * Check if this is a return trip scenario (destination of one matches origin of another)
     */
    private isReturnTripScenario;
    /**
     * Check if two locations match (within 1 mile tolerance for GPS precision)
     */
    private locationsMatch;
    /**
     * Calculate efficiency score for a backhaul pair
     * Higher efficiency = better pairing
     */
    private calculateEfficiency;
    /**
     * Calculate priority score for a pair
     */
    private calculatePriorityScore;
    /**
     * Calculate revenue score for a pair
     */
    private calculateRevenueScore;
    /**
     * Find the best backhaul pairs for a specific request
     */
    findBestPairsForRequest(request: TransportRequest, allRequests: TransportRequest[]): BackhaulPair[];
    /**
     * Find return trip opportunities for a specific request
     * This looks for requests that would bring the unit back to the original area
     */
    findReturnTripOpportunities(request: TransportRequest, allRequests: TransportRequest[]): BackhaulPair[];
    /**
     * Find all return trip opportunities in the system
     * This is specifically for scenarios like Altoona → Pittsburgh → Altoona
     */
    findAllReturnTripOpportunities(allRequests: TransportRequest[]): BackhaulPair[];
    /**
     * Calculate potential revenue increase from backhaul pairing
     */
    calculatePairingRevenue(pair: BackhaulPair): number;
    /**
     * Calculate base revenue for a request
     */
    private calculateBaseRevenue;
    /**
     * Get statistics about backhaul opportunities
     */
    getBackhaulStatistics(requests: TransportRequest[]): {
        totalRequests: number;
        possiblePairs: number;
        validPairs: number;
        averageEfficiency: number;
        potentialRevenueIncrease: number;
    };
    /**
     * Convert degrees to radians
     */
    private toRadians;
    /**
     * Update detection parameters
     */
    updateParameters(maxTimeWindow?: number, maxDistance?: number, revenueBonus?: number): void;
    /**
     * Get current parameters
     */
    getParameters(): {
        maxTimeWindow: number;
        maxDistance: number;
        revenueBonus: number;
    };
}
//# sourceMappingURL=backhaulDetector.d.ts.map