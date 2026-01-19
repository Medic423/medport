import { databaseManager } from './databaseManager';
import { Prisma } from '@prisma/client';

// SIMPLIFIED: Basic interfaces for Phase 3 simplification
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

interface AccountStatistics {
  newFacilitiesLast60Days: number;
  newAgenciesLast60Days: number;
  newFacilitiesLast90Days: number;
  newAgenciesLast90Days: number;
}

/**
 * SIMPLIFIED: Analytics Service for Phase 3
 * Focuses on basic metrics only - complex financial calculations removed
 */
export class AnalyticsService {
  
  async getSystemOverview(): Promise<SystemOverview> {
    const prisma = databaseManager.getPrismaClient();
    
    try {
      const [
        activeTrips,
        totalHospitals,
        activeHospitals,
        totalAgencies,
        activeAgencies,
        totalUnits,
        activeUnits
      ] = await Promise.all([
        // Count only active trips: exclude COMPLETED, HEALTHCARE_COMPLETED, and CANCELLED
        prisma.transportRequest.count({
          where: {
            status: {
              notIn: ['COMPLETED', 'HEALTHCARE_COMPLETED', 'CANCELLED']
            }
          }
        }),
        prisma.hospital.count(),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.eMSAgency.count(),
        prisma.eMSAgency.count({ where: { isActive: true } }),
        prisma.unit.count(),
        prisma.unit.count({ where: { isActive: true } })
      ]);

      return {
        totalTrips: activeTrips, // Return active trips count instead of total
        totalHospitals,
        totalAgencies,
        totalFacilities: totalHospitals, // Using hospitals as facilities count
        activeHospitals,
        activeAgencies,
        activeFacilities: activeHospitals, // Using active hospitals as active facilities
        totalUnits,
        activeUnits
      };
    } catch (error) {
      console.error('Error getting system overview:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      // Return zeros but log the actual error for debugging
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

  async getTripStatistics(): Promise<TripStatistics> {
    const prisma = databaseManager.getPrismaClient();

    try {
      const [
        totalTrips,
        pendingTrips,
        acceptedTrips,
        completedTrips,
        cancelledTrips
      ] = await Promise.all([
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
      }, {} as Record<string, number>);

      const tripsByPriorityFormatted = tripsByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTrips,
        pendingTrips,
        acceptedTrips,
        completedTrips,
        cancelledTrips,
        tripsByLevel: tripsByLevelFormatted,
        tripsByPriority: tripsByPriorityFormatted
      };
    } catch (error) {
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

  async getAgencyPerformance(): Promise<AgencyPerformance[]> {
    const prisma = databaseManager.getPrismaClient();

    try {
      const agencies = await prisma.eMSAgency.findMany({
        where: { isActive: true },
        include: {
          units: {
            where: { isActive: true }
          }
        }
      });

      const performanceData: AgencyPerformance[] = [];

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
    } catch (error) {
      console.error('Error getting agency performance:', error);
      return [];
    }
  }

  async getHospitalActivity(): Promise<HospitalActivity[]> {
    const prisma = databaseManager.getPrismaClient();

    try {
      const facilities = await prisma.facility.findMany({
        where: { isActive: true }
      });

      const activityData: HospitalActivity[] = [];

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
    } catch (error) {
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
  async getTripCostBreakdowns(tripId?: string, limit: number = 100): Promise<any[]> {
    console.log('TCC_DEBUG: Simplified getTripCostBreakdowns called - complex cost analysis disabled for Phase 3');
    return [];
  }

  async getCostAnalysisSummary(startDate?: Date, endDate?: Date): Promise<any> {
    console.log('TCC_DEBUG: Simplified getCostAnalysisSummary called - complex cost analysis disabled for Phase 3');
    return {
      totalTrips: 0,
      message: 'Simplified cost analysis - complex calculations removed for Phase 3'
    };
  }

  async getProfitabilityAnalysis(period: string = 'month'): Promise<any> {
    console.log('TCC_DEBUG: Simplified getProfitabilityAnalysis called - complex profitability analysis disabled for Phase 3');
    return {
      period,
      message: 'Simplified profitability analysis - complex calculations removed for Phase 3'
    };
  }

  // SIMPLIFIED: Basic trip cost breakdown creation
  async createTripCostBreakdown(tripId: string, breakdownData: any): Promise<any> {
    console.log('TCC_DEBUG: Simplified createTripCostBreakdown called - complex cost analysis disabled for Phase 3');
    return {
      tripId,
      message: 'Simplified cost breakdown creation - complex calculations removed for Phase 3'
    };
  }

  /**
   * Get account creation statistics
   * Returns counts of new accounts created in last 60 and 90 days
   */
  async getAccountStatistics(): Promise<AccountStatistics> {
    const prisma = databaseManager.getPrismaClient();
    
    try {
      const now = new Date();
      const days60Ago = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const days90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const [
        facilities60,
        facilities90,
        agencies60,
        agencies90
      ] = await Promise.all([
        // Facilities (Hospitals) - last 60 days
        prisma.hospital.count({
          where: {
            createdAt: { gte: days60Ago }
          }
        }),
        // Facilities (Hospitals) - last 90 days
        prisma.hospital.count({
          where: {
            createdAt: { gte: days90Ago }
          }
        }),
        // EMS Agencies - last 60 days
        prisma.eMSAgency.count({
          where: {
            createdAt: { gte: days60Ago }
          }
        }),
        // EMS Agencies - last 90 days
        prisma.eMSAgency.count({
          where: {
            createdAt: { gte: days90Ago }
          }
        })
      ]);

      return {
        newFacilitiesLast60Days: facilities60,
        newAgenciesLast60Days: agencies60,
        newFacilitiesLast90Days: facilities90,
        newAgenciesLast90Days: agencies90
      };
    } catch (error) {
      console.error('Error getting account statistics:', error);
      return {
        newFacilitiesLast60Days: 0,
        newAgenciesLast60Days: 0,
        newFacilitiesLast90Days: 0,
        newAgenciesLast90Days: 0
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;