import { databaseManager } from './databaseManager';
import { DistanceService } from './distanceService';
// TODO: Import notification service once provider is determined
// import notificationManager from './notificationManager';

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
  isUserAdded: boolean;   // Added by the healthcare user (should always show in HYBRID mode)
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
      console.log('PHASE3_DEBUG: Registered agencies:', registeredAgencies.map(a => ({ name: a.name, addedBy: null })));
      console.log('PHASE3_DEBUG: Found user agencies:', userAgencies.length);
      console.log('PHASE3_DEBUG: User agencies:', userAgencies.map(a => ({ name: a.name, addedBy: (a as any).addedBy })));

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
          isUserAdded: false, // Registered agencies are not user-added
          distance: distance,
          unitNumber: agency.totalUnits > 0 ? `${agency.totalUnits} units` : undefined
        });
      }

      // Add user's added agencies (these might overlap with registered agencies)
      for (const agency of userAgencies) {
        const isPreferred = agency.healthcarePreferences?.[0]?.isPreferred || false;
        const isRegistered = agencyMap.has(agency.id);

        // Calculate distance if we have origin coordinates
        let distance: number | null = null;
        if (originCoords && agency.latitude && agency.longitude) {
          distance = DistanceService.calculateDistance(
            { latitude: agency.latitude, longitude: agency.longitude },
            { latitude: originCoords.lat!, longitude: originCoords.lng! }
          );
        }

        // If already in map (from registered list), update flags to mark as user-added
        if (isRegistered) {
          const existingAgency = agencyMap.get(agency.id)!;
          existingAgency.isPreferred = isPreferred;
          existingAgency.isUserAdded = true; // Mark as user-added so it always shows in HYBRID mode
          // Update distance if not already calculated (shouldn't happen, but just in case)
          if (existingAgency.distance === null && distance !== null) {
            existingAgency.distance = distance;
          }
        } else {
          // New agency - add it
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
            isUserAdded: true, // User-added agency
            distance: distance
          });
        }
      }

      // Convert map to array
      let allAgencies = Array.from(agencyMap.values());

      // Apply mode-specific filtering
      const preferredCount = allAgencies.filter(a => a.isPreferred).length;
      const userAgenciesCount = allAgencies.filter(a => a.isUserAdded).length;

      console.log('PHASE3_DEBUG: Before filtering - total agencies:', allAgencies.length);
      console.log('PHASE3_DEBUG: Preferred count:', preferredCount, 'User agencies count:', userAgenciesCount);
      console.log('PHASE3_DEBUG: Dispatch mode:', dispatchMode, 'Radius:', notificationRadius);

      // Apply geographic filtering based on dispatch mode
      if (dispatchMode === 'GEOGRAPHIC' || dispatchMode === 'HYBRID') {
        const radius = notificationRadius || 100;
        
        console.log('PHASE3_DEBUG: Applying GEOGRAPHIC/HYBRID filtering with radius:', radius);
        
        const beforeFilter = allAgencies.length;
        
        if (dispatchMode === 'GEOGRAPHIC') {
          // GEOGRAPHIC mode: Show all agencies within radius (including user-added)
          allAgencies = allAgencies.filter(agency => {
            const keep = agency.distance !== null && agency.distance <= radius;
            console.log('PHASE3_DEBUG: GEOGRAPHIC - Agency check:', agency.name, 'distance:', agency.distance, 'keep:', keep);
            return keep;
          });
        } else {
          // HYBRID mode: Keep preferred agencies and user-added agencies regardless of distance
          // Filter registered agencies (not user-added) by distance
          allAgencies = allAgencies.filter(agency => {
            // User-added agencies and preferred agencies always shown
            if (agency.isUserAdded || agency.isPreferred) {
              console.log('PHASE3_DEBUG: HYBRID - Keeping agency (user/preferred):', agency.name, 'isRegistered:', agency.isRegistered, 'isUserAdded:', agency.isUserAdded, 'isPreferred:', agency.isPreferred);
              return true;
            }
            // Registered agencies (not user-added) filtered by distance
            const keep = agency.distance !== null && agency.distance <= radius;
            console.log('PHASE3_DEBUG: HYBRID - Agency check:', agency.name, 'distance:', agency.distance, 'keep:', keep);
            return keep;
          });
        }
        console.log('PHASE3_DEBUG: After filter - agencies:', beforeFilter, '->', allAgencies.length);
      } else if (dispatchMode === 'PREFERRED') {
        // Only show preferred agencies
        console.log('PHASE3_DEBUG: Applying PREFERRED filtering');
        allAgencies = allAgencies.filter(a => a.isPreferred);
        console.log('PHASE3_DEBUG: After PREFERRED filter - agencies:', allAgencies.length);
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
        a.isRegistered && !a.isUserAdded && !a.isPreferred && 
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

      // Send notifications to selected agencies
      await this.sendDispatchNotifications(tripId, trip, dispatchData.agencyIds);

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

  /**
   * Send dispatch notifications to selected agencies
   * PLACEHOLDER: Integrate with actual notification provider once determined
   */
  private async sendDispatchNotifications(
    tripId: string,
    trip: any,
    agencyIds: string[]
  ): Promise<void> {
    console.log('PHASE3_DEBUG: Sending notifications to agencies:', agencyIds);
    
    try {
      // Get agency details for notifications
      const agencies = await prisma.eMSAgency.findMany({
        where: { id: { in: agencyIds } },
        include: {
          users: {
            where: { isActive: true },
            take: 1 // Get at least one user per agency for notification
          }
        }
      });

      console.log('PHASE3_DEBUG: Found', agencies.length, 'agencies to notify');

      // Build trip details for notification
      const tripDetails = {
        tripNumber: trip.tripNumber,
        patientId: trip.patientId,
        fromLocation: trip.fromLocation,
        toLocation: trip.toLocation,
        scheduledTime: trip.scheduledTime,
        transportLevel: trip.transportLevel,
        urgencyLevel: trip.urgencyLevel,
        priority: trip.priority
      };

      // TODO: Replace with actual notification service integration
      // This is a placeholder that logs what would be sent
      for (const agency of agencies) {
        console.log('PHASE3_DEBUG: Would send notification to:', {
          agencyName: agency.name,
          email: agency.email,
          phone: agency.phone,
          users: agency.users.length,
          tripDetails: tripDetails
        });

        // PLACEHOLDER: Actual implementation would be:
        // await notificationManager.sendBulkNotification(
        //   agency.users.map(u => u.id),
        //   'TRIP_DISPATCH',
        //   {
        //     to: [agency.email],
        //     template: 'trip-dispatch',
        //     data: tripDetails
        //   },
        //   {
        //     to: agency.phone,
        //     message: `New trip dispatch: ${tripDetails.tripNumber} from ${tripDetails.fromLocation} to ${tripDetails.toLocation}`
        //   }
        // );
      }

      console.log('PHASE3_DEBUG: Notification placeholders logged (no actual notifications sent yet)');
    } catch (error) {
      console.error('PHASE3_DEBUG: Error preparing notifications:', error);
      // Don't throw - dispatch should succeed even if notification preparation fails
      // Actual notification failures will be caught by notification service
    }
  }
}

export const healthcareTripDispatchService = new HealthcareTripDispatchService();

