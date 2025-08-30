// Transport Level Enum
export enum TransportLevel {
  BLS = 'BLS',
  ALS = 'ALS',
  CCT = 'CCT',
  OTHER = 'Other'
}

// Priority Enum
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Request Status Enum
export enum RequestStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Facility Type Enum
export enum FacilityType {
  HOSPITAL = 'HOSPITAL',
  NURSING_HOME = 'NURSING_HOME',
  CANCER_CENTER = 'CANCER_CENTER',
  REHAB_FACILITY = 'REHAB_FACILITY',
  URGENT_CARE = 'URGENT_CARE',
  SPECIALTY_CLINIC = 'SPECIALTY_CLINIC'
}

// Unit Status Enum
export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  MAINTENANCE = 'MAINTENANCE'
}

// Route Status Enum
export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OPTIMIZED = 'OPTIMIZED',
  SUGGESTED = 'SUGGESTED'
}

// Route Type Enum
export enum RouteType {
  FASTEST = 'FASTEST',
  SHORTEST = 'SHORTEST',
  MOST_EFFICIENT = 'MOST_EFFICIENT',
  LOWEST_COST = 'LOWEST_COST',
  SCENIC = 'SCENIC'
}

// Route Optimization Type Enum
export enum RouteOptimizationType {
  CHAINED_TRIPS = 'CHAINED_TRIPS',
  RETURN_TRIP = 'RETURN_TRIP',
  MULTI_STOP = 'MULTI_STOP',
  GEOGRAPHIC = 'GEOGRAPHIC',
  TEMPORAL = 'TEMPORAL',
  REVENUE_MAX = 'REVENUE_MAX'
}

// Stop Type Enum
export enum StopType {
  PICKUP = 'PICKUP',
  DROPOFF = 'DROPOFF',
  REFUEL = 'REFUEL',
  REST = 'REST',
  EQUIPMENT = 'EQUIPMENT',
  TRANSFER = 'TRANSFER'
}

// User Role Enum
export enum UserRole {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  BILLING_STAFF = 'BILLING_STAFF',
  TRANSPORT_AGENCY = 'TRANSPORT_AGENCY'
}

// Facility Interface
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: any;
  phone?: string;
  email?: string;
  operatingHours?: any;
  capabilities?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transport Request Interface
export interface TransportRequest {
  id: string;
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  priority: Priority;
  status: RequestStatus;
  specialRequirements?: string;
  requestTimestamp: string;
  pickupTimestamp?: string;
  completionTimestamp?: string;
  assignedAgencyId?: string;
  assignedUnitId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  routeOptimizationScore?: number;
  chainingOpportunities?: any;
  timeFlexibility?: number;
  revenuePotential?: number;
}

// Transport Request with Details Interface
export interface TransportRequestWithDetails extends TransportRequest {
  originFacility: Facility;
  destinationFacility: Facility;
  createdBy: {
    id: string;
    name?: string;
    email: string;
    role: UserRole;
  };
  assignedAgency?: {
    id: string;
    name: string;
  };
  assignedUnit?: {
    id: string;
    unitNumber: string;
    type: TransportLevel;
  };
}

// Transport Agency Interface
export interface TransportAgency {
  id: string;
  name: string;
  contactName?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea?: any;
  operatingHours?: any;
  capabilities?: any;
  pricingStructure?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Unit Interface
export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: TransportLevel;
  capabilities?: any;
  currentStatus: UnitStatus;
  currentLocation?: any;
  shiftStart?: string;
  shiftEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Route Interface
export interface Route {
  id: string;
  routeNumber: string;
  agencyId: string;
  assignedUnitId?: string;
  status: RouteStatus;
  totalDistanceMiles: number;
  estimatedTimeMinutes: number;
  emptyMilesReduction?: number;
  revenueOptimizationScore?: number;
  chainedTripCount: number;
  estimatedRevenue?: number;
  plannedStartTime?: string;
  actualStartTime?: string;
  completionTime?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  optimizationType?: RouteOptimizationType;
  milesSaved?: number;
  unitsSaved?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Route Stop Interface
export interface RouteStop {
  id: string;
  routeId: string;
  stopOrder: number;
  facilityId: string;
  transportRequestId?: string;
  stopType: StopType;
  estimatedArrival?: string;
  actualArrival?: string;
  estimatedDeparture?: string;
  actualDeparture?: string;
  stopDuration?: number;
  notes?: string;
}

// Distance Matrix Interface
export interface DistanceMatrix {
  id: string;
  fromFacilityId: string;
  toFacilityId: string;
  distanceMiles: number;
  estimatedTimeMinutes: number;
  trafficFactor: number;
  tolls: number;
  fuelEfficiency?: number;
  routeType: RouteType;
  lastUpdated: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Interfaces
export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Filter Interfaces
export interface TransportRequestFilters {
  status?: RequestStatus;
  priority?: Priority;
  transportLevel?: TransportLevel;
  originFacilityId?: string;
  destinationFacilityId?: string;
  createdById?: string;
  page?: number;
  limit?: number;
}

export interface FacilitySearchFilters {
  name?: string;
  type?: FacilityType;
  city?: string;
  state?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Statistics Interfaces
export interface TransportRequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byPriority: Record<Priority, number>;
  byTransportLevel: Record<TransportLevel, number>;
}

export interface FacilityStats {
  total: number;
  byType: Record<FacilityType, number>;
  byState: Record<string, number>;
  active: number;
  inactive: number;
}

// Multi-Patient Transport Interfaces
export interface MultiPatientTransport {
  id: string;
  batchNumber: string;
  coordinatorId: string;
  status: MultiPatientStatus;
  totalPatients: number;
  totalDistance: number;
  estimatedDuration: number;
  plannedStartTime: string;
  plannedEndTime: string;
  assignedAgencyId?: string;
  assignedUnitId?: string;
  routeOptimizationScore?: number;
  costSavings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MultiPatientTransportWithDetails extends MultiPatientTransport {
  coordinator: User;
  assignedAgency?: TransportAgency;
  assignedUnit?: Unit;
  patientTransports: PatientTransport[];
  routeStops: RouteStop[];
}

export interface PatientTransport {
  id: string;
  multiPatientTransportId: string;
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  priority: Priority;
  specialRequirements?: string;
  sequenceOrder: number;
  estimatedPickupTime: string;
  estimatedDropoffTime: string;
  actualPickupTime?: string;
  actualDropoffTime?: string;
  status: PatientTransportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatientTransportWithDetails extends PatientTransport {
  originFacility: Facility;
  destinationFacility: Facility;
}

// Long-Distance Transport Interfaces
export interface LongDistanceTransport {
  id: string;
  transportNumber: string;
  coordinatorId: string;
  status: LongDistanceStatus;
  totalDistance: number;
  estimatedDuration: number;
  plannedStartTime: string;
  plannedEndTime: string;
  isMultiLeg: boolean;
  legCount: number;
  assignedAgencyId?: string;
  assignedUnitId?: string;
  costEstimate: number;
  revenuePotential: number;
  weatherConditions?: WeatherConditions;
  createdAt: string;
  updatedAt: string;
}

export interface LongDistanceTransportWithDetails extends LongDistanceTransport {
  coordinator: User;
  assignedAgency?: TransportAgency;
  assignedUnit?: Unit;
  transportLegs: TransportLeg[];
  weatherUpdates: WeatherUpdate[];
}

export interface TransportLeg {
  id: string;
  longDistanceTransportId: string;
  legNumber: number;
  originFacilityId: string;
  destinationFacilityId: string;
  distance: number;
  estimatedDuration: number;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: LegStatus;
  patientId?: string;
  transportLevel: TransportLevel;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportLegWithDetails extends TransportLeg {
  originFacility: Facility;
  destinationFacility: Facility;
}

// Weather and Environmental Interfaces
export interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
  conditions: string;
  isAirMedicalSuitable: boolean;
  groundTransportRequired: boolean;
}

export interface WeatherUpdate {
  id: string;
  longDistanceTransportId: string;
  timestamp: string;
  conditions: WeatherConditions;
  impact: string;
  recommendations: string[];
}

// Provider Network Interfaces
export interface ProviderNetwork {
  id: string;
  name: string;
  coverageArea: string[];
  capabilities: TransportLevel[];
  longDistanceCapable: boolean;
  maxDistance: number;
  responseTime: number;
  costPerMile: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Route Optimization Interfaces
export interface RouteOptimizationRequest {
  patientTransports: PatientTransport[];
  constraints: RouteConstraints;
  optimizationGoals: OptimizationGoal[];
}

export interface RouteConstraints {
  maxDuration: number;
  timeWindows: TimeWindow[];
  vehicleCapacity: number;
  driverRestRequirements: boolean;
  facilityOperatingHours: boolean;
}

export interface TimeWindow {
  startTime: string;
  endTime: string;
  priority: Priority;
}

export interface OptimizationGoal {
  type: 'MINIMIZE_DISTANCE' | 'MINIMIZE_TIME' | 'MAXIMIZE_REVENUE' | 'MINIMIZE_COST';
  weight: number;
}

export interface OptimizedRoute {
  routeId: string;
  totalDistance: number;
  totalDuration: number;
  totalCost: number;
  revenuePotential: number;
  stops: OptimizedStop[];
  optimizationScore: number;
  savings: RouteSavings;
}

export interface OptimizedStop {
  facilityId: string;
  stopType: StopType;
  sequence: number;
  estimatedArrival: string;
  estimatedDeparture: string;
  patientTransports: string[];
  duration: number;
}

export interface RouteSavings {
  distanceSaved: number;
  timeSaved: number;
  costSaved: number;
  unitsSaved: number;
  revenueIncrease: number;
}

// New Enums
export enum MultiPatientStatus {
  PLANNING = 'PLANNING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PatientTransportStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum LongDistanceStatus {
  PLANNING = 'PLANNING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WEATHER_DELAYED = 'WEATHER_DELAYED'
}

export enum LegStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED'
}
