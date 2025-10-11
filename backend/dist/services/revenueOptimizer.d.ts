export interface Unit {
    id: string;
    agencyId: string;
    unitNumber: string;
    type: string;
    capabilities: string[];
    currentStatus: string;
    currentLocation: {
        lat: number;
        lng: number;
    };
    shiftStart: Date;
    shiftEnd: Date;
    isActive: boolean;
}
export interface TransportRequest {
    id: string;
    patientId: string;
    originFacilityId: string;
    destinationFacilityId: string;
    transportLevel: string;
    priority: string;
    status: string;
    specialRequirements: string;
    requestTimestamp: Date;
    readyStart: Date;
    readyEnd: Date;
    originLocation: {
        lat: number;
        lng: number;
    };
    destinationLocation: {
        lat: number;
        lng: number;
    };
    insuranceCompany?: string;
    insurancePayRate?: number;
    perMileRate?: number;
    distanceMiles?: number;
}
export interface BackhaulPair {
    request1: TransportRequest;
    request2: TransportRequest;
    distance: number;
    timeWindow: number;
    revenueBonus: number;
    efficiency: number;
}
export interface OptimizationResult {
    unitId: string;
    assignedRequests: TransportRequest[];
    totalRevenue: number;
    totalDeadheadMiles: number;
    totalWaitTime: number;
    backhaulPairs: BackhaulPair[];
    efficiency: number;
    score: number;
}
export interface OptimizationWeights {
    deadheadMiles: number;
    waitTime: number;
    backhaulBonus: number;
    overtimeRisk: number;
    baseRevenue: number;
}
export declare class RevenueOptimizer {
    private weights;
    private databaseManager;
    constructor(databaseManager: any, customWeights?: Partial<OptimizationWeights>);
    /**
     * Calculate optimization score for a unit-request assignment
     * Formula: score(u, r, t_now) = revenue(r) - α*deadhead_miles - β*wait_time + γ*backhaul_bonus - δ*overtime_risk
     */
    calculateScore(unit: Unit, request: TransportRequest, currentTime: Date): number;
    /**
     * Calculate base revenue for a transport request
     * SIMPLIFIED: Basic revenue calculation for Phase 3
     */
    calculateRevenue(request: TransportRequest): number;
    /**
     * Calculate deadhead miles (empty miles) to reach the request
     */
    calculateDeadheadMiles(unit: Unit, request: TransportRequest): number;
    /**
     * Calculate wait time in minutes
     */
    calculateWaitTime(unit: Unit, request: TransportRequest, currentTime: Date): number;
    /**
     * Calculate backhaul bonus (simplified - will be enhanced by BackhaulDetector)
     */
    calculateBackhaulBonus(unit: Unit, request: TransportRequest): number;
    /**
     * Calculate overtime risk penalty
     */
    calculateOvertimeRisk(unit: Unit, request: TransportRequest, currentTime: Date): number;
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
     * Calculate travel time in minutes (assuming average speed of 30 mph)
     */
    calculateTravelTime(point1: {
        lat: number;
        lng: number;
    }, point2: {
        lat: number;
        lng: number;
    }): number;
    /**
     * Calculate total trip time including pickup and delivery
     */
    calculateTripTime(request: TransportRequest): number;
    /**
     * Convert degrees to radians
     */
    private toRadians;
    /**
     * Get current optimization weights
     */
    getWeights(): OptimizationWeights;
    /**
     * Update optimization weights
     */
    updateWeights(newWeights: Partial<OptimizationWeights>): void;
    /**
     * Validate that a unit can handle a request (capabilities, status, etc.)
     */
    canHandleRequest(unit: Unit, request: TransportRequest): boolean;
    /**
     * Get required capabilities for a transport level
     */
    private getRequiredCapabilities;
}
//# sourceMappingURL=revenueOptimizer.d.ts.map