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
  idleAccounts: {
    last30Days: { healthcare: number; ems: number; admin: number; total: number };
    last60Days: { healthcare: number; ems: number; admin: number; total: number };
    last90Days: { healthcare: number; ems: number; admin: number; total: number };
  };
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
   * Get idle account counts for a given number of days
   * Accounts with no lastLogin in the specified period (or NULL lastLogin)
   */
  async getIdleAccounts(days: 30 | 60 | 90): Promise<{ healthcare: number; ems: number; admin: number; total: number }> {
    const prisma = databaseManager.getPrismaClient();
    
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const [healthcare, ems, admin] = await Promise.all([
        // Healthcare users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.healthcareUser.count({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          }
        }),
        // EMS users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.eMSUser.count({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          }
        }),
        // Admin/Center users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.centerUser.count({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          }
        })
      ]);

      return {
        healthcare,
        ems,
        admin,
        total: healthcare + ems + admin
      };
    } catch (error) {
      console.error(`Error getting idle accounts for ${days} days:`, error);
      return { healthcare: 0, ems: 0, admin: 0, total: 0 };
    }
  }

  /**
   * Get detailed list of idle accounts for a given number of days
   * Returns accounts with no lastLogin in the specified period (or NULL lastLogin)
   */
  async getIdleAccountsList(days: 30 | 60 | 90): Promise<{
    healthcare: Array<{ id: string; email: string; name: string; facilityName?: string; lastLogin: string | null; createdAt: string }>;
    ems: Array<{ id: string; email: string; name: string; agencyName?: string; lastLogin: string | null; createdAt: string }>;
    admin: Array<{ id: string; email: string; name: string; lastLogin: string | null; createdAt: string }>;
  }> {
    const prisma = databaseManager.getPrismaClient();
    
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const [healthcare, ems, admin] = await Promise.all([
        // Healthcare users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.healthcareUser.findMany({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            facilityName: true,
            lastLogin: true,
            createdAt: true
          },
          orderBy: {
            lastLogin: 'asc' // NULLs will be first, then oldest first
          }
        }),
        // EMS users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.eMSUser.findMany({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            agencyName: true,
            lastLogin: true,
            createdAt: true
          },
          orderBy: {
            lastLogin: 'asc' // NULLs will be first, then oldest first
          }
        }),
        // Admin/Center users: no lastLogin or lastLogin before cutoff, active and not deleted
        prisma.centerUser.findMany({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              { lastLogin: null },
              { lastLogin: { lt: cutoffDate } }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            lastLogin: true,
            createdAt: true
          },
          orderBy: {
            lastLogin: 'asc' // NULLs will be first, then oldest first
          }
        })
      ]);

      return {
        healthcare: healthcare.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          facilityName: u.facilityName,
          lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
          createdAt: u.createdAt.toISOString()
        })),
        ems: ems.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          agencyName: u.agencyName,
          lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
          createdAt: u.createdAt.toISOString()
        })),
        admin: admin.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
          createdAt: u.createdAt.toISOString()
        }))
      };
    } catch (error) {
      console.error(`Error getting idle accounts list for ${days} days:`, error);
      return { healthcare: [], ems: [], admin: [] };
    }
  }

  /**
   * Get recent registrations (facilities or agencies) for a specific time period
   * Returns detailed list of facilities/agencies registered in the specified days
   */
  async getRecentRegistrations(type: 'facilities' | 'agencies', days: 60 | 90): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      if (type === 'facilities') {
        // Return hospitals/facilities registered in the time period
        const facilities = await prisma.hospital.findMany({
          where: {
            createdAt: { gte: cutoffDate }
          },
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            createdAt: true,
            isActive: true,
            email: true,
            phone: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return facilities.map(f => ({
          id: f.id,
          name: f.name,
          city: f.city,
          state: f.state,
          createdAt: f.createdAt.toISOString(),
          isActive: f.isActive,
          email: f.email || undefined,
          phone: f.phone || undefined
        }));
      } else {
        // Return EMS agencies registered in the time period
        const agencies = await prisma.eMSAgency.findMany({
          where: {
            createdAt: { gte: cutoffDate }
          },
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            createdAt: true,
            isActive: true,
            email: true,
            phone: true,
            contactName: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return agencies.map(a => ({
          id: a.id,
          name: a.name,
          city: a.city,
          state: a.state,
          createdAt: a.createdAt.toISOString(),
          isActive: a.isActive,
          email: a.email,
          phone: a.phone,
          contactName: a.contactName
        }));
      }
    } catch (error) {
      console.error(`Error getting recent registrations (${type}, ${days} days):`, error);
      return [];
    }
  }

  /**
   * Get account creation statistics
   * Returns counts of new accounts created in last 60 and 90 days
   * Also includes idle account statistics
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
        agencies90,
        idle30,
        idle60,
        idle90
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
        }),
        // Idle accounts - 30 days
        this.getIdleAccounts(30),
        // Idle accounts - 60 days
        this.getIdleAccounts(60),
        // Idle accounts - 90 days
        this.getIdleAccounts(90)
      ]);

      return {
        newFacilitiesLast60Days: facilities60,
        newAgenciesLast60Days: agencies60,
        newFacilitiesLast90Days: facilities90,
        newAgenciesLast90Days: agencies90,
        idleAccounts: {
          last30Days: idle30,
          last60Days: idle60,
          last90Days: idle90
        }
      };
    } catch (error) {
      console.error('Error getting account statistics:', error);
      return {
        newFacilitiesLast60Days: 0,
        newAgenciesLast60Days: 0,
        newFacilitiesLast90Days: 0,
        newAgenciesLast90Days: 0,
        idleAccounts: {
          last30Days: { healthcare: 0, ems: 0, admin: 0, total: 0 },
          last60Days: { healthcare: 0, ems: 0, admin: 0, total: 0 },
          last90Days: { healthcare: 0, ems: 0, admin: 0, total: 0 }
        }
      };
    }
  }

  /**
   * Get currently active users (users with activity within threshold minutes)
   * OPTION B: One user per facility/agency (most recently active)
   * @param thresholdMinutes - Minutes threshold for "active" (default: 15)
   * @param excludeUserId - User ID to exclude from results (current user)
   * @returns List of active users by type (one per facility/agency)
   */
  async getActiveUsers(
    thresholdMinutes: number = 15,
    excludeUserId?: string
  ): Promise<{
    healthcare: Array<{
      id: string;
      name: string;
      facilityName: string;
      city: string;
      state: string;
      lastActivity: string;
      minutesAgo: number;
    }>;
    ems: Array<{
      id: string;
      name: string;
      agencyName: string;
      city: string;
      state: string;
      lastActivity: string;
      minutesAgo: number;
    }>;
  }> {
    const db = databaseManager.getPrismaClient();
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    // Build where clause to exclude user if provided
    const excludeWhere = excludeUserId ? { id: { not: excludeUserId } } : {};

    // Get active healthcare users with location data
    // Order by lastActivity DESC to get most recent first
    const activeHealthcare = await db.healthcareUser.findMany({
      where: {
        ...excludeWhere,
        isActive: true,
        isDeleted: false,
        lastActivity: {
          gte: threshold
        }
      },
      select: {
        id: true,
        name: true,
        facilityName: true,
        lastActivity: true,
        locations: {
          where: {
            isActive: true,
            isPrimary: true  // Get primary location first
          },
          select: {
            city: true,
            state: true
          },
          take: 1
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    // Get active EMS users with agency location data
    console.log('TCC_DEBUG: Querying active EMS users with threshold:', threshold);
    const activeEMS = await db.eMSUser.findMany({
      where: {
        ...excludeWhere,
        isActive: true,
        isDeleted: false,
        lastActivity: {
          gte: threshold
        }
      },
      select: {
        id: true,
        name: true,
        agencyName: true,
        lastActivity: true,
        agency: {
          select: {
            city: true,
            state: true
          }
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });
    console.log('TCC_DEBUG: Found active EMS users:', activeEMS.length, activeEMS.map(u => ({ name: u.name, agencyName: u.agencyName, lastActivity: u.lastActivity, hasAgency: !!u.agency })));

    // OPTION B: Group by facilityName/agencyName and keep only most recent user per facility/agency
    const healthcareByFacility = new Map<string, any>();
    activeHealthcare.forEach(user => {
      const facilityName = user.facilityName;
      const existing = healthcareByFacility.get(facilityName);
      if (!existing || new Date(user.lastActivity || 0) > new Date(existing.lastActivity || 0)) {
        healthcareByFacility.set(facilityName, user);
      }
    });

    const emsByAgency = new Map<string, any>();
    activeEMS.forEach(user => {
      const agencyName = user.agencyName;
      const existing = emsByAgency.get(agencyName);
      if (!existing || new Date(user.lastActivity || 0) > new Date(existing.lastActivity || 0)) {
        emsByAgency.set(agencyName, user);
      }
    });

    // Calculate minutes ago for each user and format with location
    const now = Date.now();
    
    const formatHealthcareUser = (user: any) => {
      const lastActivityTime = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
      const minutesAgo = Math.floor((now - lastActivityTime) / (60 * 1000));
      const location = user.locations && user.locations.length > 0 
        ? user.locations[0] 
        : null;
      
      return {
        id: user.id,
        name: user.name,
        facilityName: user.facilityName,
        city: location?.city || 'N/A',
        state: location?.state || 'N/A',
        lastActivity: user.lastActivity?.toISOString() || '',
        minutesAgo
      };
    };

    const formatEMSUser = (user: any) => {
      const lastActivityTime = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
      const minutesAgo = Math.floor((now - lastActivityTime) / (60 * 1000));
      
      return {
        id: user.id,
        name: user.name,
        agencyName: user.agencyName,
        city: user.agency?.city || 'N/A',
        state: user.agency?.state || 'N/A',
        lastActivity: user.lastActivity?.toISOString() || '',
        minutesAgo
      };
    };

    return {
      healthcare: Array.from(healthcareByFacility.values()).map(formatHealthcareUser),
      ems: Array.from(emsByAgency.values()).map(formatEMSUser)
    };
  }

  /**
   * Get facilities/agencies online statistics (24h and 7 days)
   * @returns Count of distinct facilities/agencies with at least one active user
   */
  async getFacilitiesOnlineStats(): Promise<{
    healthcare: {
      last24Hours: number;
      lastWeek: number;
    };
    ems: {
      last24Hours: number;
      lastWeek: number;
    };
    total: {
      last24Hours: number;
      lastWeek: number;
    };
  }> {
    const db = databaseManager.getPrismaClient();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Healthcare: Count distinct facilities with at least one active user
    const healthcare24h = await db.healthcareUser.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        lastActivity: { gte: last24Hours }
      },
      select: {
        facilityName: true
      },
      distinct: ['facilityName']
    });

    const healthcareWeek = await db.healthcareUser.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        lastActivity: { gte: lastWeek }
      },
      select: {
        facilityName: true
      },
      distinct: ['facilityName']
    });

    // EMS: Count distinct agencies with at least one active user
    const ems24h = await db.eMSUser.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        lastActivity: { gte: last24Hours }
      },
      select: {
        agencyName: true
      },
      distinct: ['agencyName']
    });

    const emsWeek = await db.eMSUser.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        lastActivity: { gte: lastWeek }
      },
      select: {
        agencyName: true
      },
      distinct: ['agencyName']
    });

    return {
      healthcare: {
        last24Hours: healthcare24h.length,
        lastWeek: healthcareWeek.length
      },
      ems: {
        last24Hours: ems24h.length,
        lastWeek: emsWeek.length
      },
      total: {
        last24Hours: healthcare24h.length + ems24h.length,
        lastWeek: healthcareWeek.length + emsWeek.length
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;