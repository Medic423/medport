import { PrismaClient, DistanceMatrix, Facility, RouteType } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Cache for distance calculations to avoid repeated API calls
const distanceCache = new Map<string, { distance: number; time: number; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface DistanceCalculationResult {
  distanceMiles: number;
  estimatedTimeMinutes: number;
  trafficFactor: number;
  tolls: number;
  routeType: RouteType;
}

export interface RouteOptimizationResult {
  totalDistance: number;
  totalTime: number;
  milesSaved: number;
  unitsSaved: number;
  optimizationScore: number;
  chainingOpportunities: any[];
}

export class DistanceService {
  private googleMapsApiKey: string;

  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.googleMapsApiKey) {
      console.warn('DISTANCE_SERVICE: Google Maps API key not configured');
    }
  }

  /**
   * Calculate distance between two facilities using Google Maps API
   */
  async calculateDistance(
    fromFacility: Facility,
    toFacility: Facility,
    routeType: RouteType = 'FASTEST'
  ): Promise<DistanceCalculationResult> {
    const cacheKey = `${fromFacility.id}-${toFacility.id}-${routeType}`;
    
    // Check cache first
    const cached = distanceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`DISTANCE_SERVICE: Using cached distance for ${cacheKey}`);
      return {
        distanceMiles: cached.distance,
        estimatedTimeMinutes: cached.time,
        trafficFactor: 1.0,
        tolls: 0.0,
        routeType
      };
    }

    try {
      if (!this.googleMapsApiKey) {
        // Fallback to coordinate-based calculation if no API key
        return this.calculateDistanceFromCoordinates(fromFacility, toFacility, routeType);
      }

      const origin = this.formatAddress(fromFacility);
      const destination = this.formatAddress(toFacility);
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&key=${this.googleMapsApiKey}`;
      
      console.log(`DISTANCE_SERVICE: Calculating distance from ${origin} to ${destination}`);
      
      const response = await axios.get(url);
      
      if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
        const element = response.data.rows[0].elements[0];
        const distanceMiles = element.distance.value * 0.000621371; // Convert meters to miles
        const estimatedTimeMinutes = Math.ceil(element.duration.value / 60); // Convert seconds to minutes
        
        // Cache the result
        distanceCache.set(cacheKey, {
          distance: distanceMiles,
          time: estimatedTimeMinutes,
          timestamp: Date.now()
        });

        console.log(`DISTANCE_SERVICE: Calculated ${distanceMiles.toFixed(2)} miles, ${estimatedTimeMinutes} minutes`);
        
        return {
          distanceMiles,
          estimatedTimeMinutes,
          trafficFactor: 1.0, // Google API includes traffic
          tolls: 0.0, // Would need additional API call for tolls
          routeType
        };
      } else {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error calculating distance:', error);
      
      // Fallback to coordinate-based calculation
      return this.calculateDistanceFromCoordinates(fromFacility, toFacility, routeType);
    }
  }

  /**
   * Fallback distance calculation using coordinates (Haversine formula)
   */
  private calculateDistanceFromCoordinates(
    fromFacility: Facility,
    toFacility: Facility,
    routeType: RouteType
  ): DistanceCalculationResult {
    if (!fromFacility.coordinates || !toFacility.coordinates) {
      // If no coordinates, estimate based on zip codes
      return this.estimateDistanceFromZipCodes(fromFacility, toFacility, routeType);
    }

    const fromCoords = fromFacility.coordinates as { lat: number; lng: number };
    const toCoords = toFacility.coordinates as { lat: number; lng: number };
    
    const distanceMiles = this.haversineDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    );
    
    // Estimate time based on average speed (45 mph for medical transport)
    const estimatedTimeMinutes = Math.ceil((distanceMiles / 45) * 60);
    
    console.log(`DISTANCE_SERVICE: Estimated ${distanceMiles.toFixed(2)} miles, ${estimatedTimeMinutes} minutes using coordinates`);
    
    return {
      distanceMiles,
      estimatedTimeMinutes,
      trafficFactor: 1.2, // Higher factor for estimated calculations
      tolls: 0.0,
      routeType
    };
  }

  /**
   * Estimate distance based on zip codes (rough approximation)
   */
  private estimateDistanceFromZipCodes(
    fromFacility: Facility,
    toFacility: Facility,
    routeType: RouteType
  ): DistanceCalculationResult {
    // This is a very rough estimation - in production, you'd want a zip code database
    const distanceMiles = 25.0; // Default fallback
    const estimatedTimeMinutes = 45; // Default fallback
    
    console.log(`DISTANCE_SERVICE: Using fallback distance: ${distanceMiles} miles, ${estimatedTimeMinutes} minutes`);
    
    return {
      distanceMiles,
      estimatedTimeMinutes,
      trafficFactor: 1.5, // Higher factor for rough estimates
      tolls: 0.0,
      routeType
    };
  }

  /**
   * Haversine formula for calculating distance between two points on Earth
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format facility address for Google Maps API
   */
  private formatAddress(facility: Facility): string {
    return `${facility.address}, ${facility.city}, ${facility.state} ${facility.zipCode}`;
  }

  /**
   * Get or create distance matrix entry between two facilities
   */
  async getOrCreateDistanceMatrix(
    fromFacilityId: string,
    toFacilityId: string,
    routeType: RouteType = 'FASTEST'
  ): Promise<DistanceMatrix> {
    try {
      // Check if distance matrix entry exists
      let distanceMatrix = await prisma.distanceMatrix.findUnique({
        where: {
          fromFacilityId_toFacilityId: {
            fromFacilityId,
            toFacilityId
          }
        }
      });

      if (distanceMatrix) {
        // Check if data is recent (less than 24 hours old)
        const isRecent = Date.now() - distanceMatrix.lastUpdated.getTime() < CACHE_DURATION;
        if (isRecent) {
          console.log(`DISTANCE_SERVICE: Using existing distance matrix for ${fromFacilityId} to ${toFacilityId}`);
          return distanceMatrix;
        }
      }

      // Get facility details
      const [fromFacility, toFacility] = await Promise.all([
        prisma.facility.findUnique({ where: { id: fromFacilityId } }),
        prisma.facility.findUnique({ where: { id: toFacilityId } })
      ]);

      if (!fromFacility || !toFacility) {
        throw new Error('One or both facilities not found');
      }

      // Calculate new distance
      const distanceResult = await this.calculateDistance(fromFacility, toFacility, routeType);

      if (distanceMatrix) {
        // Update existing entry
        distanceMatrix = await prisma.distanceMatrix.update({
          where: { id: distanceMatrix.id },
          data: {
            distanceMiles: distanceResult.distanceMiles,
            estimatedTimeMinutes: distanceResult.estimatedTimeMinutes,
            trafficFactor: distanceResult.trafficFactor,
            tolls: distanceResult.tolls,
            routeType: distanceResult.routeType,
            lastUpdated: new Date()
          }
        });
      } else {
        // Create new entry
        distanceMatrix = await prisma.distanceMatrix.create({
          data: {
            fromFacilityId,
            toFacilityId,
            distanceMiles: distanceResult.distanceMiles,
            estimatedTimeMinutes: distanceResult.estimatedTimeMinutes,
            trafficFactor: distanceResult.trafficFactor,
            tolls: distanceResult.tolls,
            routeType: distanceResult.routeType
          }
        });
      }

      console.log(`DISTANCE_SERVICE: Created/updated distance matrix: ${distanceResult.distanceMiles.toFixed(2)} miles`);
      return distanceMatrix;
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error in getOrCreateDistanceMatrix:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix for a specific facility pair
   */
  async getDistanceMatrix(fromFacilityId: string, toFacilityId: string): Promise<DistanceMatrix | null> {
    try {
      return await prisma.distanceMatrix.findUnique({
        where: {
          fromFacilityId_toFacilityId: {
            fromFacilityId,
            toFacilityId
          }
        }
      });
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error getting distance matrix:', error);
      throw error;
    }
  }

  /**
   * Get all distances from a specific facility
   */
  async getDistancesFromFacility(facilityId: string): Promise<DistanceMatrix[]> {
    try {
      return await prisma.distanceMatrix.findMany({
        where: { fromFacilityId: facilityId },
        include: {
          toFacility: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              state: true
            }
          }
        }
      });
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error getting distances from facility:', error);
      throw error;
    }
  }

  /**
   * Get all distances to a specific facility
   */
  async getDistancesToFacility(facilityId: string): Promise<DistanceMatrix[]> {
    try {
      return await prisma.distanceMatrix.findMany({
        where: { toFacilityId: facilityId },
        include: {
          fromFacility: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              state: true
            }
          }
        }
      });
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error getting distances to facility:', error);
      throw error;
    }
  }

  /**
   * Update distance matrix entry manually
   */
  async updateDistanceMatrix(
    fromFacilityId: string,
    toFacilityId: string,
    data: Partial<Omit<DistanceMatrix, 'id' | 'fromFacilityId' | 'toFacilityId'>>
  ): Promise<DistanceMatrix> {
    try {
      return await prisma.distanceMatrix.update({
        where: {
          fromFacilityId_toFacilityId: {
            fromFacilityId,
            toFacilityId
          }
        },
        data: {
          ...data,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error updating distance matrix:', error);
      throw error;
    }
  }

  /**
   * Delete distance matrix entry
   */
  async deleteDistanceMatrix(fromFacilityId: string, toFacilityId: string): Promise<void> {
    try {
      await prisma.distanceMatrix.delete({
        where: {
          fromFacilityId_toFacilityId: {
            fromFacilityId,
            toFacilityId
          }
        }
      });
      console.log(`DISTANCE_SERVICE: Deleted distance matrix for ${fromFacilityId} to ${toFacilityId}`);
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error deleting distance matrix:', error);
      throw error;
    }
  }

  /**
   * Calculate loaded miles for a transport request
   */
  async calculateLoadedMiles(originFacilityId: string, destinationFacilityId: string): Promise<number> {
    try {
      const distanceMatrix = await this.getOrCreateDistanceMatrix(originFacilityId, destinationFacilityId);
      return distanceMatrix.distanceMiles;
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error calculating loaded miles:', error);
      throw error;
    }
  }

  /**
   * Generate route ID for optimization tracking
   */
  generateRouteId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ROUTE-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Clear distance cache
   */
  clearCache(): void {
    distanceCache.clear();
    console.log('DISTANCE_SERVICE: Distance cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    const size = distanceCache.size;
    // This is a simplified hit rate - in production you'd track actual hits/misses
    const hitRate = size > 0 ? 0.8 : 0; // Estimated 80% hit rate for cached entries
    return { size, hitRate };
  }
}

export default new DistanceService();
