import { 
  CCTUnit, 
  ResourceAvailability, 
  EscalationRequest, 
  ResourceAllocation,
  PriorityQueueItem,
  CallVolumeAnalytics,
  CapacityPlanning,
  UnitStatusUpdate,
  ResourceUtilizationReport,
  CCTUnitFilters,
  EscalationFilters,
  ResourceAllocationFilters
} from '../types/resource';
import { Priority, TransportLevel, RequestStatus } from '../types/transport';
import { UnitStatus } from '@prisma/client';
import { databaseManager } from './databaseManager';

export class ResourceManagementService {

  // CCT Unit Management
  async getCCTUnits(filters: CCTUnitFilters = {}): Promise<CCTUnit[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting CCT units with filters:', filters);
      
      const where: any = {
        type: 'CCT',
        isActive: true
      };

      if (filters.status) {
        where.currentStatus = filters.status;
      }

      if (filters.agencyId) {
        where.agencyId = filters.agencyId;
      }

      if (filters.availableNow) {
        where.currentStatus = 'AVAILABLE';
      }

      const emsDB = databaseManager.getEMSDB();
      const units = await emsDB.unit.findMany({
        where,
        take: 50 // Limit for demo
      });

      // Convert to CCTUnit format
      const cctUnits: CCTUnit[] = units.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        agencyId: unit.agencyId,
        agencyName: `Agency ${unit.agencyId}`, // Demo data
        type: TransportLevel.CCT,
        capabilities: {
          criticalCareLevel: 'BASIC_CCT',
          ventilatorSupport: true,
          cardiacMonitoring: true,
          invasiveProcedures: false,
          neonatalSupport: false,
          pediatricSupport: true,
          traumaSupport: true,
          specialtyCertifications: ['ACLS', 'PALS'],
          maxPatientCapacity: 1
        },
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation as any,
        shiftStart: unit.shiftStart?.toISOString() || new Date().toISOString(),
        shiftEnd: unit.shiftEnd?.toISOString() || new Date().toISOString(),
        crewMembers: [], // Demo data
        equipment: [], // Demo data
        isActive: unit.isActive,
        lastStatusUpdate: unit.updatedAt.toISOString(),
        currentTransportRequestId: undefined, // Demo data
        estimatedReturnTime: undefined // Demo data
      }));

      console.log('[RESOURCE_SERVICE] Found CCT units:', cctUnits.length);
      return cctUnits;

    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting CCT units:', error);
      throw new Error('Failed to get CCT units');
    }
  }

  // Resource Availability
  async getResourceAvailability(): Promise<ResourceAvailability> {
    try {
      console.log('[RESOURCE_SERVICE] Getting resource availability');
      
      const emsDB = databaseManager.getEMSDB();
      
      // Get unit counts by status
      const totalUnits = await emsDB.unit.count({
        where: { isActive: true }
      });

      const availableUnits = await emsDB.unit.count({
        where: { 
          isActive: true,
          currentStatus: 'AVAILABLE'
        }
      });

      const busyUnits = await emsDB.unit.count({
        where: { 
          isActive: true,
          currentStatus: 'IN_USE'
        }
      });

      const outOfServiceUnits = await emsDB.unit.count({
        where: { 
          isActive: true,
          currentStatus: 'OUT_OF_SERVICE'
        }
      });

      const availability: ResourceAvailability = {
        cctUnits: {
          total: totalUnits,
          available: availableUnits,
          inUse: busyUnits,
          outOfService: outOfServiceUnits,
          maintenance: 0
        },
        crewMembers: {
          total: 0,
          available: 0,
          inUse: 0,
          offDuty: 0
        },
        equipment: {
          total: 0,
          available: 0,
          inUse: 0,
          maintenance: 0
        },
        lastUpdated: new Date().toISOString()
      };

      console.log('[RESOURCE_SERVICE] Resource availability calculated:', availability);
      return availability;

    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting resource availability:', error);
      throw new Error('Failed to get resource availability');
    }
  }

  // Priority Queue Management
  async getPriorityQueue(): Promise<PriorityQueueItem[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting priority queue');
      
      const hospitalDB = databaseManager.getHospitalDB();
      
      // Get pending transport requests ordered by priority
      const transportRequests = await hospitalDB.transportRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        take: 20 // Limit for demo
      });

      const priorityQueue: PriorityQueueItem[] = transportRequests.map((request, index) => ({
        id: request.id,
        transportRequestId: request.id,
        priority: request.priority as any,
        escalationLevel: 'LEVEL_1',
        waitTime: Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60)), // minutes
        estimatedResponseTime: 15 + Math.random() * 30, // Demo data
        facilityUrgency: 'MEDIUM',
        patientCondition: 'STABLE',
        queuePosition: index + 1,
        addedToQueue: request.createdAt.toISOString(),
        lastUpdated: new Date().toISOString()
      }));

      console.log('[RESOURCE_SERVICE] Priority queue calculated:', priorityQueue.length, 'items');
      return priorityQueue;

    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting priority queue:', error);
      throw new Error('Failed to get priority queue');
    }
  }

  // Analytics and Reporting
  async getCallVolumeAnalytics(period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'): Promise<CallVolumeAnalytics> {
    try {
      console.log('[RESOURCE_SERVICE] Getting call volume analytics for period:', period);
      
      // For demo purposes, return mock analytics
      const analytics: CallVolumeAnalytics = {
        period,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        totalCalls: 47,
        byPriority: {
          [Priority.LOW]: 8,
          [Priority.MEDIUM]: 22,
          [Priority.HIGH]: 12,
          [Priority.URGENT]: 5
        },
        byTransportLevel: {
          [TransportLevel.BLS]: 25,
          [TransportLevel.ALS]: 15,
          [TransportLevel.CCT]: 7,
          [TransportLevel.OTHER]: 5
        },
        byFacility: {
          'UPMC Altoona': 18,
          'Penn Highlands': 12,
          'Mount Nittany': 8,
          'Other': 9
        },
        averageResponseTime: 18.5,
        peakHours: [
          { hour: 8, callCount: 6 },
          { hour: 12, callCount: 8 },
          { hour: 16, callCount: 7 },
          { hour: 20, callCount: 5 }
        ],
        capacityUtilization: 78.5,
        escalationRate: 12.8
      };

      console.log('[RESOURCE_SERVICE] Call volume analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting call volume analytics:', error);
      throw new Error('Failed to get call volume analytics');
    }
  }

  async getCapacityPlanning(): Promise<CapacityPlanning[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting capacity planning data');
      
      // For demo purposes, return mock capacity planning data
      const capacityPlanning: CapacityPlanning[] = [
        {
          id: '1',
          facilityId: 'facility-1',
          facilityName: 'UPMC Altoona',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '08:00-12:00',
          projectedDemand: 92,
          availableResources: 85,
          capacityGap: 7,
          recommendations: ['Add 2 additional units', 'Extend shift coverage'],
          riskLevel: 'MEDIUM',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          facilityId: 'facility-2',
          facilityName: 'Penn Highlands',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '12:00-16:00',
          projectedDemand: 78,
          availableResources: 72,
          capacityGap: 6,
          recommendations: ['Add 1 additional unit'],
          riskLevel: 'LOW',
          lastUpdated: new Date().toISOString()
        }
      ];

      console.log('[RESOURCE_SERVICE] Capacity planning data calculated:', capacityPlanning.length, 'facilities');
      return capacityPlanning;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting capacity planning:', error);
      throw new Error('Failed to get capacity planning data');
    }
  }

  // Unit Status Management
  async updateUnitStatus(unitId: string, status: UnitStatusUpdate): Promise<any> {
    try {
      console.log('[RESOURCE_SERVICE] Updating unit status:', unitId, status);
      
      const emsDB = databaseManager.getEMSDB();
      
      const updatedUnit = await emsDB.unit.update({
        where: { id: unitId },
        data: {
          currentStatus: status.newStatus,
          currentLocation: status.location,
          updatedAt: new Date()
        }
      });

      console.log('[RESOURCE_SERVICE] Unit status updated successfully:', unitId);
      return updatedUnit;

    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  // Resource Utilization Report
  async getResourceUtilizationReport(timeRange: { start: Date; end: Date }): Promise<ResourceUtilizationReport> {
    try {
      console.log('[RESOURCE_SERVICE] Getting resource utilization report');
      
      const emsDB = databaseManager.getEMSDB();
      
      // Get unit utilization data
      const totalUnits = await emsDB.unit.count({
        where: { isActive: true }
      });

      const availableUnits = await emsDB.unit.count({
        where: { 
          isActive: true,
          currentStatus: 'AVAILABLE'
        }
      });

      const busyUnits = await emsDB.unit.count({
        where: { 
          isActive: true,
          currentStatus: 'IN_USE'
        }
      });

      const report: ResourceUtilizationReport = {
        period: 'DAILY',
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString(),
        cctUnits: {
          totalHours: totalUnits * 24,
          activeHours: busyUnits * 24,
          utilizationRate: totalUnits > 0 ? (busyUnits / totalUnits) * 100 : 0,
          averageResponseTime: 18.5,
          totalTransports: busyUnits * 2,
          revenueGenerated: busyUnits * 500
        },
        crewMembers: {
          totalHours: 0,
          activeHours: 0,
          utilizationRate: 0,
          overtimeHours: 0,
          certifications: {}
        },
        equipment: {
          totalHours: 0,
          activeHours: 0,
          utilizationRate: 0,
          maintenanceHours: 0,
          downtimeHours: 0
        },
        recommendations: [
          'Consider adding 2 additional BLS units during peak hours',
          'Optimize unit placement for faster response times'
        ],
        generatedAt: new Date().toISOString()
      };

      console.log('[RESOURCE_SERVICE] Resource utilization report generated');
      return report;

    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting resource utilization report:', error);
      throw new Error('Failed to get resource utilization report');
    }
  }
}

export default ResourceManagementService;