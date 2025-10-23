#!/usr/bin/env node

/**
 * Fix Trip Locations Script
 * Updates existing trips to have proper location data for distance calculation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTripLocations() {
  console.log('🔧 Fixing trip locations for distance calculation...');
  
  try {
    // Get all trips that have null location data
    const tripsWithNullLocations = await prisma.transportRequest.findMany({
      where: {
        OR: [
          { fromLocation: null },
          { toLocation: null }
        ]
      },
      select: {
        id: true,
        fromLocation: true,
        toLocation: true,
        fromLocationId: true,
        destinationFacilityId: true
      }
    });

    console.log(`Found ${tripsWithNullLocations.length} trips with null location data`);

    for (const trip of tripsWithNullLocations) {
      console.log(`Fixing trip ${trip.id}...`);
      
      // Set default location names based on IDs or use generic names
      let fromLocation = trip.fromLocation;
      let toLocation = trip.toLocation;

      if (!fromLocation) {
        if (trip.fromLocationId) {
          // Try to get location name from healthcare location
          const healthcareLocation = await prisma.healthcareLocation.findUnique({
            where: { id: trip.fromLocationId },
            select: { locationName: true }
          });
          fromLocation = healthcareLocation?.locationName || 'Unknown Origin';
        } else {
          fromLocation = 'Unknown Origin';
        }
      }

      if (!toLocation) {
        if (trip.destinationFacilityId) {
          // Try to get location name from facility
          const facility = await prisma.facility.findUnique({
            where: { id: trip.destinationFacilityId },
            select: { name: true }
          });
          toLocation = facility?.name || 'Unknown Destination';
        } else {
          toLocation = 'Unknown Destination';
        }
      }

      // Update the trip with proper location data
      await prisma.transportRequest.update({
        where: { id: trip.id },
        data: {
          fromLocation: fromLocation,
          toLocation: toLocation
        }
      });

      console.log(`  ✅ Updated: ${fromLocation} → ${toLocation}`);
    }

    console.log('🎉 All trip locations fixed!');
    
    // Verify the fix
    const remainingNullTrips = await prisma.transportRequest.count({
      where: {
        OR: [
          { fromLocation: null },
          { toLocation: null }
        ]
      }
    });

    console.log(`Remaining trips with null locations: ${remainingNullTrips}`);

  } catch (error) {
    console.error('❌ Error fixing trip locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixTripLocations().catch(console.error);
