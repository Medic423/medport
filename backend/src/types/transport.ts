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
