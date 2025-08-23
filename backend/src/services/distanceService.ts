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

export interface BulkDistanceData {
  fromFacilityId: string;
  toFacilityId: string;
  distanceMiles: number;
  estimatedTimeMinutes: number;
  trafficFactor?: number;
  tolls?: number;
  routeType?: RouteType;
}

export interface DistanceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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
   * Validate distance data for integrity and logical consistency
   */
  async validateDistanceData(data: BulkDistanceData): Promise<DistanceValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (data.distanceMiles <= 0) {
      errors.push('Distance must be greater than 0');
    }
    if (data.distanceMiles > 1000) {
      warnings.push('Distance exceeds 1000 miles - please verify accuracy');
    }
    if (data.estimatedTimeMinutes <= 0) {
      errors.push('Estimated time must be greater than 0');
    }
    if (data.estimatedTimeMinutes > 1440) {
      warnings.push('Estimated time exceeds 24 hours - please verify accuracy');
    }
    if (data.trafficFactor && (data.trafficFactor < 0.5 || data.trafficFactor > 3.0)) {
      warnings.push('Traffic factor should be between 0.5 and 3.0');
    }
    if (data.tolls && data.tolls < 0) {
      errors.push('Tolls cannot be negative');
    }

    // Check if facilities exist
    try {
      const [fromFacility, toFacility] = await Promise.all([
        prisma.facility.findUnique({ where: { id: data.fromFacilityId } }),
        prisma.facility.findUnique({ where: { id: data.toFacilityId } })
      ]);

      if (!fromFacility) {
        errors.push(`Origin facility with ID ${data.fromFacilityId} not found`);
      }
      if (!toFacility) {
        errors.push(`Destination facility with ID ${data.toFacilityId} not found`);
      }

      // Check for self-referencing
      if (data.fromFacilityId === data.toFacilityId) {
        errors.push('Origin and destination facilities cannot be the same');
      }

      // Check triangle inequality if both directions exist
      if (fromFacility && toFacility) {
        const reverseDistance = await this.getDistanceMatrix(data.toFacilityId, data.fromFacilityId);
        if (reverseDistance) {
          const difference = Math.abs(data.distanceMiles - reverseDistance.distanceMiles);
          if (difference > 5) { // Allow 5 mile tolerance for different routes
            warnings.push('Distance difference between directions exceeds 5 miles - verify accuracy');
          }
        }
      }
    } catch (error) {
      errors.push('Error validating facility references');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Bulk import distance matrix data with validation
   */
  async bulkImportDistances(data: BulkDistanceData[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; data: BulkDistanceData; errors: string[] }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; data: BulkDistanceData; errors: string[] }>
    };

    console.log(`DISTANCE_SERVICE: Starting bulk import of ${data.length} distance entries`);

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      try {
        // Validate the entry
        const validation = await this.validateDistanceData(entry);
        if (!validation.isValid) {
          results.failed++;
          results.errors.push({
            index: i,
            data: entry,
            errors: validation.errors
          });
          continue;
        }

        // Create or update the distance matrix entry
        await this.upsertDistanceMatrix(entry);
        results.success++;

        // Log progress every 100 entries
        if ((i + 1) % 100 === 0) {
          console.log(`DISTANCE_SERVICE: Processed ${i + 1}/${data.length} entries`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          data: entry,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    console.log(`DISTANCE_SERVICE: Bulk import completed. Success: ${results.success}, Failed: ${results.failed}`);
    return results;
  }

  /**
   * Export distance matrix data in various formats
   */
  async exportDistanceMatrix(format: 'json' | 'csv' = 'json', filters?: {
    fromFacilityId?: string;
    toFacilityId?: string;
    minDistance?: number;
    maxDistance?: number;
  }): Promise<string> {
    try {
      // Build where clause
      const where: any = {};
      if (filters?.fromFacilityId) where.fromFacilityId = filters.fromFacilityId;
      if (filters?.toFacilityId) where.toFacilityId = filters.toFacilityId;
      if (filters?.minDistance) where.distanceMiles = { gte: filters.minDistance };
      if (filters?.maxDistance) {
        where.distanceMiles = { ...where.distanceMiles, lte: filters.maxDistance };
      }

      const distances = await prisma.distanceMatrix.findMany({
        where,
        include: {
          fromFacility: {
            select: {
              name: true,
              city: true,
              state: true
            }
          },
          toFacility: {
            select: {
              name: true,
              city: true,
              state: true
            }
          }
        },
        orderBy: [
          { fromFacility: { name: 'asc' } },
          { toFacility: { name: 'asc' } }
        ]
      });

      if (format === 'csv') {
        return this.convertToCSV(distances);
      } else {
        return JSON.stringify(distances, null, 2);
      }
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error exporting distance matrix:', error);
      throw error;
    }
  }

  /**
   * Convert distance matrix data to CSV format
   */
  private convertToCSV(distances: any[]): string {
    const headers = [
      'From Facility',
      'From City',
      'From State',
      'To Facility',
      'To City',
      'To State',
      'Distance (Miles)',
      'Time (Minutes)',
      'Traffic Factor',
      'Tolls',
      'Route Type',
      'Last Updated'
    ];

    const rows = distances.map(d => [
      d.fromFacility.name,
      d.fromFacility.city,
      d.fromFacility.state,
      d.toFacility.name,
      d.toFacility.city,
      d.toFacility.state,
      d.distanceMiles,
      d.estimatedTimeMinutes,
      d.trafficFactor,
      d.tolls,
      d.routeType,
      new Date(d.lastUpdated).toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Upsert distance matrix entry (create or update)
   */
  async upsertDistanceMatrix(data: BulkDistanceData): Promise<DistanceMatrix> {
    try {
      return await prisma.distanceMatrix.upsert({
        where: {
          fromFacilityId_toFacilityId: {
            fromFacilityId: data.fromFacilityId,
            toFacilityId: data.toFacilityId
          }
        },
        update: {
          distanceMiles: data.distanceMiles,
          estimatedTimeMinutes: data.estimatedTimeMinutes,
          trafficFactor: data.trafficFactor || 1.0,
          tolls: data.tolls || 0.0,
          routeType: data.routeType || 'FASTEST',
          lastUpdated: new Date()
        },
        create: {
          fromFacilityId: data.fromFacilityId,
          toFacilityId: data.toFacilityId,
          distanceMiles: data.distanceMiles,
          estimatedTimeMinutes: data.estimatedTimeMinutes,
          trafficFactor: data.trafficFactor || 1.0,
          tolls: data.tolls || 0.0,
          routeType: data.routeType || 'FASTEST'
        }
      });
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error upserting distance matrix:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix statistics for analytics
   */
  async getDistanceMatrixStats(): Promise<{
    totalEntries: number;
    averageDistance: number;
    averageTime: number;
    distanceRange: { min: number; max: number };
    timeRange: { min: number; max: number };
    facilityCount: number;
    lastUpdated: Date | null;
  }> {
    try {
      const [totalEntries, stats, facilityCount, lastUpdated] = await Promise.all([
        prisma.distanceMatrix.count(),
        prisma.distanceMatrix.aggregate({
          _avg: {
            distanceMiles: true,
            estimatedTimeMinutes: true
          },
          _min: {
            distanceMiles: true,
            estimatedTimeMinutes: true
          },
          _max: {
            distanceMiles: true,
            estimatedTimeMinutes: true
          }
        }),
        prisma.facility.count({ where: { isActive: true } }),
        prisma.distanceMatrix.findFirst({
          orderBy: { lastUpdated: 'desc' },
          select: { lastUpdated: true }
        })
      ]);

      return {
        totalEntries,
        averageDistance: stats._avg.distanceMiles || 0,
        averageTime: stats._avg.estimatedTimeMinutes || 0,
        distanceRange: {
          min: stats._min.distanceMiles || 0,
          max: stats._max.distanceMiles || 0
        },
        timeRange: {
          min: stats._min.estimatedTimeMinutes || 0,
          max: stats._max.estimatedTimeMinutes || 0
        },
        facilityCount,
        lastUpdated: lastUpdated?.lastUpdated || null
      };
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error getting distance matrix stats:', error);
      throw error;
    }
  }

  /**
   * Optimize distance matrix by removing redundant entries and validating consistency
   */
  async optimizeDistanceMatrix(): Promise<{
    entriesRemoved: number;
    entriesUpdated: number;
    inconsistencies: string[];
  }> {
    const results = {
      entriesRemoved: 0,
      entriesUpdated: 0,
      inconsistencies: [] as string[]
    };

    try {
      console.log('DISTANCE_SERVICE: Starting distance matrix optimization...');

      // Find and remove self-referencing entries
      const selfReferencing = await prisma.distanceMatrix.findMany({
        where: {
          fromFacilityId: { equals: prisma.distanceMatrix.fields.toFacilityId }
        }
      });

      if (selfReferencing.length > 0) {
        await prisma.distanceMatrix.deleteMany({
          where: {
            id: { in: selfReferencing.map(e => e.id) }
          }
        });
        results.entriesRemoved += selfReferencing.length;
        console.log(`DISTANCE_SERVICE: Removed ${selfReferencing.length} self-referencing entries`);
      }

      // Find and validate bidirectional consistency
      const allEntries = await prisma.distanceMatrix.findMany({
        include: {
          fromFacility: { select: { name: true } },
          toFacility: { select: { name: true } }
        }
      });

      for (const entry of allEntries) {
        const reverseEntry = await this.getDistanceMatrix(entry.toFacilityId, entry.fromFacilityId);
        if (reverseEntry) {
          const difference = Math.abs(entry.distanceMiles - reverseEntry.distanceMiles);
          if (difference > 10) { // Flag differences greater than 10 miles
            results.inconsistencies.push(
              `${entry.fromFacility.name} ↔ ${entry.toFacility.name}: ${difference.toFixed(1)} mile difference`
            );
          }
        }
      }

      // Update lastUpdated for all entries to trigger cache refresh
      await prisma.distanceMatrix.updateMany({
        data: { lastUpdated: new Date() }
      });
      results.entriesUpdated = allEntries.length;

      console.log(`DISTANCE_SERVICE: Optimization completed. Removed: ${results.entriesRemoved}, Updated: ${results.entriesUpdated}`);
      return results;
    } catch (error) {
      console.error('DISTANCE_SERVICE: Error optimizing distance matrix:', error);
      throw error;
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
