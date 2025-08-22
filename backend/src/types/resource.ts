// Resource Management Types for MedPort Phase 2.4

import { TransportLevel, Priority, RequestStatus } from './transport';
import { UnitStatus } from '@prisma/client';

// CCT Unit Interface with Critical Care Capabilities
export interface CCTUnit {
  id: string;
  unitNumber: string;
  agencyId: string;
  agencyName: string;
  type: TransportLevel.CCT;
  capabilities: CCTCapabilities;
  currentStatus: UnitStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    facilityId?: string;
    facilityName?: string;
  };
  shiftStart: string;
  shiftEnd: string;
  crewMembers: CrewMember[];
  equipment: CCTEquipment[];
  isActive: boolean;
  lastStatusUpdate: string;
  estimatedReturnTime?: string;
  currentTransportRequestId?: string;
}

// CCT Capabilities Interface
export interface CCTCapabilities {
  criticalCareLevel: 'BASIC_CCT' | 'ADVANCED_CCT' | 'SPECIALIZED_CCT';
  ventilatorSupport: boolean;
  cardiacMonitoring: boolean;
  invasiveProcedures: boolean;
  neonatalSupport: boolean;
  pediatricSupport: boolean;
  traumaSupport: boolean;
  specialtyCertifications: string[];
  maxPatientCapacity: number;
}

// Crew Member Interface
export interface CrewMember {
  id: string;
  name: string;
  role: 'PARAMEDIC' | 'RN' | 'RT' | 'MD' | 'EMT';
  certifications: string[];
  experienceYears: number;
  isAvailable: boolean;
  shiftStart: string;
  shiftEnd: string;
  currentLocation?: string;
}

// CCT Equipment Interface
export interface CCTEquipment {
  id: string;
  name: string;
  type: 'VENTILATOR' | 'MONITOR' | 'PUMP' | 'SUCTION' | 'OXYGEN' | 'OTHER';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  lastMaintenance: string;
  nextMaintenance: string;
  isCritical: boolean;
}

// Resource Availability Interface
export interface ResourceAvailability {
  cctUnits: {
    total: number;
    available: number;
    inUse: number;
    outOfService: number;
    maintenance: number;
  };
  crewMembers: {
    total: number;
    available: number;
    inUse: number;
    offDuty: number;
  };
  equipment: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  lastUpdated: string;
}

// Urgent Request Escalation Interface
export interface EscalationRequest {
  id: string;
  transportRequestId: string;
  escalationLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'CRITICAL';
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  autoEscalation: boolean;
  escalationChain: string[];
}

// Resource Allocation Interface
export interface ResourceAllocation {
  id: string;
  transportRequestId: string;
  cctUnitId: string;
  crewMembers: string[];
  equipment: string[];
  allocationTime: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdBy: string;
  lastUpdated: string;
}

// Emergency Transport Priority Queue Interface
export interface PriorityQueueItem {
  id: string;
  transportRequestId: string;
  priority: Priority;
  escalationLevel: EscalationRequest['escalationLevel'];
  waitTime: number; // minutes
  estimatedResponseTime: number; // minutes
  facilityUrgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  patientCondition: 'STABLE' | 'UNSTABLE' | 'CRITICAL' | 'EMERGENCY';
  queuePosition: number;
  addedToQueue: string;
  lastUpdated: string;
}

// Call Volume Analytics Interface
export interface CallVolumeAnalytics {
  period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startTime: string;
  endTime: string;
  totalCalls: number;
  byPriority: Record<Priority, number>;
  byTransportLevel: Record<TransportLevel, number>;
  byFacility: Record<string, number>;
  averageResponseTime: number;
  peakHours: {
    hour: number;
    callCount: number;
  }[];
  capacityUtilization: number;
  escalationRate: number;
}

// Capacity Planning Interface
export interface CapacityPlanning {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  projectedDemand: number;
  availableResources: number;
  capacityGap: number;
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
}

// Unit Status Management Interface
export interface UnitStatusUpdate {
  id: string;
  unitId: string;
  unitNumber: string;
  previousStatus: UnitStatus;
  newStatus: UnitStatus;
  reason: string;
  updatedBy: string;
  updatedAt: string;
  estimatedReturnTime?: string;
  location?: {
    latitude: number;
    longitude: number;
    facilityId?: string;
    facilityName?: string;
  };
  notes?: string;
}

// Resource Utilization Report Interface
export interface ResourceUtilizationReport {
  period: string;
  startDate: string;
  endDate: string;
  cctUnits: {
    totalHours: number;
    activeHours: number;
    utilizationRate: number;
    averageResponseTime: number;
    totalTransports: number;
    revenueGenerated: number;
  };
  crewMembers: {
    totalHours: number;
    activeHours: number;
    utilizationRate: number;
    overtimeHours: number;
    certifications: Record<string, number>;
  };
  equipment: {
    totalHours: number;
    activeHours: number;
    utilizationRate: number;
    maintenanceHours: number;
    downtimeHours: number;
  };
  recommendations: string[];
  generatedAt: string;
}

// Real-time Resource Dashboard Data Interface
export interface ResourceDashboardData {
  availability: ResourceAvailability;
  priorityQueue: PriorityQueueItem[];
  recentEscalations: EscalationRequest[];
  activeAllocations: ResourceAllocation[];
  callVolume: CallVolumeAnalytics;
  capacityPlanning: CapacityPlanning[];
  unitStatusUpdates: UnitStatusUpdate[];
  lastRefresh: string;
}

// API Response Interfaces for Resource Management
export interface ResourceApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface ResourcePaginatedResponse<T> {
  message: string;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Filter Interfaces for Resource Management
export interface CCTUnitFilters {
  status?: UnitStatus;
  agencyId?: string;
  capabilities?: Partial<CCTCapabilities>;
  location?: {
    latitude: number;
    longitude: number;
    radiusMiles: number;
  };
  availableNow?: boolean;
  page?: number;
  limit?: number;
}

export interface EscalationFilters {
  status?: EscalationRequest['status'];
  escalationLevel?: EscalationRequest['escalationLevel'];
  facilityId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
}

export interface ResourceAllocationFilters {
  status?: ResourceAllocation['status'];
  cctUnitId?: string;
  transportRequestId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
}
