import { PrismaClient, Route, RouteStop, TransportRequest, RouteOptimizationType } from '@prisma/client';

// Import types from the route optimization service
interface ChainedTripOpportunity {
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
  timeWindowFlexibility: number;
  geographicEfficiency: number;
  temporalEfficiency: number;
}

const prisma = new PrismaClient();

export interface EnhancedRouteCard {
  id: string;
  routeType: string;
  optimizationScore: number;
  routeSummary: {
    totalDistance: number;
    totalTime: number;
    milesSaved: number;
    unitsSaved: number;
    revenueIncrease: number;
    fuelSavings: number;
    carbonFootprintReduction: number;
  };
  routeDetails: {
    stops: RouteStopDetail[];
    waypoints: Waypoint[];
    estimatedTimeline: TimelineEvent[];
    constraints: RouteConstraint[];
  };
  financialAnalysis: {
    revenuePotential: number;
    costSavings: number;
    profitMargin: number;
    roi: number;
    breakEvenAnalysis: BreakEvenPoint[];
  };
  operationalMetrics: {
    efficiencyScore: number;
    reliabilityScore: number;
    riskAssessment: RiskFactor[];
    recommendations: string[];
  };
  comparisonData: {
    baselineMetrics: RouteMetrics;
    optimizedMetrics: RouteMetrics;
    improvementPercentages: ImprovementMetrics;
  };
  exportOptions: {
    pdfTemplate: string;
    csvFormat: string;
    jsonData: any;
  };
}

export interface RouteStopDetail {
  stopNumber: number;
  facilityId: string;
  facilityName: string;
  stopType: string;
  estimatedArrival: Date;
  estimatedDeparture: Date;
  patientCount: number;
  specialRequirements: string[];
  estimatedDuration: number;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  description: string;
  estimatedTime: Date;
  distanceFromPrevious: number;
  trafficConditions: string;
  weatherConditions: string;
}

export interface TimelineEvent {
  eventType: 'DEPARTURE' | 'ARRIVAL' | 'PICKUP' | 'DROPOFF' | 'REFUEL' | 'REST';
  location: string;
  estimatedTime: Date;
  actualTime?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  notes: string;
}

export interface RouteConstraint {
  type: 'TIME_WINDOW' | 'DISTANCE_LIMIT' | 'CAPACITY' | 'REGULATORY' | 'WEATHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
  mitigation: string;
}

export interface BreakEvenPoint {
  metric: 'MILES' | 'TIME' | 'REVENUE' | 'EFFICIENCY';
  threshold: number;
  currentValue: number;
  projectedValue: number;
  timeline: Date;
}

export interface RiskFactor {
  category: 'OPERATIONAL' | 'FINANCIAL' | 'REGULATORY' | 'ENVIRONMENTAL';
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface RouteMetrics {
  distance: number;
  time: number;
  cost: number;
  revenue: number;
  efficiency: number;
}

export interface ImprovementMetrics {
  distance: number;
  time: number;
  cost: number;
  revenue: number;
  efficiency: number;
}

export interface RouteCardExportOptions {
  format: 'PDF' | 'CSV' | 'JSON' | 'EXCEL';
  includeCharts: boolean;
  includeMaps: boolean;
  includeFinancials: boolean;
  includeTimeline: boolean;
}

export class RouteCardGenerationService {
  
  /**
   * Generate enhanced route cards with comprehensive details
   */
  async generateEnhancedRouteCards(
    opportunities: ChainedTripOpportunity[],
    exportOptions?: Partial<RouteCardExportOptions>
  ): Promise<EnhancedRouteCard[]> {
    const enhancedCards: EnhancedRouteCard[] = [];

    for (const opportunity of opportunities) {
      const enhancedCard = await this.createEnhancedRouteCard(opportunity, exportOptions);
      enhancedCards.push(enhancedCard);
    }

    return enhancedCards;
  }

  /**
   * Create a single enhanced route card
   */
  private async createEnhancedRouteCard(
    opportunity: ChainedTripOpportunity,
    exportOptions?: Partial<RouteCardExportOptions>
  ): Promise<EnhancedRouteCard> {
    const routeStops = await this.getRouteStopsWithDetails(opportunity.routeStops);
    const waypoints = await this.generateWaypoints(opportunity);
    const timeline = await this.generateTimeline(opportunity);
    const constraints = await this.analyzeConstraints(opportunity);
    const financials = await this.calculateFinancialAnalysis(opportunity);
    const operational = await this.calculateOperationalMetrics(opportunity);
    const comparison = await this.generateComparisonData(opportunity);

    return {
      id: opportunity.id,
      routeType: opportunity.routeType,
      optimizationScore: opportunity.optimizationScore,
      routeSummary: {
        totalDistance: opportunity.totalDistance,
        totalTime: opportunity.totalTime,
        milesSaved: opportunity.milesSaved,
        unitsSaved: opportunity.unitsSaved,
        revenueIncrease: opportunity.revenueIncrease,
        fuelSavings: this.calculateFuelSavings(opportunity),
        carbonFootprintReduction: this.calculateCarbonReduction(opportunity)
      },
      routeDetails: {
        stops: routeStops,
        waypoints,
        estimatedTimeline: timeline,
        constraints
      },
      financialAnalysis: financials,
      operationalMetrics: operational,
      comparisonData: comparison,
      exportOptions: await this.generateExportOptions(opportunity, exportOptions)
    };
  }

  /**
   * Get detailed route stops information
   */
  private async getRouteStopsWithDetails(routeStops: RouteStop[]): Promise<RouteStopDetail[]> {
    const detailedStops: RouteStopDetail[] = [];

    for (let i = 0; i < routeStops.length; i++) {
      const stop = routeStops[i];
      const facility = await prisma.facility.findUnique({
        where: { id: stop.facilityId }
      });

      if (facility) {
        detailedStops.push({
          stopNumber: i + 1,
          facilityId: stop.facilityId,
          facilityName: facility.name,
          stopType: stop.stopType || 'PICKUP',
          estimatedArrival: stop.estimatedArrival || new Date(),
          estimatedDeparture: stop.estimatedDeparture || new Date(),
          patientCount: 1, // Default value since this field doesn't exist in RouteStop
          specialRequirements: [], // Default empty array since this field doesn't exist in RouteStop
          estimatedDuration: stop.stopDuration || 15
        });
      }
    }

    return detailedStops;
  }

  /**
   * Generate waypoints for the route
   */
  private async generateWaypoints(opportunity: ChainedTripOpportunity): Promise<Waypoint[]> {
    const waypoints: Waypoint[] = [];
    
    // Generate waypoints between facilities
    for (let i = 0; i < opportunity.routeStops.length - 1; i++) {
      const currentStop = opportunity.routeStops[i];
      const nextStop = opportunity.routeStops[i + 1];
      
      if (currentStop.facilityId && nextStop.facilityId) {
        const distance = await this.calculateDistanceBetweenFacilities(
          currentStop.facilityId,
          nextStop.facilityId
        );

        waypoints.push({
          latitude: 0, // Would be calculated from actual facility coordinates
          longitude: 0,
          description: `Route segment ${i + 1}`,
          estimatedTime: new Date(), // Would be calculated from route timing
          distanceFromPrevious: distance,
          trafficConditions: 'Normal',
          weatherConditions: 'Clear'
        });
      }
    }

    return waypoints;
  }

  /**
   * Generate timeline for the route
   */
  private async generateTimeline(opportunity: ChainedTripOpportunity): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [];
    const startTime = opportunity.estimatedStartTime;

    timeline.push({
      eventType: 'DEPARTURE',
      location: 'Starting Point',
      estimatedTime: startTime,
      status: 'SCHEDULED',
      notes: 'Route optimization initiated'
    });

    // Add timeline events for each stop
    opportunity.routeStops.forEach((stop: any, index: number) => {
      const stopTime = new Date(startTime.getTime() + (index * 30 * 60000)); // 30 min intervals
      
      timeline.push({
        eventType: index === 0 ? 'PICKUP' : 'DROPOFF',
        location: `Stop ${index + 1}`,
        estimatedTime: stopTime,
        status: 'SCHEDULED',
        notes: `Route stop ${index + 1}`
      });
    });

    timeline.push({
      eventType: 'ARRIVAL',
      location: 'Final Destination',
      estimatedTime: opportunity.estimatedEndTime,
      status: 'SCHEDULED',
      notes: 'Route optimization completed'
    });

    return timeline;
  }

  /**
   * Analyze route constraints
   */
  private async analyzeConstraints(opportunity: ChainedTripOpportunity): Promise<RouteConstraint[]> {
    const constraints: RouteConstraint[] = [];

    // Time window constraints
    if (opportunity.timeWindowFlexibility < 30) {
      constraints.push({
        type: 'TIME_WINDOW',
        description: 'Limited time flexibility for route optimization',
        severity: 'MEDIUM',
        impact: 'May reduce optimization opportunities',
        mitigation: 'Consider extending time windows for better optimization'
      });
    }

    // Distance constraints
    if (opportunity.totalDistance > 100) {
      constraints.push({
        type: 'DISTANCE_LIMIT',
        description: 'Long-distance route may have regulatory requirements',
        severity: 'LOW',
        impact: 'Additional compliance considerations',
        mitigation: 'Verify driver rest requirements and equipment needs'
      });
    }

    // Capacity constraints
    if (opportunity.transportRequests.length > 3) {
      constraints.push({
        type: 'CAPACITY',
        description: 'Multiple patient transport requires careful coordination',
        severity: 'MEDIUM',
        impact: 'Increased complexity and coordination needs',
        mitigation: 'Ensure adequate staffing and equipment for multi-patient transport'
      });
    }

    return constraints;
  }

  /**
   * Calculate financial analysis
   */
  private async calculateFinancialAnalysis(opportunity: ChainedTripOpportunity): Promise<any> {
    const baseRevenue = opportunity.transportRequests.reduce((sum: number, req: any) => sum + (req.revenuePotential || 0), 0);
    const optimizedRevenue = opportunity.revenuePotential;
    const costSavings = opportunity.milesSaved * 0.50; // $0.50 per mile savings
    const profitMargin = ((optimizedRevenue - baseRevenue) / optimizedRevenue) * 100;
    const roi = (opportunity.revenueIncrease / costSavings) * 100;

    return {
      revenuePotential: optimizedRevenue,
      costSavings,
      profitMargin,
      roi,
      breakEvenAnalysis: [
        {
          metric: 'MILES',
          threshold: opportunity.milesSaved * 0.8,
          currentValue: opportunity.milesSaved,
          projectedValue: opportunity.milesSaved,
          timeline: new Date()
        }
      ]
    };
  }

  /**
   * Calculate operational metrics
   */
  private async calculateOperationalMetrics(opportunity: ChainedTripOpportunity): Promise<any> {
    const efficiencyScore = (opportunity.geographicEfficiency + opportunity.temporalEfficiency) / 2;
    const reliabilityScore = Math.min(100, efficiencyScore + 10);
    
    const riskFactors: RiskFactor[] = [];
    
    if (opportunity.timeWindowFlexibility < 20) {
      riskFactors.push({
        category: 'OPERATIONAL',
        risk: 'Low time flexibility increases schedule risk',
        probability: 0.7,
        impact: 0.6,
        mitigation: 'Build buffer time into schedule'
      });
    }

    return {
      efficiencyScore,
      reliabilityScore,
      riskAssessment: riskFactors,
      recommendations: [
        'Monitor route performance metrics',
        'Adjust optimization parameters based on results',
        'Consider weather and traffic conditions'
      ]
    };
  }

  /**
   * Generate comparison data
   */
  private async generateComparisonData(opportunity: ChainedTripOpportunity): Promise<any> {
    const baselineMetrics: RouteMetrics = {
      distance: opportunity.totalDistance + opportunity.milesSaved,
      time: opportunity.totalTime + 30, // Assume 30 min savings
      cost: opportunity.revenuePotential - opportunity.revenueIncrease,
      revenue: opportunity.revenuePotential - opportunity.revenueIncrease,
      efficiency: opportunity.optimizationScore - 20
    };

    const optimizedMetrics: RouteMetrics = {
      distance: opportunity.totalDistance,
      time: opportunity.totalTime,
      cost: opportunity.revenuePotential,
      revenue: opportunity.revenuePotential,
      efficiency: opportunity.optimizationScore
    };

    return {
      baselineMetrics,
      optimizedMetrics,
      improvementPercentages: {
        distance: (opportunity.milesSaved / (opportunity.totalDistance + opportunity.milesSaved)) * 100,
        time: (30 / (opportunity.totalTime + 30)) * 100,
        cost: (opportunity.revenueIncrease / (opportunity.revenuePotential - opportunity.revenueIncrease)) * 100,
        revenue: (opportunity.revenueIncrease / (opportunity.revenuePotential - opportunity.revenueIncrease)) * 100,
        efficiency: (20 / (opportunity.optimizationScore - 20)) * 100
      }
    };
  }

  /**
   * Generate export options
   */
  private async generateExportOptions(opportunity: ChainedTripOpportunity, exportOptions?: Partial<RouteCardExportOptions>): Promise<any> {
    return {
      pdfTemplate: 'route-optimization-template',
      csvFormat: await this.generateCSVFormat(opportunity),
      jsonData: opportunity
    };
  }

  /**
   * Generate CSV format data
   */
  private async generateCSVFormat(opportunity: ChainedTripOpportunity): Promise<string> {
    const headers = [
      'Route ID',
      'Route Type',
      'Optimization Score',
      'Total Distance',
      'Total Time',
      'Miles Saved',
      'Revenue Increase',
      'Units Saved'
    ];

    const data = [
      opportunity.id,
      opportunity.routeType,
      opportunity.optimizationScore,
      opportunity.totalDistance,
      opportunity.totalTime,
      opportunity.milesSaved,
      opportunity.revenueIncrease,
      opportunity.unitsSaved
    ];

    return [headers.join(','), data.join(',')].join('\n');
  }

  /**
   * Calculate fuel savings
   */
  private calculateFuelSavings(opportunity: ChainedTripOpportunity): number {
    const fuelEfficiency = 8; // miles per gallon
    const fuelCost = 3.50; // dollars per gallon
    return (opportunity.milesSaved / fuelEfficiency) * fuelCost;
  }

  /**
   * Calculate carbon footprint reduction
   */
  private calculateCarbonReduction(opportunity: ChainedTripOpportunity): number {
    const carbonPerMile = 0.404; // kg CO2 per mile
    return opportunity.milesSaved * carbonPerMile;
  }

  /**
   * Calculate distance between facilities
   */
  private async calculateDistanceBetweenFacilities(facility1Id: string, facility2Id: string): Promise<number> {
    // This would integrate with the distance service
    // For now, return a placeholder value
    return 25.5;
  }

  /**
   * Generate route card PDF
   */
  async generateRouteCardPDF(routeCard: EnhancedRouteCard): Promise<Buffer> {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    return Buffer.from('PDF placeholder');
  }

  /**
   * Export route cards to Excel
   */
  async exportToExcel(routeCards: EnhancedRouteCard[]): Promise<Buffer> {
    // This would integrate with an Excel generation library
    // For now, return a placeholder
    return Buffer.from('Excel placeholder');
  }

  /**
   * Send route card notifications
   */
  async sendRouteCardNotifications(routeCards: EnhancedRouteCard[], recipients: string[]): Promise<void> {
    // This would integrate with notification services
    console.log(`Sending ${routeCards.length} route card notifications to ${recipients.length} recipients`);
  }
}

export default new RouteCardGenerationService();
