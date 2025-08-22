export interface EmergencyDepartment {
  id: string;
  facilityId: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  hallwayBeds: number;
  criticalBeds: number;
  capacityThreshold: number;
  currentCensus: number;
  transportQueueLength: number;
  averageWaitTime: number;
  peakHours?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  facility: Facility;
  bedStatusUpdates: BedStatusUpdate[];
  transportQueues: TransportQueue[];
  capacityAlerts: CapacityAlert[];
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BedStatusUpdate {
  id: string;
  emergencyDepartmentId: string;
  updateType: BedUpdateType;
  bedCount: number;
  updateReason?: string;
  notes?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface TransportQueue {
  id: string;
  emergencyDepartmentId: string;
  transportRequestId: string;
  queuePosition: number;
  priority: Priority;
  waitTime: number;
  estimatedWaitTime?: number;
  status: QueueStatus;
  assignedProviderId?: string;
  assignedUnitId?: string;
  queueTimestamp: string;
  assignedTimestamp?: string;
  createdAt: string;
  updatedAt: string;
  transportRequest: TransportRequest;
  emergencyDepartment: EmergencyDepartment;
  assignedProvider?: TransportAgency;
  assignedUnit?: Unit;
}

export interface TransportRequest {
  id: string;
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: string;
  priority: string;
  status: string;
  specialRequirements?: string;
  requestTimestamp: string;
  pickupTimestamp?: string;
  completionTimestamp?: string;
  assignedAgencyId?: string;
  assignedUnitId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  originFacility: Facility;
  destinationFacility: Facility;
}

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
}

export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: string;
  capabilities?: any;
  currentStatus: string;
  currentLocation?: any;
  shiftStart?: string;
  shiftEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityAlert {
  id: string;
  emergencyDepartmentId: string;
  alertType: CapacityAlertType;
  severity: AlertSeverity;
  message: string;
  threshold: number;
  currentValue: number;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
  emergencyDepartment: EmergencyDepartment;
}

export interface ProviderForecast {
  id: string;
  agencyId: string;
  forecastDate: string;
  forecastType: ForecastType;
  predictedDemand: number;
  availableCapacity: number;
  capacityUtilization: number;
  confidence: number;
  factors?: any;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
  agency: TransportAgency;
}

export interface DemandPattern {
  id: string;
  facilityId: string;
  patternType: PatternType;
  dayOfWeek?: number;
  hourOfDay?: number;
  averageDemand: number;
  peakDemand: number;
  seasonalFactor: number;
  trendDirection: TrendDirection;
  confidence: number;
  dataPoints: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  facility: Facility;
}

export interface EDMetrics {
  capacityUtilization: number;
  availableCapacity: number;
  queueWaitTime: number;
  criticalBedUtilization: number;
  hallwayBedPercentage: number;
  transportQueueLength: number;
  isAtCapacity: boolean;
  isOverCapacity: boolean;
}

// Enums
export type BedUpdateType = 
  | 'BED_ADDED'
  | 'BED_REMOVED'
  | 'BED_OCCUPIED'
  | 'BED_VACATED'
  | 'HALLWAY_BED_ADDED'
  | 'HALLWAY_BED_REMOVED'
  | 'CRITICAL_BED_UPDATE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type QueueStatus = 
  | 'WAITING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ESCALATED';

export type CapacityAlertType = 
  | 'BED_CAPACITY'
  | 'HALLWAY_BED_THRESHOLD'
  | 'TRANSPORT_QUEUE_LENGTH'
  | 'WAIT_TIME_THRESHOLD'
  | 'CRITICAL_BED_SHORTAGE';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ForecastType = 
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'SEASONAL'
  | 'EVENT_BASED';

export type PatternType = 
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'SEASONAL'
  | 'EVENT_DRIVEN';

export type TrendDirection = 
  | 'INCREASING'
  | 'DECREASING'
  | 'STABLE'
  | 'CYCLICAL'
  | 'UNKNOWN';

// Form Data Interfaces
export interface EmergencyDepartmentFormData {
  facilityId: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  hallwayBeds: number;
  criticalBeds: number;
  capacityThreshold: number;
  currentCensus: number;
  transportQueueLength: number;
  averageWaitTime: number;
  peakHours?: any;
}

export interface BedStatusUpdateFormData {
  emergencyDepartmentId: string;
  updateType: BedUpdateType;
  bedCount: number;
  updateReason?: string;
  notes?: string;
  updatedBy?: string;
}

export interface TransportQueueFormData {
  emergencyDepartmentId: string;
  transportRequestId: string;
  priority: Priority;
  estimatedWaitTime?: number;
}

export interface ProviderForecastFormData {
  agencyId: string;
  forecastDate: string;
  forecastType: ForecastType;
  predictedDemand: number;
  availableCapacity: number;
  recommendations?: string;
}

export interface DemandPatternFormData {
  facilityId: string;
  patternType: PatternType;
  dayOfWeek?: number;
  hourOfDay?: number;
  averageDemand: number;
  peakDemand: number;
  seasonalFactor: number;
  trendDirection: TrendDirection;
}
