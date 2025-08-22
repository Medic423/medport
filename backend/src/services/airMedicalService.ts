import { PrismaClient } from '@prisma/client';
import { 
  AirMedicalResource, 
  AirMedicalTransport, 
  WeatherAlert, 
  GroundTransportCoordination,
  AirMedicalType,
  AirMedicalStatus,
  WeatherAlertType,
  AlertSeverity,
  CoordinationType,
  CoordinationStatus,
  WeatherConditions
} from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAirMedicalResourceData {
  resourceType: AirMedicalType;
  identifier: string;
  baseLocation: string;
  serviceArea: any;
  capabilities: any;
  crewSize: number;
  maxRange: number;
  maxPayload: number;
  weatherMinimums: any;
  operatingHours: any;
  contactInfo: any;
}

export interface CreateAirMedicalTransportData {
  transportRequestId?: string;
  multiPatientTransportId?: string;
  longDistanceTransportId?: string;
  airMedicalResourceId: string;
  flightPlan: any;
  weatherConditions: WeatherConditions;
  estimatedDeparture: Date;
  estimatedArrival: Date;
}

export interface CreateWeatherAlertData {
  alertType: WeatherAlertType;
  severity: AlertSeverity;
  location: string;
  description: string;
  startTime: Date;
  endTime: Date;
  impact: string;
  recommendations: string;
}

export interface CreateGroundTransportCoordinationData {
  airMedicalTransportId: string;
  groundTransportId?: string;
  coordinationType: CoordinationType;
  handoffLocation: string;
  handoffTime?: Date;
  handoffNotes?: string;
}

export class AirMedicalService {
  /**
   * Create a new air medical resource
   */
  async createAirMedicalResource(data: CreateAirMedicalResourceData): Promise<AirMedicalResource> {
    return prisma.airMedicalResource.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  /**
   * Get all active air medical resources
   */
  async getActiveAirMedicalResources(): Promise<AirMedicalResource[]> {
    return prisma.airMedicalResource.findMany({
      where: { isActive: true },
      orderBy: { identifier: 'asc' }
    });
  }

  /**
   * Get air medical resource by ID
   */
  async getAirMedicalResourceById(id: string): Promise<AirMedicalResource | null> {
    return prisma.airMedicalResource.findUnique({
      where: { id }
    });
  }

  /**
   * Update air medical resource
   */
  async updateAirMedicalResource(id: string, data: Partial<CreateAirMedicalResourceData>): Promise<AirMedicalResource> {
    return prisma.airMedicalResource.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Deactivate air medical resource
   */
  async deactivateAirMedicalResource(id: string): Promise<AirMedicalResource> {
    return prisma.airMedicalResource.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Create a new air medical transport
   */
  async createAirMedicalTransport(data: CreateAirMedicalTransportData): Promise<AirMedicalTransport> {
    return prisma.airMedicalTransport.create({
      data: {
        ...data,
        status: 'PLANNING'
      },
      include: {
        airMedicalResource: true,
        transportRequest: true,
        multiPatientTransport: true,
        longDistanceTransport: true
      }
    });
  }

  /**
   * Get air medical transport by ID
   */
  async getAirMedicalTransportById(id: string): Promise<AirMedicalTransport | null> {
    return prisma.airMedicalTransport.findUnique({
      where: { id },
      include: {
        airMedicalResource: true,
        transportRequest: true,
        multiPatientTransport: true,
        longDistanceTransport: true,
        weatherAlerts: true,
        groundTransportCoordination: true
      }
    });
  }

  /**
   * Get all air medical transports
   */
  async getAirMedicalTransports(filters: {
    status?: AirMedicalStatus;
    resourceType?: AirMedicalType;
    dateRange?: { start: Date; end: Date };
  } = {}): Promise<AirMedicalTransport[]> {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.resourceType) {
      where.airMedicalResource = { resourceType: filters.resourceType };
    }
    if (filters.dateRange) {
      where.estimatedDeparture = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    return prisma.airMedicalTransport.findMany({
      where,
      include: {
        airMedicalResource: true,
        transportRequest: true,
        multiPatientTransport: true,
        longDistanceTransport: true
      },
      orderBy: { estimatedDeparture: 'asc' }
    });
  }

  /**
   * Update air medical transport status
   */
  async updateAirMedicalTransportStatus(id: string, status: AirMedicalStatus, additionalData?: any): Promise<AirMedicalTransport> {
    const data: any = { 
      status,
      updatedAt: new Date()
    };

    if (status === 'IN_FLIGHT') {
      data.actualDeparture = new Date();
    } else if (status === 'LANDED') {
      data.actualArrival = new Date();
    } else if (status === 'GROUNDED') {
      data.groundingReason = additionalData?.groundingReason;
    } else if (status === 'WEATHER_DELAYED') {
      data.weatherDelay = true;
    }

    if (additionalData?.crewNotes) {
      data.crewNotes = additionalData.crewNotes;
    }

    return prisma.airMedicalTransport.update({
      where: { id },
      data
    });
  }

  /**
   * Create a new weather alert
   */
  async createWeatherAlert(data: CreateWeatherAlertData): Promise<WeatherAlert> {
    return prisma.weatherAlert.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  /**
   * Get active weather alerts
   */
  async getActiveWeatherAlerts(location?: string): Promise<WeatherAlert[]> {
    const where: any = { isActive: true };
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    return prisma.weatherAlert.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { startTime: 'asc' }
      ]
    });
  }

  /**
   * Update weather alert status
   */
  async updateWeatherAlertStatus(id: string, isActive: boolean): Promise<WeatherAlert> {
    return prisma.weatherAlert.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Create ground transport coordination
   */
  async createGroundTransportCoordination(data: CreateGroundTransportCoordinationData): Promise<GroundTransportCoordination> {
    return prisma.groundTransportCoordination.create({
      data: {
        ...data,
        status: 'PENDING'
      },
      include: {
        airMedicalTransport: true,
        groundTransport: true
      }
    });
  }

  /**
   * Update coordination status
   */
  async updateCoordinationStatus(id: string, status: CoordinationStatus, notes?: string): Promise<GroundTransportCoordination> {
    const data: any = { 
      status,
      updatedAt: new Date()
    };

    if (status === 'IN_PROGRESS' && !data.handoffTime) {
      data.handoffTime = new Date();
    }

    if (notes) {
      data.handoffNotes = notes;
    }

    return prisma.groundTransportCoordination.update({
      where: { id },
      data
    });
  }

  /**
   * Get weather impact assessment for air medical operations
   */
  async getWeatherImpactAssessment(location: string, resourceType: AirMedicalType): Promise<{
    canOperate: boolean;
    restrictions: string[];
    recommendations: string[];
    alerts: WeatherAlert[];
  }> {
    const alerts = await this.getActiveWeatherAlerts(location);
    
    let canOperate = true;
    const restrictions: string[] = [];
    const recommendations: string[] = [];

    for (const alert of alerts) {
      if (alert.severity === 'CRITICAL') {
        canOperate = false;
        restrictions.push(`${alert.alertType}: ${alert.description}`);
      } else if (alert.severity === 'HIGH') {
        canOperate = false;
        restrictions.push(`${alert.alertType}: ${alert.description}`);
      } else if (alert.severity === 'MEDIUM') {
        restrictions.push(`${alert.alertType}: ${alert.description}`);
      }

      if (alert.recommendations) {
        recommendations.push(alert.recommendations);
      }
    }

    return {
      canOperate,
      restrictions,
      recommendations,
      alerts
    };
  }

  /**
   * Get air medical resource availability
   */
  async getResourceAvailability(date: Date, location?: string): Promise<{
    available: AirMedicalResource[];
    unavailable: AirMedicalResource[];
    weatherRestricted: AirMedicalResource[];
  }> {
    const resources = await this.getActiveAirMedicalResources();
    const transports = await this.getAirMedicalTransports({
      dateRange: { start: date, end: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
    });

    const available: AirMedicalResource[] = [];
    const unavailable: AirMedicalResource[] = [];
    const weatherRestricted: AirMedicalResource[] = [];

    for (const resource of resources) {
      const resourceTransports = transports.filter(t => t.airMedicalResourceId === resource.id);
      
      if (resourceTransports.length === 0) {
        // Check weather restrictions
        const weatherAssessment = await this.getWeatherImpactAssessment(
          resource.baseLocation, 
          resource.resourceType
        );
        
        if (weatherAssessment.canOperate) {
          available.push(resource);
        } else {
          weatherRestricted.push(resource);
        }
      } else {
        unavailable.push(resource);
      }
    }

    return { available, unavailable, weatherRestricted };
  }

  /**
   * Get air medical statistics
   */
  async getAirMedicalStatistics(dateRange?: { start: Date; end: Date }): Promise<{
    totalResources: number;
    activeResources: number;
    totalTransports: number;
    completedTransports: number;
    weatherDelays: number;
    averageResponseTime: number;
    resourceUtilization: number;
  }> {
    const where: any = {};
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const [totalResources, activeResources, totalTransports, completedTransports, weatherDelays] = await Promise.all([
      prisma.airMedicalResource.count(),
      prisma.airMedicalResource.count({ where: { isActive: true } }),
      prisma.airMedicalTransport.count({ where }),
      prisma.airMedicalTransport.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.airMedicalTransport.count({ where: { ...where, weatherDelay: true } })
    ]);

    // Calculate average response time (simplified)
    const transports = await prisma.airMedicalTransport.findMany({
      where: { ...where, status: 'COMPLETED' },
      select: { createdAt: true, actualDeparture: true }
    });

    let totalResponseTime = 0;
    let validResponses = 0;

    for (const transport of transports) {
      if (transport.actualDeparture) {
        const responseTime = transport.actualDeparture.getTime() - transport.createdAt.getTime();
        totalResponseTime += responseTime;
        validResponses++;
      }
    }

    const averageResponseTime = validResponses > 0 ? totalResponseTime / validResponses : 0;

    // Calculate resource utilization
    const resourceUtilization = totalResources > 0 ? (activeResources / totalResources) * 100 : 0;

    return {
      totalResources,
      activeResources,
      totalTransports,
      completedTransports,
      weatherDelays,
      averageResponseTime,
      resourceUtilization
    };
  }
}

export default new AirMedicalService();
