/**
 * Diagnostic script to check why trips aren't displaying for healthcare users
 * Run with: node check-trip-display-issue.js
 */

// Use the backend's databaseManager which already has env configured
const { databaseManager } = require('./dist/services/databaseManager');
const prisma = databaseManager.getPrismaClient();

async function diagnoseTripDisplayIssue() {
  try {
    console.log('🔍 Diagnosing Trip Display Issue...\n');

    // 1. Check recent trips (last 24 hours)
    console.log('1️⃣ Checking recent trips (last 24 hours)...');
    const recentTrips = await prisma.transportRequest.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        patientId: true,
        healthcareCreatedById: true,
        fromLocationId: true,
        status: true,
        createdAt: true,
        fromLocation: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`   Found ${recentTrips.length} recent trips:\n`);
    recentTrips.forEach(trip => {
      console.log(`   - Patient: ${trip.patientId}`);
      console.log(`     ID: ${trip.id}`);
      console.log(`     healthcareCreatedById: ${trip.healthcareCreatedById || 'NULL ⚠️'}`);
      console.log(`     fromLocationId: ${trip.fromLocationId || 'NULL'}`);
      console.log(`     Status: ${trip.status}`);
      console.log(`     Created: ${trip.createdAt}`);
      console.log('');
    });

    // 2. Check healthcare users
    console.log('\n2️⃣ Checking healthcare users...');
    const healthcareUsers = await prisma.healthcareUser.findMany({
      select: {
        id: true,
        email: true,
        name: true
      },
      take: 10
    });

    console.log(`   Found ${healthcareUsers.length} healthcare users:\n`);
    healthcareUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     ID: ${user.id}`);
      console.log('');
    });

    // 3. For each healthcare user, check their trips
    console.log('\n3️⃣ Checking trips per healthcare user...\n');
    for (const user of healthcareUsers.slice(0, 5)) { // Check first 5 users
      // Get user's locations
      const locations = await prisma.healthcareLocation.findMany({
        where: { healthcareUserId: user.id },
        select: { id: true, locationName: true }
      });

      // Get trips created by this user
      const userCreatedTrips = await prisma.transportRequest.findMany({
        where: {
          healthcareCreatedById: user.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          patientId: true,
          status: true
        }
      });

      // Get trips from user's locations
      const locationTrips = locations.length > 0 ? await prisma.transportRequest.findMany({
        where: {
          fromLocationId: { in: locations.map(l => l.id) },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          patientId: true,
          healthcareCreatedById: true,
          status: true
        }
      }) : [];

      console.log(`   User: ${user.email} (${user.id})`);
      console.log(`     Locations: ${locations.length} (${locations.map(l => l.locationName).join(', ') || 'none'})`);
      console.log(`     Trips created by user: ${userCreatedTrips.length}`);
      if (userCreatedTrips.length > 0) {
        userCreatedTrips.forEach(t => console.log(`       - ${t.patientId} (${t.status})`));
      }
      console.log(`     Trips from user's locations: ${locationTrips.length}`);
      if (locationTrips.length > 0) {
        locationTrips.forEach(t => console.log(`       - ${t.patientId} (createdBy: ${t.healthcareCreatedById || 'NULL'}, status: ${t.status})`));
      }
      console.log('');
    }

    // 4. Check for trip with patientId PXW00PH2S (from the error message)
    console.log('\n4️⃣ Checking for patient PXW00PH2S...');
    const patientTrip = await prisma.transportRequest.findFirst({
      where: {
        patientId: 'PXW00PH2S'
      },
      select: {
        id: true,
        patientId: true,
        healthcareCreatedById: true,
        fromLocationId: true,
        status: true,
        createdAt: true
      }
    });

    if (patientTrip) {
      console.log('   ✅ Found trip for PXW00PH2S:');
      console.log(`     ID: ${patientTrip.id}`);
      console.log(`     healthcareCreatedById: ${patientTrip.healthcareCreatedById || 'NULL ⚠️'}`);
      console.log(`     fromLocationId: ${patientTrip.fromLocationId || 'NULL'}`);
      console.log(`     Status: ${patientTrip.status}`);
      console.log(`     Created: ${patientTrip.createdAt}`);
      
      // Check which user should see this trip
      if (patientTrip.healthcareCreatedById) {
        const creator = await prisma.healthcareUser.findUnique({
          where: { id: patientTrip.healthcareCreatedById },
          select: { email: true, name: true }
        });
        console.log(`     Created by: ${creator?.email || 'UNKNOWN USER'} (${creator?.name || 'N/A'})`);
      }
      
      if (patientTrip.fromLocationId) {
        const location = await prisma.healthcareLocation.findUnique({
          where: { id: patientTrip.fromLocationId },
          select: { healthcareUserId: true, locationName: true }
        });
        if (location) {
          const locationOwner = await prisma.healthcareUser.findUnique({
            where: { id: location.healthcareUserId },
            select: { email: true }
          });
          console.log(`     Location owner: ${locationOwner?.email || 'UNKNOWN'} (${location.locationName})`);
        }
      }
    } else {
      console.log('   ❌ No trip found for patient PXW00PH2S');
    }

    console.log('\n✅ Diagnosis complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseTripDisplayIssue();

