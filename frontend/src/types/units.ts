// Unit Types and Interfaces for EMS Units Management System

export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: UnitType;
  capabilities: UnitCapability[];
  currentStatus: UnitStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isActive: boolean;
  
  // Trip assignment tracking
  assignedTripId?: string;
  lastStatusUpdate: Date;
  statusHistory?: StatusHistoryEntry[];
  currentTripDetails?: TripDetails;
  
  // Location tracking
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: Date;
  };
  locationUpdatedAt?: Date;
  
  // Performance metrics
  totalTripsCompleted: number;
  averageResponseTime?: number; // in minutes
  lastMaintenanceDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type UnitType = 
  | 'AMBULANCE'
  | 'WHEELCHAIR_VAN'
  | 'CRITICAL_CARE'
  | 'OTHER';

export type UnitStatus = 
  | 'AVAILABLE'
  | 'COMMITTED'
  | 'OUT_OF_SERVICE'
  | 'MAINTENANCE'
  | 'OFF_DUTY';

export type UnitCapability = 
  | 'BLS'
  | 'ALS'
  | 'CCT'
  | 'WHEELCHAIR'
  | 'STRETCHER'
  | 'OXYGEN'
  | 'MONITORING'
  | 'VENTILATOR'
  | 'CUSTOM';

export interface StatusHistoryEntry {
  status: UnitStatus;
  timestamp: Date;
  reason?: string;
  updatedBy?: string;
}

export interface TripDetails {
  tripId: string;
  patientId: string;
  origin: string;
  destination: string;
  transportLevel: string;
  priority: string;
  assignedAt: Date;
  estimatedPickupTime?: Date;
  estimatedArrivalTime?: Date;
}

export interface UnitFormData {
  unitNumber: string;
  type: UnitType;
  capabilities: UnitCapability[];
  customCapabilities?: string[];
  isActive: boolean;
}

export interface UnitStatusUpdate {
  status: UnitStatus;
  reason?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface UnitAnalytics {
  totalUnits: number;
  availableUnits: number;
  committedUnits: number;
  outOfServiceUnits: number;
  maintenanceUnits: number;
  offDutyUnits: number;
  averageResponseTime: number;
  totalTripsToday: number;
  efficiency: number; // percentage
}

export interface UnitPerformanceMetrics {
  unitId: string;
  unitNumber: string;
  totalTrips: number;
  averageResponseTime: number;
  averageTripTime: number;
  efficiency: number;
  lastTripDate?: Date;
  maintenanceDue?: Date;
}

// Unit type display names
export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  AMBULANCE: 'Ambulance',
  WHEELCHAIR_VAN: 'Wheelchair Van',
  CRITICAL_CARE: 'Critical Care',
  OTHER: 'Other'
};

// Unit status display names and colors
export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  AVAILABLE: 'Available',
  COMMITTED: 'Committed',
  OUT_OF_SERVICE: 'Out of Service',
  MAINTENANCE: 'Maintenance',
  OFF_DUTY: 'Off Duty'
};

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  AVAILABLE: 'text-green-600 bg-green-100',
  COMMITTED: 'text-blue-600 bg-blue-100',
  OUT_OF_SERVICE: 'text-red-600 bg-red-100',
  MAINTENANCE: 'text-yellow-600 bg-yellow-100',
  OFF_DUTY: 'text-gray-600 bg-gray-100'
};

// Unit capability display names
export const UNIT_CAPABILITY_LABELS: Record<UnitCapability, string> = {
  BLS: 'Basic Life Support',
  ALS: 'Advanced Life Support',
  CCT: 'Critical Care Transport',
  WHEELCHAIR: 'Wheelchair Transport',
  STRETCHER: 'Stretcher Transport',
  OXYGEN: 'Oxygen Delivery',
  MONITORING: 'Patient Monitoring',
  VENTILATOR: 'Ventilator Support',
  CUSTOM: 'Custom Capability'
};

// API Response Types
export interface UnitsResponse {
  success: boolean;
  data?: Unit[];
  error?: string;
}

export interface UnitResponse {
  success: boolean;
  data?: Unit;
  error?: string;
}

export interface UnitAnalyticsResponse {
  success: boolean;
  data?: UnitAnalytics;
  error?: string;
}

export interface UnitPerformanceResponse {
  success: boolean;
  data?: UnitPerformanceMetrics[];
  error?: string;
}
