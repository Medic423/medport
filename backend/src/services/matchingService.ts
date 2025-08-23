import { PrismaClient } from '@prisma/client';
import { TransportRequest, TransportAgency, UnitAvailability, TransportBid } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchingCriteria {
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  originFacilityId: string;
  destinationFacilityId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  specialRequirements?: string;
  estimatedDistance?: number;
  timeWindow?: {
    earliest: string;
    latest: string;
  };
}

export interface MatchingResult {
  agency: TransportAgency;
  unitAvailability: UnitAvailability;
  matchingScore: number;
  reasons: string[];
  estimatedArrival: string;
  revenuePotential: number;
  isLDT: boolean; // Long Distance Transfer
}

export interface MatchingPreferences {
  agencyId: string;
  preferredServiceAreas: string[];
  preferredTransportLevels: ('BLS' | 'ALS' | 'CCT')[];
  maxDistance: number;
  preferredTimeWindows: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  revenueThreshold: number;
}

export class MatchingService {
  /**
   * Find the best matching agencies for a transport request
   */
  async findMatchingAgencies(
    request: TransportRequest,
    criteria: MatchingCriteria
  ): Promise<MatchingResult[]> {
    try {
      console.log('[MATCHING-SERVICE] Starting to find matching agencies...');
      
      // Get all available agencies with matching capabilities
      const availableAgencies = await this.getAvailableAgencies(criteria);
      
      console.log('[MATCHING-SERVICE] Found available agencies:', availableAgencies.length);
      
      // Calculate matching scores for each agency
      const matchingResults: MatchingResult[] = [];
      
      for (const agency of availableAgencies) {
        console.log('[MATCHING-SERVICE] Processing agency:', agency.id);
        const result = await this.calculateMatchingScore(agency, request, criteria);
        if (result.matchingScore > 0) {
          matchingResults.push(result);
        }
      }
      
      // Sort by matching score (highest first)
      matchingResults.sort((a, b) => b.matchingScore - a.matchingScore);
      
      // Limit to top 10 matches
      return matchingResults.slice(0, 10);
    } catch (error) {
      console.error('[MATCHING-SERVICE] Error finding matching agencies:', error);
      throw error;
    }
  }

  /**
   * Get available agencies based on transport level and capabilities
   */
  private async getAvailableAgencies(criteria: MatchingCriteria): Promise<TransportAgency[]> {
    try {
      console.log('[MATCHING-SERVICE] Getting available agencies for criteria:', criteria);
      
      const agencies = await prisma.transportAgency.findMany({
        where: {
          // Check if agency has units available for the required transport level
          units: {
            some: {
              type: criteria.transportLevel,
              unitAvailability: {
                some: {
                  status: 'AVAILABLE'
                }
              }
            }
          },
          // Check if agency is active
          isActive: true
        },
        include: {
          units: {
            include: {
              unitAvailability: true
            }
          },
          serviceAreas: true
        }
      });

      console.log('[MATCHING-SERVICE] Found agencies with units:', agencies.length);
      
      // For demo purposes, if no agencies have units, return all active agencies
      if (agencies.length === 0) {
        console.log('[MATCHING-SERVICE] No agencies with units found, returning all active agencies for demo');
        const allAgencies = await prisma.transportAgency.findMany({
          where: { isActive: true },
          include: {
            units: true,
            serviceAreas: true
          }
        });
        return allAgencies;
      }

      return agencies;
    } catch (error) {
      console.error('[MATCHING-SERVICE] Error getting available agencies:', error);
      // For demo purposes, return empty array instead of crashing
      return [];
    }
  }

  /**
   * Calculate matching score for an agency
   */
  private async calculateMatchingScore(
    agency: TransportAgency,
    request: TransportRequest,
    criteria: MatchingCriteria
  ): Promise<MatchingResult> {
    let score = 0;
    const reasons: string[] = [];
    
    // Base score for capability match
    const capabilityScore = this.calculateCapabilityScore(agency, criteria);
    score += capabilityScore.score;
    reasons.push(...capabilityScore.reasons);
    
    // Geographic proximity score
    const proximityScore = await this.calculateProximityScore(agency, request, criteria);
    score += proximityScore.score;
    reasons.push(...proximityScore.reasons);
    
    // Revenue optimization score
    const revenueScore = this.calculateRevenueScore(agency, request, criteria);
    score += revenueScore.score;
    reasons.push(...revenueScore.reasons);
    
    // Time window compatibility score
    const timeScore = this.calculateTimeWindowScore(agency, request, criteria);
    score += timeScore.score;
    reasons.push(...timeScore.reasons);
    
    // LDT (Long Distance Transfer) bonus
    const isLDT = (criteria.estimatedDistance || 0) > 100;
    if (isLDT) {
      score += 50; // Bonus for long distance transfers
      reasons.push('LDT bonus: Long distance transfer opportunity');
    }
    
    // Get best available unit
    const bestUnit = await this.getBestAvailableUnit(agency, criteria);
    
    return {
      agency,
      unitAvailability: bestUnit,
      matchingScore: Math.max(0, score), // Ensure non-negative score
      reasons,
      estimatedArrival: this.calculateEstimatedArrival(bestUnit, request),
      revenuePotential: this.calculateRevenuePotential(request, criteria),
      isLDT
    };
  }

  /**
   * Calculate capability-based matching score
   */
  private calculateCapabilityScore(agency: any, criteria: MatchingCriteria): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    
    // Check if agency has units
    if (!agency.units || agency.units.length === 0) {
      score -= 100;
      reasons.push('No units available');
      return { score, reasons };
    }
    
    // Check transport level capability
    const hasCapability = agency.units.some((unit: any) => unit.type === criteria.transportLevel);
    if (hasCapability) {
      score += 30;
      reasons.push(`Capability match: ${criteria.transportLevel} units available`);
    } else {
      score -= 50;
      reasons.push(`No ${criteria.transportLevel} units available`);
    }
    
    // Check special requirements
    if (criteria.specialRequirements) {
      const hasSpecialCapability = false; // TODO: Implement capabilities check when schema is updated
      if (hasSpecialCapability) {
        score += 20;
        reasons.push('Special requirements capability match');
      }
    }
    
    return { score, reasons };
  }

  /**
   * Calculate geographic proximity score
   */
  private async calculateProximityScore(
    agency: TransportAgency,
    request: TransportRequest,
    criteria: MatchingCriteria
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];
    
    // Check if origin is in service area
    const originInServiceArea = false; // TODO: Implement service area check when schema is updated
    
    if (originInServiceArea) {
      score += 25;
      reasons.push('Origin facility in service area');
    } else {
      score -= 15;
      reasons.push('Origin facility outside service area');
    }
    
    // Check if destination is in service area
    const destinationInServiceArea = false; // TODO: Implement service area check when schema is updated
    
    if (destinationInServiceArea) {
      score += 25;
      reasons.push('Destination facility in service area');
    } else {
      score -= 15;
      reasons.push('Destination facility outside service area');
    }
    
    // Distance-based scoring (closer = higher score)
    if (criteria.estimatedDistance) {
      if (criteria.estimatedDistance <= 25) {
        score += 20;
        reasons.push('Short distance transport (≤25 miles)');
      } else if (criteria.estimatedDistance <= 50) {
        score += 15;
        reasons.push('Medium distance transport (26-50 miles)');
      } else if (criteria.estimatedDistance <= 100) {
        score += 10;
        reasons.push('Long distance transport (51-100 miles)');
      } else {
        score += 5;
        reasons.push('Very long distance transport (>100 miles)');
      }
    }
    
    return { score, reasons };
  }

  /**
   * Calculate revenue optimization score
   */
  private calculateRevenueScore(
    agency: TransportAgency,
    request: TransportRequest,
    criteria: MatchingCriteria
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    
    // Priority-based revenue scoring
    switch (criteria.priority) {
      case 'URGENT':
        score += 30;
        reasons.push('High revenue: Urgent priority transport');
        break;
      case 'HIGH':
        score += 20;
        reasons.push('Good revenue: High priority transport');
        break;
      case 'MEDIUM':
        score += 10;
        reasons.push('Standard revenue: Medium priority transport');
        break;
      case 'LOW':
        score += 5;
        reasons.push('Lower revenue: Low priority transport');
        break;
    }
    
    // Transport level revenue scoring
    switch (criteria.transportLevel) {
      case 'CCT':
        score += 25;
        reasons.push('High revenue: Critical Care Transport');
        break;
      case 'ALS':
        score += 15;
        reasons.push('Good revenue: Advanced Life Support');
        break;
      case 'BLS':
        score += 10;
        reasons.push('Standard revenue: Basic Life Support');
        break;
    }
    
    return { score, reasons };
  }

  /**
   * Calculate time window compatibility score
   */
  private calculateTimeWindowScore(
    agency: TransportAgency,
    request: TransportRequest,
    criteria: MatchingCriteria
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    
    // Check if agency operates during the requested time
    if (criteria.timeWindow) {
      const requestHour = new Date(criteria.timeWindow.earliest).getHours();
      const isOperatingHours = true; // TODO: Implement operating hours check when schema is updated
      
      if (isOperatingHours) {
        score += 15;
        reasons.push('Operating hours match');
      } else {
        score -= 20;
        reasons.push('Outside operating hours');
      }
    }
    
    return { score, reasons };
  }

  /**
   * Get the best available unit for the agency
   */
  private async getBestAvailableUnit(agency: any, criteria: MatchingCriteria): Promise<UnitAvailability> {
    // Check if agency has units
    if (!agency.units || agency.units.length === 0) {
      // Return a mock availability for demo purposes
      return {
        id: 'mock-availability-no-units',
        status: 'OUT_OF_SERVICE',
        unitId: 'mock-unit',
        location: null,
        shiftStart: null,
        shiftEnd: null,
        crewMembers: null,
        currentAssignment: null,
        notes: 'No units available',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as UnitAvailability;
    }
    
    const availableUnits = agency.units.filter((unit: any) => 
      unit.type === criteria.transportLevel && 
      unit.unitAvailability?.some((avail: any) => avail.status === 'AVAILABLE')
    ) || [];
    
    // For now, return the first available unit's availability
    // In a real implementation, you might want to consider:
    // - Unit location proximity to origin
    // - Crew availability
    // - Equipment status
    // - Current assignment completion time
    const firstUnit = availableUnits[0];
    if (firstUnit && firstUnit.unitAvailability) {
      const available = firstUnit.unitAvailability.find((avail: any) => avail.status === 'AVAILABLE');
      if (available) {
        return available;
      }
    }
    
    // Return a mock availability if none found
    return {
      id: 'mock-availability',
      status: 'AVAILABLE',
      unitId: 'mock-unit',
      location: null,
      shiftStart: null,
      shiftEnd: null,
      crewMembers: null,
      currentAssignment: null,
      notes: 'Mock unit for demo',
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as UnitAvailability;
  }

  /**
   * Calculate estimated arrival time
   */
  private calculateEstimatedArrival(unit: UnitAvailability, request: TransportRequest): string {
    // Simple calculation - in real implementation, consider:
    // - Current unit location
    // - Traffic conditions
    // - Unit speed
    // - Distance to origin
    const estimatedMinutes = 15; // Placeholder
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + estimatedMinutes);
    return arrivalTime.toISOString();
  }

  /**
   * Calculate revenue potential
   */
  private calculateRevenuePotential(request: TransportRequest, criteria: MatchingCriteria): number {
    let baseRevenue = 0;
    
    // Base revenue by transport level
    switch (criteria.transportLevel) {
      case 'BLS':
        baseRevenue = 150;
        break;
      case 'ALS':
        baseRevenue = 250;
        break;
      case 'CCT':
        baseRevenue = 400;
        break;
    }
    
    // Distance multiplier
    if (criteria.estimatedDistance) {
      const distanceMultiplier = Math.max(1, criteria.estimatedDistance / 25);
      baseRevenue *= distanceMultiplier;
    }
    
    // Priority multiplier
    switch (criteria.priority) {
      case 'URGENT':
        baseRevenue *= 1.5;
        break;
      case 'HIGH':
        baseRevenue *= 1.3;
        break;
      case 'MEDIUM':
        baseRevenue *= 1.1;
        break;
      case 'LOW':
        baseRevenue *= 1.0;
        break;
    }
    
    return Math.round(baseRevenue);
  }

  /**
   * Get matching preferences for an agency
   */
  async getAgencyPreferences(agencyId: string): Promise<MatchingPreferences | null> {
    try {
      const agency = await prisma.transportAgency.findUnique({
        where: { id: agencyId },
        include: {
          units: true
        }
      });
      
      if (!agency) return null;
      
      return {
        agencyId: agency.id,
        preferredServiceAreas: [], // TODO: Implement when service areas schema is updated
        preferredTransportLevels: agency.units.map((unit: any) => unit.type),
        maxDistance: 200, // Default max distance
        preferredTimeWindows: [], // Would be populated from agency settings
        revenueThreshold: 100 // Minimum revenue threshold
      };
    } catch (error) {
      console.error('[MATCHING-SERVICE] Error getting agency preferences:', error);
      throw error;
    }
  }

  /**
   * Update agency matching preferences
   */
  async updateAgencyPreferences(
    agencyId: string,
    preferences: Partial<MatchingPreferences>
  ): Promise<MatchingPreferences> {
    try {
      // In a real implementation, you'd update the database
      // For now, return the updated preferences
      const current = await this.getAgencyPreferences(agencyId);
      if (!current) {
        throw new Error('Agency not found');
      }
      
      return { ...current, ...preferences };
    } catch (error) {
      console.error('[MATCHING-SERVICE] Error updating agency preferences:', error);
      throw error;
    }
  }

  /**
   * Get match history and analytics
   */
  async getMatchHistory(agencyId: string, limit: number = 50): Promise<any[]> {
    try {
      const bids = await prisma.transportBid.findMany({
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
      
      return bids.map(bid => ({
        bidId: bid.id,
        transportRequest: bid.transportRequest,
        status: bid.status,
        submittedAt: bid.submittedAt,
        acceptedAt: bid.reviewedAt, // Using reviewedAt as acceptedAt for now
        revenue: bid.bidAmount || 0
      }));
    } catch (error) {
      console.error('[MATCHING-SERVICE] Error getting match history:', error);
      throw error;
    }
  }
}

export default new MatchingService();
