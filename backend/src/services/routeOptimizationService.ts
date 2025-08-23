import { PrismaClient, TransportRequest, Route, RouteStop, Facility, TransportAgency, RouteOptimizationType, RouteStatus, RequestStatus, TransportLevel, Priority } from '@prisma/client';
import distanceService from './distanceService';

const prisma = new PrismaClient();

export interface RouteOptimizationRequest {
  timeWindowStart: Date;
  timeWindowEnd: Date;
  maxDistance?: number;
  transportLevels?: TransportLevel[];
  priorities?: Priority[];
  agencyId?: string;
  optimizationType?: RouteOptimizationType;
  constraints?: {
    maxDuration?: number;
    maxStops?: number;
    minRevenue?: number;
    avoidHighways?: boolean;
    preferReturnTrips?: boolean;
  };
}

export interface ChainedTripOpportunity {
  id: string;
  routeType: RouteOptimizationType;
  totalDistance: number;
  totalTime: number;
  milesSaved: number;
  unitsSaved: number;
  revenuePotential: number;
  revenueIncrease: number;
  optimizationScore: number;
  transportRequests: TransportRequest[];
  routeStops: RouteStop[];
  chainingDetails: {
    type: 'TEMPORAL' | 'SPATIAL' | 'RETURN_TRIP' | 'MULTI_STOP';
    description: string;
    benefits: string[];
  };
  estimatedStartTime: Date;
  estimatedEndTime: Date;
  timeWindowFlexibility: number; // minutes
  geographicEfficiency: number; // 0-100 score
  temporalEfficiency: number; // 0-100 score
}

export interface RouteOptimizationResult {
  opportunities: ChainedTripOpportunity[];
  summary: {
    totalOpportunities: number;
    totalMilesSaved: number;
    totalRevenueIncrease: number;
    totalUnitsSaved: number;
    averageOptimizationScore: number;
    optimizationTypes: Record<RouteOptimizationType, number>;
  };
  recommendations: {
    highValue: ChainedTripOpportunity[];
    quickWins: ChainedTripOpportunity[];
    longTerm: ChainedTripOpportunity[];
  };
  performance: {
    calculationTime: number;
    requestsAnalyzed: number;
    routesGenerated: number;
  };
}

export interface TemporalProximityAnalysis {
  requestId: string;
  nearbyRequests: Array<{
    requestId: string;
    timeDifference: number; // minutes
    facilityProximity: number; // miles
    chainingScore: number; // 0-100
    potentialSavings: {
      miles: number;
      time: number;
      revenue: number;
    };
  }>;
}

export interface SpatialProximityAnalysis {
  facilityId: string;
  nearbyFacilities: Array<{
    facilityId: string;
    distance: number;
    time: number;
    transportRequests: number;
    chainingPotential: number; // 0-100
  }>;
}

export class RouteOptimizationService {
  private readonly OPTIMIZATION_WEIGHTS = {
    REVENUE: 0.4,
    DISTANCE: 0.25,
    TIME: 0.2,
    EFFICIENCY: 0.15
  };

  private readonly CHAINING_THRESHOLDS = {
    MIN_TIME_WINDOW: 30, // minutes
    MAX_TIME_WINDOW: 240, // 4 hours
    MIN_DISTANCE_SAVINGS: 5, // miles
    MIN_REVENUE_INCREASE: 25, // dollars
    MAX_DETOUR_DISTANCE: 20 // miles
  };

  /**
   * Main route optimization method - analyzes transport requests and generates chaining opportunities
   */
  async optimizeRoutes(request: RouteOptimizationRequest): Promise<RouteOptimizationResult> {
    const startTime = Date.now();
    console.log(`[MedPort:RouteOptimization] Starting route optimization for time window: ${request.timeWindowStart} to ${request.timeWindowEnd}`);

    try {
      // 1. Get eligible transport requests
      const eligibleRequests = await this.getEligibleTransportRequests(request);
      console.log(`[MedPort:RouteOptimization] Found ${eligibleRequests.length} eligible transport requests`);

      // 2. Perform temporal proximity analysis
      const temporalAnalysis = await this.analyzeTemporalProximity(eligibleRequests, request);
      console.log(`[MedPort:RouteOptimization] Temporal analysis complete`);

      // 3. Perform spatial proximity analysis
      const spatialAnalysis = await this.analyzeSpatialProximity(eligibleRequests, request);
      console.log(`[MedPort:RouteOptimization] Spatial analysis complete`);

      // 4. Identify chaining opportunities
      const chainingOpportunities = await this.identifyChainingOpportunities(
        eligibleRequests,
        temporalAnalysis,
        spatialAnalysis,
        request
      );
      console.log(`[MedPort:RouteOptimization] Identified ${chainingOpportunities.length} chaining opportunities`);

      // 5. Generate route cards and calculate optimization scores
      const optimizedRoutes = await this.generateOptimizedRoutes(chainingOpportunities, request);
      console.log(`[MedPort:RouteOptimization] Generated ${optimizedRoutes.length} optimized routes`);

      // 6. Calculate summary statistics and recommendations
      const result = this.calculateOptimizationSummary(optimizedRoutes, startTime, eligibleRequests.length);

      console.log(`[MedPort:RouteOptimization] Route optimization complete in ${result.performance.calculationTime}ms`);
      return result;

    } catch (error) {
      console.error('[MedPort:RouteOptimization] Error during route optimization:', error);
      throw new Error(`Route optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transport requests eligible for optimization within the specified constraints
   */
  private async getEligibleTransportRequests(request: RouteOptimizationRequest): Promise<TransportRequest[]> {
    const where: any = {
      status: RequestStatus.PENDING,
      requestTimestamp: {
        gte: request.timeWindowStart,
        lte: request.timeWindowEnd
      }
    };

    if (request.transportLevels && request.transportLevels.length > 0) {
      where.transportLevel = { in: request.transportLevels };
    }

    if (request.priorities && request.priorities.length > 0) {
      where.priority = { in: request.priorities };
    }

    if (request.agencyId) {
      where.assignedAgencyId = request.agencyId;
    }

    return prisma.transportRequest.findMany({
      where,
      include: {
        originFacility: true,
        destinationFacility: true,
        assignedAgency: true
      },
      orderBy: [
        { priority: 'desc' },
        { requestTimestamp: 'asc' }
      ]
    });
  }

  /**
   * Analyze temporal proximity between transport requests for chaining opportunities
   */
  private async analyzeTemporalProximity(
    requests: TransportRequest[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<TemporalProximityAnalysis[]> {
    const analysis: TemporalProximityAnalysis[] = [];

    for (const request of requests) {
      const nearbyRequests: TemporalProximityAnalysis['nearbyRequests'] = [];

      for (const otherRequest of requests) {
        if (request.id === otherRequest.id) continue;

        // Calculate time difference
        const timeDiff = Math.abs(
          new Date(request.requestTimestamp).getTime() - 
          new Date(otherRequest.requestTimestamp).getTime()
        ) / (1000 * 60); // Convert to minutes

        // Check if within acceptable time window
        if (timeDiff >= this.CHAINING_THRESHOLDS.MIN_TIME_WINDOW && 
            timeDiff <= this.CHAINING_THRESHOLDS.MAX_TIME_WINDOW) {
          
          // Calculate facility proximity
          const facilityProximity = await this.calculateFacilityProximity(
            request.destinationFacilityId,
            otherRequest.originFacilityId
          );

          if (facilityProximity <= this.CHAINING_THRESHOLDS.MAX_DETOUR_DISTANCE) {
            // Calculate chaining score based on time and distance
            const timeScore = Math.max(0, 100 - (timeDiff / this.CHAINING_THRESHOLDS.MAX_TIME_WINDOW) * 100);
            const distanceScore = Math.max(0, 100 - (facilityProximity / this.CHAINING_THRESHOLDS.MAX_DETOUR_DISTANCE) * 100);
            const chainingScore = (timeScore + distanceScore) / 2;

            // Calculate potential savings
            const potentialSavings = await this.calculatePotentialSavings(request, otherRequest, facilityProximity);

            nearbyRequests.push({
              requestId: otherRequest.id,
              timeDifference: timeDiff,
              facilityProximity,
              chainingScore,
              potentialSavings
            });
          }
        }
      }

      // Sort by chaining score and take top opportunities
      nearbyRequests.sort((a, b) => b.chainingScore - a.chainingScore);
      
      analysis.push({
        requestId: request.id,
        nearbyRequests: nearbyRequests.slice(0, 5) // Top 5 opportunities
      });
    }

    return analysis;
  }

  /**
   * Analyze spatial proximity between facilities for geographic optimization
   */
  private async analyzeSpatialProximity(
    requests: TransportRequest[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<SpatialProximityAnalysis[]> {
    const analysis: SpatialProximityAnalysis[] = [];
    const facilityIds = new Set([
      ...requests.map(r => r.originFacilityId),
      ...requests.map(r => r.destinationFacilityId)
    ]);

    for (const facilityId of facilityIds) {
      const nearbyFacilities: SpatialProximityAnalysis['nearbyFacilities'] = [];

      for (const otherFacilityId of facilityIds) {
        if (facilityId === otherFacilityId) continue;

        const distance = await this.calculateFacilityProximity(facilityId, otherFacilityId);
        
        if (distance <= 50) { // Within 50 miles
          const transportRequests = requests.filter(r => 
            r.originFacilityId === otherFacilityId || r.destinationFacilityId === otherFacilityId
          ).length;

          const chainingPotential = Math.max(0, 100 - (distance / 50) * 100);

          nearbyFacilities.push({
            facilityId: otherFacilityId,
            distance,
            time: distance * 2, // Rough estimate: 2 minutes per mile
            transportRequests,
            chainingPotential
          });
        }
      }

      // Sort by chaining potential
      nearbyFacilities.sort((a, b) => b.chainingPotential - a.chainingPotential);

      analysis.push({
        facilityId,
        nearbyFacilities: nearbyFacilities.slice(0, 10) // Top 10 nearby facilities
      });
    }

    return analysis;
  }

  /**
   * Identify chaining opportunities based on temporal and spatial analysis
   */
  private async identifyChainingOpportunities(
    requests: TransportRequest[],
    temporalAnalysis: TemporalProximityAnalysis[],
    spatialAnalysis: SpatialProximityAnalysis[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    const opportunities: ChainedTripOpportunity[] = [];

    // 1. Temporal chaining (requests close in time)
    const temporalOpportunities = await this.generateTemporalChainingOpportunities(
      requests, temporalAnalysis, optimizationRequest
    );
    opportunities.push(...temporalOpportunities);

    // 2. Spatial chaining (facilities close in distance)
    const spatialOpportunities = await this.generateSpatialChainingOpportunities(
      requests, spatialAnalysis, optimizationRequest
    );
    opportunities.push(...spatialOpportunities);

    // 3. Return trip opportunities
    const returnTripOpportunities = await this.generateReturnTripOpportunities(
      requests, optimizationRequest
    );
    opportunities.push(...returnTripOpportunities);

    // 4. Multi-stop route opportunities
    const multiStopOpportunities = await this.generateMultiStopOpportunities(
      requests, optimizationRequest
    );
    opportunities.push(...multiStopOpportunities);

    // Sort opportunities by optimization score
    opportunities.sort((a, b) => b.optimizationScore - a.optimizationScore);

    return opportunities;
  }

  /**
   * Generate temporal chaining opportunities based on time proximity
   */
  private async generateTemporalChainingOpportunities(
    requests: TransportRequest[],
    temporalAnalysis: TemporalProximityAnalysis[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    const opportunities: ChainedTripOpportunity[] = [];

    for (const analysis of temporalAnalysis) {
      const primaryRequest = requests.find(r => r.id === analysis.requestId);
      if (!primaryRequest) continue;

      for (const nearby of analysis.nearbyRequests) {
        const secondaryRequest = requests.find(r => r.id === nearby.requestId);
        if (!secondaryRequest) continue;

        // Check if this creates a valid chaining opportunity
        if (nearby.chainingScore >= 70 && nearby.potentialSavings.miles >= this.CHAINING_THRESHOLDS.MIN_DISTANCE_SAVINGS) {
          
          const opportunity = await this.createChainingOpportunity(
            [primaryRequest, secondaryRequest],
            'TEMPORAL',
            'Temporal proximity chaining - requests within optimal time window',
            nearby.potentialSavings,
            optimizationRequest
          );

          if (opportunity) {
            opportunities.push(opportunity);
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Generate spatial chaining opportunities based on facility proximity
   */
  private async generateSpatialChainingOpportunities(
    requests: TransportRequest[],
    spatialAnalysis: SpatialProximityAnalysis[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    const opportunities: ChainedTripOpportunity[] = [];

    for (const analysis of spatialAnalysis) {
      const facilityRequests = requests.filter(r => 
        r.originFacilityId === analysis.facilityId || r.destinationFacilityId === analysis.facilityId
      );

      if (facilityRequests.length >= 2) {
        // Find pairs of requests that can be chained
        for (let i = 0; i < facilityRequests.length - 1; i++) {
          for (let j = i + 1; j < facilityRequests.length; j++) {
            const request1 = facilityRequests[i];
            const request2 = facilityRequests[j];

            // Check if they can form a chain (one ends where another begins)
            if (request1.destinationFacilityId === request2.originFacilityId ||
                request2.destinationFacilityId === request1.originFacilityId) {
              
              const potentialSavings = await this.calculatePotentialSavings(request1, request2, 0);
              
              if (potentialSavings.miles >= this.CHAINING_THRESHOLDS.MIN_DISTANCE_SAVINGS) {
                const opportunity = await this.createChainingOpportunity(
                  [request1, request2],
                  'SPATIAL',
                  'Spatial proximity chaining - facilities in close geographic proximity',
                  potentialSavings,
                  optimizationRequest
                );

                if (opportunity) {
                  opportunities.push(opportunity);
                }
              }
            }
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Generate return trip opportunities (outbound + return)
   */
  private async generateReturnTripOpportunities(
    requests: TransportRequest[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    const opportunities: ChainedTripOpportunity[] = [];

    for (const request of requests) {
      // Look for return trip opportunities
      const returnRequests = requests.filter(r => 
        r.id !== request.id &&
        r.originFacilityId === request.destinationFacilityId &&
        r.destinationFacilityId === request.originFacilityId
      );

      for (const returnRequest of returnRequests) {
        const timeDiff = Math.abs(
          new Date(request.requestTimestamp).getTime() - 
          new Date(returnRequest.requestTimestamp).getTime()
        ) / (1000 * 60);

        // Return trips should be within reasonable time window
        if (timeDiff <= 480) { // 8 hours
          const potentialSavings = await this.calculateReturnTripSavings(request, returnRequest);
          
          if (potentialSavings.miles >= this.CHAINING_THRESHOLDS.MIN_DISTANCE_SAVINGS) {
            const opportunity = await this.createChainingOpportunity(
              [request, returnRequest],
              'RETURN_TRIP',
              'Return trip optimization - outbound and return to same facility',
              potentialSavings,
              optimizationRequest
            );

            if (opportunity) {
              opportunities.push(opportunity);
            }
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Generate multi-stop route opportunities for 3+ requests
   */
  private async generateMultiStopOpportunities(
    requests: TransportRequest[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    const opportunities: ChainedTripOpportunity[] = [];

    // Look for groups of 3+ requests that can form efficient multi-stop routes
    const requestGroups = this.findEfficientRequestGroups(requests, 3, 5); // 3-5 requests per group

    for (const group of requestGroups) {
      if (group.length >= 3) {
        const potentialSavings = await this.calculateMultiStopSavings(group);
        
        if (potentialSavings.miles >= this.CHAINING_THRESHOLDS.MIN_DISTANCE_SAVINGS * 2) {
          const opportunity = await this.createChainingOpportunity(
            group,
            'MULTI_STOP',
            `Multi-stop route optimization - ${group.length} patients in single route`,
            potentialSavings,
            optimizationRequest
          );

          if (opportunity) {
            opportunities.push(opportunity);
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Create a chaining opportunity with calculated metrics
   */
  private async createChainingOpportunity(
    requests: TransportRequest[],
    chainingType: 'TEMPORAL' | 'SPATIAL' | 'RETURN_TRIP' | 'MULTI_STOP',
    description: string,
    potentialSavings: { miles: number; time: number; revenue: number },
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity | null> {
    try {
      // Calculate route metrics
      const routeMetrics = await this.calculateRouteMetrics(requests);
      
      // Calculate optimization score
      const optimizationScore = this.calculateOptimizationScore(
        potentialSavings,
        routeMetrics,
        requests.length
      );

      // Generate route stops
      const routeStops = await this.generateRouteStops(requests, routeMetrics);

      // Calculate time windows
      const timeWindows = this.calculateTimeWindows(requests);
      const timeWindowFlexibility = this.calculateTimeWindowFlexibility(timeWindows);

      // Calculate geographic efficiency
      const geographicEfficiency = this.calculateGeographicEfficiency(routeMetrics, requests);

      // Calculate temporal efficiency
      const temporalEfficiency = this.calculateTemporalEfficiency(timeWindows, requests);

      const opportunity: ChainedTripOpportunity = {
        id: `OPP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        routeType: this.mapChainingTypeToOptimizationType(chainingType),
        totalDistance: routeMetrics.totalDistance,
        totalTime: routeMetrics.totalTime,
        milesSaved: potentialSavings.miles,
        unitsSaved: Math.ceil(potentialSavings.miles / 50), // Rough estimate
        revenuePotential: routeMetrics.totalDistance * 5.00, // Base revenue per mile
        revenueIncrease: potentialSavings.revenue,
        optimizationScore,
        transportRequests: requests,
        routeStops,
        chainingDetails: {
          type: chainingType,
          description,
          benefits: this.generateChainingBenefits(potentialSavings, requests.length)
        },
        estimatedStartTime: timeWindows.start,
        estimatedEndTime: timeWindows.end,
        timeWindowFlexibility,
        geographicEfficiency,
        temporalEfficiency
      };

      return opportunity;

    } catch (error) {
      console.error('[MedPort:RouteOptimization] Error creating chaining opportunity:', error);
      return null;
    }
  }

  /**
   * Calculate route metrics for a group of transport requests
   */
  private async calculateRouteMetrics(requests: TransportRequest[]): Promise<{
    totalDistance: number;
    totalTime: number;
    emptyMiles: number;
    loadedMiles: number;
  }> {
    let totalDistance = 0;
    let totalTime = 0;
    let emptyMiles = 0;
    let loadedMiles = 0;

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      // Calculate loaded miles for this request
      const requestDistance = await this.calculateFacilityProximity(
        request.originFacilityId,
        request.destinationFacilityId
      );
      loadedMiles += requestDistance;

      // Calculate empty miles to next request (if not the last one)
      if (i < requests.length - 1) {
        const nextRequest = requests[i + 1];
        const emptyDistance = await this.calculateFacilityProximity(
          request.destinationFacilityId,
          nextRequest.originFacilityId
        );
        emptyMiles += emptyDistance;
      }

      // Add time estimates
      totalTime += requestDistance * 2; // 2 minutes per mile
    }

    totalDistance = loadedMiles + emptyMiles;

    return {
      totalDistance,
      totalTime,
      emptyMiles,
      loadedMiles
    };
  }

  /**
   * Calculate potential savings when chaining two requests
   */
  private async calculatePotentialSavings(
    request1: TransportRequest,
    request2: TransportRequest,
    detourDistance: number
  ): Promise<{ miles: number; time: number; revenue: number }> {
    // Calculate individual distances
    const distance1 = await this.calculateFacilityProximity(
      request1.originFacilityId,
      request1.destinationFacilityId
    );
    const distance2 = await this.calculateFacilityProximity(
      request2.originFacilityId,
      request2.destinationFacilityId
    );

    // Calculate chained distance
    const chainedDistance = distance1 + detourDistance + distance2;
    const individualDistance = distance1 + distance2;

    const milesSaved = Math.max(0, individualDistance - chainedDistance);
    const timeSaved = milesSaved * 2; // 2 minutes per mile
    const revenueSaved = milesSaved * 5.00; // $5 per mile

    return { miles: milesSaved, time: timeSaved, revenue: revenueSaved };
  }

  /**
   * Calculate return trip savings
   */
  private async calculateReturnTripSavings(
    outbound: TransportRequest,
    returnTrip: TransportRequest
  ): Promise<{ miles: number; time: number; revenue: number }> {
    // Return trips eliminate empty miles back to origin
    const outboundDistance = await this.calculateFacilityProximity(
      outbound.originFacilityId,
      outbound.destinationFacilityId
    );
    const returnDistance = await this.calculateFacilityProximity(
      returnTrip.originFacilityId,
      returnTrip.destinationFacilityId
    );

    // Without chaining: outbound + empty return + return trip
    const individualDistance = outboundDistance + outboundDistance + returnDistance;
    
    // With chaining: outbound + return trip
    const chainedDistance = outboundDistance + returnDistance;

    const milesSaved = Math.max(0, individualDistance - chainedDistance);
    const timeSaved = milesSaved * 2;
    const revenueSaved = milesSaved * 5.00;

    return { miles: milesSaved, time: timeSaved, revenue: revenueSaved };
  }

  /**
   * Calculate multi-stop route savings
   */
  private async calculateMultiStopSavings(requests: TransportRequest[]): Promise<{ miles: number; time: number; revenue: number }> {
    let individualDistance = 0;
    let chainedDistance = 0;

    // Calculate individual route distances
    for (const request of requests) {
      const distance = await this.calculateFacilityProximity(
        request.originFacilityId,
        request.destinationFacilityId
      );
      individualDistance += distance;
    }

    // Calculate chained route distance
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      if (i === 0) {
        // First request: start to origin
        chainedDistance += await this.calculateFacilityProximity(
          'START', // Will be replaced with actual starting point
          request.originFacilityId
        );
      }

      // Request distance
      chainedDistance += await this.calculateFacilityProximity(
        request.originFacilityId,
        request.destinationFacilityId
      );

      if (i < requests.length - 1) {
        // Distance to next request
        const nextRequest = requests[i + 1];
        chainedDistance += await this.calculateFacilityProximity(
          request.destinationFacilityId,
          nextRequest.originFacilityId
        );
      }
    }

    const milesSaved = Math.max(0, individualDistance - chainedDistance);
    const timeSaved = milesSaved * 2;
    const revenueSaved = milesSaved * 5.00;

    return { miles: milesSaved, time: timeSaved, revenue: revenueSaved };
  }

  /**
   * Generate route stops for a chained trip
   */
  private async generateRouteStops(
    requests: TransportRequest[],
    routeMetrics: { totalDistance: number; totalTime: number; emptyMiles: number; loadedMiles: number }
  ): Promise<RouteStop[]> {
    const stops: RouteStop[] = [];
    let currentTime = new Date();

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      // Pickup stop
      stops.push({
        id: `STOP-${Date.now()}-${i * 2}`,
        routeId: `ROUTE-${Date.now()}`,
        stopOrder: i * 2 + 1,
        facilityId: request.originFacilityId,
        transportRequestId: request.id,
        multiPatientTransportId: null,
        stopType: 'PICKUP',
        estimatedArrival: new Date(currentTime.getTime() + (i * 30 * 60 * 1000)), // 30 min intervals
        actualArrival: null,
        estimatedDeparture: new Date(currentTime.getTime() + (i * 30 * 60 * 1000) + (15 * 60 * 1000)), // 15 min pickup
        actualDeparture: null,
        stopDuration: 15,
        notes: `Pickup for patient ${request.patientId}`
      });

      // Dropoff stop
      stops.push({
        id: `STOP-${Date.now()}-${i * 2 + 1}`,
        routeId: `ROUTE-${Date.now()}`,
        stopOrder: i * 2 + 2,
        facilityId: request.destinationFacilityId,
        transportRequestId: request.id,
        multiPatientTransportId: null,
        stopType: 'DROPOFF',
        estimatedArrival: new Date(currentTime.getTime() + (i * 30 * 60 * 1000) + (15 * 60 * 1000)),
        actualArrival: null,
        estimatedDeparture: new Date(currentTime.getTime() + (i * 30 * 60 * 1000) + (30 * 60 * 1000)), // 15 min dropoff
        actualDeparture: null,
        stopDuration: 15,
        notes: `Dropoff for patient ${request.patientId}`
      });

      currentTime = new Date(currentTime.getTime() + (30 * 60 * 1000));
    }

    return stops;
  }

  /**
   * Calculate time windows for a group of requests
   */
  private calculateTimeWindows(requests: TransportRequest[]): { start: Date; end: Date } {
    const timestamps = requests.map(r => new Date(r.requestTimestamp));
    const start = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const end = new Date(Math.max(...timestamps.map(t => t.getTime())));

    return { start, end };
  }

  /**
   * Calculate time window flexibility score
   */
  private calculateTimeWindowFlexibility(timeWindows: { start: Date; end: Date }): number {
    const duration = timeWindows.end.getTime() - timeWindows.start.getTime();
    const hours = duration / (1000 * 60 * 60);
    
    // More flexible if longer time window (up to 4 hours)
    return Math.min(100, Math.max(0, (hours / 4) * 100));
  }

  /**
   * Calculate geographic efficiency score
   */
  private calculateGeographicEfficiency(
    routeMetrics: { totalDistance: number; totalTime: number; emptyMiles: number; loadedMiles: number },
    requests: TransportRequest[]
  ): number {
    const efficiency = (routeMetrics.loadedMiles / routeMetrics.totalDistance) * 100;
    return Math.min(100, Math.max(0, efficiency));
  }

  /**
   * Calculate temporal efficiency score
   */
  private calculateTemporalEfficiency(
    timeWindows: { start: Date; end: Date },
    requests: TransportRequest[]
  ): number {
    const duration = timeWindows.end.getTime() - timeWindows.start.getTime();
    const hours = duration / (1000 * 60 * 60);
    
    // More efficient if shorter time window (but not too short)
    if (hours < 1) return 50; // Too rushed
    if (hours > 6) return 30; // Too spread out
    return Math.max(0, 100 - (hours - 1) * 14); // Optimal between 1-6 hours
  }

  /**
   * Calculate optimization score for a chaining opportunity
   */
  private calculateOptimizationScore(
    savings: { miles: number; time: number; revenue: number },
    routeMetrics: { totalDistance: number; totalTime: number; emptyMiles: number; loadedMiles: number },
    requestCount: number
  ): number {
    const revenueScore = Math.min(100, (savings.revenue / 100) * 100); // Normalize to $100 max
    const distanceScore = Math.min(100, (savings.miles / 20) * 100); // Normalize to 20 miles max
    const timeScore = Math.min(100, (savings.time / 60) * 100); // Normalize to 60 minutes max
    const efficiencyScore = (routeMetrics.loadedMiles / routeMetrics.totalDistance) * 100;

    const weightedScore = 
      revenueScore * this.OPTIMIZATION_WEIGHTS.REVENUE +
      distanceScore * this.OPTIMIZATION_WEIGHTS.DISTANCE +
      timeScore * this.OPTIMIZATION_WEIGHTS.TIME +
      efficiencyScore * this.OPTIMIZATION_WEIGHTS.EFFICIENCY;

    return Math.min(100, Math.max(0, weightedScore));
  }

  /**
   * Generate chaining benefits description
   */
  private generateChainingBenefits(
    savings: { miles: number; time: number; revenue: number },
    requestCount: number
  ): string[] {
    const benefits: string[] = [];

    if (savings.miles > 0) {
      benefits.push(`Save ${savings.miles.toFixed(1)} miles of travel`);
    }
    if (savings.time > 0) {
      benefits.push(`Save ${savings.time.toFixed(0)} minutes of travel time`);
    }
    if (savings.revenue > 0) {
      benefits.push(`Increase revenue by $${savings.revenue.toFixed(2)}`);
    }
    if (requestCount > 1) {
      benefits.push(`Serve ${requestCount} patients in single route`);
    }

    return benefits;
  }

  /**
   * Map chaining type to optimization type
   */
  private mapChainingTypeToOptimizationType(
    chainingType: 'TEMPORAL' | 'SPATIAL' | 'RETURN_TRIP' | 'MULTI_STOP'
  ): RouteOptimizationType {
    switch (chainingType) {
      case 'TEMPORAL': return 'TEMPORAL';
      case 'SPATIAL': return 'GEOGRAPHIC';
      case 'RETURN_TRIP': return 'RETURN_TRIP';
      case 'MULTI_STOP': return 'MULTI_STOP';
      default: return 'CHAINED_TRIPS';
    }
  }

  /**
   * Find efficient request groups for multi-stop optimization
   */
  private findEfficientRequestGroups(
    requests: TransportRequest[],
    minSize: number,
    maxSize: number
  ): TransportRequest[][] {
    const groups: TransportRequest[][] = [];
    
    // Simple grouping by facility proximity
    const facilityGroups = new Map<string, TransportRequest[]>();
    
    for (const request of requests) {
      const key = request.originFacilityId;
      if (!facilityGroups.has(key)) {
        facilityGroups.set(key, []);
      }
      facilityGroups.get(key)!.push(request);
    }

    // Create groups from facilities with multiple requests
    for (const [facilityId, facilityRequests] of facilityGroups) {
      if (facilityRequests.length >= minSize && facilityRequests.length <= maxSize) {
        groups.push(facilityRequests);
      }
    }

    return groups;
  }

  /**
   * Generate optimized routes from chaining opportunities
   */
  private async generateOptimizedRoutes(
    opportunities: ChainedTripOpportunity[],
    optimizationRequest: RouteOptimizationRequest
  ): Promise<ChainedTripOpportunity[]> {
    // Apply constraints and filtering
    const filteredOpportunities = opportunities.filter(opp => {
      if (optimizationRequest.constraints?.maxDuration && opp.totalTime > optimizationRequest.constraints.maxDuration) {
        return false;
      }
      if (optimizationRequest.constraints?.maxStops && opp.routeStops.length > optimizationRequest.constraints.maxStops) {
        return false;
      }
      if (optimizationRequest.constraints?.minRevenue && opp.revenueIncrease < optimizationRequest.constraints.minRevenue) {
        return false;
      }
      return true;
    });

    return filteredOpportunities;
  }

  /**
   * Calculate optimization summary and recommendations
   */
  private calculateOptimizationSummary(
    opportunities: ChainedTripOpportunity[],
    startTime: number,
    requestsAnalyzed: number
  ): RouteOptimizationResult {
    const calculationTime = Date.now() - startTime;
    
    const summary = {
      totalOpportunities: opportunities.length,
      totalMilesSaved: opportunities.reduce((sum, opp) => sum + opp.milesSaved, 0),
      totalRevenueIncrease: opportunities.reduce((sum, opp) => sum + opp.revenueIncrease, 0),
      totalUnitsSaved: opportunities.reduce((sum, opp) => sum + opp.unitsSaved, 0),
      averageOptimizationScore: opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + opp.optimizationScore, 0) / opportunities.length 
        : 0,
      optimizationTypes: opportunities.reduce((acc, opp) => {
        acc[opp.routeType] = (acc[opp.routeType] || 0) + 1;
        return acc;
      }, {} as Record<RouteOptimizationType, number>)
    };

    const recommendations = {
      highValue: opportunities.filter(opp => opp.optimizationScore >= 80).slice(0, 5),
      quickWins: opportunities.filter(opp => opp.optimizationScore >= 60 && opp.totalTime <= 120).slice(0, 5),
      longTerm: opportunities.filter(opp => opp.optimizationScore >= 70 && opp.totalTime > 120).slice(0, 5)
    };

    const performance = {
      calculationTime,
      requestsAnalyzed,
      routesGenerated: opportunities.length
    };

    return {
      opportunities,
      summary,
      recommendations,
      performance
    };
  }

  /**
   * Calculate facility proximity using distance matrix
   */
  private async calculateFacilityProximity(facilityId1: string, facilityId2: string): Promise<number> {
    if (facilityId1 === 'START' || facilityId2 === 'START') {
      return 0; // Starting point has no distance
    }

    try {
      const distance = await distanceService.getDistanceMatrix(facilityId1, facilityId2);
      return distance ? distance.distanceMiles : 1000; // Default to 1000 miles if not found
    } catch (error) {
      console.warn(`[MedPort:RouteOptimization] Could not calculate distance between facilities ${facilityId1} and ${facilityId2}:`, error);
      return 1000; // Default to 1000 miles
    }
  }

  /**
   * Get route optimization statistics
   */
  async getOptimizationStats(): Promise<{
    totalOptimizations: number;
    averageSavings: {
      miles: number;
      revenue: number;
      time: number;
    };
    topOptimizationTypes: Array<{
      type: RouteOptimizationType;
      count: number;
      averageScore: number;
    }>;
  }> {
    // This would typically query the database for historical optimization data
    // For now, return mock data
    return {
      totalOptimizations: 0,
      averageSavings: {
        miles: 0,
        revenue: 0,
        time: 0
      },
      topOptimizationTypes: []
    };
  }
}

export default new RouteOptimizationService();
