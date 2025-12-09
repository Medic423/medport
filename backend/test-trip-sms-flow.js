require('dotenv').config({ path: '.env.local' });
const { databaseManager } = require('./src/services/databaseManager.ts');

async function testTripSMSFlow() {
  const prisma = databaseManager.getPrismaClient();
  
  // Get the most recent trip
  const trip = await prisma.transportRequest.findFirst({
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
  
  if (!trip) {
    console.log('No trips found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('\n=== Testing SMS Flow for Recent Trip ===\n');
  console.log('Trip ID:', trip.id);
  console.log('Trip Number:', trip.tripNumber);
  console.log('Notification Radius:', trip.notificationRadius);
  console.log('From Location:', trip.fromLocation);
  console.log('Healthcare Location:', trip.healthcareLocation?.locationName);
  console.log('Location Coords:', trip.healthcareLocation?.latitude, trip.healthcareLocation?.longitude);
  
  // Check if SMS would be triggered
  const smsEnabled = process.env.AZURE_SMS_ENABLED === 'true';
  const hasRadius = trip.notificationRadius && trip.notificationRadius > 0;
  const hasLocation = trip.healthcareLocation && trip.healthcareLocation.latitude && trip.healthcareLocation.longitude;
  
  console.log('\nSMS Trigger Conditions:');
  console.log('  Feature flag enabled:', smsEnabled);
  console.log('  Has notification radius:', hasRadius, `(${trip.notificationRadius})`);
  console.log('  Has location coordinates:', hasLocation);
  console.log('  Would trigger SMS?', smsEnabled && hasRadius && hasLocation ? 'YES' : 'NO');
  
  if (smsEnabled && hasRadius && hasLocation) {
    // Try to manually trigger SMS
    console.log('\nAttempting to trigger SMS...');
    try {
      const { tripSMSService } = require('./src/services/tripSMSService.ts');
      await tripSMSService.sendTripCreationSMS(trip, trip.notificationRadius);
      console.log('SMS trigger completed (check logs above for details)');
    } catch (err) {
      console.error('Error triggering SMS:', err.message);
      console.error(err.stack);
    }
  }
  
  await prisma.$disconnect();
}

testTripSMSFlow().catch(console.error);

