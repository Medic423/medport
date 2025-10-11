import { Unit, TransportRequest, BackhaulPair } from './revenueOptimizer';
import { RevenueOptimizer } from './revenueOptimizer';
import { BackhaulDetector } from './backhaulDetector';
export interface MultiUnitOptimizationResult {
    totalRevenue: number;
    totalDeadheadMiles: number;
    totalWaitTime: number;
    totalEfficiency: number;
    unitAssignments: Array<{
        unitId: string;
        unitNumber: string;
        assignedRequests: TransportRequest[];
        revenue: number;
        deadheadMiles: number;
        waitTime: number;
        efficiency: number;
        score: number;
    }>;
    backhaulPairs: BackhaulPair[];
    globalOptimization: {
        loadedMileRatio: number;
        revenuePerUnitHour: number;
        pairedTripsPercentage: number;
        averageResponseTime: number;
    };
}
export interface MultiUnitConstraints {
    maxUnitsPerRequest: number;
    maxRequestsPerUnit: number;
    maxTotalDeadheadMiles: number;
    maxTotalWaitTime: number;
    requireBackhaulOptimization: boolean;
    minEfficiencyThreshold: number;
}
export declare class MultiUnitOptimizer {
    private revenueOptimizer;
    private backhaulDetector;
    private constraints;
    constructor(revenueOptimizer: RevenueOptimizer, backhaulDetector: BackhaulDetector, constraints?: Partial<MultiUnitConstraints>);
    /**
     * Optimize assignments across multiple units
     */
    optimizeMultiUnit(units: Unit[], requests: TransportRequest[], currentTime?: Date): Promise<MultiUnitOptimizationResult>;
    /**
     * Create optimization matrix for all unit-request combinations
     */
    private createOptimizationMatrix;
    /**
     * Optimize with backhaul consideration
     */
    private optimizeWithBackhaul;
    /**
     * Optimize without backhaul consideration
     */
    private optimizeWithoutBackhaul;
    /**
     * Calculate assignment efficiency
     */
    private calculateAssignmentEfficiency;
    /**
     * Calculate loaded miles for requests
     */
    private calculateLoadedMilesForRequests;
    /**
     * Calculate loaded miles for assignments
     */
    private calculateLoadedMiles;
    /**
     * Calculate total hours for assignments
     */
    private calculateTotalHours;
    /**
     * Calculate paired trips percentage
     */
    private calculatePairedTripsPercentage;
    /**
     * Calculate average response time
     */
    private calculateAverageResponseTime;
    /**
     * Update constraints
     */
    updateConstraints(newConstraints: Partial<MultiUnitConstraints>): void;
    /**
     * Get current constraints
     */
    getConstraints(): MultiUnitConstraints;
}
//# sourceMappingURL=multiUnitOptimizer.d.ts.map