// Optimization API Service for TCC Route Optimization System

import {
  OptimizationRequest,
  OptimizationResponse,
  BackhaulAnalysisResponse,
  RevenueAnalyticsResponse,
  PerformanceMetricsResponse,
  OptimizationWeights,
  Unit,
  TransportRequest
} from '../types/optimization';

class OptimizationApiService {
  private baseUrl = '/api/optimize';

  /**
   * Optimize routes for selected trips with a starting location
   */
  async optimizeRoutes(request: { startingLocation: { lat: number; lng: number }, tripIds: string[], constraints?: any }): Promise<OptimizationResponse> {
    try {
      // For now, send tripIds as requestIds to maintain backend compatibility
      // TODO: Update backend to accept tripIds and startingLocation instead of unitId
      const response = await fetch(`${this.baseUrl}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          // Temporary: Backend still expects unitId, but we'll pass null and use startingLocation
          unitId: null,
          requestIds: request.tripIds,
          startingLocation: request.startingLocation,
          constraints: request.constraints
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize routes');
      }

      return data;
    } catch (error) {
      console.error('Error optimizing routes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Find backhaul opportunities for given trips
   */
  async analyzeBackhaul(tripIds: string[]): Promise<BackhaulAnalysisResponse> {
    try {
      // Backend expects requestIds, but we're passing tripIds
      const response = await fetch(`${this.baseUrl}/backhaul`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ requestIds: tripIds }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze backhaul opportunities');
      }

      return data;
    } catch (error) {
      console.error('Error analyzing backhaul:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get revenue analytics for a time period
   */
  async getRevenueAnalytics(timeframe: string = '24h', agencyId?: string): Promise<RevenueAnalyticsResponse> {
    try {
      const params = new URLSearchParams({ timeframe });
      if (agencyId) {
        params.append('agencyId', agencyId);
      }

      const response = await fetch(`${this.baseUrl}/revenue?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get revenue analytics');
      }

      return data;
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get performance metrics for units
   */
  async getPerformanceMetrics(timeframe: string = '24h', unitId?: string): Promise<PerformanceMetricsResponse> {
    try {
      const params = new URLSearchParams({ timeframe });
      if (unitId) {
        params.append('unitId', unitId);
      }

      const response = await fetch(`${this.baseUrl}/performance?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get performance metrics');
      }

      return data;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get available units for optimization
   */
  async getAvailableUnits(): Promise<Unit[]> {
    try {
      const response = await fetch('/api/units/available', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get available units');
      }

      return data.data || [];
    } catch (error) {
      console.error('Error getting available units:', error);
      return [];
    }
  }

  /**
   * Get pending transport requests
   */
  async getPendingRequests(): Promise<TransportRequest[]> {
    try {
      const response = await fetch('/api/trips?status=PENDING', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get pending requests');
      }

      // Transform trip data to TransportRequest format
      return (data.data || []).map((trip: any) => ({
        id: trip.id,
        patientId: trip.patientId,
        originFacilityId: trip.fromFacilityId || 'unknown',
        destinationFacilityId: trip.toFacilityId || 'unknown',
        transportLevel: trip.transportLevel || 'BLS',
        priority: trip.priority || 'MEDIUM',
        status: trip.status || 'PENDING',
        specialRequirements: trip.specialRequirements || '',
        requestTimestamp: new Date(trip.createdAt),
        readyStart: new Date(trip.scheduledTime || trip.createdAt),
        readyEnd: new Date(new Date(trip.scheduledTime || trip.createdAt).getTime() + 60 * 60 * 1000), // 1 hour window
        originLocation: {
          lat: trip.fromLocation?.lat || 40.7128,
          lng: trip.fromLocation?.lng || -74.0060
        },
        destinationLocation: {
          lat: trip.toLocation?.lat || 40.7589,
          lng: trip.toLocation?.lng || -73.9851
        }
      }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  /**
   * Update optimization weights
   */
  async updateOptimizationWeights(weights: Partial<OptimizationWeights>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ weights }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update optimization weights');
      }

      return true;
    } catch (error) {
      console.error('Error updating optimization weights:', error);
      return false;
    }
  }

  /**
   * Get optimization settings
   */
  async getOptimizationSettings(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get optimization settings');
      }

      return data.data || {};
    } catch (error) {
      console.error('Error getting optimization settings:', error);
      return {};
    }
  }

  /**
   * Save optimization settings
   */
  async saveOptimizationSettings(settings: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save optimization settings');
      }

      return true;
    } catch (error) {
      console.error('Error saving optimization settings:', error);
      return false;
    }
  }

  /**
   * Get EMS agency home base coordinates
   * @param agencyId Optional agency ID for TCC/Admin users. If not provided, uses logged-in user's agency.
   */
  async getAgencyHomeBase(agencyId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const url = agencyId 
        ? `${this.baseUrl}/agency/home-base?agencyId=${agencyId}`
        : `${this.baseUrl}/agency/home-base`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get agency home base');
      }

      return data;
    } catch (error) {
      console.error('Error getting agency home base:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get agency's current active/completed trips
   * @param agencyId Optional agency ID for TCC/Admin users. If not provided, uses logged-in user's agency.
   */
  async getCurrentTrips(agencyId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const url = agencyId
        ? `${this.baseUrl}/agency/current-trips?agencyId=${agencyId}`
        : `${this.baseUrl}/agency/current-trips`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get current trips');
      }

      return data;
    } catch (error) {
      console.error('Error getting current trips:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Find return trip opportunities
   */
  async findReturnOpportunities(request: {
    currentLocation: { lat: number; lng: number };
    homeBase: { lat: number; lng: number };
    proximityRadius?: number;
    maxLegs?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/return-opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to find return opportunities');
      }

      return data;
    } catch (error) {
      console.error('Error finding return opportunities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const optimizationApi = new OptimizationApiService();
export default optimizationApi;
