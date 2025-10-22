import { databaseManager } from './databaseManager';

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export class CoordinateService {
  private coordinateCache: Map<string, LocationData>;
  private cacheExpiry: number;
  private cacheTimestamps: Map<string, number>;

  constructor() {
    this.coordinateCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.cacheTimestamps = new Map();
  }

  /**
   * Get coordinates for a facility by ID
   */
  async getFacilityCoordinates(facilityId: string): Promise<LocationData | null> {
    // Check cache first
    const cacheKey = `facility_${facilityId}`;
    if (this.isCacheValid(cacheKey)) {
      console.log('TCC_DEBUG: Using cached coordinates for facility:', facilityId);
      return this.coordinateCache.get(cacheKey) || null;
    }

    try {
      const prisma = databaseManager.getCenterDB();
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true,
          city: true,
          state: true
        }
      });

      if (!facility) {
        console.warn('TCC_DEBUG: Facility not found:', facilityId);
        return null;
      }

      if (facility.latitude && facility.longitude) {
        const locationData: LocationData = {
          lat: facility.latitude,
          lng: facility.longitude,
          name: facility.name,
          address: `${facility.address}, ${facility.city}, ${facility.state}`
        };

        // Cache the result
        this.coordinateCache.set(cacheKey, locationData);
        this.cacheTimestamps.set(cacheKey, Date.now());

        console.log('TCC_DEBUG: Retrieved coordinates for facility:', {
          id: facilityId,
          name: facility.name,
          coordinates: locationData
        });

        return locationData;
      } else {
        console.warn('TCC_DEBUG: Facility has no coordinates:', facilityId, facility.name);
        return null;
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error fetching facility coordinates:', error);
      return null;
    }
  }

  /**
   * Get coordinates for multiple facilities
   */
  async getFacilitiesCoordinates(facilityIds: string[]): Promise<Map<string, LocationData>> {
    const coordinates = new Map<string, LocationData>();

    // Process in parallel
    const promises = facilityIds.map(async (facilityId) => {
      const coords = await this.getFacilityCoordinates(facilityId);
      if (coords) {
        coordinates.set(facilityId, coords);
      }
    });

    await Promise.all(promises);
    return coordinates;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in miles
   */
  calculateDistance(point1: LocationData, point2: LocationData): number {
    const R = 3959; // Earth's radius in miles

    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return (Date.now() - timestamp) < this.cacheExpiry;
  }

  /**
   * Clear coordinate cache
   */
  clearCache(): void {
    this.coordinateCache.clear();
    this.cacheTimestamps.clear();
    console.log('TCC_DEBUG: Coordinate cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.coordinateCache.size,
      entries: Array.from(this.coordinateCache.keys())
    };
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get default coordinates (fallback)
   */
  getDefaultCoordinates(): LocationData {
    return {
      lat: 40.7128, // NYC
      lng: -74.0060,
      name: 'Default Location',
      address: 'New York, NY'
    };
  }

  /**
   * Check if coordinates are valid
   */
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}

export const coordinateService = new CoordinateService();
export default coordinateService;



