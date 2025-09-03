import { TransportRequest, TransportLevel, Priority, RequestStatus, Facility, User, TransportAgency, Unit } from '@prisma/client';
import { createHash } from 'crypto';
// Temporarily disabled due to compilation errors
// import distanceService from './distanceService';
import { databaseManager } from './databaseManager';

export interface CreateMultiPatientTransportData {
  facilityId: string;
  coordinatorId: string;
  priority?: Priority;
  patientTransports: {
    patientId: string;
    originFacilityId: string;
    destinationFacilityId: string;
    transportLevel: TransportLevel;
    priority: Priority;
    specialRequirements?: string;
    estimatedPickupTime: string;
    estimatedDropoffTime: string;
  }[];
  plannedStartTime: string;
  plannedEndTime: string;
}

export interface CreateLongDistanceTransportData {
  facilityId: string;
  destinationFacilityId: string;
  transportType?: string;
  priority?: Priority;
  coordinatorId: string;
  transportLegs: {
    legType?: string;
    originFacilityId: string;
    destinationFacilityId: string;
    fromLocation?: string;
    toLocation?: string;
    patientId?: string;
    transportLevel: TransportLevel;
    specialRequirements?: string;
    plannedStartTime: string;
    plannedEndTime: string;
  }[];
  weatherConditions?: {
    temperature: number;
    windSpeed: number;
    visibility: number;
    precipitation: number;
    conditions: string;
    isAirMedicalSuitable: boolean;
    groundTransportRequired: boolean;
  };
}

export interface RouteOptimizationRequest {
  patientTransports: any[];
  constraints: {
    maxDuration: number;
    timeWindows: any[];
    vehicleCapacity: number;
    driverRestRequirements: boolean;
    facilityOperatingHours: boolean;
  };
  optimizationGoals: any[];
}

export class AdvancedTransportService {
  /**
   * Generate unique batch number for multi-patient transport
   */
  private generateBatchNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const hash = createHash('sha256').update(timestamp + random).digest('hex');
    return `BATCH-${hash.substring(0, 6).toUpperCase()}`;
  }

  /**
   * Generate unique transport number for long-distance transport
   */
  private generateTransportNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const hash = createHash('sha256').update(timestamp + random).digest('hex');
    return `LDT-${hash.substring(0, 6).toUpperCase()}`;
  }

  /**
   * Create multi-patient transport with route optimization
   */
  async createMultiPatientTransport(data: CreateMultiPatientTransportData): Promise<any> {
    const batchNumber = this.generateBatchNumber();
    
    // Validate all facilities exist
    const facilityIds = new Set([
      ...data.patientTransports.map(pt => pt.originFacilityId),
      ...data.patientTransports.map(pt => pt.destinationFacilityId)
    ]);

    const hospitalDB = databaseManager.getHospitalDB();
    const facilities = await hospitalDB.facility.findMany({
      where: { id: { in: Array.from(facilityIds) } }
    });

    if (facilities.length !== facilityIds.size) {
      throw new Error('One or more facilities not found');
    }

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

          for (const pt of data.patientTransports) {
        // Temporarily disabled due to compilation errors
        // const distance = await distanceService.getDistanceMatrix(
        //   pt.originFacilityId,
        //   pt.destinationFacilityId
        // );
        const distance = { distanceMiles: 0, estimatedTimeMinutes: 0 }; // Mock data
        if (distance) {
          totalDistance += distance.distanceMiles;
          totalDuration += distance.estimatedTimeMinutes;
        }
      }

    // Create multi-patient transport record
    const multiPatientTransport = await hospitalDB.$transaction(async (tx) => {
      const transport = await tx.multiPatientTransport.create({
        data: {
          facilityId: data.facilityId,
          transportType: 'MULTI_PATIENT',
          priority: data.priority || 'MEDIUM',
          batchNumber,
          coordinatorId: data.coordinatorId,
          status: 'PLANNING',
          totalPatients: data.patientTransports.length,
          totalDistance,
          estimatedDuration: totalDuration,
          plannedStartTime: new Date(data.plannedStartTime),
          plannedEndTime: new Date(data.plannedEndTime)
        }
      });

      // Create patient transport records
      const patientTransports = await Promise.all(
        data.patientTransports.map((pt, index) =>
          tx.patientTransport.create({
            data: {
              multiPatientTransportId: transport.id,
              patientId: pt.patientId,
              originFacilityId: pt.originFacilityId,
              destinationFacilityId: pt.destinationFacilityId,
              transportLevel: pt.transportLevel,
              priority: pt.priority,
              specialRequirements: pt.specialRequirements,
              sequenceOrder: index + 1,
              estimatedPickupTime: new Date(pt.estimatedPickupTime),
              estimatedDropoffTime: new Date(pt.estimatedDropoffTime),
              status: 'PENDING'
            }
          })
        )
      );

      return { transport, patientTransports };
    });

    console.log(`[MedPort:AdvancedTransport] Created multi-patient transport ${batchNumber} with ${data.patientTransports.length} patients`);
    return multiPatientTransport;
  }

  /**
   * Create long-distance transport with multi-leg planning
   */
  async createLongDistanceTransport(data: CreateLongDistanceTransportData): Promise<any> {
    const transportNumber = this.generateTransportNumber();
    
    // Validate all facilities exist
    const facilityIds = new Set([
      ...data.transportLegs.map(leg => leg.originFacilityId),
      ...data.transportLegs.map(leg => leg.destinationFacilityId)
    ]);

    const hospitalDB = databaseManager.getHospitalDB();
    const facilities = await hospitalDB.facility.findMany({
      where: { id: { in: Array.from(facilityIds) } }
    });

    if (facilities.length !== facilityIds.size) {
      throw new Error('One or more facilities not found');
    }

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (const leg of data.transportLegs) {
        // Temporarily disabled due to compilation errors
        // const distance = await distanceService.getDistanceMatrix(
        //   leg.originFacilityId,
        //   leg.destinationFacilityId
        // );
        const distance = { distanceMiles: 0, estimatedTimeMinutes: 0 }; // Mock data
        if (distance) {
          totalDistance += distance.distanceMiles;
          totalDuration += distance.estimatedTimeMinutes;
        }
      }

    // Estimate costs and revenue
    const costPerMile = 3.50; // Base cost per mile
    const revenuePerMile = 5.00; // Base revenue per mile
    const costEstimate = totalDistance * costPerMile;
    const revenuePotential = totalDistance * revenuePerMile;

    // Create long-distance transport record
    const longDistanceTransport = await hospitalDB.$transaction(async (tx) => {
      const transport = await tx.longDistanceTransport.create({
        data: {
          facilityId: data.facilityId,
          destinationFacilityId: data.destinationFacilityId,
          distance: totalDistance,
          transportType: data.transportType || 'GROUND',
          priority: data.priority || 'MEDIUM',
          transportNumber,
          coordinatorId: data.coordinatorId,
          status: 'PLANNING',
          totalDistance,
          estimatedDuration: totalDuration,
          plannedStartTime: new Date(data.transportLegs[0].plannedStartTime),
          plannedEndTime: new Date(data.transportLegs[data.transportLegs.length - 1].plannedEndTime),
          isMultiLeg: data.transportLegs.length > 1,
          legCount: data.transportLegs.length,
          costEstimate,
          revenuePotential,
          weatherConditions: data.weatherConditions
        }
      });

      // Create transport leg records
      const transportLegs = await Promise.all(
        data.transportLegs.map((leg, index) =>
          tx.transportLeg.create({
            data: {
              longDistanceTransportId: transport.id,
              legType: leg.legType || 'TRANSIT',
              legNumber: index + 1,
              sequence: index + 1,
              fromLocation: leg.fromLocation || 'Unknown',
              toLocation: leg.toLocation || 'Unknown',
              originFacilityId: leg.originFacilityId,
              destinationFacilityId: leg.destinationFacilityId,
              distance: 0, // Will be calculated
              estimatedDuration: 0, // Will be calculated
              plannedStartTime: new Date(leg.plannedStartTime),
              plannedEndTime: new Date(leg.plannedEndTime),
              status: 'PLANNED',
              patientId: leg.patientId,
              transportLevel: leg.transportLevel,
              specialRequirements: leg.specialRequirements
            }
          })
        )
      );

      // Update leg distances and durations
      for (let i = 0; i < transportLegs.length; i++) {
        const leg = data.transportLegs[i];
        // Temporarily disabled due to compilation errors
        // const distance = await distanceService.getDistanceMatrix(
        //   leg.originFacilityId,
        //   leg.destinationFacilityId
        // );
        const distance = { distanceMiles: 0, estimatedTimeMinutes: 0 }; // Mock data

        if (distance) {
          await tx.transportLeg.update({
            where: { id: transportLegs[i].id },
            data: {
              distance: distance.distanceMiles,
              estimatedDuration: distance.estimatedTimeMinutes
            }
          });
        }
      }

      return { transport, transportLegs };
    });

    console.log(`[MedPort:AdvancedTransport] Created long-distance transport ${transportNumber} with ${data.transportLegs.length} legs`);
    return longDistanceTransport;
  }

  /**
   * Optimize route for multiple patient transports
   */
  async optimizeRoute(request: RouteOptimizationRequest): Promise<any> {
    console.log(`[MedPort:AdvancedTransport] Optimizing route for ${request.patientTransports.length} patients`);

    // Simple optimization algorithm - can be enhanced with more sophisticated algorithms
    const optimizedStops: any[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // Sort by priority and estimated pickup time
    const sortedTransports = request.patientTransports.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.estimatedPickupTime).getTime() - new Date(b.estimatedPickupTime).getTime();
    });

    // Create optimized stops
    for (let i = 0; i < sortedTransports.length; i++) {
      const transport = sortedTransports[i];
      
      // Calculate distance to next stop
      if (i > 0) {
        const prevTransport = sortedTransports[i - 1];
        // Temporarily disabled due to compilation errors
        // const distance = await distanceService.getDistanceMatrix(
        //   prevTransport.destinationFacilityId,
        //   transport.originFacilityId
        // );
        const distance = { distanceMiles: 0, estimatedTimeMinutes: 0 }; // Mock data
        if (distance) {
          totalDistance += distance.distanceMiles;
          totalDuration += distance.estimatedTimeMinutes;
        }
      }

      // Add pickup stop
      optimizedStops.push({
        facilityId: transport.originFacilityId,
        stopType: 'PICKUP',
        sequence: i * 2 + 1,
        estimatedArrival: transport.estimatedPickupTime,
        estimatedDeparture: transport.estimatedPickupTime,
        patientTransports: [transport.id],
        duration: 15 // 15 minutes for pickup
      });

      // Add dropoff stop
      optimizedStops.push({
        facilityId: transport.destinationFacilityId,
        stopType: 'DROPOFF',
        sequence: i * 2 + 2,
        estimatedArrival: transport.estimatedDropoffTime,
        estimatedDeparture: transport.estimatedDropoffTime,
        patientTransports: [transport.id],
        duration: 15 // 15 minutes for dropoff
      });

      // Add transport distance
      // Temporarily disabled due to compilation errors
      // const transportDistance = await distanceService.getDistanceMatrix(
      //   transport.originFacilityId,
      //   transport.destinationFacilityId
      // );
      const transportDistance = { distanceMiles: 0, estimatedTimeMinutes: 0 }; // Mock data
      if (transportDistance) {
        totalDistance += transportDistance.distanceMiles;
        totalDuration += transportDistance.estimatedTimeMinutes;
      }
    }

    // Calculate optimization score and savings
    const baseDistance = request.patientTransports.reduce((sum, pt) => sum + (pt.distance || 0), 0);
    const distanceSaved = Math.max(0, baseDistance - totalDistance);
    const optimizationScore = Math.min(100, Math.max(0, (distanceSaved / baseDistance) * 100));

    const optimizedRoute = {
      routeId: `OPT-${Date.now()}`,
      totalDistance,
      totalDuration,
      totalCost: totalDistance * 3.50, // Base cost per mile
      revenuePotential: totalDistance * 5.00, // Base revenue per mile
      stops: optimizedStops,
      optimizationScore,
      savings: {
        distanceSaved,
        timeSaved: 0, // Could calculate based on speed differences
        costSaved: distanceSaved * 3.50,
        unitsSaved: Math.ceil(distanceSaved / 50), // Rough estimate
        revenueIncrease: distanceSaved * 5.00
      }
    };

    console.log(`[MedPort:AdvancedTransport] Route optimization complete. Score: ${optimizationScore.toFixed(1)}%, Distance saved: ${distanceSaved.toFixed(1)} miles`);
    return optimizedRoute;
  }

  /**
   * Get multi-patient transport by ID with full details
   */
  async getMultiPatientTransportById(id: string): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.multiPatientTransport.findUnique({
      where: { id },
      include: {
        coordinator: true,
        assignedAgency: true,

        patientTransports: {
          include: {
            originFacility: true,
            destinationFacility: true
          }
        },
        routeStops: true
      }
    });
  }

  /**
   * Get long-distance transport by ID with full details
   */
  async getLongDistanceTransportById(id: string): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.longDistanceTransport.findUnique({
      where: { id },
      include: {
        coordinator: true,
        assignedAgency: true,

        transportLegs: {
          include: {
            originFacility: true,
            destinationFacility: true
          }
        },
        weatherUpdates: true
      }
    });
  }

  /**
   * Get all multi-patient transports with filtering
   */
  async getMultiPatientTransports(filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.coordinatorId) where.coordinatorId = filters.coordinatorId;
    if (filters.assignedAgencyId) where.assignedAgencyId = filters.assignedAgencyId;

    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.multiPatientTransport.findMany({
      where,
      include: {
        coordinator: true,
        assignedAgency: true,

        patientTransports: {
          include: {
            originFacility: true,
            destinationFacility: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get all long-distance transports with filtering
   */
  async getLongDistanceTransports(filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.coordinatorId) where.coordinatorId = filters.coordinatorId;
    if (filters.assignedAgencyId) where.assignedAgencyId = filters.assignedAgencyId;
    if (filters.isMultiLeg !== undefined) where.isMultiLeg = filters.isMultiLeg;

    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.longDistanceTransport.findMany({
      where,
      include: {
        coordinator: true,
        assignedAgency: true,

        transportLegs: {
          include: {
            originFacility: true,
            destinationFacility: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update multi-patient transport status
   */
  async updateMultiPatientTransportStatus(id: string, status: string, assignedAgencyId?: string, assignedUnitId?: string): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.multiPatientTransport.update({
      where: { id },
      data: {
        status: status as any,
        assignedAgencyId,
        assignedUnitId,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update long-distance transport status
   */
  async updateLongDistanceTransportStatus(id: string, status: string, assignedAgencyId?: string, assignedUnitId?: string): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.longDistanceTransport.update({
      where: { id },
      data: {
        status: status as any,
        assignedAgencyId,
        assignedUnitId,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Add weather update to long-distance transport
   */
  async addWeatherUpdate(transportId: string, weatherData: any): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.weatherUpdate.create({
      data: {
        facilityId: weatherData.facilityId || 'unknown',
        longDistanceTransportId: transportId,
        location: weatherData.location || 'Unknown',
        weatherCondition: weatherData.weatherConditions || 'CLEAR',
        temperature: weatherData.temperature || 0,
        windSpeed: weatherData.windSpeed || 0,
        windDirection: weatherData.windDirection || 'Unknown',
        visibility: weatherData.visibility || 0,
        precipitation: weatherData.precipitation || 0,
        cloudCover: weatherData.cloudCover || 0,
        impactLevel: weatherData.impactLevel || 'LOW',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
  }

  /**
   * Get transport statistics for dashboard
   */
  async getTransportStatistics(): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    const [multiPatientStats, longDistanceStats] = await Promise.all([
      hospitalDB.multiPatientTransport.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      hospitalDB.longDistanceTransport.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    return {
      multiPatient: multiPatientStats.reduce((acc: any, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      longDistance: longDistanceStats.reduce((acc: any, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {})
    };
  }
}

export default new AdvancedTransportService();
