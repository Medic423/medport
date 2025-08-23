import { PrismaClient } from '@prisma/client';
import { 
  UnitAssignmentRequest, 
  UnitAssignmentResponse, 
  UnitPerformanceMetrics, 
  RevenueAnalysis, 
  AssignmentConflict, 
  ShiftSchedule,
  UnitAvailabilityMatrix,
  AssignmentOptimizationResult
} from '../types/unitAssignment';
import { TransportLevel, UnitStatus, RequestStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

export class UnitAssignmentService {

  /**
   * Assign transport request to optimal unit based on revenue optimization
   */
  async assignTransportToUnit(request: UnitAssignmentRequest): Promise<UnitAssignmentResponse> {
    try {
      console.log('[UNIT_ASSIGNMENT_SERVICE] Assigning transport to unit:', request);

      // Get available units for the transport level
      const availableUnits = await this.getAvailableUnits(request.transportLevel, request.agencyId);
      
      if (availableUnits.length === 0) {
        throw new Error('No available units for the specified transport level');
      }

      // Calculate assignment scores for each unit
      const unitScores = await this.calculateUnitAssignmentScores(
        availableUnits, 
        request.transportRequestId,
        request.assignmentTime
      );

      // Select optimal unit based on highest score
      const optimalUnit = unitScores.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      // Create unit assignment
      const assignment = await this.createUnitAssignment({
        unitId: optimalUnit.unitId,
        transportRequestId: request.transportRequestId,
        assignmentType: 'PRIMARY',
        startTime: request.assignmentTime,
        status: 'ACTIVE',
        assignedBy: request.assignedBy
      });

      // Update unit status
      await this.updateUnitStatus(optimalUnit.unitId, 'IN_USE');

      // Update transport request status
      await this.updateTransportRequestStatus(request.transportRequestId, 'SCHEDULED');

      return {
        success: true,
        assignmentId: assignment.id,
        unitId: optimalUnit.unitId,
        unitNumber: optimalUnit.unitNumber,
        score: optimalUnit.score,
        estimatedRevenue: optimalUnit.estimatedRevenue,
        assignmentTime: assignment.startTime,
        message: `Successfully assigned to ${optimalUnit.unitNumber} with score ${optimalUnit.score.toFixed(2)}`
      };

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error assigning transport to unit:', error);
      throw error;
    }
  }

  /**
   * Get available units for a specific transport level and agency
   */
  async getAvailableUnits(transportLevel: TransportLevel, agencyId?: string): Promise<any[]> {
    const where: any = {
      type: transportLevel,
      currentStatus: UnitStatus.AVAILABLE,
      isActive: true
    };

    if (agencyId) {
      where.agencyId = agencyId;
    }

    return await prisma.unit.findMany({
      where,
      include: {
        agency: true,
        unitAvailability: {
          where: {
            status: UnitStatus.AVAILABLE
          },
          orderBy: {
            lastUpdated: 'desc'
          },
          take: 1
        }
      }
    });
  }

  /**
   * Calculate assignment scores for units based on multiple factors
   */
  private async calculateUnitAssignmentScores(
    units: any[], 
    transportRequestId: string, 
    assignmentTime: Date
  ): Promise<Array<{unitId: string, unitNumber: string, score: number, estimatedRevenue: number}>> {
    
    const transportRequest = await prisma.transportRequest.findUnique({
      where: { id: transportRequestId },
      include: {
        originFacility: true,
        destinationFacility: true
      }
    });

    if (!transportRequest) {
      throw new Error('Transport request not found');
    }

    const scores = [];

    for (const unit of units) {
      let score = 0;
      let estimatedRevenue = 0;

      // Base score from unit capabilities (40%)
      score += 40;

      // Geographic proximity score (25%)
      const proximityScore = await this.calculateProximityScore(unit, transportRequest);
      score += proximityScore * 25;

      // Revenue optimization score (20%)
      const revenueScore = await this.calculateRevenueScore(unit, transportRequest);
      score += revenueScore * 20;
      estimatedRevenue = revenueScore * 100; // Base revenue calculation

      // Time efficiency score (15%)
      const timeScore = await this.calculateTimeEfficiencyScore(unit, transportRequest, assignmentTime);
      score += timeScore * 15;

      scores.push({
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        score: Math.round(score * 100) / 100,
        estimatedRevenue: Math.round(estimatedRevenue * 100) / 100
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate proximity score based on unit location and transport route
   */
  private async calculateProximityScore(unit: any, transportRequest: any): Promise<number> {
    // For demo purposes, return a random score between 0.7 and 1.0
    // In production, this would calculate actual distance from unit location to origin facility
    return 0.7 + Math.random() * 0.3;
  }

  /**
   * Calculate revenue score based on unit efficiency and transport characteristics
   */
  private async calculateRevenueScore(unit: any, transportRequest: any): Promise<number> {
    // Base revenue score based on transport level
    let baseScore = 0.8;
    
    switch (transportRequest.transportLevel) {
      case TransportLevel.CCT:
        baseScore = 1.0;
        break;
      case TransportLevel.ALS:
        baseScore = 0.9;
        break;
      case TransportLevel.BLS:
        baseScore = 0.8;
        break;
    }

    // Add random variation for demo
    return baseScore + (Math.random() * 0.2 - 0.1);
  }

  /**
   * Calculate time efficiency score
   */
  private async calculateTimeEfficiencyScore(unit: any, transportRequest: any, assignmentTime: Date): Promise<number> {
    // Check if unit is within optimal shift time
    const unitAvailability = unit.unitAvailability[0];
    if (unitAvailability) {
      const shiftStart = new Date(unitAvailability.shiftStart);
      const shiftEnd = new Date(unitAvailability.shiftEnd);
      
      if (assignmentTime >= shiftStart && assignmentTime <= shiftEnd) {
        return 1.0; // Optimal timing
      } else if (assignmentTime >= shiftStart && assignmentTime <= new Date(shiftEnd.getTime() + 2 * 60 * 60 * 1000)) {
        return 0.8; // Within 2 hours of shift end
      }
    }
    
    return 0.6; // Default score
  }

  /**
   * Create unit assignment record
   */
  private async createUnitAssignment(assignmentData: any) {
    return await prisma.unitAssignment.create({
      data: {
        unitId: assignmentData.unitId,
        unitAvailabilityId: await this.getUnitAvailabilityId(assignmentData.unitId),
        transportRequestId: assignmentData.transportRequestId,
        assignmentType: assignmentData.assignmentType,
        startTime: assignmentData.startTime,
        status: assignmentData.status,
        assignedBy: assignmentData.assignedBy
      }
    });
  }

  /**
   * Get unit availability ID for assignment
   */
  private async getUnitAvailabilityId(unitId: string): Promise<string> {
    const availability = await prisma.unitAvailability.findFirst({
      where: { unitId },
      orderBy: { lastUpdated: 'desc' }
    });
    
    if (!availability) {
      // Create new availability record if none exists
      const newAvailability = await prisma.unitAvailability.create({
        data: {
          unitId,
          status: UnitStatus.IN_USE,
          lastUpdated: new Date()
        }
      });
      return newAvailability.id;
    }
    
    return availability.id;
  }

  /**
   * Update unit status
   */
  private async updateUnitStatus(unitId: string, status: UnitStatus) {
    await prisma.unit.update({
      where: { id: unitId },
      data: { currentStatus: status }
    });
  }

  /**
   * Update transport request status
   */
  private async updateTransportRequestStatus(transportRequestId: string, status: RequestStatus) {
    await prisma.transportRequest.update({
      where: { id: transportRequestId },
      data: { status }
    });
  }

  /**
   * Get unit performance metrics for revenue analysis
   */
  async getUnitPerformanceMetrics(unitId: string, timeRange: { start: Date, end: Date }): Promise<UnitPerformanceMetrics> {
    try {
      const assignments = await prisma.unitAssignment.findMany({
        where: {
          unitId,
          startTime: { gte: timeRange.start },
          endTime: { lte: timeRange.end },
          status: 'COMPLETED'
        },
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          }
        }
      });

      let totalMiles = 0;
      let totalRevenue = 0;
      let completedTransports = 0;

      for (const assignment of assignments) {
        if (assignment.transportRequest) {
          // Calculate miles (in production, this would use actual distance matrix)
          const miles = this.calculateTransportMiles(assignment.transportRequest);
          totalMiles += miles;
          
          // Calculate revenue based on transport level and distance
          const revenue = this.calculateTransportRevenue(assignment.transportRequest, miles);
          totalRevenue += revenue;
          
          completedTransports++;
        }
      }

      return {
        unitId,
        timeRange,
        totalMiles,
        totalRevenue,
        completedTransports,
        averageMilesPerTransport: completedTransports > 0 ? totalMiles / completedTransports : 0,
        averageRevenuePerTransport: completedTransports > 0 ? totalRevenue / completedTransports : 0,
        revenuePerMile: totalMiles > 0 ? totalRevenue / totalMiles : 0
      };

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting unit performance metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate transport miles (demo implementation)
   */
  private calculateTransportMiles(transportRequest: any): number {
    // In production, this would use the distance matrix
    // For demo, return a realistic range
    return 15 + Math.random() * 35; // 15-50 miles
  }

  /**
   * Calculate transport revenue (demo implementation)
   */
  private calculateTransportRevenue(transportRequest: any, miles: number): number {
    let baseRate = 0;
    
    switch (transportRequest.transportLevel) {
      case TransportLevel.BLS:
        baseRate = 2.50;
        break;
      case TransportLevel.ALS:
        baseRate = 3.75;
        break;
      case TransportLevel.CCT:
        baseRate = 5.00;
        break;
    }
    
    return baseRate * miles;
  }

  /**
   * Detect assignment conflicts
   */
  async detectAssignmentConflicts(unitId: string, startTime: Date, endTime: Date): Promise<AssignmentConflict[]> {
    try {
      const conflicts = await prisma.unitAssignment.findMany({
        where: {
          unitId,
          status: 'ACTIVE',
          OR: [
            {
              startTime: { lte: endTime },
              endTime: { gte: startTime }
            }
          ]
        },
        include: {
          transportRequest: true
        }
      });

      return conflicts.map(conflict => ({
        conflictId: conflict.id,
        conflictingAssignmentId: conflict.id,
        conflictType: 'TIME_OVERLAP',
        severity: 'HIGH',
        description: `Time conflict with existing assignment`,
        conflictingTransportRequest: conflict.transportRequest
      }));

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error detecting conflicts:', error);
      throw error;
    }
  }

  /**
   * Get unit availability matrix for dashboard
   */
  async getUnitAvailabilityMatrix(): Promise<UnitAvailabilityMatrix> {
    try {
      const units = await prisma.unit.findMany({
        where: { isActive: true },
        include: {
          agency: true,
          unitAvailability: {
            orderBy: { lastUpdated: 'desc' },
            take: 1
          },
          unitAssignments: {
            where: {
              status: 'ACTIVE',
              startTime: { lte: new Date() },
              endTime: { gte: new Date() }
            }
          }
        }
      });

      const matrix = {
        totalUnits: units.length,
        availableUnits: 0,
        inUseUnits: 0,
        outOfServiceUnits: 0,
        maintenanceUnits: 0,
        unitsByStatus: {} as Record<string, number>,
        unitsByType: {} as Record<string, number>,
        unitsByAgency: {} as Record<string, number>,
        lastUpdated: new Date()
      };

      for (const unit of units) {
        const status = unit.currentStatus;
        const type = unit.type;
        const agencyName = unit.agency.name;

        // Count by status
        matrix.unitsByStatus[status] = (matrix.unitsByStatus[status] || 0) + 1;
        
        // Count by type
        matrix.unitsByType[type] = (matrix.unitsByType[type] || 0) + 1;
        
        // Count by agency
        matrix.unitsByAgency[agencyName] = (matrix.unitsByAgency[agencyName] || 0) + 1;

        // Update main counts
        switch (status) {
          case UnitStatus.AVAILABLE:
            matrix.availableUnits++;
            break;
          case UnitStatus.IN_USE:
            matrix.inUseUnits++;
            break;
          case UnitStatus.OUT_OF_SERVICE:
            matrix.outOfServiceUnits++;
            break;
          case UnitStatus.MAINTENANCE:
            matrix.maintenanceUnits++;
            break;
        }
      }

      return matrix;

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting unit availability matrix:', error);
      throw error;
    }
  }

  /**
   * Optimize unit assignments for maximum revenue
   */
  async optimizeUnitAssignments(optimizationParams: any): Promise<AssignmentOptimizationResult> {
    try {
      console.log('[UNIT_ASSIGNMENT_SERVICE] Optimizing unit assignments with params:', optimizationParams);

      // Get unassigned transport requests
      const unassignedRequests = await prisma.transportRequest.findMany({
        where: {
          status: RequestStatus.PENDING,
          assignedUnitId: null
        },
        include: {
          originFacility: true,
          destinationFacility: true
        }
      });

      // Get available units
      const availableUnits = await prisma.unit.findMany({
        where: {
          currentStatus: UnitStatus.AVAILABLE,
          isActive: true
        }
      });

      const assignments = [];
      let totalRevenueIncrease = 0;
      let unitsUtilized = 0;

      // Simple greedy algorithm for demo
      for (const request of unassignedRequests) {
        if (availableUnits.length === 0) break;

        // Find best unit for this request
        let bestUnit = null;
        let bestScore = 0;

        for (let i = 0; i < availableUnits.length; i++) {
          const unit = availableUnits[i];
          if (unit.type === request.transportLevel) {
            const score = await this.calculateUnitAssignmentScores([unit], request.id, new Date());
            if (score[0] && score[0].score > bestScore) {
              bestScore = score[0].score;
              bestUnit = { unit, index: i };
            }
          }
        }

        if (bestUnit) {
          // Create assignment
          const assignment = await this.assignTransportToUnit({
            transportRequestId: request.id,
            transportLevel: request.transportLevel,
            assignmentTime: new Date(),
            assignedBy: 'system-optimization'
          });

          assignments.push(assignment);
          totalRevenueIncrease += assignment.estimatedRevenue || 0;
          unitsUtilized++;

          // Remove assigned unit from available list
          availableUnits.splice(bestUnit.index, 1);
        }
      }

      return {
        success: true,
        assignmentsCreated: assignments.length,
        totalRevenueIncrease,
        unitsUtilized,
        assignments,
        message: `Optimization completed: ${assignments.length} assignments created, $${totalRevenueIncrease.toFixed(2)} revenue increase`
      };

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error optimizing unit assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignments with filtering and pagination
   */
  async getAssignments(where: any, skip: number, limit: number): Promise<any[]> {
    try {
      return await prisma.unitAssignment.findMany({
        where,
        include: {
          unit: {
            include: {
              agency: true
            }
          },
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        skip,
        take: limit
      });
    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignment count for pagination
   */
  async getAssignmentCount(where: any): Promise<number> {
    try {
      return await prisma.unitAssignment.count({ where });
    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting assignment count:', error);
      throw error;
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(assignmentId: string, updateData: any): Promise<any> {
    try {
      return await prisma.unitAssignment.update({
        where: { id: assignmentId },
        data: updateData
      });
    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Cancel assignment
   */
  async cancelAssignment(assignmentId: string): Promise<any> {
    try {
      const assignment = await prisma.unitAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: 'CANCELLED',
          endTime: new Date()
        }
      });

      // Update unit status back to available
      await this.updateUnitStatus(assignment.unitId, 'AVAILABLE');

      return assignment;
    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error cancelling assignment:', error);
      throw error;
    }
  }
}

export default new UnitAssignmentService();
