require('dotenv').config({ path: '.env.local' });
const { databaseManager } = require('./src/services/databaseManager.ts');

async function testSMSSetup() {
  const prisma = databaseManager.getPrismaClient();
  
  console.log('\n=== SMS Debug Test ===\n');
  
  // Check feature flag
  console.log('1. Feature Flag:', process.env.AZURE_SMS_ENABLED);
  
  // Check Elk County EMS
  const elkCounty = await prisma.eMSAgency.findFirst({
    where: { 
      name: { contains: 'Elk', mode: 'insensitive' } 
    },
    select: {
      id: true,
      name: true,
      phone: true,
      acceptsNotifications: true,
      isActive: true,
      latitude: true,
      longitude: true
    }
  });
  
  console.log('\n2. Elk County EMS:');
  console.log(JSON.stringify(elkCounty, null, 2));
  
  // Check recent trip
  const recentTrip = await prisma.transportRequest.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      healthcareLocation: {
        select: {
          id: true,
          locationName: true,
          latitude: true,
          longitude: true
        }
      }
    }
  });
  
  console.log('\n3. Most Recent Trip:');
  if (recentTrip) {
    console.log('  Trip ID:', recentTrip.id);
    console.log('  Trip Number:', recentTrip.tripNumber);
    console.log('  Notification Radius:', recentTrip.notificationRadius);
    console.log('  From Location:', recentTrip.fromLocation);
    console.log('  Healthcare Location:', recentTrip.healthcareLocation?.locationName);
    console.log('  Location Coords:', recentTrip.healthcareLocation?.latitude, recentTrip.healthcareLocation?.longitude);
  } else {
    console.log('  No trips found');
  }
  
  // Test distance calculation if we have both
  if (recentTrip?.healthcareLocation && elkCounty) {
    const { DistanceService } = require('./src/services/distanceService.ts');
    const distance = DistanceService.calculateDistance(
      { latitude: recentTrip.healthcareLocation.latitude, longitude: recentTrip.healthcareLocation.longitude },
      { latitude: elkCounty.latitude, longitude: elkCounty.longitude }
    );
    console.log('\n4. Distance from trip origin to Elk County EMS:', distance.toFixed(2), 'miles');
    console.log('   Trip notification radius:', recentTrip.notificationRadius, 'miles');
    console.log('   Within radius?', distance <= (recentTrip.notificationRadius || 0) ? 'YES' : 'NO');
  }
  
  await prisma.$disconnect();
}

testSMSSetup().catch(console.error);

