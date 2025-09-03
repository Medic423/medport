import { databaseManager } from './databaseManager';
import { calculateDistance, calculateBearing } from '../utils/geoUtils';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface LocationUpdate {
  unitId: string;
  location: GPSLocation;
  source?: 'UNIT_DEVICE' | 'MOBILE_APP' | 'CAD_SYSTEM' | 'MANUAL_ENTRY' | 'ESTIMATION';
}

export interface ETARequest {
  unitId: string;
  destinationId: string;
  destinationType: 'FACILITY' | 'PICKUP_LOCATION' | 'DROPOFF_LOCATION' | 'WAYPOINT' | 'CUSTOM';
}

export interface GeofenceConfig {
  facilityId: string;
  radius: number; // in meters
  type: 'FACILITY_ARRIVAL' | 'FACILITY_DEPARTURE' | 'SERVICE_AREA' | 'RESTRICTED_AREA' | 'CUSTOM';
}

export class RealTimeTrackingService {
  /**
   * Update unit location and store in GPS tracking
   */
  async updateUnitLocation(update: LocationUpdate): Promise<any> {
    try {
      const emsDB = databaseManager.getEMSDB();
      
      // Get or create GPS tracking record for the unit
      let gpsTracking = await emsDB.gPSTracking.findFirst({
        where: {
          unitId: update.unitId,
          isActive: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!gpsTracking) {
        // Create new GPS tracking record
        gpsTracking = await emsDB.gPSTracking.create({
          data: {
            unitId: update.unitId,
            latitude: update.location.latitude,
            longitude: update.location.longitude,
            altitude: update.location.altitude,
            speed: update.location.speed,
            heading: update.location.heading,
            accuracy: update.location.accuracy,
            batteryLevel: update.location.batteryLevel,
            signalStrength: update.location.signalStrength,
            locationType: 'GPS',
            source: update.source || 'UNIT_DEVICE',
            isActive: true,
          },
        });
      } else {
        // Update existing GPS tracking record
        gpsTracking = await emsDB.gPSTracking.update({
          where: { id: gpsTracking.id },
          data: {
            latitude: update.location.latitude,
            longitude: update.location.longitude,
            altitude: update.location.altitude,
            speed: update.location.speed,
            heading: update.location.heading,
            accuracy: update.location.accuracy,
            batteryLevel: update.location.batteryLevel,
            signalStrength: update.location.signalStrength,
            timestamp: new Date(),
          },
        });
      }

      // Store location in history
      await emsDB.locationHistory.create({
        data: {
          gpsTrackingId: gpsTracking.id,
          latitude: update.location.latitude,
          longitude: update.location.longitude,
          altitude: update.location.altitude,
          speed: update.location.speed,
          heading: update.location.heading,
          accuracy: update.location.accuracy,
          locationType: 'GPS',
          source: update.source || 'UNIT_DEVICE',
        },
      });

      // Update unit's current location
      await emsDB.unit.update({
        where: { id: update.unitId },
        data: {
          currentLocation: {
            latitude: update.location.latitude,
            longitude: update.location.longitude,
            timestamp: new Date(),
          },
        },
      });

      // Check for geofence events
      await this.checkGeofenceEvents(gpsTracking.id, update.location);

      // Check for route deviations
      await this.checkRouteDeviations(gpsTracking.id, update.location);

      return gpsTracking;
    } catch (error) {
      console.error('Error updating unit location:', error);
      throw error;
    }
  }

  /**
   * Calculate ETA for a unit to a destination
   */
  async calculateETA(request: ETARequest): Promise<any> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      const gpsTracking = await emsDB.gPSTracking.findFirst({
        where: {
          unitId: request.unitId,
          isActive: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!gpsTracking) {
        throw new Error('No active GPS tracking found for unit');
      }

      // Get destination coordinates
      let destinationCoords;
      if (request.destinationType === 'FACILITY') {
        const facility = await hospitalDB.facility.findUnique({
          where: { id: request.destinationId },
        });
        if (!facility?.coordinates) {
          throw new Error('Facility coordinates not found');
        }
        destinationCoords = facility.coordinates as any;
      } else {
        // For other destination types, you might need to implement custom logic
        throw new Error('Destination type not yet implemented');
      }

      // Calculate distance and bearing
      const distance = calculateDistance(
        gpsTracking.latitude,
        gpsTracking.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude
      );

      // Get traffic and weather factors
      const trafficFactor = await this.getTrafficFactor(gpsTracking.latitude, gpsTracking.longitude);
      const weatherFactor = await this.getWeatherFactor(gpsTracking.latitude, gpsTracking.longitude);

      // Calculate ETA (assuming average speed of 35 mph for demo)
      const averageSpeed = 35; // mph
      const adjustedSpeed = averageSpeed / (trafficFactor * weatherFactor);
      const etaMinutes = Math.round((distance / adjustedSpeed) * 60);
      const eta = new Date(Date.now() + etaMinutes * 60 * 1000);

      // Store ETA update
      const etaUpdate = await emsDB.eTAUpdate.create({
        data: {
          gpsTrackingId: gpsTracking.id,
          destinationId: request.destinationId,
          destinationType: request.destinationType,
          currentETA: eta,
          trafficFactor,
          weatherFactor,
          routeConditions: {
            distance,
            averageSpeed: adjustedSpeed,
            trafficFactor,
            weatherFactor,
          },
          isActive: true,
        },
      });

      return {
        eta,
        etaMinutes,
        distance,
        trafficFactor,
        weatherFactor,
        etaUpdate,
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      throw error;
    }
  }

  /**
   * Check for geofence events
   */
  private async checkGeofenceEvents(gpsTrackingId: string, location: GPSLocation): Promise<void> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      // Get all active geofences
      const geofences = await emsDB.geofenceEvent.findMany({
        where: {
          isActive: true,
        },
      });

      for (const geofence of geofences) {
        if (geofence.facilityId) {
          // Get facility coordinates from Hospital DB
          const facility = await hospitalDB.facility.findUnique({
            where: { id: geofence.facilityId },
          });
          
          if (facility?.coordinates) {
            const facilityCoords = facility.coordinates as any;
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              facilityCoords.latitude,
              facilityCoords.longitude
            );

            // Check if unit is within geofence radius
            if (distance <= geofence.radius / 1000) { // Convert meters to kilometers
              // Create or update geofence event
              await emsDB.geofenceEvent.upsert({
                where: {
                  id: geofence.id,
                },
                update: {
                  eventType: 'ENTERED',
                  timestamp: new Date(),
                  isActive: true,
                },
                create: {
                  gpsTrackingId,
                  facilityId: geofence.facilityId,
                  geofenceType: geofence.geofenceType,
                  eventType: 'ENTERED',
                  latitude: location.latitude,
                  longitude: location.longitude,
                  radius: geofence.radius,
                  isActive: true,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking geofence events:', error);
    }
  }

  /**
   * Check for route deviations
   */
  private async checkRouteDeviations(gpsTrackingId: string, location: GPSLocation): Promise<void> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      // Get the unit ID from the GPS tracking record
      const gpsTracking = await emsDB.gPSTracking.findUnique({
        where: { id: gpsTrackingId },
        select: { unitId: true },
      });
      
      if (!gpsTracking) return;

      // Get active routes for the unit
      const routes = await emsDB.route.findMany({
        where: {
          assignedUnitId: gpsTracking.unitId,
          status: 'IN_PROGRESS',
        },
        include: {
          routeStops: true,
        },
      });

      for (const route of routes) {
        // Check if unit is deviating from expected route
        // This is a simplified implementation - you might want to implement more sophisticated route deviation detection
        const expectedLocation = this.getExpectedRouteLocation(route, location);
        if (expectedLocation) {
          const deviation = calculateDistance(
            location.latitude,
            location.longitude,
            expectedLocation.latitude,
            expectedLocation.longitude
          );

          // If deviation is more than 1km, create a route deviation alert
          if (deviation > 1) {
            await emsDB.routeDeviation.create({
              data: {
                gpsTrackingId,
                routeId: route.id,
                deviationType: 'ROUTE_DEVIATION',
                severity: 'MEDIUM',
                description: `Unit deviated ${deviation.toFixed(2)}km from expected route`,
                currentLatitude: location.latitude,
                currentLongitude: location.longitude,
                expectedLatitude: expectedLocation.latitude,
                expectedLongitude: expectedLocation.longitude,
                distanceOffRoute: deviation * 1000, // Convert to meters
                isResolved: false,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking route deviations:', error);
    }
  }

  /**
   * Get expected location based on route
   */
  private getExpectedRouteLocation(route: any, currentLocation: GPSLocation): any {
    // This is a simplified implementation
    // In a real system, you would calculate the expected location based on the route plan and current time
    if (route.routeStops && route.routeStops.length > 0) {
      // For demo purposes, return the first stop location
      const firstStop = route.routeStops[0];
      if (firstStop.facility?.coordinates) {
        return firstStop.facility.coordinates;
      }
    }
    return null;
  }

  /**
   * Get traffic factor for a location
   */
  private async getTrafficFactor(latitude: number, longitude: number): Promise<number> {
    try {
      const emsDB = databaseManager.getEMSDB();
      
      // Check for active traffic conditions in the area
      const trafficConditions = await emsDB.trafficCondition.findMany({
        where: {
          isActive: true,
          startTime: { lte: new Date() },
          OR: [
            { endTime: null },
            { endTime: { gte: new Date() } },
          ],
        },
      });

      // For demo purposes, return a random traffic factor
      // In a real system, you would integrate with traffic APIs
      return 1.0 + Math.random() * 0.5; // 1.0 to 1.5
    } catch (error) {
      console.error('Error getting traffic factor:', error);
      return 1.0;
    }
  }

  /**
   * Get weather factor for a location
   */
  private async getWeatherFactor(latitude: number, longitude: number): Promise<number> {
    try {
      const emsDB = databaseManager.getEMSDB();
      
      // Check for active weather impacts in the area
      const weatherImpacts = await emsDB.weatherImpact.findMany({
        where: {
          isActive: true,
          startTime: { lte: new Date() },
          OR: [
            { endTime: null },
            { endTime: { gte: new Date() } },
          ],
        },
      });

      // For demo purposes, return a random weather factor
      // In a real system, you would integrate with weather APIs
      return 1.0 + Math.random() * 0.3; // 1.0 to 1.3
    } catch (error) {
      console.error('Error getting weather factor:', error);
      return 1.0;
    }
  }

  /**
   * Get real-time location for all active units
   */
  async getActiveUnitLocations(): Promise<any[]> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const centerDB = databaseManager.getCenterDB();
      
      const activeUnits = await emsDB.gPSTracking.findMany({
        where: {
          isActive: true,
        },
        include: {
          unit: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Get agency information for each unit
      const unitsWithAgencies = await Promise.all(
        activeUnits.map(async (tracking) => {
          const agency = await centerDB.eMSAgency.findUnique({
            where: { id: tracking.unit.agencyId },
          });
          
          return {
            id: tracking.id,
            unitId: tracking.unitId,
            unitNumber: tracking.unit.unitNumber,
            agencyName: agency?.name || 'Unknown Agency',
            latitude: tracking.latitude,
            longitude: tracking.longitude,
            speed: tracking.speed,
            heading: tracking.heading,
            batteryLevel: tracking.batteryLevel,
            signalStrength: tracking.signalStrength,
            timestamp: tracking.timestamp,
            lastUpdated: tracking.timestamp,
          };
        })
      );

      return unitsWithAgencies;
    } catch (error) {
      console.error('Error getting active unit locations:', error);
      throw error;
    }
  }

  /**
   * Get location history for a unit
   */
  async getUnitLocationHistory(unitId: string, hours: number = 24): Promise<any[]> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      const history = await emsDB.locationHistory.findMany({
        where: {
          gpsTracking: {
            unitId,
          },
          timestamp: {
            gte: cutoffTime,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      return history.map(record => ({
        latitude: record.latitude,
        longitude: record.longitude,
        speed: record.speed,
        heading: record.heading,
        timestamp: record.timestamp,
      }));
    } catch (error) {
      console.error('Error getting unit location history:', error);
      throw error;
    }
  }

  /**
   * Get geofence events for a unit
   */
  async getUnitGeofenceEvents(unitId: string, hours: number = 24): Promise<any[]> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      const events = await emsDB.geofenceEvent.findMany({
        where: {
          gpsTracking: {
            unitId,
          },
          timestamp: {
            gte: cutoffTime,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Get facility information for each event
      const eventsWithFacilities = await Promise.all(
        events.map(async (event) => {
          const facility = await hospitalDB.facility.findUnique({
            where: { id: event.facilityId },
          });
          
          return {
            id: event.id,
            facilityName: facility?.name || 'Unknown Facility',
            geofenceType: event.geofenceType,
            eventType: event.eventType,
            timestamp: event.timestamp,
            notes: event.notes,
          };
        })
      );

      return eventsWithFacilities;
    } catch (error) {
      console.error('Error getting unit geofence events:', error);
      throw error;
    }
  }

  /**
   * Get route deviations for a unit
   */
  async getUnitRouteDeviations(unitId: string, hours: number = 24): Promise<any[]> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      const deviations = await emsDB.routeDeviation.findMany({
        where: {
          gpsTracking: {
            unitId,
          },
          timestamp: {
            gte: cutoffTime,
          },
        },
        include: {
          route: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      return deviations.map(deviation => ({
        id: deviation.id,
        routeNumber: deviation.route?.routeNumber,
        deviationType: deviation.deviationType,
        severity: deviation.severity,
        description: deviation.description,
        distanceOffRoute: deviation.distanceOffRoute,
        timestamp: deviation.timestamp,
        isResolved: deviation.isResolved,
      }));
    } catch (error) {
      console.error('Error getting unit route deviations:', error);
      throw error;
    }
  }
}

export default new RealTimeTrackingService();
