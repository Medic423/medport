import { PrismaClient, HospitalAgencyPreference, TransportAgency } from '@prisma/client';

const prisma = new PrismaClient();

export interface HospitalAgencyPreferenceData {
  hospitalId: string;
  agencyId: string;
  isActive?: boolean;
  preferenceOrder?: number;
  notes?: string;
}

export interface AgencySearchFilters {
  transportLevel?: string;
  city?: string;
  state?: string;
  hasAvailableUnits?: boolean;
  searchTerm?: string;
}

export class HospitalAgencyService {
  // Get all available agencies with optional filtering
  async getAvailableAgencies(filters: AgencySearchFilters = {}): Promise<TransportAgency[]> {
    try {
      const whereClause: any = {
        isActive: true
      };

      // Filter by transport level if specified
      if (filters.transportLevel) {
        whereClause.units = {
          some: {
            type: filters.transportLevel,
            isActive: true
          }
        };
      }

      // Filter by location if specified
      if (filters.city) {
        whereClause.city = {
          contains: filters.city,
          mode: 'insensitive'
        };
      }

      if (filters.state) {
        whereClause.state = filters.state;
      }

      // Filter by search term (name, contact name, or email)
      if (filters.searchTerm) {
        whereClause.OR = [
          { name: { contains: filters.searchTerm, mode: 'insensitive' } },
          { contactName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { email: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }

      const agencies = await prisma.transportAgency.findMany({
        where: whereClause,
        include: {
          units: {
            where: { isActive: true },
            include: {
              unitAvailability: true
            }
          },
          serviceAreas: {
            where: { isActive: true }
          },
          agencyProfiles: true
        },
        orderBy: [
          { name: 'asc' }
        ]
      });

      // Filter by available units if requested
      if (filters.hasAvailableUnits) {
        return agencies.filter(agency => 
          agency.units.some(unit => 
            unit.unitAvailability.some(availability => availability.status === 'AVAILABLE')
          )
        );
      }

      return agencies;
    } catch (error) {
      console.error('Error getting available agencies:', error);
      throw error;
    }
  }

  // Get hospital's preferred agencies
  async getHospitalPreferredAgencies(hospitalId: string): Promise<HospitalAgencyPreference[]> {
    try {
      return await prisma.hospitalAgencyPreference.findMany({
        where: {
          hospitalId,
          isActive: true
        },
        include: {
          agency: {
            include: {
              units: {
                where: { isActive: true },
                include: {
                  unitAvailability: true
                }
              },
              serviceAreas: {
                where: { isActive: true }
              },
              agencyProfiles: true
            }
          }
        },
        orderBy: [
          { preferenceOrder: 'asc' },
          { createdAt: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Error getting hospital preferred agencies:', error);
      throw error;
    }
  }

  // Add agency to hospital's preferred list
  async addPreferredAgency(data: HospitalAgencyPreferenceData): Promise<HospitalAgencyPreference> {
    try {
      // Check if preference already exists
      const existing = await prisma.hospitalAgencyPreference.findUnique({
        where: {
          hospitalId_agencyId: {
            hospitalId: data.hospitalId,
            agencyId: data.agencyId
          }
        }
      });

      if (existing) {
        // Update existing preference
        return await prisma.hospitalAgencyPreference.update({
          where: {
            hospitalId_agencyId: {
              hospitalId: data.hospitalId,
              agencyId: data.agencyId
            }
          },
          data: {
            isActive: data.isActive ?? true,
            preferenceOrder: data.preferenceOrder ?? 0,
            notes: data.notes
          },
          include: {
            agency: {
              include: {
                units: {
                  where: { isActive: true },
                  include: {
                    unitAvailability: true
                  }
                },
                serviceAreas: {
                  where: { isActive: true }
                },
                agencyProfiles: true
              }
            }
          }
        });
      }

      // Create new preference
      return await prisma.hospitalAgencyPreference.create({
        data: {
          hospitalId: data.hospitalId,
          agencyId: data.agencyId,
          isActive: data.isActive ?? true,
          preferenceOrder: data.preferenceOrder ?? 0,
          notes: data.notes
        },
        include: {
          agency: {
            include: {
              units: {
                where: { isActive: true },
                include: {
                  unitAvailability: true
                }
              },
              serviceAreas: {
                where: { isActive: true }
              },
              agencyProfiles: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error adding preferred agency:', error);
      throw error;
    }
  }

  // Remove agency from hospital's preferred list
  async removePreferredAgency(hospitalId: string, agencyId: string): Promise<void> {
    try {
      await prisma.hospitalAgencyPreference.deleteMany({
        where: {
          hospitalId,
          agencyId
        }
      });
    } catch (error) {
      console.error('Error removing preferred agency:', error);
      throw error;
    }
  }

  // Update preference order
  async updatePreferenceOrder(hospitalId: string, agencyId: string, preferenceOrder: number): Promise<HospitalAgencyPreference> {
    try {
      return await prisma.hospitalAgencyPreference.update({
        where: {
          hospitalId_agencyId: {
            hospitalId,
            agencyId
          }
        },
        data: {
          preferenceOrder
        },
        include: {
          agency: {
            include: {
              units: {
                where: { isActive: true },
                include: {
                  unitAvailability: true
                }
              },
              serviceAreas: {
                where: { isActive: true }
              },
              agencyProfiles: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating preference order:', error);
      throw error;
    }
  }

  // Get agency details by ID
  async getAgencyById(agencyId: string): Promise<TransportAgency | null> {
    try {
      return await prisma.transportAgency.findUnique({
        where: { id: agencyId },
        include: {
          units: {
            where: { isActive: true },
            include: {
              unitAvailability: true
            }
          },
          serviceAreas: {
            where: { isActive: true }
          },
          agencyProfiles: true,
          agencyPerformance: {
            orderBy: { periodEnd: 'desc' },
            take: 1
          }
        }
      });
    } catch (error) {
      console.error('Error getting agency by ID:', error);
      throw error;
    }
  }

  // Check if agency is preferred by hospital
  async isAgencyPreferred(hospitalId: string, agencyId: string): Promise<boolean> {
    try {
      const preference = await prisma.hospitalAgencyPreference.findUnique({
        where: {
          hospitalId_agencyId: {
            hospitalId,
            agencyId
          }
        }
      });
      return !!preference && preference.isActive;
    } catch (error) {
      console.error('Error checking if agency is preferred:', error);
      return false;
    }
  }

  // Get agencies with availability status
  async getAgenciesWithAvailability(filters: AgencySearchFilters = {}): Promise<any[]> {
    try {
      const agencies = await this.getAvailableAgencies(filters);
      
      return agencies.map(agency => {
        // For now, return mock availability data since units relation doesn't exist
        return {
          ...agency,
          availability: {
            totalUnits: 3,
            availableUnits: 2,
            availabilityPercentage: 67,
            hasAvailableUnits: true
          }
        };
      });
    } catch (error) {
      console.error('Error getting agencies with availability:', error);
      throw error;
    }
  }
}

export default new HospitalAgencyService();
