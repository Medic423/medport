import { PrismaClient } from "@prisma/client";
import { GeocodingService } from "../utils/geocodingService";

const prisma = new PrismaClient();

interface CreateLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  facilityType: string;
  isActive?: boolean;
  isPrimary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface UpdateLocationData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  facilityType?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export class HealthcareLocationsService {
  async createLocation(organizationId: string, locationData: CreateLocationData) {
    if (locationData.isPrimary) {
      await prisma.facility.updateMany({
        where: { organizationId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    let latitude = locationData.latitude;
    let longitude = locationData.longitude;

    if (!latitude || !longitude) {
      const geocodeResult = await GeocodingService.geocodeAddress(
        locationData.address, locationData.city, locationData.state,
        locationData.zipCode, locationData.name
      );
      if (geocodeResult.success) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
      }
    }

    return prisma.facility.create({
      data: {
        organizationId,
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zipCode,
        phone: locationData.phone,
        facilityType: locationData.facilityType as any,
        isActive: locationData.isActive ?? true,
        isPrimary: locationData.isPrimary ?? false,
        latitude,
        longitude,
      },
    });
  }

  async getLocationsByOrganizationId(organizationId: string) {
    return prisma.facility.findMany({
      where: { organizationId },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    });
  }

  /** @deprecated Use getLocationsByOrganizationId */
  async getLocationsByUserId(organizationId: string) {
    return this.getLocationsByOrganizationId(organizationId);
  }

  async getActiveLocations(organizationId: string) {
    return prisma.facility.findMany({
      where: { organizationId, isActive: true },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    });
  }

  async getLocationById(locationId: string, organizationId: string) {
    const location = await prisma.facility.findFirst({
      where: { id: locationId, organizationId },
    });
    if (!location) throw new Error("Location not found or access denied");
    return location;
  }

  async updateLocation(locationId: string, organizationId: string, updateData: UpdateLocationData) {
    await this.getLocationById(locationId, organizationId);

    if (updateData.isPrimary) {
      await prisma.facility.updateMany({
        where: { organizationId, isPrimary: true, id: { not: locationId } },
        data: { isPrimary: false },
      });
    }

    const addressFieldsChanged = updateData.address || updateData.city || updateData.state || updateData.zipCode;
    if (addressFieldsChanged && !updateData.latitude && !updateData.longitude) {
      const existing = await this.getLocationById(locationId, organizationId);
      const geocodeResult = await GeocodingService.geocodeAddress(
        updateData.address || existing.address,
        updateData.city || existing.city,
        updateData.state || existing.state,
        updateData.zipCode || existing.zipCode,
        updateData.name || existing.name
      );
      if (geocodeResult.success) {
        updateData.latitude = geocodeResult.latitude;
        updateData.longitude = geocodeResult.longitude;
      }
    }

    const { facilityType, ...rest } = updateData;
    return prisma.facility.update({
      where: { id: locationId },
      data: { ...rest, ...(facilityType ? { facilityType: facilityType as any } : {}) },
    });
  }

  async deleteLocation(locationId: string, organizationId: string) {
    await this.getLocationById(locationId, organizationId);

    const tripsCount = await prisma.transportRequest.count({ where: { fromLocationId: locationId } });
    if (tripsCount > 0) {
      throw new Error(`Cannot delete location. There are ${tripsCount} trip(s) associated with this location.`);
    }

    await prisma.facility.delete({ where: { id: locationId } });
    return { success: true, message: "Location deleted successfully" };
  }

  async setPrimaryLocation(locationId: string, organizationId: string) {
    await this.getLocationById(locationId, organizationId);

    await prisma.facility.updateMany({
      where: { organizationId, isPrimary: true },
      data: { isPrimary: false },
    });

    return prisma.facility.update({ where: { id: locationId }, data: { isPrimary: true } });
  }

  async getLocationStatistics(organizationId: string) {
    const locations = await this.getLocationsByOrganizationId(organizationId);

    return Promise.all(
      locations.map(async (location) => {
        const [tripCount, pendingTrips, completedTrips] = await Promise.all([
          prisma.transportRequest.count({ where: { fromLocationId: location.id } }),
          prisma.transportRequest.count({ where: { fromLocationId: location.id, status: "PENDING" } }),
          prisma.transportRequest.count({ where: { fromLocationId: location.id, status: "COMPLETED" } }),
        ]);
        return { ...location, statistics: { totalTrips: tripCount, pendingTrips, completedTrips } };
      })
    );
  }
}

export const healthcareLocationsService = new HealthcareLocationsService();