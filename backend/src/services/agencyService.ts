import { databaseManager } from './databaseManager';

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
    const prisma = databaseManager.getPrismaClient();
    
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
    const prisma = databaseManager.getPrismaClient();
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

    const [agencies, total] = await Promise.all([
      prisma.eMSAgency.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.eMSAgency.count({ where })
    ]);

    return {
      agencies,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAgencyById(id: string): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.eMSAgency.findUnique({
      where: { id },
    });
  }

  async updateAgency(id: string, data: Partial<AgencyData>): Promise<any> {
    const prisma = databaseManager.getPrismaClient();
    
    return await prisma.eMSAgency.update({
      where: { id },
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
        isActive: data.isActive,
        updatedAt: new Date()
      },
    });
  }

  async deleteAgency(id: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();
    await prisma.eMSAgency.delete({
      where: { id }
    });
  }

  async searchAgencies(query: string): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
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
