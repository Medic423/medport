import { PrismaClient } from '@prisma/client';

// Types for optimization
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
  // Insurance and pricing fields
  insuranceCompany?: string;
  insurancePayRate?: number;
  perMileRate?: number;
  distanceMiles?: number;
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

export class RevenueOptimizer {
  private weights: OptimizationWeights;
  private databaseManager: any;

  constructor(databaseManager: any, customWeights?: Partial<OptimizationWeights>) {
    this.databaseManager = databaseManager;
    
    // Default weights based on industry standards and reference documents
    this.weights = {
      deadheadMiles: 0.5,      // $0.50 per mile deadhead penalty
      waitTime: 0.1,           // $0.10 per minute wait time penalty
      backhaulBonus: 25.0,     // $25 bonus for backhaul pairs
      overtimeRisk: 2.0,       // $2.00 penalty per hour overtime risk
      baseRevenue: 1.0,        // Base revenue multiplier
      ...customWeights
    };
  }

  /**
   * Calculate optimization score for a unit-request assignment
   * Formula: score(u, r, t_now) = revenue(r) - α*deadhead_miles - β*wait_time + γ*backhaul_bonus - δ*overtime_risk
   */
  calculateScore(unit: Unit, request: TransportRequest, currentTime: Date): number {
    const revenue = this.calculateRevenue(request);
    const deadheadMiles = this.calculateDeadheadMiles(unit, request);
    const waitTime = this.calculateWaitTime(unit, request, currentTime);
    const backhaulBonus = this.calculateBackhaulBonus(unit, request);
    const overtimeRisk = this.calculateOvertimeRisk(unit, request, currentTime);

    const score = revenue 
      - (this.weights.deadheadMiles * deadheadMiles)
      - (this.weights.waitTime * waitTime)
      + (this.weights.backhaulBonus * backhaulBonus)
      - (this.weights.overtimeRisk * overtimeRisk);

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate base revenue for a transport request
   * SIMPLIFIED: Basic revenue calculation for Phase 3
   */
  calculateRevenue(request: TransportRequest): number {
    console.log('TCC_DEBUG: Simplified calculateRevenue called - complex revenue calculations disabled for Phase 3');
    
    // SIMPLIFIED: Basic flat rates without complex calculations
    const baseRates = {
      'BLS': 150.0,
      'ALS': 250.0,
      'CCT': 400.0
    };

    const baseRate = baseRates[request.transportLevel as keyof typeof baseRates] || 150.0;
    
    // SIMPLIFIED: Basic priority multiplier only
    const priorityMultipliers = {
      'LOW': 1.0,
      'MEDIUM': 1.1,
      'HIGH': 1.25,
      'URGENT': 1.5
    };

    const priorityMultiplier = priorityMultipliers[request.priority as keyof typeof priorityMultipliers] || 1.0;

    return baseRate * priorityMultiplier;
  }

  /**
   * Calculate deadhead miles (empty miles) to reach the request
   */
  calculateDeadheadMiles(unit: Unit, request: TransportRequest): number {
    return this.calculateDistance(unit.currentLocation, request.originLocation);
  }

  /**
   * Calculate wait time in minutes
   */
  calculateWaitTime(unit: Unit, request: TransportRequest, currentTime: Date): number {
    const travelTime = this.calculateTravelTime(unit.currentLocation, request.originLocation);
    const arrivalTime = new Date(currentTime.getTime() + (travelTime * 60000));
    
    // If we arrive before ready time, calculate wait
    if (arrivalTime < request.readyStart) {
      return (request.readyStart.getTime() - arrivalTime.getTime()) / 60000;
    }
    
    return 0; // No wait time if arriving after ready time
  }

  /**
   * Calculate backhaul bonus (simplified - will be enhanced by BackhaulDetector)
   */
  calculateBackhaulBonus(unit: Unit, request: TransportRequest): number {
    // This is a simplified version - the full backhaul detection will be in BackhaulDetector
    // For now, return 0 - this will be calculated when we have multiple requests
    return 0;
  }

  /**
   * Calculate overtime risk penalty
   */
  calculateOvertimeRisk(unit: Unit, request: TransportRequest, currentTime: Date): number {
    // If no shift end time is available, assume no overtime risk
    if (!unit.shiftEnd) {
      return 0;
    }
    
    const estimatedTripTime = this.calculateTripTime(request);
    const estimatedCompletionTime = new Date(currentTime.getTime() + (estimatedTripTime * 60000));
    
    // Check if completion would be after shift end
    if (estimatedCompletionTime > unit.shiftEnd) {
      const overtimeHours = (estimatedCompletionTime.getTime() - unit.shiftEnd.getTime()) / (1000 * 60 * 60);
      return overtimeHours;
    }
    
    return 0;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate travel time in minutes (assuming average speed of 30 mph)
   */
  calculateTravelTime(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const distance = this.calculateDistance(point1, point2);
    const averageSpeed = 30; // mph
    return (distance / averageSpeed) * 60; // Convert to minutes
  }

  /**
   * Calculate total trip time including pickup and delivery
   */
  calculateTripTime(request: TransportRequest): number {
    const pickupTime = this.calculateTravelTime(request.originLocation, request.destinationLocation);
    const serviceTime = 15; // 15 minutes for patient loading/unloading
    return pickupTime + serviceTime;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get current optimization weights
   */
  getWeights(): OptimizationWeights {
    return { ...this.weights };
  }

  /**
   * Update optimization weights
   */
  updateWeights(newWeights: Partial<OptimizationWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Validate that a unit can handle a request (capabilities, status, etc.)
   */
  canHandleRequest(unit: Unit, request: TransportRequest): boolean {
    // Check if unit is available
    if (unit.currentStatus !== 'AVAILABLE' && unit.currentStatus !== 'ON_CALL') {
      return false;
    }

    // Check if unit has required capabilities
    const requiredCapabilities = this.getRequiredCapabilities(request.transportLevel);
    const hasCapabilities = requiredCapabilities.every(cap => 
      unit.capabilities.includes(cap)
    );

    if (!hasCapabilities) {
      return false;
    }

    // Check if unit is active
    if (!unit.isActive) {
      return false;
    }

    return true;
  }

  /**
   * Get required capabilities for a transport level
   */
  private getRequiredCapabilities(transportLevel: string): string[] {
    const capabilityMap = {
      'BLS': ['BLS'],
      'ALS': ['BLS', 'ALS'],
      'CCT': ['BLS', 'ALS', 'CCT']
    };

    return capabilityMap[transportLevel as keyof typeof capabilityMap] || ['BLS'];
  }
}
