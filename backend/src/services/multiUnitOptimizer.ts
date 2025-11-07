import { Unit, TransportRequest, OptimizationResult, BackhaulPair } from './revenueOptimizer';
import { RevenueOptimizer } from './revenueOptimizer';
import { BackhaulDetector } from './backhaulDetector';

export interface MultiUnitOptimizationResult {
  totalRevenue: number;
  totalDeadheadMiles: number;
  totalWaitTime: number;
  totalEfficiency: number;
  unitAssignments: Array<{
    unitId: string;
    unitNumber: string;
    assignedRequests: TransportRequest[];
    revenue: number;
    deadheadMiles: number;
    waitTime: number;
    efficiency: number;
    score: number;
  }>;
  backhaulPairs: BackhaulPair[];
  globalOptimization: {
    loadedMileRatio: number;
    revenuePerUnitHour: number;
    pairedTripsPercentage: number;
    averageResponseTime: number;
  };
}

export interface MultiUnitConstraints {
  maxUnitsPerRequest: number;
  maxRequestsPerUnit: number;
  maxTotalDeadheadMiles: number;
  maxTotalWaitTime: number;
  requireBackhaulOptimization: boolean;
  minEfficiencyThreshold: number;
}

export class MultiUnitOptimizer {
  private revenueOptimizer: RevenueOptimizer;
  private backhaulDetector: BackhaulDetector;
  private constraints: MultiUnitConstraints;

  constructor(
    revenueOptimizer: RevenueOptimizer,
    backhaulDetector: BackhaulDetector,
    constraints?: Partial<MultiUnitConstraints>
  ) {
    this.revenueOptimizer = revenueOptimizer;
    this.backhaulDetector = backhaulDetector;
    
    this.constraints = {
      maxUnitsPerRequest: 1,
      maxRequestsPerUnit: 5,
      maxTotalDeadheadMiles: 100,
      maxTotalWaitTime: 300,
      requireBackhaulOptimization: true,
      minEfficiencyThreshold: 0.7,
      ...constraints
    };
  }

  /**
   * Optimize assignments across multiple units
   */
  async optimizeMultiUnit(
    units: Unit[],
    requests: TransportRequest[],
    currentTime: Date = new Date()
  ): Promise<MultiUnitOptimizationResult> {
    // Filter available units
    const availableUnits = units.filter(unit => 
      unit.isActive && 
      (unit.currentStatus === 'AVAILABLE' || unit.currentStatus === 'ON_CALL')
    );

    if (availableUnits.length === 0) {
      throw new Error('No available units for optimization');
    }

    // Filter pending requests
    const pendingRequests = requests.filter(req => req.status === 'PENDING');

    if (pendingRequests.length === 0) {
      throw new Error('No pending requests for optimization');
    }

    // Find backhaul opportunities
    const backhaulPairs = this.backhaulDetector.findPairs(pendingRequests);
    
    // Create optimization matrix
    const optimizationMatrix = this.createOptimizationMatrix(
      availableUnits, 
      pendingRequests, 
      currentTime
    );

    // Apply backhaul optimization if enabled
    let optimizedAssignments: Array<{
      unitId: string;
      assignedRequests: TransportRequest[];
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      efficiency: number;
      score: number;
    }> = [];

    if (this.constraints.requireBackhaulOptimization && backhaulPairs.length > 0) {
      optimizedAssignments = this.optimizeWithBackhaul(
        optimizationMatrix,
        backhaulPairs,
        availableUnits,
        pendingRequests
      );
    } else {
      optimizedAssignments = this.optimizeWithoutBackhaul(
        optimizationMatrix,
        availableUnits,
        pendingRequests
      );
    }

    // Calculate global metrics
    const totalRevenue = optimizedAssignments.reduce((sum, assignment) => sum + assignment.revenue, 0);
    const totalDeadheadMiles = optimizedAssignments.reduce((sum, assignment) => sum + assignment.deadheadMiles, 0);
    const totalWaitTime = optimizedAssignments.reduce((sum, assignment) => sum + assignment.waitTime, 0);
    const totalEfficiency = optimizedAssignments.length > 0 
      ? optimizedAssignments.reduce((sum, assignment) => sum + assignment.efficiency, 0) / optimizedAssignments.length 
      : 0;

    // Calculate global optimization metrics
    const totalMiles = totalDeadheadMiles + this.calculateLoadedMiles(optimizedAssignments);
    const loadedMileRatio = totalMiles > 0 ? (totalMiles - totalDeadheadMiles) / totalMiles : 0;
    const totalHours = this.calculateTotalHours(optimizedAssignments);
    const revenuePerUnitHour = totalHours > 0 ? totalRevenue / totalHours : 0;
    const pairedTripsPercentage = this.calculatePairedTripsPercentage(optimizedAssignments, backhaulPairs);
    const averageResponseTime = this.calculateAverageResponseTime(optimizedAssignments, currentTime);

    return {
      totalRevenue,
      totalDeadheadMiles,
      totalWaitTime,
      totalEfficiency,
      unitAssignments: optimizedAssignments.map(assignment => ({
        ...assignment,
        unitNumber: availableUnits.find(unit => unit.id === assignment.unitId)?.unitNumber || 'Unknown'
      })),
      backhaulPairs: backhaulPairs.slice(0, 10), // Top 10 pairs
      globalOptimization: {
        loadedMileRatio,
        revenuePerUnitHour,
        pairedTripsPercentage,
        averageResponseTime
      }
    };
  }

  /**
   * Create optimization matrix for all unit-request combinations
   */
  private createOptimizationMatrix(
    units: Unit[],
    requests: TransportRequest[],
    currentTime: Date
  ): Array<{
    unitId: string;
    requestId: string;
    score: number;
    revenue: number;
    deadheadMiles: number;
    waitTime: number;
    overtimeRisk: number;
    canHandle: boolean;
  }> {
    const matrix: Array<{
      unitId: string;
      requestId: string;
      score: number;
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      overtimeRisk: number;
      canHandle: boolean;
    }> = [];

    for (const unit of units) {
      for (const request of requests) {
        const canHandle = this.revenueOptimizer.canHandleRequest(unit, request);
        const score = canHandle ? this.revenueOptimizer.calculateScore(unit, request, currentTime) : 0;
        const revenue = this.revenueOptimizer.calculateRevenue(request);
        const deadheadMiles = this.revenueOptimizer.calculateDeadheadMiles(unit, request);
        const waitTime = this.revenueOptimizer.calculateWaitTime(unit, request, currentTime);
        const overtimeRisk = this.revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);

        matrix.push({
          unitId: unit.id,
          requestId: request.id,
          score,
          revenue,
          deadheadMiles,
          waitTime,
          overtimeRisk,
          canHandle
        });
      }
    }

    return matrix.sort((a, b) => b.score - a.score);
  }

  /**
   * Optimize with backhaul consideration
   */
  private optimizeWithBackhaul(
    matrix: Array<{
      unitId: string;
      requestId: string;
      score: number;
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      overtimeRisk: number;
      canHandle: boolean;
    }>,
    backhaulPairs: BackhaulPair[],
    units: Unit[],
    requests: TransportRequest[]
  ): Array<{
    unitId: string;
    assignedRequests: TransportRequest[];
    revenue: number;
    deadheadMiles: number;
    waitTime: number;
    efficiency: number;
    score: number;
  }> {
    const assignments: Array<{
      unitId: string;
      assignedRequests: TransportRequest[];
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      efficiency: number;
      score: number;
    }> = [];

    const assignedRequests = new Set<string>();
    const unitAssignments = new Map<string, TransportRequest[]>();

    // Initialize unit assignments
    for (const unit of units) {
      unitAssignments.set(unit.id, []);
    }

    // Process backhaul pairs first (highest priority)
    for (const pair of backhaulPairs) {
      if (assignedRequests.has(pair.request1.id) || assignedRequests.has(pair.request2.id)) {
        continue; // Skip if either request is already assigned
      }

      // Find best unit for this pair
      let bestUnitId = '';
      let bestScore = -Infinity;

      for (const unit of units) {
        const currentAssignments = unitAssignments.get(unit.id) || [];
        if (currentAssignments.length >= this.constraints.maxRequestsPerUnit) {
          continue; // Unit is at capacity
        }

        // Calculate combined score for both requests
        const request1Score = matrix.find(m => m.unitId === unit.id && m.requestId === pair.request1.id);
        const request2Score = matrix.find(m => m.unitId === unit.id && m.requestId === pair.request2.id);

        if (request1Score?.canHandle && request2Score?.canHandle) {
          const combinedScore = request1Score.score + request2Score.score + pair.revenueBonus;
          if (combinedScore > bestScore) {
            bestScore = combinedScore;
            bestUnitId = unit.id;
          }
        }
      }

      if (bestUnitId) {
        const unitAssignmentsList = unitAssignments.get(bestUnitId) || [];
        unitAssignmentsList.push(pair.request1, pair.request2);
        unitAssignments.set(bestUnitId, unitAssignmentsList);
        assignedRequests.add(pair.request1.id);
        assignedRequests.add(pair.request2.id);
      }
    }

    // Process remaining individual requests
    for (const entry of matrix) {
      if (assignedRequests.has(entry.requestId) || !entry.canHandle) {
        continue;
      }

      const currentAssignments = unitAssignments.get(entry.unitId) || [];
      if (currentAssignments.length >= this.constraints.maxRequestsPerUnit) {
        continue; // Unit is at capacity
      }

      const request = requests.find(req => req.id === entry.requestId);
      if (request) {
        currentAssignments.push(request);
        unitAssignments.set(entry.unitId, currentAssignments);
        assignedRequests.add(entry.requestId);
      }
    }

    // Convert to result format
    for (const [unitId, assignedRequestsList] of unitAssignments) {
      if (assignedRequestsList.length > 0) {
        const revenue = assignedRequestsList.reduce((sum, req) => 
          sum + this.revenueOptimizer.calculateRevenue(req), 0
        );
        const deadheadMiles = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateDeadheadMiles(unit, req) : sum;
        }, 0);
        const waitTime = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateWaitTime(unit, req, new Date()) : sum;
        }, 0);
        const efficiency = this.calculateAssignmentEfficiency(assignedRequestsList, deadheadMiles, waitTime);
        const score = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateScore(unit, req, new Date()) : sum;
        }, 0);

        assignments.push({
          unitId,
          assignedRequests: assignedRequestsList,
          revenue,
          deadheadMiles,
          waitTime,
          efficiency,
          score
        });
      }
    }

    return assignments;
  }

  /**
   * Optimize without backhaul consideration
   */
  private optimizeWithoutBackhaul(
    matrix: Array<{
      unitId: string;
      requestId: string;
      score: number;
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      overtimeRisk: number;
      canHandle: boolean;
    }>,
    units: Unit[],
    requests: TransportRequest[]
  ): Array<{
    unitId: string;
    assignedRequests: TransportRequest[];
    revenue: number;
    deadheadMiles: number;
    waitTime: number;
    efficiency: number;
    score: number;
  }> {
    const assignments: Array<{
      unitId: string;
      assignedRequests: TransportRequest[];
      revenue: number;
      deadheadMiles: number;
      waitTime: number;
      efficiency: number;
      score: number;
    }> = [];

    const assignedRequests = new Set<string>();
    const unitAssignments = new Map<string, TransportRequest[]>();

    // Initialize unit assignments
    for (const unit of units) {
      unitAssignments.set(unit.id, []);
    }

    // Assign requests to units based on highest scores
    for (const entry of matrix) {
      if (assignedRequests.has(entry.requestId) || !entry.canHandle) {
        continue;
      }

      const currentAssignments = unitAssignments.get(entry.unitId) || [];
      if (currentAssignments.length >= this.constraints.maxRequestsPerUnit) {
        continue; // Unit is at capacity
      }

      const request = requests.find(req => req.id === entry.requestId);
      if (request) {
        currentAssignments.push(request);
        unitAssignments.set(entry.unitId, currentAssignments);
        assignedRequests.add(entry.requestId);
      }
    }

    // Convert to result format
    for (const [unitId, assignedRequestsList] of unitAssignments) {
      if (assignedRequestsList.length > 0) {
        const revenue = assignedRequestsList.reduce((sum, req) => 
          sum + this.revenueOptimizer.calculateRevenue(req), 0
        );
        const deadheadMiles = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateDeadheadMiles(unit, req) : sum;
        }, 0);
        const waitTime = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateWaitTime(unit, req, new Date()) : sum;
        }, 0);
        const efficiency = this.calculateAssignmentEfficiency(assignedRequestsList, deadheadMiles, waitTime);
        const score = assignedRequestsList.reduce((sum, req) => {
          const unit = units.find(u => u.id === unitId);
          return unit ? sum + this.revenueOptimizer.calculateScore(unit, req, new Date()) : sum;
        }, 0);

        assignments.push({
          unitId,
          assignedRequests: assignedRequestsList,
          revenue,
          deadheadMiles,
          waitTime,
          efficiency,
          score
        });
      }
    }

    return assignments;
  }

  /**
   * Calculate assignment efficiency
   */
  private calculateAssignmentEfficiency(
    requests: TransportRequest[],
    deadheadMiles: number,
    waitTime: number
  ): number {
    if (requests.length === 0) return 0;

    const totalRevenue = requests.reduce((sum, req) => 
      sum + this.revenueOptimizer.calculateRevenue(req), 0
    );
    const totalMiles = deadheadMiles + this.calculateLoadedMilesForRequests(requests);
    const loadedMileRatio = totalMiles > 0 ? (totalMiles - deadheadMiles) / totalMiles : 0;
    const waitTimePenalty = Math.max(0, 1 - (waitTime / 120)); // Penalty for wait time > 2 hours
    const revenueEfficiency = totalRevenue / (requests.length * 200); // Normalize by expected revenue

    return (loadedMileRatio * 0.4 + waitTimePenalty * 0.3 + revenueEfficiency * 0.3);
  }

  /**
   * Calculate loaded miles for requests
   */
  private calculateLoadedMilesForRequests(requests: TransportRequest[]): number {
    return requests.reduce((sum, req) => {
      return sum + this.revenueOptimizer.calculateDistance(
        req.originLocation,
        req.destinationLocation
      );
    }, 0);
  }

  /**
   * Calculate loaded miles for assignments
   */
  private calculateLoadedMiles(assignments: Array<{
    assignedRequests: TransportRequest[];
  }>): number {
    return assignments.reduce((sum, assignment) => {
      return sum + this.calculateLoadedMilesForRequests(assignment.assignedRequests);
    }, 0);
  }

  /**
   * Calculate total hours for assignments
   */
  private calculateTotalHours(assignments: Array<{
    assignedRequests: TransportRequest[];
  }>): number {
    return assignments.reduce((sum, assignment) => {
      return sum + assignment.assignedRequests.length * 1.5; // Assume 1.5 hours per request
    }, 0);
  }

  /**
   * Calculate paired trips percentage
   */
  private calculatePairedTripsPercentage(
    assignments: Array<{ assignedRequests: TransportRequest[] }>,
    backhaulPairs: BackhaulPair[]
  ): number {
    const totalRequests = assignments.reduce((sum, assignment) => 
      sum + assignment.assignedRequests.length, 0
    );
    
    if (totalRequests === 0) return 0;

    const pairedRequests = backhaulPairs.length * 2; // Each pair has 2 requests
    return (pairedRequests / totalRequests) * 100;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(
    assignments: Array<{ assignedRequests: TransportRequest[] }>,
    currentTime: Date
  ): number {
    let totalResponseTime = 0;
    let requestCount = 0;

    for (const assignment of assignments) {
      for (const request of assignment.assignedRequests) {
        const responseTime = (currentTime.getTime() - request.requestTimestamp.getTime()) / (1000 * 60); // minutes
        totalResponseTime += responseTime;
        requestCount++;
      }
    }

    return requestCount > 0 ? totalResponseTime / requestCount : 0;
  }

  /**
   * Update constraints
   */
  updateConstraints(newConstraints: Partial<MultiUnitConstraints>): void {
    this.constraints = { ...this.constraints, ...newConstraints };
  }

  /**
   * Get current constraints
   */
  getConstraints(): MultiUnitConstraints {
    return { ...this.constraints };
  }
}
