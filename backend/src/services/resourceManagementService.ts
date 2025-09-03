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
        type: TransportLevel.CCT,
        isActive: true
      };

      if (filters.status) {
        where.currentStatus = filters.status;
      }

      if (filters.agencyId) {
        where.agencyId = filters.agencyId;
      }

      if (filters.availableNow) {
        where.currentStatus = UnitStatus.AVAILABLE;
      }

      const emsDB = databaseManager.getEMSDB();
      const units = await emsDB.unit.findMany({
        where,
        include: {
          agency: true,
          transportRequests: {
            where: {
              status: {
                in: [RequestStatus.PENDING, RequestStatus.SCHEDULED, RequestStatus.IN_TRANSIT]
              }
            },
            take: 1
          }
        },
        orderBy: {
          currentStatus: 'asc'
        }
      });

      // Transform to CCTUnit interface with mock capabilities for demo
      const cctUnits: CCTUnit[] = units.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        agencyId: unit.agencyId,
        agencyName: unit.agency.name,
        type: TransportLevel.CCT,
        capabilities: {
          criticalCareLevel: 'ADVANCED_CCT',
          ventilatorSupport: true,
          cardiacMonitoring: true,
          invasiveProcedures: true,
          neonatalSupport: false,
          pediatricSupport: true,
          traumaSupport: true,
          specialtyCertifications: ['ACLS', 'PALS', 'ITLS'],
          maxPatientCapacity: 1
        },
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation as any,
        shiftStart: unit.shiftStart?.toISOString() || new Date().toISOString(),
        shiftEnd: unit.shiftEnd?.toISOString() || new Date().toISOString(),
        crewMembers: [
          {
            id: 'crew-1',
            name: 'John Smith',
            role: 'PARAMEDIC',
            certifications: ['ACLS', 'PALS', 'ITLS'],
            experienceYears: 8,
            isAvailable: true,
            shiftStart: unit.shiftStart?.toISOString() || new Date().toISOString(),
            shiftEnd: unit.shiftEnd?.toISOString() || new Date().toISOString()
          },
          {
            id: 'crew-2',
            name: 'Sarah Johnson',
            role: 'RN',
            certifications: ['CCRN', 'ACLS', 'PALS'],
            experienceYears: 12,
            isAvailable: true,
            shiftStart: unit.shiftStart?.toISOString() || new Date().toISOString(),
            shiftEnd: unit.shiftEnd?.toISOString() || new Date().toISOString()
          }
        ],
        equipment: [
          {
            id: 'equip-1',
            name: 'Ventilator',
            type: 'VENTILATOR',
            status: 'AVAILABLE',
            lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isCritical: true
          },
          {
            id: 'equip-2',
            name: 'Cardiac Monitor',
            type: 'MONITOR',
            status: 'AVAILABLE',
            lastMaintenance: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            isCritical: true
          }
        ],
        isActive: unit.isActive,
        lastStatusUpdate: unit.updatedAt.toISOString(),
        currentTransportRequestId: unit.transportRequests[0]?.id,
        estimatedReturnTime: unit.currentStatus === UnitStatus.IN_USE ? 
          new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : undefined
      }));

      console.log(`[RESOURCE_SERVICE] Found ${cctUnits.length} CCT units`);
      return cctUnits;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting CCT units:', error);
      throw new Error('Failed to get CCT units');
    }
  }

  async getResourceAvailability(): Promise<ResourceAvailability> {
    try {
      console.log('[RESOURCE_SERVICE] Getting resource availability');
      
      const emsDB = databaseManager.getEMSDB();
      const [cctUnits, crewMembers, equipment] = await Promise.all([
        emsDB.unit.count({
          where: {
            type: TransportLevel.CCT,
            isActive: true
          }
        }),
        emsDB.unit.count({
          where: {
            type: TransportLevel.CCT,
            isActive: true
          }
        }),
        emsDB.unit.count({
          where: {
            type: TransportLevel.CCT,
            isActive: true
          }
        })
      ]);

      const availableUnits = await emsDB.unit.count({
        where: {
          type: TransportLevel.CCT,
          currentStatus: UnitStatus.AVAILABLE,
          isActive: true
        }
      });

      const inUseUnits = await emsDB.unit.count({
        where: {
          type: TransportLevel.CCT,
          currentStatus: UnitStatus.IN_USE,
          isActive: true
        }
      });

      const outOfServiceUnits = await emsDB.unit.count({
        where: {
          type: TransportLevel.CCT,
          currentStatus: UnitStatus.OUT_OF_SERVICE,
          isActive: true
        }
      });

      const maintenanceUnits = await emsDB.unit.count({
        where: {
          type: TransportLevel.CCT,
          currentStatus: UnitStatus.MAINTENANCE,
          isActive: true
        }
      });

      const availability: ResourceAvailability = {
        cctUnits: {
          total: cctUnits,
          available: availableUnits,
          inUse: inUseUnits,
          outOfService: outOfServiceUnits,
          maintenance: maintenanceUnits
        },
        crewMembers: {
          total: cctUnits * 2, // Assuming 2 crew per unit
          available: availableUnits * 2,
          inUse: inUseUnits * 2,
          offDuty: (cctUnits - availableUnits - inUseUnits) * 2
        },
        equipment: {
          total: cctUnits * 2, // Assuming 2 pieces of equipment per unit
          available: availableUnits * 2,
          inUse: inUseUnits * 2,
          maintenance: maintenanceUnits * 2
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

  // Escalation Management
  async createEscalationRequest(escalationData: Omit<EscalationRequest, 'id' | 'requestedAt' | 'status' | 'escalationChain'>): Promise<EscalationRequest> {
    try {
      console.log('[RESOURCE_SERVICE] Creating escalation request:', escalationData);
      
      // For demo purposes, create mock escalation
      const escalation: EscalationRequest = {
        id: `esc-${Date.now()}`,
        transportRequestId: escalationData.transportRequestId,
        escalationLevel: escalationData.escalationLevel,
        reason: escalationData.reason,
        requestedBy: escalationData.requestedBy,
        requestedAt: new Date().toISOString(),
        status: 'PENDING',
        autoEscalation: escalationData.autoEscalation,
        escalationChain: [escalationData.requestedBy]
      };

      console.log('[RESOURCE_SERVICE] Escalation request created:', escalation);
      return escalation;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error creating escalation request:', error);
      throw new Error('Failed to create escalation request');
    }
  }

  async getEscalationRequests(filters: EscalationFilters = {}): Promise<EscalationRequest[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting escalation requests with filters:', filters);
      
      // For demo purposes, return mock escalations
      const mockEscalations: EscalationRequest[] = [
        {
          id: 'esc-1',
          transportRequestId: 'req-1',
          escalationLevel: 'CRITICAL',
          reason: 'Patient deteriorating, need immediate CCT transport',
          requestedBy: 'Dr. Smith',
          requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'PENDING',
          autoEscalation: true,
          escalationChain: ['Dr. Smith', 'ICU Charge Nurse']
        },
        {
          id: 'esc-2',
          transportRequestId: 'req-2',
          escalationLevel: 'LEVEL_2',
          reason: 'No CCT units available in area',
          requestedBy: 'Nurse Johnson',
          requestedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'ACKNOWLEDGED',
          acknowledgedBy: 'EMS Supervisor',
          acknowledgedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          autoEscalation: false,
          escalationChain: ['Nurse Johnson', 'EMS Supervisor']
        }
      ];

      let filteredEscalations = mockEscalations;

      if (filters.status) {
        filteredEscalations = filteredEscalations.filter(e => e.status === filters.status);
      }

      if (filters.escalationLevel) {
        filteredEscalations = filteredEscalations.filter(e => e.escalationLevel === filters.escalationLevel);
      }

      console.log(`[RESOURCE_SERVICE] Found ${filteredEscalations.length} escalation requests`);
      return filteredEscalations;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting escalation requests:', error);
      throw new Error('Failed to get escalation requests');
    }
  }

  // Resource Allocation
  async allocateResource(allocationData: Omit<ResourceAllocation, 'id' | 'allocationTime' | 'lastUpdated' | 'status'>): Promise<ResourceAllocation> {
    try {
      console.log('[RESOURCE_SERVICE] Allocating resource:', allocationData);
      
      const allocation: ResourceAllocation = {
        id: `alloc-${Date.now()}`,
        transportRequestId: allocationData.transportRequestId,
        cctUnitId: allocationData.cctUnitId,
        crewMembers: allocationData.crewMembers,
        equipment: allocationData.equipment,
        allocationTime: new Date().toISOString(),
        estimatedDeparture: allocationData.estimatedDeparture,
        estimatedArrival: allocationData.estimatedArrival,
        status: 'PENDING',
        notes: allocationData.notes,
        createdBy: allocationData.createdBy,
        lastUpdated: new Date().toISOString()
      };

      console.log('[RESOURCE_SERVICE] Resource allocation created:', allocation);
      return allocation;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error allocating resource:', error);
      throw new Error('Failed to allocate resource');
    }
  }

  async getResourceAllocations(filters: ResourceAllocationFilters = {}): Promise<ResourceAllocation[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting resource allocations with filters:', filters);
      
      // For demo purposes, return mock allocations
      const mockAllocations: ResourceAllocation[] = [
        {
          id: 'alloc-1',
          transportRequestId: 'req-1',
          cctUnitId: 'unit-1',
          crewMembers: ['crew-1', 'crew-2'],
          equipment: ['equip-1', 'equip-2'],
          allocationTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          estimatedDeparture: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          status: 'CONFIRMED',
          notes: 'CCT unit dispatched for critical patient',
          createdBy: 'EMS Coordinator',
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      let filteredAllocations = mockAllocations;

      if (filters.status) {
        filteredAllocations = filteredAllocations.filter(a => a.status === filters.status);
      }

      if (filters.cctUnitId) {
        filteredAllocations = filteredAllocations.filter(a => a.cctUnitId === filters.cctUnitId);
      }

      console.log(`[RESOURCE_SERVICE] Found ${filteredAllocations.length} resource allocations`);
      return filteredAllocations;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting resource allocations:', error);
      throw new Error('Failed to get resource allocations');
    }
  }

  // Priority Queue Management
  async getPriorityQueue(): Promise<PriorityQueueItem[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting priority queue');
      
      // For demo purposes, return mock priority queue
      const mockQueue: PriorityQueueItem[] = [
        {
          id: 'queue-1',
          transportRequestId: 'req-1',
          priority: Priority.URGENT,
          escalationLevel: 'CRITICAL',
          waitTime: 45,
          estimatedResponseTime: 15,
          facilityUrgency: 'CRITICAL',
          patientCondition: 'EMERGENCY',
          queuePosition: 1,
          addedToQueue: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'queue-2',
          transportRequestId: 'req-2',
          priority: Priority.HIGH,
          escalationLevel: 'LEVEL_2',
          waitTime: 30,
          estimatedResponseTime: 25,
          facilityUrgency: 'HIGH',
          patientCondition: 'CRITICAL',
          queuePosition: 2,
          addedToQueue: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ];

      console.log(`[RESOURCE_SERVICE] Priority queue has ${mockQueue.length} items`);
      return mockQueue;
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
      
      // For demo purposes, return mock capacity planning
      const capacityPlanning: CapacityPlanning[] = [
        {
          id: 'cap-1',
          facilityId: 'facility-1',
          facilityName: 'UPMC Altoona',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '08:00-16:00',
          projectedDemand: 12,
          availableResources: 8,
          capacityGap: 4,
          recommendations: [
            'Activate backup CCT unit',
            'Coordinate with neighboring facilities',
            'Consider air medical options'
          ],
          riskLevel: 'HIGH',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'cap-2',
          facilityId: 'facility-2',
          facilityName: 'Penn Highlands',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '16:00-24:00',
          projectedDemand: 8,
          availableResources: 6,
          capacityGap: 2,
          recommendations: [
            'Monitor resource utilization',
            'Prepare for potential escalation'
          ],
          riskLevel: 'MEDIUM',
          lastUpdated: new Date().toISOString()
        }
      ];

      console.log(`[RESOURCE_SERVICE] Found ${capacityPlanning.length} capacity planning items`);
      return capacityPlanning;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting capacity planning:', error);
      throw new Error('Failed to get capacity planning');
    }
  }

  // Unit Status Management
  async updateUnitStatus(unitId: string, newStatus: UnitStatus, reason: string, updatedBy: string, additionalData?: any): Promise<UnitStatusUpdate> {
    try {
      console.log('[RESOURCE_SERVICE] Updating unit status:', { unitId, newStatus, reason, updatedBy });
      
      // Get current unit status
      const emsDB = databaseManager.getEMSDB();
      const unit = await emsDB.unit.findUnique({
        where: { id: unitId }
      });

      if (!unit) {
        throw new Error('Unit not found');
      }

      const previousStatus = unit.currentStatus;

      // Update unit status in database
      await emsDB.unit.update({
        where: { id: unitId },
        data: {
          currentStatus: newStatus,
          updatedAt: new Date()
        }
      });

      const statusUpdate: UnitStatusUpdate = {
        id: `status-${Date.now()}`,
        unitId,
        unitNumber: unit.unitNumber,
        previousStatus,
        newStatus,
        reason,
        updatedBy,
        updatedAt: new Date().toISOString(),
        estimatedReturnTime: additionalData?.estimatedReturnTime,
        location: additionalData?.location,
        notes: additionalData?.notes
      };

      console.log('[RESOURCE_SERVICE] Unit status updated:', statusUpdate);
      return statusUpdate;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  async getUnitStatusUpdates(limit: number = 10): Promise<UnitStatusUpdate[]> {
    try {
      console.log('[RESOURCE_SERVICE] Getting unit status updates, limit:', limit);
      
      // For demo purposes, return mock status updates
      const mockUpdates: UnitStatusUpdate[] = [
        {
          id: 'status-1',
          unitId: 'unit-1',
          unitNumber: 'CCT-001',
          previousStatus: UnitStatus.AVAILABLE,
          newStatus: UnitStatus.IN_USE,
          reason: 'Assigned to urgent transport',
          updatedBy: 'EMS Coordinator',
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          estimatedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          notes: 'Critical patient transport to UPMC Altoona'
        },
        {
          id: 'status-2',
          unitId: 'unit-2',
          unitNumber: 'CCT-002',
          previousStatus: UnitStatus.IN_USE,
          newStatus: UnitStatus.AVAILABLE,
          reason: 'Transport completed',
          updatedBy: 'System',
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          notes: 'Returned to base station'
        }
      ];

      console.log(`[RESOURCE_SERVICE] Found ${mockUpdates.length} status updates`);
      return mockUpdates.slice(0, limit);
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting unit status updates:', error);
      throw new Error('Failed to get unit status updates');
    }
  }

  // Resource Utilization Report
  async generateResourceUtilizationReport(startDate: string, endDate: string): Promise<ResourceUtilizationReport> {
    try {
      console.log('[RESOURCE_SERVICE] Generating resource utilization report:', { startDate, endDate });
      
      // For demo purposes, return mock report
      const report: ResourceUtilizationReport = {
        period: `${startDate} to ${endDate}`,
        startDate,
        endDate,
        cctUnits: {
          totalHours: 168,
          activeHours: 132,
          utilizationRate: 78.6,
          averageResponseTime: 18.5,
          totalTransports: 47,
          revenueGenerated: 23500
        },
        crewMembers: {
          totalHours: 336,
          activeHours: 264,
          utilizationRate: 78.6,
          overtimeHours: 24,
          certifications: {
            'ACLS': 8,
            'PALS': 6,
            'ITLS': 4,
            'CCRN': 2
          }
        },
        equipment: {
          totalHours: 168,
          activeHours: 132,
          utilizationRate: 78.6,
          maintenanceHours: 8,
          downtimeHours: 4
        },
        recommendations: [
          'Increase CCT unit capacity during peak hours',
          'Implement crew rotation to reduce overtime',
          'Schedule equipment maintenance during low-demand periods',
          'Consider additional units for high-volume facilities'
        ],
        generatedAt: new Date().toISOString()
      };

      console.log('[RESOURCE_SERVICE] Resource utilization report generated:', report);
      return report;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error generating resource utilization report:', error);
      throw new Error('Failed to generate resource utilization report');
    }
  }

  // Dashboard Data Aggregation
  async getResourceDashboardData(): Promise<any> {
    try {
      console.log('[RESOURCE_SERVICE] Getting resource dashboard data');
      
      const [
        availability,
        priorityQueue,
        recentEscalations,
        activeAllocations,
        callVolume,
        capacityPlanning,
        unitStatusUpdates
      ] = await Promise.all([
        this.getResourceAvailability(),
        this.getPriorityQueue(),
        this.getEscalationRequests({ status: 'PENDING' }),
        this.getResourceAllocations({ status: 'IN_PROGRESS' }),
        this.getCallVolumeAnalytics('DAILY'),
        this.getCapacityPlanning(),
        this.getUnitStatusUpdates(5)
      ]);

      const dashboardData = {
        availability,
        priorityQueue,
        recentEscalations,
        activeAllocations,
        callVolume,
        capacityPlanning,
        unitStatusUpdates,
        lastRefresh: new Date().toISOString()
      };

      console.log('[RESOURCE_SERVICE] Dashboard data aggregated successfully');
      return dashboardData;
    } catch (error) {
      console.error('[RESOURCE_SERVICE] Error getting dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }
}

export default ResourceManagementService;
