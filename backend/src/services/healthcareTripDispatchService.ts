import { databaseManager } from './databaseManager';
import { DistanceService } from './distanceService';

const prisma = databaseManager.getPrismaClient();

export interface TripAgencyInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  capabilities: string[];
  isRegistered: boolean;  // Has account in system
  isPreferred: boolean;   // Marked as preferred by user
  distance: number | null; // Miles from origin (if calculated)
  unitType?: string;
  unitNumber?: string;
}

export interface TripAgenciesResult {
  agencies: TripAgencyInfo[];
  preferredCount: number;
  geographicCount: number;
  userAgenciesCount: number;
}

export interface DispatchRequest {
  agencyIds: string[];
  dispatchMode: 'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID';
  notificationRadius?: number;
}

export class HealthcareTripDispatchService {
  /**
   * Get available agencies for a specific trip
   * Combines registered agencies and user's added agencies
   */
  async getTripAgencies(
    tripId: string,
    healthcareUserId: string,
    dispatchMode?: 'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID',
    notificationRadius?: number
  ): Promise<TripAgenciesResult> {
    console.log('PHASE3_DEBUG: Getting agencies for trip:', tripId, 'Mode:', dispatchMode);
    
    try {
      // Get trip details (especially origin location for geographic filtering)
      const trip = await prisma.transportRequest.findUnique({
        where: { id: tripId },
        include: {
          healthcareLocation: {
            select: {
              id: true,
              locationName: true,
              latitude: true,
              longitude: true,
              address: true,
              city: true,
              state: true
            }
          }
        }
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Verify trip belongs to this healthcare user
      if ((trip as any).healthcareCreatedById !== healthcareUserId) {
        throw new Error('Trip does not belong to this healthcare user');
      }

      const originCoords = trip.healthcareLocation 
        ? { lat: trip.healthcareLocation.latitude, lng: trip.healthcareLocation.longitude }
        : null;

      console.log('PHASE3_DEBUG: Trip origin location:', trip.healthcareLocation?.locationName, 'Coords:', originCoords);

      // Get all registered agencies (from EMSAgency)
      const registeredAgencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true,
          acceptsNotifications: true
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          state: true,
          capabilities: true,
          latitude: true,
          longitude: true,
          totalUnits: true
        }
      });

      // Get user's added agencies with preference status
      const userAgencies = await prisma.eMSAgency.findMany({
        where: {
          addedBy: healthcareUserId,
          isActive: true
        },
        include: {
          healthcarePreferences: {
            where: {
              healthcareUserId: healthcareUserId
            },
            select: {
              isPreferred: true
            }
          }
        }
      });

      console.log('PHASE3_DEBUG: Found registered agencies:', registeredAgencies.length);
      console.log('PHASE3_DEBUG: Found user agencies:', userAgencies.length);

      // Create a map of agencies by ID to deduplicate
      const agencyMap = new Map<string, TripAgencyInfo>();

      // Add registered agencies (these are agencies with accounts in the system)
      for (const agency of registeredAgencies) {
        let distance: number | null = null;

        // Calculate distance if we have origin coordinates
        if (originCoords && agency.latitude && agency.longitude) {
          distance = DistanceService.calculateDistance(
            { latitude: agency.latitude, longitude: agency.longitude },
            { latitude: originCoords.lat!, longitude: originCoords.lng! }
          );
        }

        agencyMap.set(agency.id, {
          id: agency.id,
          name: agency.name,
          phone: agency.phone,
          email: agency.email,
          address: agency.address,
          city: agency.city,
          state: agency.state,
          capabilities: agency.capabilities,
          isRegistered: true,
          isPreferred: false, // Will be updated if user has preference
          distance: distance,
          unitNumber: agency.totalUnits > 0 ? `${agency.totalUnits} units` : undefined
        });
      }

      // Add user's added agencies (these might overlap with registered agencies)
      for (const agency of userAgencies) {
        const isPreferred = agency.healthcarePreferences?.[0]?.isPreferred || false;
        const isRegistered = agencyMap.has(agency.id);

        // If already in map, just update the isPreferred flag
        if (isRegistered) {
          const existingAgency = agencyMap.get(agency.id)!;
          existingAgency.isPreferred = isPreferred;
        } else {
          // New agency - add it
          let distance: number | null = null;

          // Calculate distance if we have origin coordinates
          if (originCoords && agency.latitude && agency.longitude) {
            distance = DistanceService.calculateDistance(
              { latitude: agency.latitude, longitude: agency.longitude },
              { latitude: originCoords.lat!, longitude: originCoords.lng! }
            );
          }

          agencyMap.set(agency.id, {
            id: agency.id,
            name: agency.name,
            phone: agency.phone,
            email: agency.email,
            address: agency.address,
            city: agency.city,
            state: agency.state,
            capabilities: agency.capabilities,
            isRegistered: false, // This is a user-added agency
            isPreferred: isPreferred,
            distance: distance
          });
        }
      }

      // Convert map to array
      let allAgencies = Array.from(agencyMap.values());

      // Apply mode-specific filtering
      const preferredCount = allAgencies.filter(a => a.isPreferred).length;
      const userAgenciesCount = allAgencies.filter(a => !a.isRegistered).length;

      // Apply geographic filtering based on dispatch mode
      if (dispatchMode === 'GEOGRAPHIC' || dispatchMode === 'HYBRID') {
        const radius = notificationRadius || 100;
        
        // Keep preferred agencies and user agencies regardless of distance
        // Filter registered agencies by distance
        allAgencies = allAgencies.filter(agency => {
          // User agencies and preferred agencies always shown
          if (!agency.isRegistered || agency.isPreferred) {
            return true;
          }
          // Registered agencies filtered by distance
          return agency.distance !== null && agency.distance <= radius;
        });
      } else if (dispatchMode === 'PREFERRED') {
        // Only show preferred agencies
        allAgencies = allAgencies.filter(a => a.isPreferred);
      }

      // Sort: preferred first, then by distance
      allAgencies.sort((a, b) => {
        if (a.isPreferred !== b.isPreferred) {
          return a.isPreferred ? -1 : 1;
        }
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });

      const geographicCount = allAgencies.filter(a => 
        a.isRegistered && !a.isPreferred && 
        (dispatchMode !== 'GEOGRAPHIC' && dispatchMode !== 'HYBRID' || 
         (a.distance !== null && a.distance <= (notificationRadius || 100)))
      ).length;

      console.log('PHASE3_DEBUG: Returning agencies:', allAgencies.length, 'Preferred:', preferredCount, 'Geographic:', geographicCount);

      return {
        agencies: allAgencies,
        preferredCount,
        geographicCount,
        userAgenciesCount
      };
    } catch (error) {
      console.error('PHASE3_DEBUG: Error getting trip agencies:', error);
      throw error;
    }
  }

  /**
   * Dispatch trip to selected agencies
   */
  async dispatchTrip(
    tripId: string,
    healthcareUserId: string,
    dispatchData: DispatchRequest
  ): Promise<{ tripId: string; dispatchedTo: number; responses: any[] }> {
    console.log('PHASE3_DEBUG: Dispatching trip:', tripId, 'to agencies:', dispatchData.agencyIds);

    try {
      // Get trip and validate it exists and belongs to healthcare user
      const trip = await prisma.transportRequest.findUnique({
        where: { id: tripId },
        include: {
          healthcareLocation: true,
          destinationFacility: true,
          pickupLocation: true
        }
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Verify trip belongs to this healthcare user
      if ((trip as any).healthcareCreatedById !== healthcareUserId) {
        throw new Error('Trip does not belong to this healthcare user');
      }

      // Verify trip status is PENDING_DISPATCH
      if (trip.status !== 'PENDING_DISPATCH') {
        throw new Error(`Trip status must be PENDING_DISPATCH, but is ${trip.status}`);
      }

      // Validate all selected agencies belong to user OR are registered
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          id: { in: dispatchData.agencyIds },
          isActive: true
        }
      });

      if (agencies.length !== dispatchData.agencyIds.length) {
        throw new Error('One or more agencies not found');
      }

      // Create agency responses for each selected agency
      const responses = await Promise.all(
        dispatchData.agencyIds.map(agencyId => 
          prisma.agencyResponse.create({
            data: {
              tripId: tripId,
              agencyId: agencyId,
              response: 'PENDING', // Agencies haven't responded yet
              responseTimestamp: new Date(),
              isSelected: false
            }
          })
        )
      );

      console.log('PHASE3_DEBUG: Created', responses.length, 'agency responses');

      // Update trip status to PENDING (awaiting agency response)
      await prisma.transportRequest.update({
        where: { id: tripId },
        data: {
          status: 'PENDING',
          selectedAgencies: dispatchData.agencyIds
        }
      });

      console.log('PHASE3_DEBUG: Trip status updated to PENDING');

      // TODO: Send notifications to selected agencies
      // This would use the notification service to email/SMS agencies
      // For now, we'll log it
      console.log('PHASE3_DEBUG: TODO - Send notifications to agencies:', dispatchData.agencyIds);

      return {
        tripId,
        dispatchedTo: responses.length,
        responses: responses.map(r => ({
          id: r.id,
          agencyId: r.agencyId,
          tripId: r.tripId,
          response: r.response
        }))
      };
    } catch (error) {
      console.error('PHASE3_DEBUG: Error dispatching trip:', error);
      throw error;
    }
  }
}

export const healthcareTripDispatchService = new HealthcareTripDispatchService();

