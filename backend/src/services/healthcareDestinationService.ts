import { databaseManager } from './databaseManager';

export interface HealthcareDestinationData {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  contactName?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  notes?: string;
}

export interface HealthcareDestinationSearchFilters {
  name?: string;
  type?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface HealthcareDestinationListResult {
  destinations: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class HealthcareDestinationService {
  /**
   * Get all destinations for a healthcare user
   */
  async getDestinationsForHealthcareUser(
    healthcareUserId: string,
    filters: HealthcareDestinationSearchFilters = {}
  ): Promise<HealthcareDestinationListResult> {
    const prisma = databaseManager.getPrismaClient();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      healthcareUserId,
    };

    if (whereFilters.name) {
      where.name = { contains: whereFilters.name, mode: 'insensitive' };
    }
    if (whereFilters.type) {
      where.type = whereFilters.type;
    }
    if (whereFilters.city) {
      where.city = { contains: whereFilters.city, mode: 'insensitive' };
    }
    if (whereFilters.state) {
      where.state = { contains: whereFilters.state, mode: 'insensitive' };
    }
    if (whereFilters.isActive !== undefined) {
      where.isActive = whereFilters.isActive;
    }

    const [destinations, total] = await Promise.all([
      prisma.healthcareDestination.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.healthcareDestination.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      destinations,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get a single destination by ID (only if owned by the healthcare user)
   */
  async getDestinationByIdForHealthcareUser(
    id: string,
    healthcareUserId: string
  ): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.healthcareDestination.findFirst({
      where: {
        id,
        healthcareUserId,
      },
    });
  }

  /**
   * Create a new destination for a healthcare user
   */
  async createDestinationForHealthcareUser(
    healthcareUserId: string,
    data: HealthcareDestinationData
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const destination = await prisma.healthcareDestination.create({
      data: {
        healthcareUserId,
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        contactName: data.contactName,
        latitude: data.latitude,
        longitude: data.longitude,
        isActive: data.isActive ?? true,
        notes: data.notes,
      },
    });

    return destination;
  }

  /**
   * Update a destination (only if owned by the healthcare user)
   */
  async updateDestinationForHealthcareUser(
    id: string,
    healthcareUserId: string,
    data: Partial<HealthcareDestinationData>
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    // Verify ownership
    const existing = await prisma.healthcareDestination.findFirst({
      where: {
        id,
        healthcareUserId,
      },
    });

    if (!existing) {
      throw new Error('Destination not found or access denied');
    }

    const updated = await prisma.healthcareDestination.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete a destination (only if owned by the healthcare user)
   * Soft delete: Set isActive = false
   */
  async deleteDestinationForHealthcareUser(
    id: string,
    healthcareUserId: string
  ): Promise<void> {
    const prisma = databaseManager.getPrismaClient();

    // Verify ownership
    const existing = await prisma.healthcareDestination.findFirst({
      where: {
        id,
        healthcareUserId,
      },
    });

    if (!existing) {
      throw new Error('Destination not found or access denied');
    }

    // Soft delete
    await prisma.healthcareDestination.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const healthcareDestinationService = new HealthcareDestinationService();

