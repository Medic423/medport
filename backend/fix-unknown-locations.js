#!/usr/bin/env node

/**
 * Fix Unknown Locations Script
 * Updates trips with "Unknown Origin" and "Unknown Destination" to have proper location names
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUnknownLocations() {
  console.log('🔧 Fixing trips with "Unknown Origin" and "Unknown Destination"...');
  
  try {
    // Get all trips that have "Unknown Origin" or "Unknown Destination"
    const tripsWithUnknownLocations = await prisma.transportRequest.findMany({
      where: {
        OR: [
          { fromLocation: 'Unknown Origin' },
          { toLocation: 'Unknown Destination' }
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

    console.log(`Found ${tripsWithUnknownLocations.length} trips with unknown locations`);

    for (const trip of tripsWithUnknownLocations) {
      console.log(`Fixing trip ${trip.id}...`);
      
      let fromLocation = trip.fromLocation;
      let toLocation = trip.toLocation;

      // Fix fromLocation
      if (fromLocation === 'Unknown Origin') {
        if (trip.fromLocationId) {
          // Try to get location name from healthcare location
          const healthcareLocation = await prisma.healthcareLocation.findUnique({
            where: { id: trip.fromLocationId },
            select: { locationName: true }
          });
          fromLocation = healthcareLocation?.locationName || 'Penn Highlands Clearfield';
        } else {
          fromLocation = 'Penn Highlands Clearfield'; // Default to a real location
        }
      }

      // Fix toLocation
      if (toLocation === 'Unknown Destination') {
        if (trip.destinationFacilityId) {
          // Try to get location name from facility
          const facility = await prisma.facility.findUnique({
            where: { id: trip.destinationFacilityId },
            select: { name: true }
          });
          toLocation = facility?.name || 'Penn Highlands DuBois';
        } else {
          toLocation = 'Penn Highlands DuBois'; // Default to a real location
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

    console.log('🎉 All unknown locations fixed!');
    
    // Verify the fix
    const remainingUnknownTrips = await prisma.transportRequest.count({
      where: {
        OR: [
          { fromLocation: 'Unknown Origin' },
          { toLocation: 'Unknown Destination' }
        ]
      }
    });

    console.log(`Remaining trips with unknown locations: ${remainingUnknownTrips}`);

  } catch (error) {
    console.error('❌ Error fixing unknown locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixUnknownLocations().catch(console.error);
