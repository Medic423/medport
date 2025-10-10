#!/usr/bin/env node

/**
 * TCC Trip Location Population Script
 * Populates origin and destination coordinates for trips based on facility locations
 */

const { databaseManager } = require('./dist/services/databaseManager');

const prisma = databaseManager.getCenterDB();

// Mock facility locations (in production, these would come from a geocoding service)
const facilityLocations = {
  'UPMC Bedford': { lat: 40.0158, lng: -78.5047 },
  'UPMC Altoona': { lat: 40.5187, lng: -78.3947 },
  'UPMC Shadyside': { lat: 40.4500, lng: -79.9333 },
  'UPMC Presbyterian': { lat: 40.4418, lng: -79.9631 },
  'UPMC Mercy': { lat: 40.4418, lng: -79.9631 },
  'UPMC Children\'s Hospital': { lat: 40.4418, lng: -79.9631 },
  'UPMC Magee-Womens Hospital': { lat: 40.4418, lng: -79.9631 },
  'UPMC St. Margaret': { lat: 40.4418, lng: -79.9631 },
  'UPMC East': { lat: 40.4418, lng: -79.9631 },
  'UPMC Passavant': { lat: 40.4418, lng: -79.9631 },
  'UPMC McKeesport': { lat: 40.3500, lng: -79.8500 },
  'UPMC Horizon': { lat: 40.4418, lng: -79.9631 },
  'UPMC Jameson': { lat: 40.4418, lng: -79.9631 },
  'UPMC Northwest': { lat: 40.4418, lng: -79.9631 },
  'UPMC Hamot': { lat: 42.1292, lng: -80.0851 },
  'UPMC Chautauqua': { lat: 42.1292, lng: -80.0851 },
  'UPMC Cole': { lat: 40.4418, lng: -79.9631 },
  'UPMC Kane': { lat: 40.4418, lng: -79.9631 },
  'UPMC Muncy': { lat: 40.4418, lng: -79.9631 },
  'UPMC Wellsboro': { lat: 40.4418, lng: -79.9631 },
  'Test Hospital': { lat: 40.4418, lng: -79.9631 } // Default Pittsburgh location for test data
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate trip cost based on distance and transport level
function calculateTripCost(distance, transportLevel) {
  const baseRate = {
    'BLS': 2.50,    // Basic Life Support
    'ALS': 3.75,    // Advanced Life Support  
    'CCT': 5.00     // Critical Care Transport
  };
  
  const rate = baseRate[transportLevel] || baseRate['BLS'];
  return Math.round((distance * rate + 50) * 100) / 100; // $50 base fee + distance rate
}

async function populateTripLocations() {
  console.log('🔄 Starting trip location population...');
  
  try {
    // Get all trips that need location data or cost calculation
    const tripsToUpdate = await prisma.trip.findMany({
      where: {
        OR: [
          { originLatitude: null },
          { originLongitude: null },
          { destinationLatitude: null },
          { destinationLongitude: null },
          { tripCost: null }
        ]
      },
      select: {
        id: true,
        fromLocation: true,
        toLocation: true,
        transportLevel: true,
        originLatitude: true,
        originLongitude: true,
        destinationLatitude: true,
        destinationLongitude: true,
        tripCost: true
      }
    });

    console.log(`📊 Found ${tripsToUpdate.length} trips needing updates`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const trip of tripsToUpdate) {
      let needsUpdate = false;
      const updateData = {};

      // Check and populate origin location
      if (!trip.originLatitude || !trip.originLongitude) {
        const originLocation = findFacilityLocation(trip.fromLocation);
        if (originLocation) {
          updateData.originLatitude = originLocation.lat;
          updateData.originLongitude = originLocation.lng;
          needsUpdate = true;
        } else {
          console.log(`⚠️  Origin location not found for: ${trip.fromLocation}`);
        }
      }

      // Check and populate destination location
      if (!trip.destinationLatitude || !trip.destinationLongitude) {
        const destinationLocation = findFacilityLocation(trip.toLocation);
        if (destinationLocation) {
          updateData.destinationLatitude = destinationLocation.lat;
          updateData.destinationLongitude = destinationLocation.lng;
          needsUpdate = true;
        } else {
          console.log(`⚠️  Destination location not found for: ${trip.toLocation}`);
        }
      }

      // Calculate trip cost if we have both coordinates and no existing cost
      if (!trip.tripCost && trip.originLatitude && trip.originLongitude && 
          trip.destinationLatitude && trip.destinationLongitude) {
        const distance = calculateDistance(
          trip.originLatitude, trip.originLongitude,
          trip.destinationLatitude, trip.destinationLongitude
        );
        const cost = calculateTripCost(distance, trip.transportLevel);
        updateData.tripCost = cost;
        needsUpdate = true;
        console.log(`💰 Calculated cost for trip ${trip.id}: $${cost} (${distance.toFixed(1)} miles, ${trip.transportLevel})`);
      }

      if (needsUpdate) {
        await prisma.trip.update({
          where: { id: trip.id },
          data: updateData
        });
        updatedCount++;
        console.log(`✅ Updated trip ${trip.id}: ${trip.fromLocation} → ${trip.toLocation}`);
      } else {
        skippedCount++;
      }
    }

    console.log(`\n📈 Population Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} trips`);
    console.log(`   ⏭️  Skipped: ${skippedCount} trips`);
    console.log(`   📊 Total processed: ${tripsToUpdate.length} trips`);

  } catch (error) {
    console.error('❌ Error populating trip locations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function findFacilityLocation(facilityName) {
  if (!facilityName) return null;
  
  // Try exact match first
  if (facilityLocations[facilityName]) {
    return facilityLocations[facilityName];
  }
  
  // Try partial match
  for (const [key, location] of Object.entries(facilityLocations)) {
    if (facilityName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(facilityName.toLowerCase())) {
      return location;
    }
  }
  
  return null;
}

// Run the script
if (require.main === module) {
  populateTripLocations()
    .then(() => {
      console.log('🎉 Trip location population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateTripLocations };
