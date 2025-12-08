/**
 * Trip SMS Service
 * Handles SMS notifications for trip creation
 * Siloed service - all SMS logic contained here
 */

import { databaseManager } from './databaseManager';
import { DistanceService } from './distanceService';
import { smsMessageComposer, TripData } from './smsMessageComposer';
import azureSMSService from './azureSMSService';

const prisma = databaseManager.getPrismaClient();

interface AgencyWithPhone {
  id: string;
  name: string;
  phone: string;
  distance: number;
}

class TripSMSService {
  /**
   * Send SMS notifications for trip creation
   * Non-blocking - errors are logged but don't throw
   */
  async sendTripCreationSMS(trip: any, notificationRadius: number): Promise<void> {
    // Check feature flag first
    if (process.env.AZURE_SMS_ENABLED !== 'true') {
      console.log('TCC_DEBUG: SMS notifications disabled via feature flag');
      return;
    }

    try {
      console.log('TCC_DEBUG: Starting SMS notification for trip:', trip.id, 'Radius:', notificationRadius);

      // Get agencies within radius
      const agencies = await this.getAgenciesWithinRadius(trip, notificationRadius);
      
      if (agencies.length === 0) {
        console.log('TCC_DEBUG: No agencies within notification radius - skipping SMS');
        return;
      }

      console.log('TCC_DEBUG: Found', agencies.length, 'agencies within radius for SMS notification');

      // Compose message from trip data
      const tripData: TripData = {
        tripNumber: trip.tripNumber || null,
        patientId: trip.patientId || 'N/A',
        transportLevel: trip.transportLevel || 'N/A',
        priority: trip.priority || 'N/A',
        urgencyLevel: trip.urgencyLevel || null,
        fromLocation: trip.fromLocation || trip.healthcareLocation?.locationName || null,
        toLocation: trip.toLocation || null,
        scheduledTime: trip.scheduledTime ? new Date(trip.scheduledTime) : null,
        facilityName: trip.healthcareLocation?.locationName || null
      };

      const messageResult = smsMessageComposer.composeMessage(tripData);

      if (!messageResult.isValid) {
        console.error('TCC_DEBUG: Invalid SMS message composition:', messageResult.warnings);
        return;
      }

      if (messageResult.warnings && messageResult.warnings.length > 0) {
        console.warn('TCC_DEBUG: SMS message warnings:', messageResult.warnings);
      }

      console.log('TCC_DEBUG: Composed SMS message:', {
        characterCount: messageResult.characterCount,
        messageCount: messageResult.messageCount
      });

      // Send SMS to each agency
      const sendPromises = agencies.map(agency => 
        this.sendSMSToAgency(agency, messageResult.message, trip.tripNumber)
      );

      const results = await Promise.allSettled(sendPromises);

      // Log results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

      console.log('TCC_DEBUG: SMS notification results:', {
        total: agencies.length,
        successful,
        failed
      });

    } catch (error) {
      // Never throw - SMS failures should not affect trip creation
      console.error('TCC_DEBUG: Error in sendTripCreationSMS (non-blocking):', error);
    }
  }

  /**
   * Get agencies within notification radius from trip origin
   */
  private async getAgenciesWithinRadius(trip: any, radius: number): Promise<AgencyWithPhone[]> {
    try {
      // Get trip's origin location
      const originLocation = trip.healthcareLocation;
      
      if (!originLocation || !originLocation.latitude || !originLocation.longitude) {
        console.warn('TCC_DEBUG: Trip origin location missing coordinates - cannot filter by distance');
        return [];
      }

      const originCoords = {
        latitude: originLocation.latitude,
        longitude: originLocation.longitude
      };

      console.log('TCC_DEBUG: Trip origin coordinates:', originCoords, 'Radius:', radius, 'miles');

      // Get all active EMS agencies that accept notifications
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true,
          acceptsNotifications: true
        },
        select: {
          id: true,
          name: true,
          phone: true,
          latitude: true,
          longitude: true
        }
      });

      console.log('TCC_DEBUG: Found', agencies.length, 'active agencies that accept notifications');

      // Filter agencies within radius
      const agenciesWithinRadius: AgencyWithPhone[] = [];

      for (const agency of agencies) {
        if (!agency.latitude || !agency.longitude) {
          console.log('TCC_DEBUG: Skipping agency without coordinates:', agency.name);
          continue;
        }

        if (!agency.phone) {
          console.log('TCC_DEBUG: Skipping agency without phone number:', agency.name);
          continue;
        }

        // Calculate distance
        const distance = DistanceService.calculateDistance(
          originCoords,
          { latitude: agency.latitude, longitude: agency.longitude }
        );

        if (distance <= radius) {
          agenciesWithinRadius.push({
            id: agency.id,
            name: agency.name,
            phone: agency.phone,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal
          });
        }
      }

      // Sort by distance (closest first)
      agenciesWithinRadius.sort((a, b) => a.distance - b.distance);

      console.log('TCC_DEBUG: Agencies within radius:', agenciesWithinRadius.length);
      agenciesWithinRadius.forEach(agency => {
        console.log(`  - ${agency.name}: ${agency.distance} miles (${agency.phone})`);
      });

      return agenciesWithinRadius;

    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies within radius:', error);
      return [];
    }
  }

  /**
   * Send SMS to a single agency
   */
  private async sendSMSToAgency(agency: AgencyWithPhone, message: string, tripNumber: string | null): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('TCC_DEBUG: Sending SMS to agency:', agency.name, 'Phone:', agency.phone);

      const result = await azureSMSService.sendSMS(agency.phone, message);

      if (result.success) {
        console.log('TCC_DEBUG: SMS sent successfully to', agency.name, 'Message ID:', result.messageId);
      } else {
        console.error('TCC_DEBUG: SMS failed for', agency.name, 'Error:', result.error);
      }

      return {
        success: result.success,
        error: result.error
      };

    } catch (error: any) {
      console.error('TCC_DEBUG: Error sending SMS to agency', agency.name, ':', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
}

export const tripSMSService = new TripSMSService();
export default tripSMSService;

