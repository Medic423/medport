import { databaseManager } from "./databaseManager";
import { GeocodingService } from "../utils/geocodingService";

export interface HealthcareDestinationData {
  name: string;
  type?: string;
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
  async getDestinationsForHealthcareUser(
    organizationId: string,
    filters: HealthcareDestinationSearchFilters = {}
  ): Promise<HealthcareDestinationListResult> {
    const prisma = databaseManager.getPrismaClient();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    try {
      const where: any = { organizationId, isActive: true };

      if (whereFilters.name) where.name = { contains: whereFilters.name, mode: "insensitive" };
      if (whereFilters.type) where.facilityType = whereFilters.type;
      if (whereFilters.city) where.city = { contains: whereFilters.city, mode: "insensitive" };
      if (whereFilters.state) where.state = whereFilters.state;
      if (whereFilters.isActive !== undefined) where.isActive = whereFilters.isActive;

      const [destinations, total] = await Promise.all([
        prisma.facility.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.facility.count({ where }),
      ]);

      return {
        destinations: destinations || [],
        total: total || 0,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error("Error in getDestinationsForHealthcareUser:", error);
      return { destinations: [], total: 0, page, totalPages: 0 };
    }
  }

  async getDestinationByIdForHealthcareUser(id: string, organizationId: string): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return prisma.facility.findFirst({ where: { id, organizationId } });
  }

  async createDestinationForHealthcareUser(organizationId: string, data: HealthcareDestinationData): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (data.latitude) {
      const v = parseFloat(String(data.latitude));
      if (!isNaN(v) && v !== 0) latitude = v;
    }
    if (data.longitude) {
      const v = parseFloat(String(data.longitude));
      if (!isNaN(v) && v !== 0) longitude = v;
    }

    if (!latitude || !longitude) {
      const geocodeResult = await GeocodingService.geocodeAddress(
        data.address, data.city, data.state, data.zipCode, data.name
      );
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
      } else {
        latitude = null;
        longitude = null;
      }
    }

    return prisma.facility.create({
      data: {
        organizationId,
        name: data.name,
        facilityType: (data.type as any) || "OTHER",
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        latitude,
        longitude,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateDestinationForHealthcareUser(id: string, organizationId: string, data: Partial<HealthcareDestinationData>): Promise<any> {
    const prisma = databaseManager.getPrismaClient();

    const existing = await prisma.facility.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Destination not found or access denied");

    const { type, ...rest } = data;
    return prisma.facility.update({
      where: { id },
      data: { ...rest, ...(type ? { facilityType: type as any } : {}) },
    });
  }

  async deleteDestinationForHealthcareUser(id: string, organizationId: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();

    const existing = await prisma.facility.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Destination not found or access denied");

    await prisma.facility.update({ where: { id }, data: { isActive: false } });
  }
}

export const healthcareDestinationService = new HealthcareDestinationService();