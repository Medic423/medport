import { TransportRequest, BackhaulPair } from './revenueOptimizer';

export class BackhaulDetector {
  private maxTimeWindow: number; // minutes
  private maxDistance: number; // miles
  private revenueBonus: number;

  constructor(
    maxTimeWindow: number = 90, // 90 minutes as per reference documents
    maxDistance: number = 15,   // 15 miles as per reference documents
    revenueBonus: number = 25.0 // $25 bonus for backhaul pairs
  ) {
    this.maxTimeWindow = maxTimeWindow;
    this.maxDistance = maxDistance;
    this.revenueBonus = revenueBonus;
  }

  /**
   * Find all possible backhaul pairs from a list of requests
   */
  findPairs(requests: TransportRequest[]): BackhaulPair[] {
    const pairs: BackhaulPair[] = [];
    
    // Only consider pending requests
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    
    // Generate all possible pairs
    for (let i = 0; i < pendingRequests.length; i++) {
      for (let j = i + 1; j < pendingRequests.length; j++) {
        const request1 = pendingRequests[i];
        const request2 = pendingRequests[j];
        
        const pair = this.createPair(request1, request2);
        if (pair && this.isValidPair(pair)) {
          pairs.push(pair);
        }
      }
    }
    
    // Sort by efficiency (highest first)
    return pairs.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Create a backhaul pair from two requests
   */
  private createPair(request1: TransportRequest, request2: TransportRequest): BackhaulPair | null {
    // Check for return trip scenario (destination of one matches origin of another)
    const isReturnTrip = this.isReturnTripScenario(request1, request2);
    
    let distance: number;
    if (isReturnTrip) {
      // For return trips, calculate distance from destination of first to origin of second
      distance = this.calculateDistance(
        request1.destinationLocation,
        request2.originLocation
      );
    } else {
      // For regular backhaul, calculate distance between destinations
      distance = this.calculateDistance(
        request1.destinationLocation,
        request2.destinationLocation
      );
    }

    // Calculate time window between ready times
    const timeWindow = this.calculateTimeWindow(request1, request2);

    // Calculate efficiency score (return trips get bonus)
    const efficiency = this.calculateEfficiency(request1, request2, distance, timeWindow, isReturnTrip);

    return {
      request1,
      request2,
      distance,
      timeWindow,
      revenueBonus: isReturnTrip ? this.revenueBonus * 1.5 : this.revenueBonus, // 50% bonus for return trips
      efficiency
    };
  }

  /**
   * Validate if a pair meets backhaul criteria
   */
  isValidPair(pair: BackhaulPair): boolean {
    return (
      pair.distance <= this.maxDistance &&
      pair.timeWindow <= this.maxTimeWindow &&
      this.hasCompatibleTransportLevels(pair.request1, pair.request2)
    );
  }

  /**
   * Check if two requests have compatible transport levels
   */
  private hasCompatibleTransportLevels(request1: TransportRequest, request2: TransportRequest): boolean {
    // For backhaul pairs, we need compatible transport levels
    // BLS can pair with BLS, ALS can pair with ALS or BLS, CCT can pair with any
    const levels = [request1.transportLevel, request2.transportLevel];
    
    if (levels.includes('CCT')) {
      return true; // CCT can handle any level
    }
    
    if (levels.includes('ALS')) {
      return true; // ALS can handle BLS or ALS
    }
    
    return levels.every(level => level === 'BLS'); // Both must be BLS
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate time window between two requests
   */
  private calculateTimeWindow(request1: TransportRequest, request2: TransportRequest): number {
    const time1 = request1.readyStart.getTime();
    const time2 = request2.readyStart.getTime();
    
    return Math.abs(time2 - time1) / (1000 * 60); // Convert to minutes
  }

  /**
   * Check if this is a return trip scenario (destination of one matches origin of another)
   */
  private isReturnTripScenario(request1: TransportRequest, request2: TransportRequest): boolean {
    // Check if destination of request1 matches origin of request2 (or vice versa)
    const dest1MatchesOrigin2 = this.locationsMatch(request1.destinationLocation, request2.originLocation);
    const dest2MatchesOrigin1 = this.locationsMatch(request2.destinationLocation, request1.originLocation);
    
    return dest1MatchesOrigin2 || dest2MatchesOrigin1;
  }

  /**
   * Check if two locations match (within 1 mile tolerance for GPS precision)
   */
  private locationsMatch(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): boolean {
    const distance = this.calculateDistance(loc1, loc2);
    return distance <= 1.0; // Within 1 mile = same location
  }

  /**
   * Calculate efficiency score for a backhaul pair
   * Higher efficiency = better pairing
   */
  private calculateEfficiency(
    request1: TransportRequest, 
    request2: TransportRequest, 
    distance: number, 
    timeWindow: number,
    isReturnTrip: boolean = false
  ): number {
    // Base efficiency from distance (closer = better)
    const distanceScore = Math.max(0, (this.maxDistance - distance) / this.maxDistance);
    
    // Time window efficiency (shorter window = better)
    const timeScore = Math.max(0, (this.maxTimeWindow - timeWindow) / this.maxTimeWindow);
    
    // Priority bonus (higher priority = better)
    const priorityScore = this.calculatePriorityScore(request1, request2);
    
    // Revenue potential (higher revenue = better)
    const revenueScore = this.calculateRevenueScore(request1, request2);
    
    // Return trip bonus (return trips are highly efficient)
    const returnTripBonus = isReturnTrip ? 0.3 : 0;
    
    // Weighted combination with return trip bonus
    return (distanceScore * 0.25 + timeScore * 0.15 + priorityScore * 0.25 + revenueScore * 0.15 + returnTripBonus);
  }

  /**
   * Calculate priority score for a pair
   */
  private calculatePriorityScore(request1: TransportRequest, request2: TransportRequest): number {
    const priorityValues = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'URGENT': 4
    };
    
    const priority1 = priorityValues[request1.priority as keyof typeof priorityValues] || 1;
    const priority2 = priorityValues[request2.priority as keyof typeof priorityValues] || 1;
    
    // Average priority, normalized to 0-1
    return (priority1 + priority2) / 8; // Max possible is 8 (4+4)
  }

  /**
   * Calculate revenue score for a pair
   */
  private calculateRevenueScore(request1: TransportRequest, request2: TransportRequest): number {
    const baseRates = {
      'BLS': 150.0,
      'ALS': 250.0,
      'CCT': 400.0
    };
    
    const revenue1 = baseRates[request1.transportLevel as keyof typeof baseRates] || 150.0;
    const revenue2 = baseRates[request2.transportLevel as keyof typeof baseRates] || 150.0;
    
    // Normalize to 0-1 (assuming max revenue is 400)
    return (revenue1 + revenue2) / 800;
  }

  /**
   * Find the best backhaul pairs for a specific request
   */
  findBestPairsForRequest(request: TransportRequest, allRequests: TransportRequest[]): BackhaulPair[] {
    const otherRequests = allRequests.filter(req => 
      req.id !== request.id && req.status === 'PENDING'
    );
    
    const pairs: BackhaulPair[] = [];
    
    for (const otherRequest of otherRequests) {
      const pair = this.createPair(request, otherRequest);
      if (pair && this.isValidPair(pair)) {
        pairs.push(pair);
      }
    }
    
    return pairs.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Find return trip opportunities for a specific request
   * This looks for requests that would bring the unit back to the original area
   */
  findReturnTripOpportunities(request: TransportRequest, allRequests: TransportRequest[]): BackhaulPair[] {
    const otherRequests = allRequests.filter(req => 
      req.id !== request.id && req.status === 'PENDING'
    );
    
    const returnTrips: BackhaulPair[] = [];
    
    for (const otherRequest of otherRequests) {
      // Check if this would be a return trip
      const isReturnTrip = this.isReturnTripScenario(request, otherRequest);
      
      if (isReturnTrip) {
        const pair = this.createPair(request, otherRequest);
        if (pair && this.isValidPair(pair)) {
          returnTrips.push(pair);
        }
      }
    }
    
    return returnTrips.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Find all return trip opportunities in the system
   * This is specifically for scenarios like Altoona → Pittsburgh → Altoona
   */
  findAllReturnTripOpportunities(allRequests: TransportRequest[]): BackhaulPair[] {
    const pendingRequests = allRequests.filter(req => req.status === 'PENDING');
    const returnTrips: BackhaulPair[] = [];
    
    for (let i = 0; i < pendingRequests.length; i++) {
      for (let j = i + 1; j < pendingRequests.length; j++) {
        const request1 = pendingRequests[i];
        const request2 = pendingRequests[j];
        
        const isReturnTrip = this.isReturnTripScenario(request1, request2);
        if (isReturnTrip) {
          const pair = this.createPair(request1, request2);
          if (pair && this.isValidPair(pair)) {
            returnTrips.push(pair);
          }
        }
      }
    }
    
    return returnTrips.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Calculate potential revenue increase from backhaul pairing
   */
  calculatePairingRevenue(pair: BackhaulPair): number {
    // Base revenue from both requests
    const baseRevenue = this.calculateBaseRevenue(pair.request1) + this.calculateBaseRevenue(pair.request2);
    
    // Add backhaul bonus
    const totalRevenue = baseRevenue + pair.revenueBonus;
    
    // Calculate efficiency multiplier (better pairs get higher multiplier)
    const efficiencyMultiplier = 1 + (pair.efficiency * 0.2); // Up to 20% bonus
    
    return Math.round(totalRevenue * efficiencyMultiplier * 100) / 100;
  }

  /**
   * Calculate base revenue for a request
   */
  private calculateBaseRevenue(request: TransportRequest): number {
    const baseRates = {
      'BLS': 150.0,
      'ALS': 250.0,
      'CCT': 400.0
    };
    
    const baseRate = baseRates[request.transportLevel as keyof typeof baseRates] || 150.0;
    
    // Priority multipliers
    const priorityMultipliers = {
      'LOW': 1.0,
      'MEDIUM': 1.1,
      'HIGH': 1.25,
      'URGENT': 1.5
    };
    
    const priorityMultiplier = priorityMultipliers[request.priority as keyof typeof priorityMultipliers] || 1.0;
    
    return baseRate * priorityMultiplier;
  }

  /**
   * Get statistics about backhaul opportunities
   */
  getBackhaulStatistics(requests: TransportRequest[]): {
    totalRequests: number;
    possiblePairs: number;
    validPairs: number;
    averageEfficiency: number;
    potentialRevenueIncrease: number;
  } {
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const pairs = this.findPairs(pendingRequests);
    
    const totalRequests = pendingRequests.length;
    const possiblePairs = (totalRequests * (totalRequests - 1)) / 2;
    const validPairs = pairs.length;
    const averageEfficiency = pairs.length > 0 
      ? pairs.reduce((sum, pair) => sum + pair.efficiency, 0) / pairs.length 
      : 0;
    
    const potentialRevenueIncrease = pairs.reduce((sum, pair) => 
      sum + this.calculatePairingRevenue(pair), 0
    );
    
    return {
      totalRequests,
      possiblePairs,
      validPairs,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      potentialRevenueIncrease: Math.round(potentialRevenueIncrease * 100) / 100
    };
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Update detection parameters
   */
  updateParameters(maxTimeWindow?: number, maxDistance?: number, revenueBonus?: number): void {
    if (maxTimeWindow !== undefined) this.maxTimeWindow = maxTimeWindow;
    if (maxDistance !== undefined) this.maxDistance = maxDistance;
    if (revenueBonus !== undefined) this.revenueBonus = revenueBonus;
  }

  /**
   * Get current parameters
   */
  getParameters(): { maxTimeWindow: number; maxDistance: number; revenueBonus: number } {
    return {
      maxTimeWindow: this.maxTimeWindow,
      maxDistance: this.maxDistance,
      revenueBonus: this.revenueBonus
    };
  }
}
