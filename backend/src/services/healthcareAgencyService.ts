import { databaseManager } from './databaseManager';
import { GeocodingService } from '../utils/geocodingService';

export interface HealthcareAgencyData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
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
      isActive: true, // Only get active agencies by default
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

    // ✅ NEW: Auto-geocode if coordinates not provided
    let latitude = data.latitude ? parseFloat(String(data.latitude)) : null;
    let longitude = data.longitude ? parseFloat(String(data.longitude)) : null;

    if (!latitude || !longitude) {
      console.log('HEALTHCARE_AGENCY: No coordinates provided, attempting geocoding...');
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
        console.log('HEALTHCARE_AGENCY: Geocoding successful:', { latitude, longitude });
      } else {
        console.warn('HEALTHCARE_AGENCY: Geocoding failed:', geocodeResult.error);
      }
    }

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
        latitude: latitude,
        longitude: longitude,
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

  /**
   * Get available agencies for a healthcare user (agencies marked as available)
   * Returns only agencies where availabilityStatus.isAvailable = true
   * Includes both registered agencies (with EMS accounts) and user-added agencies
   */
  async getAvailableAgenciesForHealthcareUser(
    healthcareUserId: string
  ): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();

    // Get all agencies: both registered agencies (with EMS accounts) and user-added agencies
    // Registered agencies have addedBy = null (they have EMS user accounts)
    // User-added agencies have addedBy = healthcareUserId (manually added by healthcare user)
    const agencies = await prisma.eMSAgency.findMany({
      where: {
        OR: [
          { addedBy: null }, // Registered agencies with EMS accounts
          { addedBy: healthcareUserId } // Agencies manually added by this healthcare user
        ],
        isActive: true,
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

    // Filter to only available agencies and transform
    const availableAgencies = agencies
      .filter((agency: any) => {
        // Check if agency has availabilityStatus and isAvailable is true
        if (!agency.availabilityStatus) {
          return false;
        }
        
        try {
          const status = typeof agency.availabilityStatus === 'string'
            ? JSON.parse(agency.availabilityStatus)
            : agency.availabilityStatus;
          
          return status.isAvailable === true;
        } catch (error) {
          console.error('Error parsing availabilityStatus:', error);
          return false;
        }
      })
      .map((agency: any) => {
        // Parse availabilityStatus to get availableLevels
        let availableLevels: string[] = [];
        try {
          const status = typeof agency.availabilityStatus === 'string'
            ? JSON.parse(agency.availabilityStatus)
            : agency.availabilityStatus;
          availableLevels = Array.isArray(status.availableLevels) ? status.availableLevels : [];
        } catch (error) {
          console.error('Error parsing availableLevels:', error);
        }

        return {
          ...agency,
          isPreferred: agency.healthcarePreferences?.[0]?.isPreferred || false,
          availableLevels,
          healthcarePreferences: undefined, // Remove nested preferences
        };
      });

    // Sort by preferred status first, then alphabetically
    availableAgencies.sort((a: any, b: any) => {
      // Preferred agencies first
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;
      // Then alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return availableAgencies;
  }
}

export const healthcareAgencyService = new HealthcareAgencyService();
export default healthcareAgencyService;

