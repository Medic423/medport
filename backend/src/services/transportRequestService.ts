import { TransportRequest, TransportLevel, Priority, RequestStatus, Facility, User } from '@prisma/client';
import { createHash } from 'crypto';
// Temporarily disabled due to compilation errors
// import distanceService from './distanceService';
import { notificationService } from './notificationService';
import { databaseManager } from './databaseManager';

export interface CreateTransportRequestData {
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  priority: Priority;
  specialRequirements?: string;
  createdById: string;
  selectedAgencies?: string[]; // Array of agency IDs to notify
}

export interface UpdateTransportRequestData {
  patientId?: string;
  originFacilityId?: string;
  destinationFacilityId?: string;
  transportLevel?: TransportLevel;
  priority?: Priority;
  status?: RequestStatus;
  specialRequirements?: string;
  acceptedTimestamp?: Date;
  pickupTimestamp?: Date;
  completionTimestamp?: Date;
  assignedAgencyId?: string;
  assignedUnitId?: string;
}

export interface TransportRequestWithDetails extends TransportRequest {
  originFacility: Facility;
  destinationFacility: Facility;
  createdBy: User;
  assignedAgency?: any;
  assignedUnit?: any;
}

export class TransportRequestService {
  /**
   * Generate HIPAA-compliant non-identifiable patient ID
   * Uses hash of timestamp + random data to ensure uniqueness
   */
  private generatePatientId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const hash = createHash('sha256').update(timestamp + random).digest('hex');
    return `P${hash.substring(0, 8).toUpperCase()}`;
  }

  /**
   * Create a new transport request with HIPAA-compliant patient ID
   */
  async createTransportRequest(data: CreateTransportRequestData): Promise<TransportRequest> {
    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    
    // Generate unique patient ID if not provided
    const patientId = data.patientId || this.generatePatientId();

    // Validate facilities exist and are different
    if (data.originFacilityId === data.destinationFacilityId) {
      throw new Error('Origin and destination facilities must be different');
    }

    const [originFacility, destinationFacility] = await Promise.all([
      hospitalDB.facility.findUnique({ where: { id: data.originFacilityId } }),
      hospitalDB.facility.findUnique({ where: { id: data.destinationFacilityId } })
    ]);

    if (!originFacility || !destinationFacility) {
      throw new Error('One or both facilities not found');
    }

    // Create the transport request
    const transportRequest = await hospitalDB.transportRequest.create({
      data: {
        hospitalId: 'default-hospital', // TODO: Get from user context
        patientId,
        originFacilityId: data.originFacilityId,
        destinationFacilityId: data.destinationFacilityId,
        transportLevel: data.transportLevel,
        priority: data.priority,
        specialRequirements: data.specialRequirements,
        createdById: data.createdById,
        status: RequestStatus.PENDING
      }
    });

    console.log(`[MedPort:TransportRequest] Created transport request ${transportRequest.id} for patient ${patientId}`);
    return transportRequest;
  }

  /**
   * Create a new transport request with notifications to selected agencies
   */
  async createTransportRequestWithNotifications(data: CreateTransportRequestData): Promise<{
    transportRequest: TransportRequest;
    notifications: any[];
  }> {
    // Create the transport request first
    const transportRequest = await this.createTransportRequest(data);

    const notifications = [];

    // Send notifications to selected agencies if any
    if (data.selectedAgencies && data.selectedAgencies.length > 0) {
      try {
        // Get agency details for notifications (agencies in Center DB)
        const centerDB = databaseManager.getCenterDB();
        const agencies = await centerDB.eMSAgency.findMany({
          where: { id: { in: data.selectedAgencies } },
          select: { id: true, name: true, phone: true, email: true }
        });

        // Get facility details for notification content (facilities in Hospital DB)
        const hospitalDB = databaseManager.getHospitalDB();
        const [originFacility, destinationFacility] = await Promise.all([
          hospitalDB.facility.findUnique({ where: { id: data.originFacilityId } }),
          hospitalDB.facility.findUnique({ where: { id: data.destinationFacilityId } })
        ]);

        // Send notifications to each agency
        for (const agency of agencies) {
          try {
            // Send SMS notification if phone number is available
            if (agency.phone) {
              const smsResult = await notificationService.sendAgencyAssignmentNotification(
                agency.phone,
                transportRequest.id,
                originFacility?.name || 'Unknown Facility',
                data.transportLevel
              );
              notifications.push({
                agencyId: agency.id,
                agencyName: agency.name,
                type: 'sms',
                result: smsResult
              });
            }

            // Send email notification if email is available
            if (agency.email) {
              const emailResult = await notificationService.sendEmail({
                to: agency.email,
                subject: `New Transport Request - ${transportRequest.id}`,
                body: `New transport request available:\n\nRequest ID: ${transportRequest.id}\nOrigin: ${originFacility?.name || 'Unknown'}\nDestination: ${destinationFacility?.name || 'Unknown'}\nTransport Level: ${data.transportLevel}\nPriority: ${data.priority}\n\nPlease log in to view details and respond.`,
                template: 'transport_request',
                metadata: {
                  requestId: transportRequest.id,
                  agencyId: agency.id,
                  type: 'transport_request'
                }
              });
              notifications.push({
                agencyId: agency.id,
                agencyName: agency.name,
                type: 'email',
                result: emailResult
              });
            }
          } catch (error) {
            console.error(`[MedPort:TransportRequest] Failed to send notification to agency ${agency.id}:`, error);
            notifications.push({
              agencyId: agency.id,
              agencyName: agency.name,
              type: 'error',
              result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            });
          }
        }

        console.log(`[MedPort:TransportRequest] Sent ${notifications.length} notifications for transport request ${transportRequest.id}`);
      } catch (error) {
        console.error(`[MedPort:TransportRequest] Error sending notifications for transport request ${transportRequest.id}:`, error);
        // Don't fail the entire request if notifications fail
      }
    }

    return { transportRequest, notifications };
  }

  /**
   * Get transport request by ID with full details
   */
  async getTransportRequestById(id: string): Promise<TransportRequestWithDetails | null> {
    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    return hospitalDB.transportRequest.findUnique({
      where: { id },
      include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true
      }
    });
  }

  /**
   * Get all transport requests with filtering and pagination
   */
  async getTransportRequests(filters: {
    status?: RequestStatus;
    priority?: Priority;
    transportLevel?: TransportLevel;
    originFacilityId?: string;
    destinationFacilityId?: string;
    createdById?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    requests: TransportRequestWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (whereFilters.status) where.status = whereFilters.status;
    if (whereFilters.priority) where.priority = whereFilters.priority;
    if (whereFilters.transportLevel) where.transportLevel = whereFilters.transportLevel;
    if (whereFilters.originFacilityId) where.originFacilityId = whereFilters.originFacilityId;
    if (whereFilters.destinationFacilityId) where.destinationFacilityId = whereFilters.destinationFacilityId;
    if (whereFilters.createdById) where.createdById = whereFilters.createdById;

    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    
    const [requests, total] = await Promise.all([
      hospitalDB.transportRequest.findMany({
        where,
              include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true
      },
        orderBy: { requestTimestamp: 'desc' },
        skip,
        take: limit
      }),
      hospitalDB.transportRequest.count({ where })
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update transport request
   */
  async updateTransportRequest(id: string, data: UpdateTransportRequestData): Promise<TransportRequest> {
    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    
    // Validate request exists
    const existingRequest = await hospitalDB.transportRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new Error('Transport request not found');
    }

    // Validate status transitions
    if (data.status && !this.isValidStatusTransition(existingRequest.status, data.status)) {
      throw new Error(`Invalid status transition from ${existingRequest.status} to ${data.status}`);
    }

    // Update the request
    const updatedRequest = await hospitalDB.transportRequest.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    console.log(`[MedPort:TransportRequest] Updated transport request ${id} to status ${updatedRequest.status}`);
    return updatedRequest;
  }



  /**
   * Duplicate transport request for similar transports
   */
  async duplicateTransportRequest(id: string, modifications: Partial<CreateTransportRequestData>): Promise<TransportRequest> {
    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    
    const originalRequest = await hospitalDB.transportRequest.findUnique({
      where: { id },
      include: {
        originFacility: true,
        destinationFacility: true
      }
    });

    if (!originalRequest) {
      throw new Error('Transport request not found');
    }

    // Create new request with modifications
    const newRequestData: CreateTransportRequestData = {
      patientId: modifications.patientId || this.generatePatientId(),
      originFacilityId: modifications.originFacilityId || originalRequest.originFacilityId,
      destinationFacilityId: modifications.destinationFacilityId || originalRequest.destinationFacilityId,
      transportLevel: modifications.transportLevel || originalRequest.transportLevel,
      priority: modifications.priority || originalRequest.priority,
      specialRequirements: modifications.specialRequirements || (originalRequest.specialRequirements || undefined),
      createdById: modifications.createdById || originalRequest.createdById
    };

    return this.createTransportRequest(newRequestData);
  }

  /**
   * Bulk update transport requests
   */
  async bulkUpdateTransportRequests(
    ids: string[],
    updates: UpdateTransportRequestData
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = await Promise.allSettled(
      ids.map(id => this.updateTransportRequest(id, updates))
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    console.log(`[MedPort:TransportRequest] Bulk update completed: ${success} success, ${failed} failed`);
    return { success, failed, errors };
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(currentStatus: RequestStatus, newStatus: RequestStatus): boolean {
    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.PENDING]: [RequestStatus.SCHEDULED, RequestStatus.CANCELLED],
      [RequestStatus.SCHEDULED]: [RequestStatus.IN_TRANSIT, RequestStatus.CANCELLED],
      [RequestStatus.IN_TRANSIT]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
      [RequestStatus.COMPLETED]: [], // No further transitions
      [RequestStatus.CANCELLED]: [] // No further transitions
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get transport request statistics
   */
  async getTransportRequestStats(): Promise<{
    total: number;
    byStatus: Record<RequestStatus, number>;
    byPriority: Record<Priority, number>;
    byTransportLevel: Record<TransportLevel, number>;
  }> {
    // Transport requests stored in Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    
    const [total, byStatus, byPriority, byTransportLevel] = await Promise.all([
      hospitalDB.transportRequest.count(),
      hospitalDB.transportRequest.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      hospitalDB.transportRequest.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      hospitalDB.transportRequest.groupBy({
        by: ['transportLevel'],
        _count: { transportLevel: true }
      })
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<RequestStatus, number>);

    const priorityStats = byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<Priority, number>);

    const transportLevelStats = byTransportLevel.reduce((acc, item) => {
      acc[item.transportLevel] = item._count.transportLevel;
      return acc;
    }, {} as Record<TransportLevel, number>);

    return {
      total,
      byStatus: statusStats,
      byPriority: priorityStats,
      byTransportLevel: transportLevelStats
    };
  }

  /**
   * Calculate loaded miles for a transport request
   */
  async calculateLoadedMiles(transportRequestId: string): Promise<number> {
    try {
      // Transport requests stored in Hospital DB
      const hospitalDB = databaseManager.getHospitalDB();
      
      const transportRequest = await hospitalDB.transportRequest.findUnique({
        where: { id: transportRequestId },
        select: { originFacilityId: true, destinationFacilityId: true }
      });

      if (!transportRequest) {
        throw new Error('Transport request not found');
      }

      // Temporarily disabled due to compilation errors
      // const loadedMiles = await distanceService.calculateLoadedMiles(
      //   transportRequest.originFacilityId,
      //   transportRequest.destinationFacilityId
      // );
      const loadedMiles = 0; // Mock data

      console.log(`[MedPort:TransportRequest] Calculated ${loadedMiles.toFixed(2)} loaded miles for request ${transportRequestId}`);
      return loadedMiles;
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error calculating loaded miles:', error);
      throw error;
    }
  }

  /**
   * Get transport request with distance information
   */
  async getTransportRequestWithDistance(id: string): Promise<TransportRequestWithDetails & { loadedMiles?: number } | null> {
    try {
      const transportRequest = await this.getTransportRequestById(id);
      if (!transportRequest) return null;

      // Calculate loaded miles
      const loadedMiles = await this.calculateLoadedMiles(id);

      return {
        ...transportRequest,
        loadedMiles
      };
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error getting transport request with distance:', error);
      return null;
    }
  }

  /**
   * Get all transport requests with distance information
   */
  async getAllTransportRequestsWithDistance(filters?: any): Promise<(TransportRequestWithDetails & { loadedMiles?: number })[]> {
    try {
      const transportRequestsResponse = await this.getTransportRequests(filters);
      
      // Calculate distances for all requests
      const requestsWithDistance = await Promise.all(
        transportRequestsResponse.requests.map(async (request: TransportRequestWithDetails) => {
          try {
            const loadedMiles = await this.calculateLoadedMiles(request.id);
            return { ...request, loadedMiles };
          } catch (error) {
            console.warn(`[MedPort:TransportRequest] Could not calculate distance for request ${request.id}:`, error);
            return { ...request, loadedMiles: undefined };
          }
        })
      );

      return requestsWithDistance;
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error getting transport requests with distance:', error);
      throw error;
    }
  }

  /**
   * Update ETA for a transport request
   */
  async updateEta(requestId: string, etaData: {
    estimatedArrivalTime?: string;
    estimatedPickupTime?: string;
    reason?: string;
    updatedBy: string;
  }): Promise<TransportRequestWithDetails> {
    try {
      const existingRequest = await this.getTransportRequestById(requestId);
      if (!existingRequest) {
        throw new Error('Transport request not found');
      }

      // Create new ETA update entry
      const etaUpdate = {
        id: `eta_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        timestamp: new Date().toISOString(),
        estimatedArrivalTime: etaData.estimatedArrivalTime,
        estimatedPickupTime: etaData.estimatedPickupTime,
        updatedBy: etaData.updatedBy,
        reason: etaData.reason
      };

      // Get existing ETA updates
      const existingEtaUpdates = (existingRequest.etaUpdates as any[]) || [];
      const updatedEtaUpdates = [...existingEtaUpdates, etaUpdate];

      // Update the transport request
      const hospitalDB = databaseManager.getHospitalDB();
      const updatedRequest = await hospitalDB.transportRequest.update({
        where: { id: requestId },
        data: {
          estimatedArrivalTime: etaData.estimatedArrivalTime ? new Date(etaData.estimatedArrivalTime) : undefined,
          estimatedPickupTime: etaData.estimatedPickupTime ? new Date(etaData.estimatedPickupTime) : undefined,
          etaUpdates: updatedEtaUpdates,
          updatedAt: new Date()
        },
              include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true
      }
      });

      return updatedRequest as TransportRequestWithDetails;
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error updating ETA:', error);
      throw error;
    }
  }

  /**
   * Accept a transport request (for EMS agencies)
   */
  async acceptTransportRequest(requestId: string, acceptanceData: {
    assignedAgencyId: string;
    assignedUnitId?: string;
    estimatedArrivalTime?: string;
    acceptedBy: string;
  }): Promise<TransportRequestWithDetails> {
    try {
      const existingRequest = await this.getTransportRequestById(requestId);
      if (!existingRequest) {
        throw new Error('Transport request not found');
      }

      if (existingRequest.status !== 'PENDING') {
        throw new Error('Transport request is not in pending status');
      }

      // Create ETA update entry for acceptance
      const etaUpdate = {
        id: `eta_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        timestamp: new Date().toISOString(),
        estimatedArrivalTime: acceptanceData.estimatedArrivalTime,
        updatedBy: acceptanceData.acceptedBy,
        reason: 'Request accepted by EMS agency'
      };

      // Get existing ETA updates
      const existingEtaUpdates = (existingRequest.etaUpdates as any[]) || [];
      const updatedEtaUpdates = [...existingEtaUpdates, etaUpdate];

      // Update the transport request
      const hospitalDB = databaseManager.getHospitalDB();
      const updatedRequest = await hospitalDB.transportRequest.update({
        where: { id: requestId },
        data: {
          status: 'SCHEDULED',
          acceptedTimestamp: new Date(),
          assignedAgencyId: acceptanceData.assignedAgencyId,
          assignedUnitId: acceptanceData.assignedUnitId,
          estimatedArrivalTime: acceptanceData.estimatedArrivalTime ? new Date(acceptanceData.estimatedArrivalTime) : undefined,
          etaUpdates: updatedEtaUpdates,
          updatedAt: new Date()
        },
              include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true
      }
      });

      return updatedRequest as TransportRequestWithDetails;
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error accepting transport request:', error);
      throw error;
    }
  }

  /**
   * Cancel a transport request with reason
   */
  async cancelTransportRequest(requestId: string, reason?: string): Promise<TransportRequestWithDetails> {
    try {
      const existingRequest = await this.getTransportRequestById(requestId);
      if (!existingRequest) {
        throw new Error('Transport request not found');
      }

      if (existingRequest.status === 'COMPLETED') {
        throw new Error('Cannot cancel a completed transport request');
      }

      // Update the transport request
      const hospitalDB = databaseManager.getHospitalDB();
      const updatedRequest = await hospitalDB.transportRequest.update({
        where: { id: requestId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          updatedAt: new Date()
        },
              include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true
      }
      });

      return updatedRequest as TransportRequestWithDetails;
    } catch (error) {
      console.error('[MedPort:TransportRequest] Error cancelling transport request:', error);
      throw error;
    }
  }
}

export default new TransportRequestService();
