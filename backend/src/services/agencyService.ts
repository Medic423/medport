import { databaseManager } from './databaseManager';

// Use databaseManager for all environments
// Both databaseManager and productionDatabaseManager should work since they both
// connect to the same DATABASE_URL. The productionDatabaseManager is used
// for health checks in production-index.ts, but services can use databaseManager.
const getDatabaseClient = () => {
  // Always use databaseManager - it works in both local dev and production
  // The productionDatabaseManager is only used for health checks in production-index.ts
  return databaseManager.getPrismaClient();
};

export interface AgencyData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string[];
  operatingHours?: any;
  capabilities: string[];
  pricingStructure?: any;
  isActive?: boolean;
  status?: string;
}

export interface AgencySearchFilters {
  name?: string;
  city?: string;
  state?: string;
  capabilities?: string[];
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AgencyListResult {
  agencies: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class AgencyService {
  async createAgency(data: AgencyData): Promise<any> {
    const prisma = getDatabaseClient();
    
    return await prisma.eMSAgency.create({
      data: {
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        serviceArea: data.serviceArea || [],
        operatingHours: data.operatingHours,
        capabilities: data.capabilities,
        pricingStructure: data.pricingStructure,
        status: data.status ?? 'ACTIVE',
        isActive: data.isActive ?? true,
      }
    });
  }

  async getAgencies(filters: AgencySearchFilters = {}): Promise<AgencyListResult> {
    try {
      console.log('TCC_DEBUG: AgencyService.getAgencies() called with filters:', JSON.stringify(filters, null, 2));
      const prisma = getDatabaseClient();
      const { page = 1, limit = 50, ...whereFilters } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (whereFilters.name) {
        where.name = { contains: whereFilters.name, mode: 'insensitive' };
      }
      if (whereFilters.city) {
        where.city = { contains: whereFilters.city, mode: 'insensitive' };
      }
      if (whereFilters.state) {
        where.state = { contains: whereFilters.state, mode: 'insensitive' };
      }
      if (whereFilters.capabilities && whereFilters.capabilities.length > 0) {
        where.capabilities = { hasSome: whereFilters.capabilities };
      }
      if (whereFilters.isActive !== undefined) {
        where.isActive = whereFilters.isActive;
      }

      console.log('TCC_DEBUG: Prisma where clause:', JSON.stringify(where, null, 2));
      console.log('TCC_DEBUG: Query params - skip:', skip, 'take:', limit);

      const [agencies, total] = await Promise.all([
        prisma.eMSAgency.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            latitude: true,
            longitude: true,
            capabilities: true,
            serviceArea: true,
            isActive: true,
            status: true,
            contactName: true,
            operatingHours: true,
            availabilityStatus: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.eMSAgency.count({ where })
      ]);

      console.log('TCC_DEBUG: Query completed - agencies found:', agencies.length, 'total:', total);

      return {
        agencies,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('TCC_DEBUG: AgencyService.getAgencies() error:', error);
      console.error('TCC_DEBUG: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      throw error; // Re-throw to be handled by route handler
    }
  }

  async getAgencyById(id: string): Promise<any | null> {
    const prisma = getDatabaseClient();
    return await prisma.eMSAgency.findUnique({
      where: { id },
    });
  }

  async updateAgency(id: string, data: Partial<AgencyData> & { availabilityStatus?: { isAvailable: boolean; availableLevels: string[] }; isAvailable?: boolean; capabilities?: string[] }): Promise<any> {
    const prisma = getDatabaseClient();

    const updateData: any = {
      name: data.name,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      serviceArea: data.serviceArea || [],
      operatingHours: data.operatingHours,
      capabilities: data.capabilities,
      pricingStructure: data.pricingStructure,
      status: data.status ?? 'ACTIVE',
      isActive: data.isActive,
      updatedAt: new Date()
    };

    // TCC Admin override: force availability for dispatch
    if (data.availabilityStatus !== undefined) {
      updateData.availabilityStatus = data.availabilityStatus;
    } else if (data.isAvailable !== undefined) {
      const validLevels = ['BLS', 'ALS', 'CCT'];
      const levels = data.isAvailable && data.capabilities?.length
        ? data.capabilities.filter((c: string) => validLevels.includes(c))
        : [];
      updateData.availabilityStatus = {
        isAvailable: data.isAvailable,
        availableLevels: levels.length ? levels : (data.isAvailable ? ['BLS', 'ALS'] : [])
      };
    }

    return await prisma.eMSAgency.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAgency(id: string): Promise<void> {
    const prisma = getDatabaseClient();
    await prisma.eMSAgency.delete({
      where: { id }
    });
  }

  async searchAgencies(query: string): Promise<any[]> {
    const prisma = getDatabaseClient();
    return await prisma.eMSAgency.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
  }
}

export const agencyService = new AgencyService();
export default agencyService;
