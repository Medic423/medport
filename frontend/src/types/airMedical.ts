// Air Medical Integration Types

export enum AirMedicalType {
  HELICOPTER = 'HELICOPTER',
  FIXED_WING = 'FIXED_WING',
  JET = 'JET',
  TURBOPROP = 'TURBOPROP'
}

export enum AirMedicalStatus {
  PLANNING = 'PLANNING',
  SCHEDULED = 'SCHEDULED',
  IN_FLIGHT = 'IN_FLIGHT',
  LANDED = 'LANDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  GROUNDED = 'GROUNDED',
  WEATHER_DELAYED = 'WEATHER_DELAYED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum WeatherAlertType {
  TURBULENCE = 'TURBULENCE',
  LOW_VISIBILITY = 'LOW_VISIBILITY',
  HIGH_WINDS = 'HIGH_WINDS',
  ICING = 'ICING',
  THUNDERSTORMS = 'THUNDERSTORMS',
  SNOW = 'SNOW',
  FOG = 'FOG',
  VOLCANIC_ASH = 'VOLCANIC_ASH'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum CoordinationType {
  HANDOFF = 'HANDOFF',
  ESCORT = 'ESCORT',
  BACKUP = 'BACKUP',
  RELAY = 'RELAY',
  INTERCEPT = 'INTERCEPT'
}

export enum CoordinationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum WeatherConditions {
  CLEAR = 'CLEAR',
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  SNOW = 'SNOW',
  FOG = 'FOG',
  THUNDERSTORMS = 'THUNDERSTORMS',
  HIGH_WINDS = 'HIGH_WINDS',
  ICING = 'ICING',
  TURBULENCE = 'TURBULENCE'
}

export interface AirMedicalResource {
  id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AirMedicalTransport {
  id: string;
  transportRequestId?: string;
  multiPatientTransportId?: string;
  longDistanceTransportId?: string;
  airMedicalResourceId: string;
  status: AirMedicalStatus;
  flightPlan: any;
  weatherConditions: WeatherConditions;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  groundingReason?: string;
  weatherDelay: boolean;
  crewNotes?: string;
  createdAt: string;
  updatedAt: string;
  airMedicalResource?: AirMedicalResource;
  transportRequest?: any;
  multiPatientTransport?: any;
  longDistanceTransport?: any;
}

export interface WeatherAlert {
  id: string;
  alertType: WeatherAlertType;
  severity: AlertSeverity;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  impact: string;
  recommendations: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroundTransportCoordination {
  id: string;
  airMedicalTransportId: string;
  groundTransportId?: string;
  coordinationType: CoordinationType;
  status: CoordinationStatus;
  handoffLocation: string;
  handoffTime?: string;
  handoffNotes?: string;
  createdAt: string;
  updatedAt: string;
  airMedicalTransport?: AirMedicalTransport;
  groundTransport?: any;
}

export interface WeatherImpactAssessment {
  canOperate: boolean;
  restrictions: string[];
  recommendations: string[];
  alerts: WeatherAlert[];
}

export interface ResourceAvailability {
  available: AirMedicalResource[];
  unavailable: AirMedicalResource[];
  weatherRestricted: AirMedicalResource[];
}

export interface AirMedicalStatistics {
  totalResources: number;
  activeResources: number;
  totalTransports: number;
  completedTransports: number;
  weatherDelays: number;
  averageResponseTime: number;
  resourceUtilization: number;
}

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
  estimatedDeparture: string;
  estimatedArrival: string;
}

export interface CreateWeatherAlertData {
  alertType: WeatherAlertType;
  severity: AlertSeverity;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  impact: string;
  recommendations: string;
}

export interface CreateGroundTransportCoordinationData {
  airMedicalTransportId: string;
  groundTransportId?: string;
  coordinationType: CoordinationType;
  handoffLocation: string;
  handoffTime?: string;
  handoffNotes?: string;
}

export interface AirMedicalFilters {
  status?: AirMedicalStatus;
  resourceType?: AirMedicalType;
  startDate?: string;
  endDate?: string;
}
