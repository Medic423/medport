import { PrismaClient, TransportRequest, TransportLevel, Priority, RequestStatus, Facility, User } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export interface CreateTransportRequestData {
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: TransportLevel;
  priority: Priority;
  specialRequirements?: string;
  createdById: string;
}

export interface UpdateTransportRequestData {
  patientId?: string;
  originFacilityId?: string;
  destinationFacilityId?: string;
  transportLevel?: TransportLevel;
  priority?: Priority;
  status?: RequestStatus;
  specialRequirements?: string;
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
    // Generate unique patient ID if not provided
    const patientId = data.patientId || this.generatePatientId();

    // Validate facilities exist and are different
    if (data.originFacilityId === data.destinationFacilityId) {
      throw new Error('Origin and destination facilities must be different');
    }

    const [originFacility, destinationFacility] = await Promise.all([
      prisma.facility.findUnique({ where: { id: data.originFacilityId } }),
      prisma.facility.findUnique({ where: { id: data.destinationFacilityId } })
    ]);

    if (!originFacility || !destinationFacility) {
      throw new Error('One or both facilities not found');
    }

    // Create the transport request
    const transportRequest = await prisma.transportRequest.create({
      data: {
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
   * Get transport request by ID with full details
   */
  async getTransportRequestById(id: string): Promise<TransportRequestWithDetails | null> {
    return prisma.transportRequest.findUnique({
      where: { id },
      include: {
        originFacility: true,
        destinationFacility: true,
        createdBy: true,
        assignedAgency: true,
        assignedUnit: true
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

    const [requests, total] = await Promise.all([
      prisma.transportRequest.findMany({
        where,
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: true,
          assignedAgency: true,
          assignedUnit: true
        },
        orderBy: { requestTimestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.transportRequest.count({ where })
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
    // Validate request exists
    const existingRequest = await prisma.transportRequest.findUnique({
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
    const updatedRequest = await prisma.transportRequest.update({
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
   * Cancel transport request
   */
  async cancelTransportRequest(id: string, reason?: string): Promise<TransportRequest> {
    const request = await prisma.transportRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new Error('Transport request not found');
    }

    if (request.status === RequestStatus.COMPLETED) {
      throw new Error('Cannot cancel completed transport request');
    }

    if (request.status === RequestStatus.CANCELLED) {
      throw new Error('Transport request is already cancelled');
    }

    return this.updateTransportRequest(id, {
      status: RequestStatus.CANCELLED,
      specialRequirements: reason ? `${request.specialRequirements || ''}\n[CANCELLED: ${reason}]` : (request.specialRequirements || undefined)
    });
  }

  /**
   * Duplicate transport request for similar transports
   */
  async duplicateTransportRequest(id: string, modifications: Partial<CreateTransportRequestData>): Promise<TransportRequest> {
    const originalRequest = await prisma.transportRequest.findUnique({
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
    const [total, byStatus, byPriority, byTransportLevel] = await Promise.all([
      prisma.transportRequest.count(),
      prisma.transportRequest.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.transportRequest.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      prisma.transportRequest.groupBy({
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
}

export default new TransportRequestService();
