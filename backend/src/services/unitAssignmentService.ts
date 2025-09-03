import { databaseManager } from './databaseManager';
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
   * Get all units with optional filtering
   */
  async getAllUnits(where: any = {}): Promise<any[]> {
    try {
      console.log('[UNIT_ASSIGNMENT_SERVICE] Getting all units with filters:', where);
      
      const emsDB = databaseManager.getEMSDB();
      const centerDB = databaseManager.getCenterDB();
      
      const units = await emsDB.unit.findMany({
        where: {
          isActive: true,
          ...where
        },
        include: {
          unitAvailability: {
            orderBy: { lastUpdated: 'desc' },
            take: 1
          }
        }
      });

      // Get agency information for each unit
      const unitsWithAgencies = await Promise.all(
        units.map(async (unit) => {
          const agency = await centerDB.eMSAgency.findUnique({
            where: { id: unit.agencyId },
          });
          
          return {
            id: unit.id,
            unitNumber: unit.unitNumber,
            type: unit.type,
            currentStatus: unit.currentStatus,
            agencyName: agency?.name || 'Unknown Agency',
            currentLocation: unit.currentLocation,
            shiftStart: unit.shiftStart,
            shiftEnd: unit.shiftEnd,
            estimatedRevenue: 0, // Will be calculated based on assignments
            lastStatusUpdate: unit.unitAvailability?.[0]?.lastUpdated || unit.updatedAt
          };
        })
      );

      return unitsWithAgencies;

    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting all units:', error);
      throw error;
    }
  }

  /**
   * Get available units for a specific transport level and agency
   */
  async getAvailableUnits(transportLevel: TransportLevel, agencyId?: string): Promise<any[]> {
    try {
      console.log('[UNIT_ASSIGNMENT_SERVICE] Getting available units for:', { transportLevel, agencyId });
      
      const emsDB = databaseManager.getEMSDB();
      const centerDB = databaseManager.getCenterDB();
      
      const where: any = {
      type: transportLevel,
      isActive: true
    };

    // Handle both enum and string values for status
    where.OR = [
      { currentStatus: UnitStatus.AVAILABLE },
      { currentStatus: 'AVAILABLE' }
    ];

    if (agencyId) {
      where.agencyId = agencyId;
    }

    const units = await emsDB.unit.findMany({
      where,
      include: {
        unitAvailability: {
          orderBy: {
            lastUpdated: 'desc'
          },
          take: 1
        }
      }
    });

    // Get agency information for each unit
    const unitsWithAgencies = await Promise.all(
      units.map(async (unit) => {
        const agency = await centerDB.eMSAgency.findUnique({
          where: { id: unit.agencyId },
        });
        
        return {
          ...unit,
          agency: agency
        };
      })
    );

    console.log(`[UNIT_ASSIGNMENT_SERVICE] Found ${unitsWithAgencies.length} available units for ${transportLevel}`);
    unitsWithAgencies.forEach(unit => {
      console.log(`[UNIT_ASSIGNMENT_SERVICE] Unit: ${unit.unitNumber} (${unit.type}) - Status: ${unit.currentStatus}`);
    });

    return unitsWithAgencies;
    } catch (error) {
      console.error('[UNIT_ASSIGNMENT_SERVICE] Error getting available units:', error);
      return [];
    }
  }

  /**
   * Calculate assignment scores for units based on multiple factors
   */
  private async calculateUnitAssignmentScores(
    units: any[], 
    transportRequestId: string, 
    assignmentTime: Date
  ): Promise<Array<{unitId: string, unitNumber: string, score: number, estimatedRevenue: number}>> {
    
    const hospitalDB = databaseManager.getHospitalDB();
    
    const transportRequest = await hospitalDB.transportRequest.findUnique({
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
    if (unit.unitAvailability && unit.unitAvailability.length > 0) {
      const unitAvailability = unit.unitAvailability[0];
      if (unitAvailability && unitAvailability.shiftStart && unitAvailability.shiftEnd) {
        const shiftStart = new Date(unitAvailability.shiftStart);
        const shiftEnd = new Date(unitAvailability.shiftEnd);
        
        if (assignmentTime >= shiftStart && assignmentTime <= shiftEnd) {
          return 1.0; // Optimal timing
        } else if (assignmentTime >= shiftStart && assignmentTime <= new Date(shiftEnd.getTime() + 2 * 60 * 60 * 1000)) {
          return 0.8; // Within 2 hours of shift end
        }
      }
    }
    
    return 0.6; // Default score
  }

  /**
   * Create unit assignment record
   */
  private async createUnitAssignment(assignmentData: any) {
    const emsDB = databaseManager.getEMSDB();
    
    return await emsDB.unitAssignment.create({
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
    const emsDB = databaseManager.getEMSDB();
    
    const availability = await emsDB.unitAvailability.findFirst({
      where: { unitId },
      orderBy: { lastUpdated: 'desc' }
    });
    
    if (!availability) {
      // Create new availability record if none exists
      const newAvailability = await emsDB.unitAvailability.create({
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
    const emsDB = databaseManager.getEMSDB();
    
    await emsDB.unit.update({
      where: { id: unitId },
      data: { currentStatus: status }
    });
  }

  /**
   * Update transport request status
   */
  private async updateTransportRequestStatus(transportRequestId: string, status: RequestStatus) {
    const hospitalDB = databaseManager.getHospitalDB();
    
    await hospitalDB.transportRequest.update({
      where: { id: transportRequestId },
      data: { status }
    });
  }

  /**
   * Get unit performance metrics for revenue analysis
   */
  async getUnitPerformanceMetrics(unitId: string, timeRange: { start: Date, end: Date }): Promise<UnitPerformanceMetrics> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      const assignments = await emsDB.unitAssignment.findMany({
        where: {
          unitId,
          startTime: { gte: timeRange.start },
          endTime: { lte: timeRange.end },
          status: 'COMPLETED'
        }
      });

      // Get transport request details for each assignment
      const assignmentsWithRequests = await Promise.all(
        assignments.map(async (assignment) => {
          const transportRequest = await hospitalDB.transportRequest.findUnique({
            where: { id: assignment.transportRequestId },
            include: {
              originFacility: true,
              destinationFacility: true
            }
          });
          
          return {
            ...assignment,
            transportRequest
          };
        })
      );

      let totalMiles = 0;
      let totalRevenue = 0;
      let completedTransports = 0;

      for (const assignment of assignmentsWithRequests) {
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
      const emsDB = databaseManager.getEMSDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      const conflicts = await emsDB.unitAssignment.findMany({
        where: {
          unitId,
          status: 'ACTIVE',
          OR: [
            {
              startTime: { lte: endTime },
              endTime: { gte: startTime }
            }
          ]
        }
      });

      // Get transport request details for each conflict
      const conflictsWithRequests = await Promise.all(
        conflicts.map(async (conflict) => {
          const transportRequest = await hospitalDB.transportRequest.findUnique({
            where: { id: conflict.transportRequestId },
          });
          
          return {
            ...conflict,
            transportRequest
          };
        })
      );

      return conflictsWithRequests.map(conflict => ({
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
      const emsDB = databaseManager.getEMSDB();
      const centerDB = databaseManager.getCenterDB();
      
      const units = await emsDB.unit.findMany({
        where: { isActive: true },
        include: {
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

      // Get agency information for each unit
      const unitsWithAgencies = await Promise.all(
        units.map(async (unit) => {
          const agency = await centerDB.eMSAgency.findUnique({
            where: { id: unit.agencyId },
          });
          
          return {
            ...unit,
            agency: agency
          };
        })
      );

      const matrix = {
        totalUnits: unitsWithAgencies.length,
        availableUnits: 0,
        inUseUnits: 0,
        outOfServiceUnits: 0,
        maintenanceUnits: 0,
        unitsByStatus: {} as Record<string, number>,
        unitsByType: {} as Record<string, number>,
        unitsByAgency: {} as Record<string, number>,
        lastUpdated: new Date()
      };

      for (const unit of unitsWithAgencies) {
        const status = unit.currentStatus;
        const type = unit.type;
        const agencyName = unit.agency?.name || 'Unknown Agency';

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
      const hospitalDB = databaseManager.getHospitalDB();
      
      const unassignedRequests = await hospitalDB.transportRequest.findMany({
        where: {
          status: RequestStatus.PENDING,
          assignedUnitId: null
        },
        include: {
          originFacility: true,
          destinationFacility: true
        }
      });

      console.log(`[UNIT_ASSIGNMENT_SERVICE] Found ${unassignedRequests.length} unassigned requests`);
      
      if (unassignedRequests.length === 0) {
        console.log('[UNIT_ASSIGNMENT_SERVICE] No unassigned requests found');
        return {
          success: true,
          assignmentsCreated: 0,
          totalRevenueIncrease: 0,
          unitsUtilized: 0,
          assignments: [],
          message: 'No unassigned transport requests to optimize'
        };
      }

      unassignedRequests.forEach(req => {
        console.log(`[UNIT_ASSIGNMENT_SERVICE] Request ${req.id}: ${req.transportLevel} from ${req.originFacility?.name} to ${req.destinationFacility?.name}`);
      });

      // Get available units for each transport level
      const availableUnitsByLevel = new Map();
      for (const request of unassignedRequests) {
        const units = await this.getAvailableUnits(request.transportLevel);
        availableUnitsByLevel.set(request.transportLevel, units);
        console.log(`[UNIT_ASSIGNMENT_SERVICE] Found ${units.length} available units for ${request.transportLevel}`);
      }

      const assignments = [];
      let totalRevenueIncrease = 0;
      let unitsUtilized = 0;

      // Simple greedy algorithm for demo
      for (const request of unassignedRequests) {
        const availableUnits = availableUnitsByLevel.get(request.transportLevel) || [];
        
        if (availableUnits.length === 0) {
          console.log(`[UNIT_ASSIGNMENT_SERVICE] No available units for ${request.transportLevel} transport level`);
          continue;
        }

        // Find best unit for this request
        let bestUnit = null;
        let bestScore = 0;

        for (let i = 0; i < availableUnits.length; i++) {
          const unit = availableUnits[i];
          // Compare transport levels, handling both string and enum values
          if (unit.type === request.transportLevel || 
              unit.type.toString() === request.transportLevel.toString()) {
            try {
              const score = await this.calculateUnitAssignmentScores([unit], request.id, new Date());
              if (score && score.length > 0 && score[0].score > bestScore) {
                bestScore = score[0].score;
                bestUnit = { unit, index: i };
              }
            } catch (error) {
              console.log(`[UNIT_ASSIGNMENT_SERVICE] Error calculating score for unit ${unit.id}:`, error);
              continue;
            }
          }
        }

        if (bestUnit) {
          try {
            console.log(`[UNIT_ASSIGNMENT_SERVICE] Creating assignment for request ${request.id} to unit ${bestUnit.unit.unitNumber}`);
            
            // Create assignment directly
            const assignment = await this.createUnitAssignment({
              unitId: bestUnit.unit.id,
              transportRequestId: request.id,
              assignmentType: 'PRIMARY',
              startTime: new Date(),
              status: 'ACTIVE',
              assignedBy: 'cmeo6eojr0002ccpwrin40zz7' // Use existing agency user ID
            });

            // Update unit status
            await this.updateUnitStatus(bestUnit.unit.id, 'IN_USE');

            // Update transport request status and assign unit
            await this.updateTransportRequestStatus(request.id, 'SCHEDULED');
            await hospitalDB.transportRequest.update({
              where: { id: request.id },
              data: { assignedUnitId: bestUnit.unit.id }
            });

            assignments.push({
              success: true,
              assignmentId: assignment.id,
              unitId: bestUnit.unit.id,
              unitNumber: bestUnit.unit.unitNumber,
              score: bestScore,
              estimatedRevenue: bestScore * 100, // Simple revenue calculation
              assignmentTime: assignment.startTime,
              message: `Successfully assigned to ${bestUnit.unit.unitNumber} with score ${bestScore.toFixed(2)}`
            });

            totalRevenueIncrease += bestScore * 100;
            unitsUtilized++;

            // Remove assigned unit from available list
            availableUnits.splice(bestUnit.index, 1);
            console.log(`[UNIT_ASSIGNMENT_SERVICE] Successfully assigned request ${request.id} to unit ${bestUnit.unit.unitNumber}`);
          } catch (error) {
            console.log(`[UNIT_ASSIGNMENT_SERVICE] Error creating assignment for unit ${bestUnit.unit.id}:`, error);
            continue;
          }
        } else {
          console.log(`[UNIT_ASSIGNMENT_SERVICE] No suitable unit found for request ${request.id} (${request.transportLevel})`);
        }
      }

      console.log(`[UNIT_ASSIGNMENT_SERVICE] Optimization completed: ${assignments.length} assignments created`);
      
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
      const emsDB = databaseManager.getEMSDB();
      const centerDB = databaseManager.getCenterDB();
      const hospitalDB = databaseManager.getHospitalDB();
      
      const assignments = await emsDB.unitAssignment.findMany({
        where,
        include: {
          unit: true
        },
        orderBy: {
          startTime: 'desc'
        },
        skip,
        take: limit
      });

      // Get agency and transport request details for each assignment
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const agency = await centerDB.eMSAgency.findUnique({
            where: { id: assignment.unit.agencyId },
          });
          
          const transportRequest = await hospitalDB.transportRequest.findUnique({
            where: { id: assignment.transportRequestId },
            include: {
              originFacility: true,
              destinationFacility: true
            }
          });
          
          return {
            ...assignment,
            unit: {
              ...assignment.unit,
              agency: agency
            },
            transportRequest
          };
        })
      );

      return assignmentsWithDetails;
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
      const emsDB = databaseManager.getEMSDB();
      
      return await emsDB.unitAssignment.count({ where });
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
      const emsDB = databaseManager.getEMSDB();
      
      return await emsDB.unitAssignment.update({
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
      const emsDB = databaseManager.getEMSDB();
      
      const assignment = await emsDB.unitAssignment.update({
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
