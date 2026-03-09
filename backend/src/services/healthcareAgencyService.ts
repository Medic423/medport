import { databaseManager } from "./databaseManager";
import { GeocodingService } from "../utils/geocodingService";

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
  status?: string;
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
  /** Get all EMS agencies for a healthcare organization */
  async getAgenciesForHealthcareUser(
    healthcareOrgId: string,
    filters: HealthcareAgencySearchFilters = {}
  ): Promise<HealthcareAgencyListResult> {
    const prisma = databaseManager.getPrismaClient();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      OR: [
        { addedBy: healthcareOrgId },
        {
          incomingPreferences: {
            some: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" },
          },
        },
      ],
    };

    if (whereFilters.name) where.name = { contains: whereFilters.name, mode: "insensitive" };
    if (whereFilters.city) where.city = { contains: whereFilters.city, mode: "insensitive" };
    if (whereFilters.state) where.state = { contains: whereFilters.state, mode: "insensitive" };
    if (whereFilters.capabilities?.length) where.capabilities = { hasSome: whereFilters.capabilities };
    if (whereFilters.isActive !== undefined) where.isActive = whereFilters.isActive;

    const [agencies, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          incomingPreferences: {
            where: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" },
            select: { value: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ]);

    const transformedAgencies = agencies.map((agency: any) => {
      const pref = agency.incomingPreferences?.[0];
      const isPreferred = pref?.value ? (pref.value as any).isPreferred === true : false;
      return { ...agency, isPreferred, incomingPreferences: undefined };
    });

    let filteredAgencies = transformedAgencies;
    if (whereFilters.status && whereFilters.status !== "all") {
      filteredAgencies = transformedAgencies.filter((agency: any) => {
        if (whereFilters.status === "preferred") return agency.isPreferred === true;
        if (whereFilters.status === "regular") return agency.isPreferred === false;
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

  async getAgencyByIdForHealthcareUser(id: string, healthcareOrgId: string): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return prisma.organization.findFirst({
      where: {
        id,
        OR: [
          { addedBy: healthcareOrgId },
          { incomingPreferences: { some: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" } } },
        ],
      },
      include: {
        incomingPreferences: {
          where: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" },
          select: { value: true },
        },
      },
    });
  }

  async createAgencyForHealthcareUser(healthcareOrgId: string, data: HealthcareAgencyData): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    let latitude = data.latitude ? parseFloat(String(data.latitude)) : null;
    let longitude = data.longitude ? parseFloat(String(data.longitude)) : null;

    if (!latitude || !longitude) {
      const geocodeResult = await GeocodingService.geocodeAddress(
        data.address, data.city, data.state, data.zipCode, data.name
      );
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
      }
    }

    const agency = await prisma.organization.create({
      data: {
        organizationType: "EMS",
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude,
        longitude,
        serviceArea: data.serviceArea || [],
        operatingHours: data.operatingHours,
        capabilities: data.capabilities,
        pricingStructure: data.pricingStructure,
        status: data.status ?? "ACTIVE",
        isActive: data.isActive ?? true,
        addedBy: healthcareOrgId,
      },
    });

    await prisma.organizationPreference.create({
      data: {
        organizationId: healthcareOrgId,
        preferenceType: "PREFERRED_EMS_AGENCY",
        targetOrganizationId: agency.id,
        value: { isPreferred: data.isPreferred ?? false },
      },
    });

    return agency;
  }

  async updateAgencyForHealthcareUser(id: string, healthcareOrgId: string, data: Partial<HealthcareAgencyData>): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const existingAgency = await prisma.organization.findFirst({ where: { id, addedBy: healthcareOrgId } });
    if (!existingAgency) throw new Error("Agency not found or access denied");

    return prisma.organization.update({
      where: { id },
      data: {
        name: data.name, contactName: data.contactName, phone: data.phone,
        email: data.email, address: data.address, city: data.city, state: data.state,
        zipCode: data.zipCode, serviceArea: data.serviceArea, operatingHours: data.operatingHours,
        capabilities: data.capabilities, pricingStructure: data.pricingStructure,
        status: data.status, isActive: data.isActive, updatedAt: new Date(),
      },
    });
  }

  async deleteAgencyForHealthcareUser(id: string, healthcareOrgId: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();

    const existingAgency = await prisma.organization.findFirst({
      where: {
        id,
        OR: [
          { addedBy: healthcareOrgId },
          { incomingPreferences: { some: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" } } },
        ],
      },
    });
    if (!existingAgency) throw new Error("Agency not found or access denied");

    if (existingAgency.addedBy === healthcareOrgId) {
      await prisma.organization.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
    } else {
      await prisma.organizationPreference.deleteMany({
        where: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY", targetOrganizationId: id },
      });
    }
  }

  async togglePreferredStatus(healthcareOrgId: string, agencyId: string, isPreferred: boolean): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const agency = await prisma.organization.findFirst({
      where: {
        id: agencyId,
        OR: [
          { addedBy: healthcareOrgId },
          { incomingPreferences: { some: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" } } },
        ],
      },
    });
    if (!agency) throw new Error("Agency not found or access denied");

    return prisma.organizationPreference.upsert({
      where: {
        organizationId_preferenceType_targetOrganizationId: {
          organizationId: healthcareOrgId,
          preferenceType: "PREFERRED_EMS_AGENCY",
          targetOrganizationId: agencyId,
        },
      },
      update: { value: { isPreferred }, updatedAt: new Date() },
      create: {
        organizationId: healthcareOrgId,
        preferenceType: "PREFERRED_EMS_AGENCY",
        targetOrganizationId: agencyId,
        value: { isPreferred },
      },
    });
  }

  async searchAgenciesForHealthcareUser(healthcareOrgId: string, query: string): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    return prisma.organization.findMany({
      where: {
        addedBy: healthcareOrgId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { contactName: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });
  }

  async searchRegisteredAgenciesForHealthcareUser(healthcareOrgId: string, query: string): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    return prisma.organization.findMany({
      where: {
        addedBy: null,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { state: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        incomingPreferences: {
          where: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" },
          select: { id: true },
        },
      },
      take: 15,
      orderBy: { name: "asc" },
    }).then((agencies: any[]) =>
      agencies.map((a) => ({
        id: a.id, name: a.name, contactName: a.contactName, phone: a.phone,
        email: a.email, address: a.address, city: a.city, state: a.state,
        zipCode: a.zipCode, capabilities: a.capabilities || [],
        alreadyAdded: (a.incomingPreferences?.length ?? 0) > 0,
      }))
    );
  }

  async addExistingAgencyToHealthcareUser(healthcareOrgId: string, agencyId: string, isPreferred: boolean = false): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const agency = await prisma.organization.findFirst({ where: { id: agencyId, addedBy: null, isActive: true } });
    if (!agency) throw new Error("Agency not found or access denied. Only registered EMS agencies can be added.");

    const preference = await prisma.organizationPreference.upsert({
      where: {
        organizationId_preferenceType_targetOrganizationId: {
          organizationId: healthcareOrgId,
          preferenceType: "PREFERRED_EMS_AGENCY",
          targetOrganizationId: agencyId,
        },
      },
      update: { value: { isPreferred }, updatedAt: new Date() },
      create: {
        organizationId: healthcareOrgId,
        preferenceType: "PREFERRED_EMS_AGENCY",
        targetOrganizationId: agencyId,
        value: { isPreferred },
      },
    });

    return { ...agency, isPreferred: (preference.value as any)?.isPreferred ?? false };
  }

  async getAvailableAgenciesForHealthcareUser(healthcareOrgId: string, radiusMiles?: number | null): Promise<any[]> {
    try {
      const prisma = databaseManager.getPrismaClient();
      
      let DistanceService: any;
      try {
        const distanceModule = await import("./distanceService");
        DistanceService = distanceModule.DistanceService;
      } catch (importError: any) {
        throw new Error(`Distance calculation service unavailable: ${importError.message}`);
      }

      const primaryLocation = await prisma.facility.findFirst({
        where: { organizationId: healthcareOrgId, isActive: true },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      });

      const agencies = await prisma.organization.findMany({
        where: {
          OR: [{ addedBy: null }, { addedBy: healthcareOrgId }],
          isActive: true,
        },
        include: {
          incomingPreferences: {
            where: { organizationId: healthcareOrgId, preferenceType: "PREFERRED_EMS_AGENCY" },
            select: { value: true },
          },
        },
      });

      const availableAgencies = agencies
        .filter((agency: any) => {
          const status = (() => {
            try {
              return typeof agency.availabilityStatus === "string"
                ? JSON.parse(agency.availabilityStatus) : agency.availabilityStatus;
            } catch { return null; }
          })();
          return status?.isAvailable === true;
        })
        .map((agency: any) => {
          const pref = agency.incomingPreferences?.[0];
          const isPreferred = pref?.value ? (pref.value as any).isPreferred === true : false;
          let availableLevels: string[] = [];
          try {
            const status = typeof agency.availabilityStatus === "string"
              ? JSON.parse(agency.availabilityStatus) : agency.availabilityStatus;
            availableLevels = Array.isArray(status?.availableLevels) ? status.availableLevels : [];
          } catch { /* ignore */ }

          let distance: number | null = null;
          if (primaryLocation?.latitude && primaryLocation?.longitude && agency.latitude && agency.longitude) {
            try {
              distance = DistanceService.calculateDistance(
                { latitude: primaryLocation.latitude, longitude: primaryLocation.longitude },
                { latitude: agency.latitude, longitude: agency.longitude }
              );
            } catch { /* ignore */ }
          }

          return { ...agency, isPreferred, availableLevels, distance, incomingPreferences: undefined };
        })
        .filter((agency: any) => {
          if (radiusMiles == null) return true;
          if (agency.distance === null) return true;
          return agency.distance <= radiusMiles;
        });

      availableAgencies.sort((a: any, b: any) => {
        if (a.isPreferred && !b.isPreferred) return -1;
        if (!a.isPreferred && b.isPreferred) return 1;
        if (a.distance !== null && b.distance !== null && a.distance !== b.distance) return a.distance - b.distance;
        if (a.distance !== null && b.distance === null) return -1;
        if (a.distance === null && b.distance !== null) return 1;
        return a.name.localeCompare(b.name);
      });

      return availableAgencies;
    } catch (error: any) {
      console.error("Error in getAvailableAgenciesForHealthcareUser:", error);
      throw error;
    }
  }
}

export const healthcareAgencyService = new HealthcareAgencyService();
export default healthcareAgencyService;