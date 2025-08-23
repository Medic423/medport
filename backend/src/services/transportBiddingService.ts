import { PrismaClient, TransportBid, TransportRequest, TransportAgency, AgencyUser } from '@prisma/client';

const prisma = new PrismaClient();

export interface BidSubmissionData {
  transportRequestId: string;
  agencyId: string;
  agencyUserId: string;
  bidAmount?: number;
  estimatedArrival?: Date;
  unitType: 'BLS' | 'ALS' | 'CCT';
  specialCapabilities?: any;
  notes?: string;
}

export interface BidFilterOptions {
  agencyId?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  transportRequestId?: string;
  submittedAfter?: Date;
  submittedBefore?: Date;
}

export class TransportBiddingService {
  // Submit a bid on a transport request
  async submitBid(data: BidSubmissionData): Promise<TransportBid> {
    try {
      // Validate that the transport request exists and is available for bidding
      const transportRequest = await prisma.transportRequest.findUnique({
        where: { id: data.transportRequestId },
        include: { assignedAgency: true }
      });

      if (!transportRequest) {
        throw new Error('Transport request not found');
      }

      if (transportRequest.status !== 'PENDING') {
        throw new Error('Transport request is not available for bidding');
      }

      if (transportRequest.assignedAgencyId) {
        throw new Error('Transport request has already been assigned');
      }

      // Check if agency has already submitted a bid for this request
      const existingBid = await prisma.transportBid.findFirst({
        where: {
          transportRequestId: data.transportRequestId,
          agencyId: data.agencyId,
          status: { in: ['PENDING', 'ACCEPTED'] }
        }
      });

      if (existingBid) {
        throw new Error('Agency has already submitted a bid for this transport request');
      }

      // Validate agency has appropriate unit type available
      const availableUnit = await prisma.unit.findFirst({
        where: {
          agencyId: data.agencyId,
          type: data.unitType,
          isActive: true,
          unitAvailability: {
            some: {
              status: 'AVAILABLE'
            }
          }
        }
      });

      if (!availableUnit) {
        throw new Error(`No ${data.unitType} units available for this transport`);
      }

      // Create the bid
      const bid = await prisma.transportBid.create({
        data: {
          transportRequestId: data.transportRequestId,
          agencyId: data.agencyId,
          agencyUserId: data.agencyUserId,
          bidAmount: data.bidAmount,
          estimatedArrival: data.estimatedArrival,
          unitType: data.unitType,
          specialCapabilities: data.specialCapabilities,
          notes: data.notes,
          status: 'PENDING'
        },
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          },
          agency: true,
          agencyUser: true
        }
      });

      console.log(`[BID-SUBMISSION] Agency ${data.agencyId} submitted bid ${bid.id} for transport ${data.transportRequestId}`);

      return bid;
    } catch (error) {
      console.error('Submit bid error:', error);
      throw error;
    }
  }

  // Get bids with filtering options
  async getBids(filters: BidFilterOptions = {}): Promise<TransportBid[]> {
    try {
      const where: any = {};

      if (filters.agencyId) {
        where.agencyId = filters.agencyId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.transportRequestId) {
        where.transportRequestId = filters.transportRequestId;
      }

      if (filters.submittedAfter || filters.submittedBefore) {
        where.submittedAt = {};
        if (filters.submittedAfter) {
          where.submittedAt.gte = filters.submittedAfter;
        }
        if (filters.submittedBefore) {
          where.submittedAt.lte = filters.submittedBefore;
        }
      }

      return await prisma.transportBid.findMany({
        where,
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          },
          agency: true,
          agencyUser: true
        },
        orderBy: { submittedAt: 'desc' }
      });
    } catch (error) {
      console.error('Get bids error:', error);
      throw error;
    }
  }

  // Get bids for a specific transport request
  async getBidsForTransport(transportRequestId: string): Promise<TransportBid[]> {
    try {
      return await prisma.transportBid.findMany({
        where: { transportRequestId },
        include: {
          agency: true,
          agencyUser: true
        },
        orderBy: [
          { status: 'asc' }, // PENDING first
          { submittedAt: 'asc' } // Then by submission time
        ]
      });
    } catch (error) {
      console.error('Get bids for transport error:', error);
      throw error;
    }
  }

  // Get agency's bid history
  async getAgencyBidHistory(agencyId: string, limit: number = 50): Promise<TransportBid[]> {
    try {
      return await prisma.transportBid.findMany({
        where: { agencyId },
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Get agency bid history error:', error);
      throw error;
    }
  }

  // Accept a bid (coordinator action)
  async acceptBid(bidId: string, reviewedBy: string, reviewNotes?: string): Promise<TransportBid> {
    try {
      const bid = await prisma.transportBid.findUnique({
        where: { id: bidId },
        include: { transportRequest: true }
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Bid is not pending');
      }

      // Start a transaction to update bid and transport request
      const result = await prisma.$transaction(async (tx) => {
        // Update the bid status
        const updatedBid = await tx.transportBid.update({
          where: { id: bidId },
          data: {
            status: 'ACCEPTED',
            reviewedAt: new Date(),
            reviewedBy,
            reviewNotes
          }
        });

        // Assign the transport request to the agency
        await tx.transportRequest.update({
          where: { id: bid.transportRequestId },
          data: {
            assignedAgencyId: bid.agencyId,
            status: 'SCHEDULED'
          }
        });

        // Reject all other pending bids for this transport request
        await tx.transportBid.updateMany({
          where: {
            transportRequestId: bid.transportRequestId,
            id: { not: bidId },
            status: 'PENDING'
          },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewedBy,
            reviewNotes: 'Another bid was accepted'
          }
        });

        return updatedBid;
      });

      console.log(`[BID-ACCEPTED] Bid ${bidId} accepted for transport ${bid.transportRequestId}`);

      return result;
    } catch (error) {
      console.error('Accept bid error:', error);
      throw error;
    }
  }

  // Reject a bid (coordinator action)
  async rejectBid(bidId: string, reviewedBy: string, reviewNotes?: string): Promise<TransportBid> {
    try {
      const bid = await prisma.transportBid.findUnique({
        where: { id: bidId }
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Bid is not pending');
      }

      const updatedBid = await prisma.transportBid.update({
        where: { id: bidId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy,
          reviewNotes
        }
      });

      console.log(`[BID-REJECTED] Bid ${bidId} rejected for transport ${bid.transportRequestId}`);

      return updatedBid;
    } catch (error) {
      console.error('Reject bid error:', error);
      throw error;
    }
  }

  // Withdraw a bid (agency action)
  async withdrawBid(bidId: string, agencyId: string): Promise<TransportBid> {
    try {
      const bid = await prisma.transportBid.findUnique({
        where: { id: bidId }
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.agencyId !== agencyId) {
        throw new Error('Unauthorized to withdraw this bid');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Bid cannot be withdrawn');
      }

      const updatedBid = await prisma.transportBid.update({
        where: { id: bidId },
        data: {
          status: 'EXPIRED',
          reviewNotes: 'Bid withdrawn by agency'
        }
      });

      console.log(`[BID-WITHDRAWN] Bid ${bidId} withdrawn by agency ${agencyId}`);

      return updatedBid;
    } catch (error) {
      console.error('Withdraw bid error:', error);
      throw error;
    }
  }

  // Get bid statistics for an agency
  async getAgencyBidStats(agencyId: string): Promise<any> {
    try {
      const [totalBids, acceptedBids, rejectedBids, pendingBids] = await Promise.all([
        prisma.transportBid.count({ where: { agencyId } }),
        prisma.transportBid.count({ where: { agencyId, status: 'ACCEPTED' } }),
        prisma.transportBid.count({ where: { agencyId, status: 'REJECTED' } }),
        prisma.transportBid.count({ where: { agencyId, status: 'PENDING' } })
      ]);

      const acceptanceRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;

      return {
        totalBids,
        acceptedBids,
        rejectedBids,
        pendingBids,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100
      };
    } catch (error) {
      console.error('Get agency bid stats error:', error);
      throw error;
    }
  }

  // Get available transport requests for bidding
  async getAvailableTransportsForAgency(agencyId: string, filters: any = {}): Promise<TransportRequest[]> {
    try {
      const where: any = {
        status: 'PENDING',
        assignedAgencyId: null
      };

      // Add transport level filter if specified
      if (filters.transportLevel) {
        where.transportLevel = filters.transportLevel;
      }

      // Add priority filter if specified
      if (filters.priority) {
        where.priority = filters.priority;
      }

      // Add geographic filters if agency has service areas defined
      if (filters.originCity || filters.destinationCity) {
        where.OR = [];
        
        if (filters.originCity) {
          where.OR.push({
            originFacility: { city: { contains: filters.originCity, mode: 'insensitive' } }
          });
        }
        
        if (filters.destinationCity) {
          where.OR.push({
            destinationFacility: { city: { contains: filters.destinationCity, mode: 'insensitive' } }
          });
        }
      }

      // Exclude transports that the agency has already bid on
      const existingBids = await prisma.transportBid.findMany({
        where: { agencyId },
        select: { transportRequestId: true }
      });

      const bidTransportIds = existingBids.map(bid => bid.transportRequestId);
      if (bidTransportIds.length > 0) {
        where.id = { notIn: bidTransportIds };
      }

      return await prisma.transportRequest.findMany({
        where,
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: {
            select: { name: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { requestTimestamp: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Get available transports error:', error);
      throw error;
    }
  }

  // Auto-expire old pending bids
  async expireOldBids(): Promise<number> {
    try {
      const expirationHours = 24; // Bids expire after 24 hours
      const expirationDate = new Date(Date.now() - expirationHours * 60 * 60 * 1000);

      const result = await prisma.transportBid.updateMany({
        where: {
          status: 'PENDING',
          submittedAt: { lt: expirationDate }
        },
        data: {
          status: 'EXPIRED',
          reviewNotes: 'Bid expired automatically'
        }
      });

      if (result.count > 0) {
        console.log(`[BID-EXPIRATION] Expired ${result.count} old bids`);
      }

      return result.count;
    } catch (error) {
      console.error('Expire old bids error:', error);
      throw error;
    }
  }
}

export default new TransportBiddingService();
