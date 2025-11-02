import { databaseManager } from './databaseManager';

export interface HealthcareAgencyData {
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
  isPreferred?: boolean;
}

export interface HealthcareAgencySearchFilters {
  name?: string;
  city?: string;
  state?: string;
  capabilities?: string[];
  isActive?: boolean;
  status?: string; // 'preferred' | 'regular' | 'all'
  page?: number;
  limit?: number;
}

export interface HealthcareAgencyListResult {
  agencies: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class HealthcareAgencyService {
  /**
   * Get all agencies for a healthcare user with their preference status
   */
  async getAgenciesForHealthcareUser(
    healthcareUserId: string,
    filters: HealthcareAgencySearchFilters = {}
  ): Promise<HealthcareAgencyListResult> {
    const prisma = databaseManager.getPrismaClient();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      addedBy: healthcareUserId, // Only get agencies added by this user
    };

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
        include: {
          healthcarePreferences: {
            where: {
              healthcareUserId: healthcareUserId,
            },
            select: {
              isPreferred: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.eMSAgency.count({ where }),
    ]);

    // Transform agencies to include isPreferred flag
    const transformedAgencies = agencies.map((agency: any) => ({
      ...agency,
      isPreferred: agency.healthcarePreferences?.[0]?.isPreferred || false,
      healthcarePreferences: undefined, // Remove nested preferences
    }));

    // Filter by preferred/regular status if specified
    let filteredAgencies = transformedAgencies;
    if (whereFilters.status && whereFilters.status !== 'all') {
      filteredAgencies = transformedAgencies.filter((agency: any) => {
        if (whereFilters.status === 'preferred') {
          return agency.isPreferred === true;
        } else if (whereFilters.status === 'regular') {
          return agency.isPreferred === false;
        }
        return true;
      });
    }

    return {
      agencies: filteredAgencies,
      total: filteredAgencies.length,
      page,
      totalPages: Math.ceil(filteredAgencies.length / limit),
    };
  }

  /**
   * Get a single agency by ID (only if owned by the healthcare user)
   */
  async getAgencyByIdForHealthcareUser(
    id: string,
    healthcareUserId: string
  ): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.eMSAgency.findFirst({
      where: {
        id,
        addedBy: healthcareUserId, // Verify ownership
      },
      include: {
        healthcarePreferences: {
          where: {
            healthcareUserId: healthcareUserId,
          },
          select: {
            isPreferred: true,
          },
        },
      },
    });
  }

  /**
   * Create a new agency for a healthcare user
   */
  async createAgencyForHealthcareUser(
    healthcareUserId: string,
    data: HealthcareAgencyData
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    // Create the agency with addedBy = healthcare user ID
    const agency = await prisma.eMSAgency.create({
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
        addedBy: healthcareUserId,
      },
    });

    // Create preference record with isPreferred from data or false (default)
    await prisma.healthcareAgencyPreference.create({
      data: {
        healthcareUserId: healthcareUserId,
        agencyId: agency.id,
        isPreferred: data.isPreferred ?? false,
      },
    });

    return agency;
  }

  /**
   * Update an agency (only if owned by the healthcare user)
   */
  async updateAgencyForHealthcareUser(
    id: string,
    healthcareUserId: string,
    data: Partial<HealthcareAgencyData>
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    // First verify ownership
    const existingAgency = await prisma.eMSAgency.findFirst({
      where: {
        id,
        addedBy: healthcareUserId,
      },
    });

    if (!existingAgency) {
      throw new Error('Agency not found or access denied');
    }

    // Update the agency
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
        serviceArea: data.serviceArea,
        operatingHours: data.operatingHours,
        capabilities: data.capabilities,
        pricingStructure: data.pricingStructure,
        status: data.status,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete an agency (only if owned by the healthcare user)
   */
  async deleteAgencyForHealthcareUser(id: string, healthcareUserId: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();

    // First verify ownership
    const existingAgency = await prisma.eMSAgency.findFirst({
      where: {
        id,
        addedBy: healthcareUserId,
      },
    });

    if (!existingAgency) {
      throw new Error('Agency not found or access denied');
    }

    // Soft delete by setting isActive = false
    await prisma.eMSAgency.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Toggle preferred status for an agency
   */
  async togglePreferredStatus(
    healthcareUserId: string,
    agencyId: string,
    isPreferred: boolean
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    // Verify the agency exists and is owned by this user
    const agency = await prisma.eMSAgency.findFirst({
      where: {
        id: agencyId,
        addedBy: healthcareUserId,
      },
    });

    if (!agency) {
      throw new Error('Agency not found or access denied');
    }

    // Upsert the preference record
    const preference = await prisma.healthcareAgencyPreference.upsert({
      where: {
        healthcareUserId_agencyId: {
          healthcareUserId: healthcareUserId,
          agencyId: agencyId,
        },
      },
      update: {
        isPreferred: isPreferred,
        updatedAt: new Date(),
      },
      create: {
        healthcareUserId: healthcareUserId,
        agencyId: agencyId,
        isPreferred: isPreferred,
      },
    });

    return preference;
  }

  /**
   * Search agencies for a healthcare user
   */
  async searchAgenciesForHealthcareUser(
    healthcareUserId: string,
    query: string
  ): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.eMSAgency.findMany({
      where: {
        addedBy: healthcareUserId, // Only search user's agencies
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
  }
}

export const healthcareAgencyService = new HealthcareAgencyService();
export default healthcareAgencyService;

