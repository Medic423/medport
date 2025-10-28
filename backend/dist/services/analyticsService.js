"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const databaseManager_1 = require("./databaseManager");
/**
 * SIMPLIFIED: Analytics Service for Phase 3
 * Focuses on basic metrics only - complex financial calculations removed
 */
class AnalyticsService {
    async getSystemOverview() {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        try {
            const [totalTrips, totalHospitals, activeHospitals, totalAgencies, activeAgencies, totalUnits, activeUnits] = await Promise.all([
                prisma.transportRequest.count(),
                prisma.hospital.count(),
                prisma.hospital.count({ where: { isActive: true } }),
                prisma.eMSAgency.count(),
                prisma.eMSAgency.count({ where: { isActive: true } }),
                prisma.unit.count(),
                prisma.unit.count({ where: { isActive: true } })
            ]);
            return {
                totalTrips,
                totalHospitals,
                totalAgencies,
                totalFacilities: totalHospitals, // Using hospitals as facilities count
                activeHospitals,
                activeAgencies,
                activeFacilities: activeHospitals, // Using active hospitals as active facilities
                totalUnits,
                activeUnits
            };
        }
        catch (error) {
            console.error('Error getting system overview:', error);
            return {
                totalTrips: 0,
                totalHospitals: 0,
                totalAgencies: 0,
                totalFacilities: 0,
                activeHospitals: 0,
                activeAgencies: 0,
                activeFacilities: 0,
                totalUnits: 0,
                activeUnits: 0
            };
        }
    }
    async getTripStatistics() {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        try {
            const [totalTrips, pendingTrips, acceptedTrips, completedTrips, cancelledTrips] = await Promise.all([
                prisma.transportRequest.count(),
                prisma.transportRequest.count({ where: { status: 'PENDING' } }),
                prisma.transportRequest.count({ where: { status: 'ACCEPTED' } }),
                prisma.transportRequest.count({ where: { status: 'COMPLETED' } }),
                prisma.transportRequest.count({ where: { status: 'CANCELLED' } })
            ]);
            // SIMPLIFIED: Basic grouping by transport level and priority
            const tripsByLevel = await prisma.transportRequest.groupBy({
                by: ['transportLevel'],
                _count: true
            });
            const tripsByPriority = await prisma.transportRequest.groupBy({
                by: ['priority'],
                _count: true
            });
            const tripsByLevelFormatted = tripsByLevel.reduce((acc, item) => {
                acc[item.transportLevel] = item._count;
                return acc;
            }, {});
            const tripsByPriorityFormatted = tripsByPriority.reduce((acc, item) => {
                acc[item.priority] = item._count;
                return acc;
            }, {});
            return {
                totalTrips,
                pendingTrips,
                acceptedTrips,
                completedTrips,
                cancelledTrips,
                tripsByLevel: tripsByLevelFormatted,
                tripsByPriority: tripsByPriorityFormatted
            };
        }
        catch (error) {
            console.error('Error getting trip statistics:', error);
            return {
                totalTrips: 0,
                pendingTrips: 0,
                acceptedTrips: 0,
                completedTrips: 0,
                cancelledTrips: 0,
                tripsByLevel: {},
                tripsByPriority: {}
            };
        }
    }
    async getAgencyPerformance() {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        try {
            const agencies = await prisma.eMSAgency.findMany({
                where: { isActive: true },
                include: {
                    units: {
                        where: { isActive: true }
                    }
                }
            });
            const performanceData = [];
            for (const agency of agencies) {
                const [totalTrips, completedTrips] = await Promise.all([
                    prisma.transportRequest.count({ where: { assignedAgencyId: agency.id } }),
                    prisma.transportRequest.count({ where: { assignedAgencyId: agency.id, status: 'COMPLETED' } })
                ]);
                const completionRate = totalTrips > 0 ? completedTrips / totalTrips : 0;
                const activeUnits = agency.units.length;
                performanceData.push({
                    agencyId: agency.id,
                    agencyName: agency.name,
                    totalTrips,
                    completedTrips,
                    completionRate,
                    activeUnits
                });
            }
            return performanceData;
        }
        catch (error) {
            console.error('Error getting agency performance:', error);
            return [];
        }
    }
    async getHospitalActivity() {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        try {
            const facilities = await prisma.facility.findMany({
                where: { isActive: true }
            });
            const activityData = [];
            for (const facility of facilities) {
                const [totalRequests, lastTrip] = await Promise.all([
                    prisma.transportRequest.count({ where: { originFacilityId: facility.id } }),
                    prisma.transportRequest.findFirst({
                        where: { originFacilityId: facility.id },
                        orderBy: { createdAt: 'desc' },
                        select: { createdAt: true }
                    })
                ]);
                activityData.push({
                    hospitalId: facility.id,
                    hospitalName: facility.name,
                    totalRequests,
                    lastActivity: lastTrip?.createdAt || null
                });
            }
            return activityData;
        }
        catch (error) {
            console.error('Error getting hospital activity:', error);
            return [];
        }
    }
    // SIMPLIFIED: Commented out complex cost analysis methods for Phase 3
    /*
    async getTripCostBreakdowns(tripId?: string, limit: number = 100): Promise<any[]> {
      // Complex cost breakdown analysis - disabled for Phase 3
    }
  
    async getCostAnalysisSummary(startDate?: Date, endDate?: Date): Promise<any> {
      // Complex cost analysis - disabled for Phase 3
    }
  
    async getProfitabilityAnalysis(period: string = 'month'): Promise<any> {
      // Complex profitability analysis - disabled for Phase 3
    }
    */
    // SIMPLIFIED: Basic methods that return minimal data
    async getTripCostBreakdowns(tripId, limit = 100) {
        console.log('TCC_DEBUG: Simplified getTripCostBreakdowns called - complex cost analysis disabled for Phase 3');
        return [];
    }
    async getCostAnalysisSummary(startDate, endDate) {
        console.log('TCC_DEBUG: Simplified getCostAnalysisSummary called - complex cost analysis disabled for Phase 3');
        return {
            totalTrips: 0,
            message: 'Simplified cost analysis - complex calculations removed for Phase 3'
        };
    }
    async getProfitabilityAnalysis(period = 'month') {
        console.log('TCC_DEBUG: Simplified getProfitabilityAnalysis called - complex profitability analysis disabled for Phase 3');
        return {
            period,
            message: 'Simplified profitability analysis - complex calculations removed for Phase 3'
        };
    }
    // SIMPLIFIED: Basic trip cost breakdown creation
    async createTripCostBreakdown(tripId, breakdownData) {
        console.log('TCC_DEBUG: Simplified createTripCostBreakdown called - complex cost analysis disabled for Phase 3');
        return {
            tripId,
            message: 'Simplified cost breakdown creation - complex calculations removed for Phase 3'
        };
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
exports.default = exports.analyticsService;
//# sourceMappingURL=analyticsService.js.map