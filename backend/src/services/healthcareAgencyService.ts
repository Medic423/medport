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
   * Get all agencies for a healthcare user with their preference status.
   * Includes: agencies added by user (addedBy) OR agencies linked via HealthcareAgencyPreference.
   */
  async getAgenciesForHealthcareUser(
    healthcareUserId: string,
    filters: HealthcareAgencySearchFilters = {}
  ): Promise<HealthcareAgencyListResult> {
    const prisma = databaseManager.getPrismaClient();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      OR: [
        { addedBy: healthcareUserId }, // Manually created by this user
        {
          healthcarePreferences: {
            some: {
              healthcareUserId,
            },
          },
        }, // Linked via preference (incl. registered agencies)
      ],
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
              healthcareUserId,
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
   * Get a single agency by ID (owned by user or linked via preference)
   */
  async getAgencyByIdForHealthcareUser(
    id: string,
    healthcareUserId: string
  ): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.eMSAgency.findFirst({
      where: {
        id,
        OR: [
          { addedBy: healthcareUserId },
          {
            healthcarePreferences: {
              some: { healthcareUserId },
            },
          },
        ],
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
   * Remove agency from healthcare user's list.
   * - If user created it (addedBy): soft-delete the agency.
   * - If registered agency (addedBy: null): remove the preference only.
   */
  async deleteAgencyForHealthcareUser(id: string, healthcareUserId: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();

    const existingAgency = await prisma.eMSAgency.findFirst({
      where: {
        id,
        OR: [
          { addedBy: healthcareUserId },
          {
            healthcarePreferences: {
              some: { healthcareUserId },
            },
          },
        ],
      },
    });

    if (!existingAgency) {
      throw new Error('Agency not found or access denied');
    }

    if (existingAgency.addedBy === healthcareUserId) {
      // User created it: soft-delete the agency
      await prisma.eMSAgency.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } else {
      // Registered agency: remove the preference only
      await prisma.healthcareAgencyPreference.deleteMany({
        where: {
          healthcareUserId,
          agencyId: id,
        },
      });
    }
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

    // Verify the agency exists and is accessible (owned or linked via preference)
    const agency = await prisma.eMSAgency.findFirst({
      where: {
        id: agencyId,
        OR: [
          { addedBy: healthcareUserId },
          {
            healthcarePreferences: {
              some: { healthcareUserId },
            },
          },
        ],
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
   * Search registered EMS agencies (addedBy = null) for healthcare to add to their list.
   * Marks agencies already in user's list via HealthcareAgencyPreference as alreadyAdded.
   */
  async searchRegisteredAgenciesForHealthcareUser(
    healthcareUserId: string,
    query: string
  ): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.eMSAgency.findMany({
      where: {
        addedBy: null, // Registered agencies only (TCC Admin list)
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        healthcarePreferences: {
          where: {
            healthcareUserId,
          },
          select: { id: true },
        },
      },
      take: 15,
      orderBy: { name: 'asc' },
    }).then((agencies) =>
      agencies.map((a: any) => ({
        id: a.id,
        name: a.name,
        contactName: a.contactName,
        phone: a.phone,
        email: a.email,
        address: a.address,
        city: a.city,
        state: a.state,
        zipCode: a.zipCode,
        capabilities: a.capabilities || [],
        alreadyAdded: (a.healthcarePreferences?.length ?? 0) > 0,
      }))
    );
  }

  /**
   * Add an existing registered agency to a healthcare user's list (create preference only).
   */
  async addExistingAgencyToHealthcareUser(
    healthcareUserId: string,
    agencyId: string,
    isPreferred: boolean = false
  ): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const agency = await prisma.eMSAgency.findFirst({
      where: {
        id: agencyId,
        addedBy: null, // Must be registered agency
        isActive: true,
      },
    });

    if (!agency) {
      throw new Error('Agency not found or access denied. Only registered EMS agencies can be added.');
    }

    const preference = await prisma.healthcareAgencyPreference.upsert({
      where: {
        healthcareUserId_agencyId: {
          healthcareUserId,
          agencyId,
        },
      },
      update: {
        isPreferred,
        updatedAt: new Date(),
      },
      create: {
        healthcareUserId,
        agencyId,
        isPreferred,
      },
    });

    return { ...agency, isPreferred: preference.isPreferred };
  }

  /**
   * Get available agencies for a healthcare user (agencies marked as available)
   * Returns only agencies where availabilityStatus.isAvailable = true
   * Includes both registered agencies (with EMS accounts) and user-added agencies
   * Filters by distance from healthcare user's primary facility location
   */
  async getAvailableAgenciesForHealthcareUser(
    healthcareUserId: string,
    radiusMiles?: number | null
  ): Promise<any[]> {
    try {
      const prisma = databaseManager.getPrismaClient();
      
      // Import DistanceService with better error handling
      let DistanceService;
      try {
        const distanceModule = await import('./distanceService');
        DistanceService = distanceModule.DistanceService;
      } catch (importError: any) {
        console.error('Failed to import DistanceService:', importError);
        throw new Error(`Distance calculation service unavailable: ${importError.message}`);
      }

      // Get healthcare user's primary location (or first active location)
      const primaryLocation = await prisma.healthcareLocation.findFirst({
        where: {
          healthcareUserId: healthcareUserId,
          isActive: true,
          OR: [
            { isPrimary: true },
            { isPrimary: false } // If no primary, get first active
          ]
        },
        orderBy: [
          { isPrimary: 'desc' }, // Primary first
          { createdAt: 'asc' } // Then oldest
        ]
      });

      if (!primaryLocation) {
        console.warn(`No healthcare location found for user ${healthcareUserId} - distance calculation will be skipped`);
      }

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

      console.log(`Found ${agencies.length} total agencies for healthcare user ${healthcareUserId}`);

      // Filter to only available agencies, calculate distances, and transform
      const availableAgenciesWithDistance = agencies
      .filter((agency: any) => {
        // Check if agency has availabilityStatus and isAvailable is true
        if (!agency.availabilityStatus) {
          console.debug(`Agency ${agency.id} (${agency.name}) has no availabilityStatus`);
          return false;
        }
        
        try {
          const status = typeof agency.availabilityStatus === 'string'
            ? JSON.parse(agency.availabilityStatus)
            : agency.availabilityStatus;
          
          const isAvailable = status.isAvailable === true;
          if (isAvailable) {
            console.debug(`Agency ${agency.id} (${agency.name}) is marked as available`);
          }
          return isAvailable;
        } catch (error) {
          console.error(`Error parsing availabilityStatus for agency ${agency.id}:`, error);
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

        // Calculate distance from healthcare facility to agency
        let distance: number | null = null;
        if (primaryLocation?.latitude && primaryLocation?.longitude && 
            agency.latitude && agency.longitude) {
          try {
            distance = DistanceService.calculateDistance(
              { latitude: primaryLocation.latitude, longitude: primaryLocation.longitude },
              { latitude: agency.latitude, longitude: agency.longitude }
            );
          } catch (error) {
            console.error('Error calculating distance:', error);
          }
        }

        return {
          ...agency,
          isPreferred: agency.healthcarePreferences?.[0]?.isPreferred || false,
          availableLevels,
          distance,
          healthcarePreferences: undefined, // Remove nested preferences
        };
      })
      .filter((agency: any) => {
        // Filter by radius if specified (null means show all)
        if (radiusMiles === null || radiusMiles === undefined) {
          return true; // Show all if no radius specified
        }
        if (agency.distance === null) {
          return true; // Include agencies without distance (no coordinates)
        }
        return agency.distance <= radiusMiles;
      });

      // Sort by preferred status first, then by distance, then alphabetically
      availableAgenciesWithDistance.sort((a: any, b: any) => {
        // Preferred agencies first
        if (a.isPreferred && !b.isPreferred) return -1;
        if (!a.isPreferred && b.isPreferred) return 1;
        
        // Then by distance (closest first)
        if (a.distance !== null && b.distance !== null) {
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
        } else if (a.distance !== null && b.distance === null) {
          return -1; // Agencies with distance come before those without
        } else if (a.distance === null && b.distance !== null) {
          return 1;
        }
        
        // Finally alphabetically by name
        return a.name.localeCompare(b.name);
      });

      console.log(`Returning ${availableAgenciesWithDistance.length} available agencies`);
      return availableAgenciesWithDistance;
      
    } catch (error: any) {
      console.error('Error in getAvailableAgenciesForHealthcareUser:', error);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw to be caught by route handler
    }
  }
}

export const healthcareAgencyService = new HealthcareAgencyService();
export default healthcareAgencyService;

