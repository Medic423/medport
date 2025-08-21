import { PrismaClient, Facility, FacilityType } from '@prisma/client';

const prisma = new PrismaClient();

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
    const skip = (page - 1) * limit;

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

    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.facility.count({ where })
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
    return prisma.facility.findUnique({
      where: { id }
    });
  }

  /**
   * Get facilities by type
   */
  async getFacilitiesByType(type: FacilityType): Promise<Facility[]> {
    return prisma.facility.findMany({
      where: { type, isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get facilities in a specific area (city/state)
   */
  async getFacilitiesInArea(city?: string, state?: string): Promise<Facility[]> {
    const where: any = { isActive: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };

    return prisma.facility.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get facility types for filtering
   */
  async getFacilityTypes(): Promise<FacilityType[]> {
    const types = await prisma.facility.groupBy({
      by: ['type'],
      where: { isActive: true }
    });
    return types.map(t => t.type);
  }

  /**
   * Get cities with facilities
   */
  async getCitiesWithFacilities(): Promise<string[]> {
    const cities = await prisma.facility.groupBy({
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
    const states = await prisma.facility.groupBy({
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
    const [total, byType, byState, active, inactive] = await Promise.all([
      prisma.facility.count(),
      prisma.facility.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.facility.groupBy({
        by: ['state'],
        _count: { state: true }
      }),
      prisma.facility.count({ where: { isActive: true } }),
      prisma.facility.count({ where: { isActive: false } })
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
}

export default new FacilityService();
