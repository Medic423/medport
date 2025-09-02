import { Facility } from '@prisma/client';
import { FacilityType } from '../../dist/prisma/hospital';
import { databaseManager } from './databaseManager';

export interface FacilitySearchFilters {
  name?: string;
  type?: FacilityType;
  city?: string;
  state?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface FacilityWithDistance extends Facility {
  distance?: number;
  estimatedTime?: number;
}

export class FacilityService {
  /**
   * Search facilities with filters and pagination
   */
  async searchFacilities(filters: FacilitySearchFilters = {}): Promise<{
    facilities: Facility[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const where: any = { isActive: true };
    if (whereFilters.name) {
      where.name = { contains: whereFilters.name, mode: 'insensitive' };
    }
    if (whereFilters.type) where.type = whereFilters.type;
    if (whereFilters.city) {
      where.city = { contains: whereFilters.city, mode: 'insensitive' };
    }
    if (whereFilters.state) {
      where.state = { contains: whereFilters.state, mode: 'insensitive' };
    }
    if (whereFilters.isActive !== undefined) where.isActive = whereFilters.isActive;

    const hospitalDB = databaseManager.getHospitalDB();
    const [facilities, total] = await Promise.all([
      hospitalDB.facility.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit.toString())
      }),
      hospitalDB.facility.count({ where })
    ]);

    return {
      facilities,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.facility.findUnique({
      where: { id }
    });
  }

  /**
   * Create a new facility
   */
  async createFacility(data: {
    name: string;
    type: FacilityType;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    coordinates?: any;
    operatingHours?: any;
    capabilities?: any;
  }): Promise<Facility> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.facility.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  /**
   * Get facilities by type
   */
  async getFacilitiesByType(type: FacilityType): Promise<Facility[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.facility.findMany({
      where: { type, isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get facilities in a specific area (city/state)
   */
  async getFacilitiesInArea(city?: string, state?: string): Promise<Facility[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    const where: any = { isActive: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };

    return hospitalDB.facility.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get facility types for filtering
   */
  async getFacilityTypes(): Promise<FacilityType[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    const types = await hospitalDB.facility.groupBy({
      by: ['type'],
      where: { isActive: true }
    });
    return types.map(t => t.type);
  }

  /**
   * Get cities with facilities
   */
  async getCitiesWithFacilities(): Promise<string[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    const cities = await hospitalDB.facility.groupBy({
      by: ['city'],
      where: { isActive: true },
      orderBy: { city: 'asc' }
    });
    return cities.map(c => c.city);
  }

  /**
   * Get states with facilities
   */
  async getStatesWithFacilities(): Promise<string[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    const states = await hospitalDB.facility.groupBy({
      by: ['state'],
      where: { isActive: true },
      orderBy: { state: 'asc' }
    });
    return states.map(s => s.state);
  }

  /**
   * Get facility statistics
   */
  async getFacilityStats(): Promise<{
    total: number;
    byType: Record<FacilityType, number>;
    byState: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    const hospitalDB = databaseManager.getHospitalDB();
    const [total, byType, byState, active, inactive] = await Promise.all([
      hospitalDB.facility.count(),
      hospitalDB.facility.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      hospitalDB.facility.groupBy({
        by: ['state'],
        _count: { state: true }
      }),
      hospitalDB.facility.count({ where: { isActive: true } }),
      hospitalDB.facility.count({ where: { isActive: false } })
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<FacilityType, number>);

    const stateStats = byState.reduce((acc, item) => {
      acc[item.state] = item._count.state;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byType: typeStats,
      byState: stateStats,
      active,
      inactive
    };
  }

  /**
   * Update a facility
   */
  async updateFacility(id: string, data: {
    name?: string;
    type?: FacilityType;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    operatingHours?: any;
    capabilities?: any;
    isActive?: boolean;
  }): Promise<Facility | null> {
    const hospitalDB = databaseManager.getHospitalDB();
    try {
      return await hospitalDB.facility.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating facility:', error);
      return null;
    }
  }

  /**
   * Delete a facility (soft delete by setting isActive to false)
   */
  async deleteFacility(id: string): Promise<boolean> {
    const hospitalDB = databaseManager.getHospitalDB();
    try {
      await hospitalDB.facility.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting facility:', error);
      return false;
    }
  }
}

export default new FacilityService();
