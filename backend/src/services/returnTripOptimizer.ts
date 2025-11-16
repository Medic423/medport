/**
 * Return Trip Optimizer Service
 * Finds multi-leg return trip sequences to minimize deadhead miles
 * while generating revenue on the return journey to home base.
 */

import { DistanceService } from './distanceService';
import { databaseManager } from './databaseManager';

const prisma = databaseManager.getPrismaClient();

export interface Location {
  lat: number;
  lng: number;
}

export interface TripOpportunity {
  tripId: string;
  patientId: string;
  transportLevel: string;
  urgencyLevel: string;
  priority: string;
  status: string;
  pickup: {
    name: string;
    lat: number;
    lng: number;
    distanceFromPrevious: number;
  };
  dropoff: {
    name: string;
    lat: number;
    lng: number;
    distanceToNext: number;
  };
  estimatedRevenue: number;
  tripDistance: number;
}

export interface ReturnTripSequence {
  legs: TripOpportunity[];
  totalRevenue: number;
  totalDistance: number;
  deadheadSavings: number;
  efficiencyScore: number;
  route: {
    startLocation: Location;
    endLocation: Location;
    legDistances: number[];
    totalDeadheadMiles: number;
  };
}

export class ReturnTripOptimizer {
  /**
   * Estimate revenue based on transport level
   */
  private estimateRevenue(transportLevel: string, tripDistance: number): number {
    // Base rates per mile by transport level
    const rates: { [key: string]: number } = {
      'BLS': 8.50,   // Basic Life Support
      'ALS': 12.00,  // Advanced Life Support
      'CCT': 15.00   // Critical Care Transport
    };

    const ratePerMile = rates[transportLevel] || rates['BLS'];
    const baseRate = transportLevel === 'BLS' ? 150 : transportLevel === 'ALS' ? 250 : 350;
    
    return baseRate + (tripDistance * ratePerMile);
  }

  /**
   * Calculate deadhead cost per mile
   */
  private calculateDeadheadCost(distance: number): number {
    return distance * 2.0; // $2 per mile deadhead cost
  }

  /**
   * Find all single-leg return trip opportunities
   */
  async findSingleLegOpportunities(
    currentLocation: Location,
    homeBase: Location,
    proximityRadius: number,
    availableTrips: any[]
  ): Promise<TripOpportunity[]> {
    const opportunities: TripOpportunity[] = [];

    for (const trip of availableTrips) {
      // Get pickup coordinates (origin)
      let pickupLat: number | null = null;
      let pickupLng: number | null = null;
      let pickupName: string = 'Unknown';

      if (trip.originFacility?.latitude && trip.originFacility?.longitude) {
        pickupLat = trip.originFacility.latitude;
        pickupLng = trip.originFacility.longitude;
        pickupName = trip.originFacility.name || 'Unknown';
      } else if (trip.healthcareLocation?.latitude && trip.healthcareLocation?.longitude) {
        pickupLat = trip.healthcareLocation.latitude;
        pickupLng = trip.healthcareLocation.longitude;
        pickupName = trip.healthcareLocation.locationName || 'Unknown';
      }

      // Get dropoff coordinates (destination)
      let dropoffLat: number | null = null;
      let dropoffLng: number | null = null;
      let dropoffName: string = 'Unknown';

      if (trip.destinationFacility?.latitude && trip.destinationFacility?.longitude) {
        dropoffLat = trip.destinationFacility.latitude;
        dropoffLng = trip.destinationFacility.longitude;
        dropoffName = trip.destinationFacility.name || 'Unknown';
      } else if (trip.healthcareLocation?.latitude && trip.healthcareLocation?.longitude) {
        dropoffLat = trip.healthcareLocation.latitude;
        dropoffLng = trip.healthcareLocation.longitude;
        dropoffName = trip.healthcareLocation.locationName || 'Unknown';
      }

      // Skip if we don't have coordinates
      if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
        continue;
      }

      // Calculate distances
      const pickupToCurrent = DistanceService.calculateDistance(
        { latitude: pickupLat, longitude: pickupLng },
        { latitude: currentLocation.lat, longitude: currentLocation.lng }
      );

      const dropoffToHome = DistanceService.calculateDistance(
        { latitude: dropoffLat, longitude: dropoffLng },
        { latitude: homeBase.lat, longitude: homeBase.lng }
      );

      const tripDistance = DistanceService.calculateDistance(
        { latitude: pickupLat, longitude: pickupLng },
        { latitude: dropoffLat, longitude: dropoffLng }
      );

      // Check if trip meets proximity criteria
      if (pickupToCurrent <= proximityRadius && dropoffToHome <= proximityRadius) {
        const revenue = this.estimateRevenue(trip.transportLevel, tripDistance);

        opportunities.push({
          tripId: trip.id,
          patientId: trip.patientId,
          transportLevel: trip.transportLevel,
          urgencyLevel: trip.urgencyLevel,
          priority: trip.priority,
          status: trip.status,
          pickup: {
            name: pickupName,
            lat: pickupLat,
            lng: pickupLng,
            distanceFromPrevious: Math.round(pickupToCurrent * 10) / 10
          },
          dropoff: {
            name: dropoffName,
            lat: dropoffLat,
            lng: dropoffLng,
            distanceToNext: Math.round(dropoffToHome * 10) / 10
          },
          estimatedRevenue: revenue,
          tripDistance: Math.round(tripDistance * 10) / 10
        });
      }
    }

    return opportunities;
  }

  /**
   * Find multi-leg return trip sequences
   * Uses recursive backtracking to find sequences of trips
   */
  async findMultiLegSequences(
    currentLocation: Location,
    homeBase: Location,
    proximityRadius: number,
    maxLegs: number,
    availableTrips: any[]
  ): Promise<ReturnTripSequence[]> {
    // First, get all single-leg opportunities
    const singleLegOpportunities = await this.findSingleLegOpportunities(
      currentLocation,
      homeBase,
      proximityRadius,
      availableTrips
    );

    const sequences: ReturnTripSequence[] = [];

    // Helper function to recursively build sequences
    const buildSequence = (
      currentPos: Location,
      legs: TripOpportunity[],
      remainingTrips: TripOpportunity[],
      usedTripIds: Set<string>
    ): void => {
      // Check if current position (dropoff of last leg) is close to home base
      const distanceToHome = DistanceService.calculateDistance(
        { latitude: currentPos.lat, longitude: currentPos.lng },
        { latitude: homeBase.lat, longitude: homeBase.lng }
      );

      // If we're close enough to home base and have at least one leg, save this sequence
      if (distanceToHome <= proximityRadius && legs.length > 0) {
        // Calculate sequence metrics
        const totalRevenue = legs.reduce((sum, leg) => sum + leg.estimatedRevenue, 0);
        const totalDistance = legs.reduce((sum, leg) => {
          return sum + leg.pickup.distanceFromPrevious + leg.tripDistance + leg.dropoff.distanceToNext;
        }, 0);

        // Calculate deadhead savings vs direct return
        const directReturnDistance = DistanceService.calculateDistance(
          { latitude: currentLocation.lat, longitude: currentLocation.lng },
          { latitude: homeBase.lat, longitude: homeBase.lng }
        );
        const totalTripDistance = legs.reduce((sum, leg) => sum + leg.tripDistance, 0);
        const totalDeadheadMiles = totalDistance - totalTripDistance;
        const deadheadSavings = directReturnDistance - totalDeadheadMiles;

        // Calculate efficiency score
        const deadheadCost = this.calculateDeadheadCost(totalDeadheadMiles);
        const efficiencyScore = totalDistance > 0 ? (totalRevenue - deadheadCost) / totalDistance : 0;

        sequences.push({
          legs: [...legs],
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalDistance: Math.round(totalDistance * 10) / 10,
          deadheadSavings: Math.round(deadheadSavings * 10) / 10,
          efficiencyScore: Math.round(efficiencyScore * 100) / 100,
          route: {
            startLocation: currentLocation,
            endLocation: homeBase,
            legDistances: legs.map(leg => leg.pickup.distanceFromPrevious + leg.tripDistance + leg.dropoff.distanceToNext),
            totalDeadheadMiles: Math.round(totalDeadheadMiles * 10) / 10
          }
        });
      }

      // Stop if we've reached max legs
      if (legs.length >= maxLegs) {
        return;
      }

      // Find next trips that start near current position
      for (const trip of remainingTrips) {
        if (usedTripIds.has(trip.tripId)) {
          continue;
        }

        const distanceToPickup = DistanceService.calculateDistance(
          { latitude: currentPos.lat, longitude: currentPos.lng },
          { latitude: trip.pickup.lat, longitude: trip.pickup.lng }
        );

        // If pickup is within proximity, add this trip to sequence
        if (distanceToPickup <= proximityRadius) {
          // Update trip with distance from previous location
          const updatedTrip: TripOpportunity = {
            ...trip,
            pickup: {
              ...trip.pickup,
              distanceFromPrevious: Math.round(distanceToPickup * 10) / 10
            }
          };

          // Recalculate dropoff distance to home
          const dropoffToHome = DistanceService.calculateDistance(
            { latitude: trip.dropoff.lat, longitude: trip.dropoff.lng },
            { latitude: homeBase.lat, longitude: homeBase.lng }
          );
          updatedTrip.dropoff.distanceToNext = Math.round(dropoffToHome * 10) / 10;

          // Create new set for this branch to avoid sharing state
          const newUsedTripIds = new Set(usedTripIds);
          newUsedTripIds.add(trip.tripId);

          buildSequence(
            { lat: trip.dropoff.lat, lng: trip.dropoff.lng },
            [...legs, updatedTrip],
            remainingTrips.filter(t => t.tripId !== trip.tripId),
            newUsedTripIds
          );
        }
      }
    };

    // Start building sequences from current location
    buildSequence(currentLocation, [], singleLegOpportunities, new Set<string>());

    // Sort by efficiency score (highest first)
    sequences.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    // Limit to top 20 sequences to avoid overwhelming the frontend
    return sequences.slice(0, 20);
  }

  /**
   * Calculate total route distance for a sequence
   */
  calculateTotalRouteDistance(sequence: ReturnTripSequence): number {
    return sequence.route.legDistances.reduce((sum, dist) => sum + dist, 0);
  }

  /**
   * Calculate deadhead savings for a sequence
   */
  calculateDeadheadSavings(
    startLocation: Location,
    endLocation: Location,
    sequence: ReturnTripSequence
  ): number {
    const directReturnDistance = DistanceService.calculateDistance(
      { latitude: startLocation.lat, longitude: startLocation.lng },
      { latitude: endLocation.lat, longitude: endLocation.lng }
    );

    const totalDeadheadMiles = sequence.route.totalDeadheadMiles;
    return directReturnDistance - totalDeadheadMiles;
  }
}

export const returnTripOptimizer = new ReturnTripOptimizer();

