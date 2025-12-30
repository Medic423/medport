import { databaseManager } from './databaseManager';
import { GeocodingService } from '../utils/geocodingService';

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

    try {
      const where: any = {
        healthcareUserId,
        isActive: true, // Only get active destinations by default
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

      console.log('TCC_DEBUG: Querying destinations with where:', JSON.stringify(where));

      const [destinations, total] = await Promise.all([
        prisma.healthcareDestination.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.healthcareDestination.count({ where }),
      ]);

      console.log('TCC_DEBUG: Query successful, found', destinations.length, 'destinations');

      const totalPages = Math.ceil(total / limit);

      return {
        destinations: destinations || [],
        total: total || 0,
        page,
        totalPages,
      };
    } catch (error: any) {
      console.error('TCC_DEBUG: Error in getDestinationsForHealthcareUser:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      
      // If it's a column mapping error, try using raw SQL as fallback
      if (error.code === 'P2022' || error.message?.includes('column') || error.message?.includes('does not exist') || error.message?.includes('healthcareUserId')) {
        console.warn('TCC_DEBUG: Column mapping error detected, trying raw SQL fallback');
        try {
          // Build WHERE clause for raw SQL
          let whereClause = `WHERE healthcare_user_id = $1 AND is_active = true`;
          const params: any[] = [healthcareUserId];
          let paramIndex = 2;

          if (whereFilters.name) {
            whereClause += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${whereFilters.name}%`);
            paramIndex++;
          }
          if (whereFilters.type) {
            whereClause += ` AND type = $${paramIndex}`;
            params.push(whereFilters.type);
            paramIndex++;
          }
          if (whereFilters.city) {
            whereClause += ` AND city ILIKE $${paramIndex}`;
            params.push(`%${whereFilters.city}%`);
            paramIndex++;
          }
          if (whereFilters.state) {
            whereClause += ` AND state ILIKE $${paramIndex}`;
            params.push(`%${whereFilters.state}%`);
            paramIndex++;
          }

          // Get total count
          const countResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM healthcare_destinations ${whereClause}`,
            ...params
          );
          const total = parseInt((countResult as any[])[0]?.count || '0');

          // Get destinations with pagination
          const destinationsResult = await prisma.$queryRawUnsafe(
            `SELECT * FROM healthcare_destinations ${whereClause} ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            ...params,
            limit,
            skip
          );

          // Transform snake_case to camelCase
          const destinations = (destinationsResult as any[]).map((row: any) => ({
            id: row.id,
            healthcareUserId: row.healthcare_user_id,
            name: row.name,
            type: row.type,
            address: row.address,
            city: row.city,
            state: row.state,
            zipCode: row.zip_code,
            phone: row.phone,
            email: row.email,
            contactName: row.contact_name,
            latitude: row.latitude,
            longitude: row.longitude,
            isActive: row.is_active,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          const totalPages = Math.ceil(total / limit);

          console.log('TCC_DEBUG: Raw SQL fallback successful, found', destinations.length, 'destinations');

          return {
            destinations: destinations || [],
            total: total || 0,
            page,
            totalPages,
          };
        } catch (rawError: any) {
          console.error('TCC_DEBUG: Raw SQL fallback also failed:', rawError);
          // If even raw SQL fails, return empty array
          return {
            destinations: [],
            total: 0,
            page,
            totalPages: 0,
          };
        }
      }
      
      // For other errors, still return empty array instead of throwing
      console.warn('TCC_DEBUG: Unknown error, returning empty array to prevent crash');
      return {
        destinations: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
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

    // ✅ NEW: Auto-geocode if coordinates not provided
    let latitude = data.latitude ? parseFloat(String(data.latitude)) : null;
    let longitude = data.longitude ? parseFloat(String(data.longitude)) : null;

    if (!latitude || !longitude) {
      console.log('HEALTHCARE_DESTINATION: No coordinates provided, attempting geocoding...');
      const geocodeResult = await GeocodingService.geocodeAddress(
        data.address,
        data.city,
        data.state,
        data.zipCode,
        data.name
      );
      
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        console.log('HEALTHCARE_DESTINATION: Geocoding successful:', { latitude, longitude });
      } else {
        console.warn('HEALTHCARE_DESTINATION: Geocoding failed:', geocodeResult.error);
      }
    }

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
        latitude: latitude,
        longitude: longitude,
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

