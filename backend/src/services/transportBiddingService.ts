import { databaseManager } from './databaseManager';

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
  async submitBid(data: BidSubmissionData): Promise<any> {
    try {
      console.log('[BIDDING_SERVICE] Submitting bid:', data);

      // Get database instances
      const hospitalDB = databaseManager.getHospitalDB();
      const emsDB = databaseManager.getEMSDB();

      // Validate that the transport request exists
      const transportRequest = await hospitalDB.transportRequest.findUnique({
        where: { id: data.transportRequestId }
      });

      if (!transportRequest) {
        throw new Error('Transport request not found');
      }

      if (transportRequest.status !== 'PENDING') {
        throw new Error('Transport request is not available for bidding');
      }

      // For demo purposes, create a mock bid
      const bid = {
        id: `bid_${Date.now()}`,
        transportRequestId: data.transportRequestId,
        agencyId: data.agencyId,
        agencyUserId: data.agencyUserId,
        bidAmount: data.bidAmount,
        estimatedArrival: data.estimatedArrival,
        unitType: data.unitType,
        specialCapabilities: data.specialCapabilities,
        notes: data.notes,
        status: 'PENDING',
        submittedAt: new Date()
      };

      console.log('[BIDDING_SERVICE] Bid submitted successfully:', bid.id);
      return bid;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error submitting bid:', error);
      throw new Error('Failed to submit bid');
    }
  }

  // Get bids for a specific agency
  async getAgencyBids(agencyId: string, filters: BidFilterOptions = {}): Promise<any[]> {
    try {
      console.log('[BIDDING_SERVICE] Getting bids for agency:', agencyId);

      // For demo purposes, return mock data
      const mockBids = [
        {
          id: 'bid_1',
          transportRequestId: 'req_1',
          agencyId: agencyId,
          bidAmount: 150,
          status: 'PENDING',
          submittedAt: new Date()
        }
      ];

      return mockBids;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error getting agency bids:', error);
      throw new Error('Failed to get agency bids');
    }
  }

  // Get bids for a specific transport request
  async getTransportRequestBids(transportRequestId: string): Promise<any[]> {
    try {
      console.log('[BIDDING_SERVICE] Getting bids for transport request:', transportRequestId);

      // For demo purposes, return mock data
      const mockBids = [
        {
          id: 'bid_1',
          transportRequestId: transportRequestId,
          agencyId: 'agency_1',
          bidAmount: 150,
          status: 'PENDING',
          submittedAt: new Date()
        }
      ];

      return mockBids;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error getting transport request bids:', error);
      throw new Error('Failed to get transport request bids');
    }
  }

  // Accept a bid
  async acceptBid(bidId: string): Promise<any> {
    try {
      console.log('[BIDDING_SERVICE] Accepting bid:', bidId);

      // For demo purposes, return mock accepted bid
      const acceptedBid = {
        id: bidId,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      };

      return acceptedBid;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error accepting bid:', error);
      throw new Error('Failed to accept bid');
    }
  }

  // Reject a bid
  async rejectBid(bidId: string, reason?: string): Promise<any> {
    try {
      console.log('[BIDDING_SERVICE] Rejecting bid:', bidId);

      // For demo purposes, return mock rejected bid
      const rejectedBid = {
        id: bidId,
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason
      };

      return rejectedBid;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error rejecting bid:', error);
      throw new Error('Failed to reject bid');
    }
  }

  // Get bidding statistics for an agency
  async getAgencyBiddingStats(agencyId: string): Promise<any> {
    try {
      console.log('[BIDDING_SERVICE] Getting bidding stats for agency:', agencyId);

      // For demo purposes, return mock statistics
      const stats = {
        totalBids: 25,
        acceptedBids: 18,
        rejectedBids: 5,
        pendingBids: 2,
        acceptanceRate: 72.0,
        averageBidAmount: 145.50
      };

      return stats;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error getting bidding stats:', error);
      throw new Error('Failed to get bidding statistics');
    }
  }

  // Get available transport requests for bidding
  async getAvailableTransportRequests(agencyId?: string): Promise<any[]> {
    try {
      console.log('[BIDDING_SERVICE] Getting available transport requests');

      const hospitalDB = databaseManager.getHospitalDB();
      
      // Get pending transport requests from Hospital DB
      const transportRequests = await hospitalDB.transportRequest.findMany({
        where: { status: 'PENDING' },
        take: 10 // Limit for demo
      });

      return transportRequests;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error getting available transport requests:', error);
      throw new Error('Failed to get available transport requests');
    }
  }

  // Update bid status
  async updateBidStatus(bidId: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'): Promise<any> {
    try {
      console.log('[BIDDING_SERVICE] Updating bid status:', bidId, status);

      // For demo purposes, return mock updated bid
      const updatedBid = {
        id: bidId,
        status: status,
        updatedAt: new Date()
      };

      return updatedBid;

    } catch (error) {
      console.error('[BIDDING_SERVICE] Error updating bid status:', error);
      throw new Error('Failed to update bid status');
    }
  }
}

export default TransportBiddingService;