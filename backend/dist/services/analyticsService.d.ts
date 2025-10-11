interface SystemOverview {
    totalTrips: number;
    totalHospitals: number;
    totalAgencies: number;
    totalFacilities: number;
    activeHospitals: number;
    activeAgencies: number;
    activeFacilities: number;
    totalUnits: number;
    activeUnits: number;
}
interface TripStatistics {
    totalTrips: number;
    pendingTrips: number;
    acceptedTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    tripsByLevel: Record<string, number>;
    tripsByPriority: Record<string, number>;
}
interface AgencyPerformance {
    agencyId: string;
    agencyName: string;
    totalTrips: number;
    completedTrips: number;
    completionRate: number;
    activeUnits: number;
}
interface HospitalActivity {
    hospitalId: string;
    hospitalName: string;
    totalRequests: number;
    lastActivity: Date | null;
}
/**
 * SIMPLIFIED: Analytics Service for Phase 3
 * Focuses on basic metrics only - complex financial calculations removed
 */
export declare class AnalyticsService {
    getSystemOverview(): Promise<SystemOverview>;
    getTripStatistics(): Promise<TripStatistics>;
    getAgencyPerformance(): Promise<AgencyPerformance[]>;
    getHospitalActivity(): Promise<HospitalActivity[]>;
    getTripCostBreakdowns(tripId?: string, limit?: number): Promise<any[]>;
    getCostAnalysisSummary(startDate?: Date, endDate?: Date): Promise<any>;
    getProfitabilityAnalysis(period?: string): Promise<any>;
    createTripCostBreakdown(tripId: string, breakdownData: any): Promise<any>;
}
export declare const analyticsService: AnalyticsService;
export default analyticsService;
//# sourceMappingURL=analyticsService.d.ts.map