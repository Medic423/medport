// Optimization Types for TCC Route Optimization System

export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: string;
  capabilities: string[];
  currentStatus: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  shiftStart: Date;
  shiftEnd: Date;
  isActive: boolean;
}

export interface TransportRequest {
  id: string;
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: string; // BLS, ALS, CCT
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  status: string;
  specialRequirements: string;
  requestTimestamp: Date;
  readyStart: Date;
  readyEnd: Date;
  originLocation: {
    lat: number;
    lng: number;
  };
  destinationLocation: {
    lat: number;
    lng: number;
  };
}

export interface BackhaulPair {
  request1: TransportRequest;
  request2: TransportRequest;
  distance: number;
  timeWindow: number; // minutes
  revenueBonus: number;
  efficiency: number;
}

export interface OptimizationResult {
  unitId: string;
  assignedRequests: TransportRequest[];
  totalRevenue: number;
  totalDeadheadMiles: number;
  totalWaitTime: number;
  backhaulPairs: BackhaulPair[];
  efficiency: number;
  score: number;
}

export interface OptimizationWeights {
  deadheadMiles: number;    // α - penalty per mile of deadhead
  waitTime: number;         // β - penalty per minute of wait time
  backhaulBonus: number;    // γ - bonus for backhaul pairs
  overtimeRisk: number;     // δ - penalty for overtime risk
  baseRevenue: number;      // base revenue multiplier
}

export interface OptimizationRequest {
  unitId: string;
  requestIds: string[];
  constraints?: {
    maxDeadheadMiles?: number;
    maxWaitTime?: number;
    maxOvertimeHours?: number;
  };
  weights?: Partial<OptimizationWeights>;
}

export interface OptimizationResponse {
  success: boolean;
  data?: {
    unitId: string;
    optimizedRequests: Array<{
      requestId: string;
      score: number;
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      overtimeRisk: number;
      canHandle: boolean;
    }>;
    backhaulPairs: BackhaulPair[];
    totalRevenue: number;
    totalDeadheadMiles: number;
    totalWaitTime: number;
    averageScore: number;
  };
  error?: string;
}

export interface BackhaulAnalysisResponse {
  success: boolean;
  data?: {
    pairs: BackhaulPair[];
    statistics: {
      totalRequests: number;
      possiblePairs: number;
      validPairs: number;
      averageEfficiency: number;
      potentialRevenueIncrease: number;
    };
    recommendations: Array<{
      pairId: string;
      efficiency: number;
      distance: number;
      timeWindow: number;
      revenueBonus: number;
      potentialRevenue: number;
    }>;
  };
  error?: string;
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data?: {
    timeframe: string;
    totalRevenue: number;
    loadedMileRatio: number;
    revenuePerHour: number;
    totalTrips: number;
    averageRevenuePerTrip: number;
    totalMiles: number;
    loadedMiles: number;
  };
  error?: string;
}

export interface PerformanceMetricsResponse {
  success: boolean;
  data?: {
    timeframe: string;
    totalTrips: number;
    completedTrips: number;
    averageResponseTime: number;
    averageTripTime: number;
    totalRevenue: number;
    efficiency: number;
    customerSatisfaction: number;
  };
  error?: string;
}

export interface OptimizationSettings {
  weights: OptimizationWeights;
  constraints: {
    maxDeadheadMiles: number;
    maxWaitTime: number;
    maxOvertimeHours: number;
    maxBackhaulDistance: number;
    maxBackhaulTimeWindow: number;
  };
  autoOptimize: boolean;
  refreshInterval: number; // seconds
}

export interface OptimizationMetrics {
  loadedMileRatio: number;
  revenuePerUnitHour: number;
  pairedTripsPercentage: number;
  optimizationResponseTime: number;
  userAdoptionRate: number;
}
