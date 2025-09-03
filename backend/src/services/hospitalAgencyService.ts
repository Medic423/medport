import { HospitalAgencyPreference } from '../../dist/prisma/hospital';
import { EMSAgency } from '../../dist/prisma/center';
import { databaseManager } from './databaseManager';

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
  async getAvailableAgencies(filters: AgencySearchFilters = {}): Promise<EMSAgency[]> {
    try {
      const whereClause: any = {
        isActive: true
      };

      // Filter by transport level if specified
      // Note: Unit filtering requires cross-database query since units are in EMS DB
      // For now, we'll filter by agency capabilities instead
      if (filters.transportLevel) {
        whereClause.capabilities = {
          has: filters.transportLevel
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

      // Get agencies from Center DB (EMSAgency table)
      const centerDB = databaseManager.getCenterDB();
      const agencies = await centerDB.eMSAgency.findMany({
        where: whereClause,
        orderBy: [
          { name: 'asc' }
        ]
      });

      // Note: Unit availability filtering would require cross-database query
      // For now, return all active agencies
      // TODO: Implement cross-database unit availability check if needed

      return agencies;
    } catch (error) {
      console.error('Error getting available agencies:', error);
      throw error;
    }
  }

  // Get hospital's preferred agencies
  async getHospitalPreferredAgencies(hospitalId: string): Promise<HospitalAgencyPreference[]> {
    try {
      // Get preferences from Hospital DB
      const hospitalDB = databaseManager.getHospitalDB();
      return await hospitalDB.hospitalAgencyPreference.findMany({
        where: {
          hospitalId,
          isActive: true
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
      const hospitalDB = databaseManager.getHospitalDB();
      
      // Check if preference already exists
      const existing = await hospitalDB.hospitalAgencyPreference.findFirst({
        where: {
          hospitalId: data.hospitalId,
          agencyId: data.agencyId
        }
      });

      if (existing) {
        // Update existing preference
        return await hospitalDB.hospitalAgencyPreference.update({
          where: {
            id: existing.id
          },
          data: {
            isActive: data.isActive ?? true,
            preferenceOrder: data.preferenceOrder ?? 0,
            notes: data.notes
          }
        });
      }

      // Create new preference
      return await hospitalDB.hospitalAgencyPreference.create({
        data: {
          hospitalId: data.hospitalId,
          agencyId: data.agencyId,
          isActive: data.isActive ?? true,
          preferenceOrder: data.preferenceOrder ?? 0,
          notes: data.notes
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
      const hospitalDB = databaseManager.getHospitalDB();
      await hospitalDB.hospitalAgencyPreference.deleteMany({
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
      const hospitalDB = databaseManager.getHospitalDB();
      const existing = await hospitalDB.hospitalAgencyPreference.findFirst({
        where: {
          hospitalId,
          agencyId
        }
      });

      if (!existing) {
        throw new Error('Preference not found');
      }

      return await hospitalDB.hospitalAgencyPreference.update({
        where: {
          id: existing.id
        },
        data: {
          preferenceOrder
        }
      });
    } catch (error) {
      console.error('Error updating preference order:', error);
      throw error;
    }
  }

  // Get agency details by ID
  async getAgencyById(agencyId: string): Promise<EMSAgency | null> {
    try {
      const centerDB = databaseManager.getCenterDB();
      return await centerDB.eMSAgency.findUnique({
        where: { id: agencyId }
      });
    } catch (error) {
      console.error('Error getting agency by ID:', error);
      throw error;
    }
  }

  // Check if agency is preferred by hospital
  async isAgencyPreferred(hospitalId: string, agencyId: string): Promise<boolean> {
    try {
      const hospitalDB = databaseManager.getHospitalDB();
      const preference = await hospitalDB.hospitalAgencyPreference.findFirst({
        where: {
          hospitalId,
          agencyId
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
