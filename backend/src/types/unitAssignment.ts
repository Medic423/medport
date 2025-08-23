// Unit Assignment Types for MedPort Phase 4.4

import { TransportLevel, UnitStatus, RequestStatus, Priority, AssignmentType, AssignmentStatus } from '@prisma/client';
import { RevenueMetrics } from './revenueTracking';

// Unit Assignment Request Interface
export interface UnitAssignmentRequest {
  transportRequestId: string;
  transportLevel: TransportLevel;
  agencyId?: string;
  assignmentTime: Date;
  assignedBy: string;
  priority?: Priority;
  specialRequirements?: string;
}

// Unit Assignment Response Interface
export interface UnitAssignmentResponse {
  success: boolean;
  assignmentId: string;
  unitId: string;
  unitNumber: string;
  score: number;
  estimatedRevenue: number;
  assignmentTime: Date;
  message: string;
  conflicts?: AssignmentConflict[];
}

// Unit Performance Metrics Interface
export interface UnitPerformanceMetrics {
  unitId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  totalMiles: number;
  totalRevenue: number;
  completedTransports: number;
  averageMilesPerTransport: number;
  averageRevenuePerTransport: number;
  revenuePerMile: number;
  utilizationRate?: number;
  efficiencyScore?: number;
}

// Revenue Analysis Interface
export interface RevenueAnalysis {
  currentMetrics: RevenueMetrics;
  optimizationPotential: {
    revenueIncrease: number;
    efficiencyGains: number;
    utilizationImprovement: number;
    costReduction: number;
  };
  recommendations: string[];
  analysisDate: Date;
  confidence: number;
}

// Assignment Conflict Interface
export interface AssignmentConflict {
  conflictId: string;
  conflictingAssignmentId: string;
  conflictType: 'TIME_OVERLAP' | 'RESOURCE_CONFLICT' | 'CAPABILITY_MISMATCH' | 'GEOGRAPHIC_CONSTRAINT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  conflictingTransportRequest?: any;
  resolution?: string;
  resolvedAt?: Date;
}

// Shift Schedule Interface
export interface ShiftSchedule {
  unitId: string;
  shiftStart: Date;
  shiftEnd: Date;
  crewMembers: CrewMember[];
  breakTimes: BreakTime[];
  notes?: string;
}

// Crew Member Interface
export interface CrewMember {
  id: string;
  name: string;
  role: 'DRIVER' | 'EMT' | 'PARAMEDIC' | 'RN' | 'RT' | 'MD';
  certifications: string[];
  experienceYears: number;
  shiftStart: Date;
  shiftEnd: Date;
  isAvailable: boolean;
}

// Break Time Interface
export interface BreakTime {
  startTime: Date;
  endTime: Date;
  breakType: 'LUNCH' | 'DINNER' | 'REST' | 'FUEL' | 'MAINTENANCE';
  duration: number; // in minutes
}

// Unit Availability Matrix Interface
export interface UnitAvailabilityMatrix {
  totalUnits: number;
  availableUnits: number;
  inUseUnits: number;
  outOfServiceUnits: number;
  maintenanceUnits: number;
  unitsByStatus: Record<string, number>;
  unitsByType: Record<string, number>;
  unitsByAgency: Record<string, number>;
  lastUpdated: Date;
}

// Assignment Optimization Result Interface
export interface AssignmentOptimizationResult {
  success: boolean;
  assignmentsCreated: number;
  totalRevenueIncrease: number;
  unitsUtilized: number;
  assignments: UnitAssignmentResponse[];
  message: string;
  optimizationMetrics?: {
    efficiencyImprovement: number;
    milesSaved: number;
    timeSaved: number;
    costReduction: number;
  };
}

// Unit Assignment Filters Interface
export interface UnitAssignmentFilters {
  unitId?: string;
  agencyId?: string;
  transportLevel?: TransportLevel;
  status?: AssignmentStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedBy?: string;
}

// Unit Assignment Update Interface
export interface UnitAssignmentUpdate {
  assignmentId: string;
  status?: AssignmentStatus;
  endTime?: Date;
  notes?: string;
  updatedBy: string;
}

// Bulk Assignment Request Interface
export interface BulkAssignmentRequest {
  transportRequestIds: string[];
  assignmentStrategy: 'OPTIMAL' | 'ROUND_ROBIN' | 'PROXIMITY' | 'REVENUE_MAX';
  constraints?: {
    maxUnits?: number;
    maxDistance?: number;
    preferredAgencyId?: string;
    timeWindow?: {
      start: Date;
      end: Date;
    };
  };
  assignedBy: string;
}

// Bulk Assignment Response Interface
export interface BulkAssignmentResponse {
  success: boolean;
  totalRequests: number;
  successfulAssignments: number;
  failedAssignments: number;
  assignments: UnitAssignmentResponse[];
  summary: {
    totalRevenue: number;
    averageScore: number;
    unitsUtilized: number;
  };
  errors?: string[];
}

// Unit Performance Comparison Interface
export interface UnitPerformanceComparison {
  timeRange: {
    start: Date;
    end: Date;
  };
  units: Array<{
    unitId: string;
    unitNumber: string;
    unitType: TransportLevel;
    metrics: UnitPerformanceMetrics;
    ranking: number;
    performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';
  }>;
  benchmarks: {
    topPerformer: string;
    averageRevenue: number;
    averageMiles: number;
    averageUtilization: number;
  };
}

// Assignment Calendar Interface
export interface AssignmentCalendar {
  unitId: string;
  date: Date;
  assignments: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    transportRequestId: string;
    status: AssignmentStatus;
    type: AssignmentType;
    notes?: string;
  }>;
  availability: {
    totalHours: number;
    assignedHours: number;
    availableHours: number;
    utilizationRate: number;
  };
}

// Revenue Optimization Parameters Interface
export interface RevenueOptimizationParams {
  targetRevenuePerMile: number;
  targetTransportsPerPeriod: number;
  maxEmptyMiles: number;
  preferredTransportLevels: TransportLevel[];
  geographicConstraints?: {
    maxDistance: number;
    preferredAreas: string[];
    avoidAreas: string[];
  };
  timeConstraints?: {
    preferredTimeWindows: Array<{
      start: string; // HH:MM format
      end: string; // HH:MM format
      daysOfWeek: number[]; // 0-6, Sunday-Saturday
    }>;
    maxShiftExtension: number; // in hours
  };
}

// Unit Assignment Statistics Interface
export interface UnitAssignmentStatistics {
  totalAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  averageAssignmentDuration: number; // in minutes
  averageResponseTime: number; // in minutes
  assignmentSuccessRate: number; // percentage
  revenuePerAssignment: number;
  milesPerAssignment: number;
  utilizationTrends: Array<{
    period: string;
    utilizationRate: number;
    revenue: number;
    miles: number;
  }>;
}
