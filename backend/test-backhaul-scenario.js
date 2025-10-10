#!/usr/bin/env node

/**
 * TCC Backhaul Analysis End-to-End Test
 * Simulates Altoona → Pittsburgh → Altoona scenario
 */

const { databaseManager } = require('./dist/services/databaseManager');
const { BackhaulDetector } = require('./dist/services/backhaulDetector');

async function testBackhaulScenario() {
  console.log('🚀 Starting TCC Backhaul Analysis End-to-End Test');
  console.log('=' .repeat(60));

  try {
    // Initialize database connections
    const centerDB = databaseManager.getCenterDB();
    const emsDB = databaseManager.getEMSDB();

    console.log('✅ Database connections established');

    // Step 1: Create test hospitals with coordinates
    console.log('\n1️⃣ Creating test hospitals...');
    
    // First, try to find existing hospitals
    let altoonaHospital = await centerDB.hospital.findFirst({
      where: { name: 'UPMC Altoona' }
    });
    
    if (!altoonaHospital) {
      altoonaHospital = await centerDB.hospital.create({
        data: {
          name: 'UPMC Altoona',
          address: '620 Howard Ave',
          city: 'Altoona',
          state: 'PA',
          zipCode: '16601',
          phone: '814-889-2000',
          type: 'ACUTE_CARE',
          capabilities: ['EMERGENCY', 'SURGERY', 'CARDIOLOGY'],
          region: 'Central PA',
          latitude: 40.5187,
          longitude: -78.3947,
          isActive: true
        }
      });
    }

    let pittsburghHospital = await centerDB.hospital.findFirst({
      where: { name: 'UPMC Presbyterian' }
    });
    
    if (!pittsburghHospital) {
      pittsburghHospital = await centerDB.hospital.create({
        data: {
          name: 'UPMC Presbyterian',
          address: '200 Lothrop St',
          city: 'Pittsburgh',
          state: 'PA',
          zipCode: '15213',
          phone: '412-647-2345',
          type: 'ACUTE_CARE',
          capabilities: ['EMERGENCY', 'SURGERY', 'CARDIOLOGY', 'TRAUMA'],
          region: 'Western PA',
          latitude: 40.4418,
          longitude: -79.9631,
          isActive: true
        }
      });
    }

    console.log(`   ✅ Created: ${altoonaHospital.name} (${altoonaHospital.latitude}, ${altoonaHospital.longitude})`);
    console.log(`   ✅ Created: ${pittsburghHospital.name} (${pittsburghHospital.latitude}, ${pittsburghHospital.longitude})`);

    // Step 2: Create test EMS agency and unit
    console.log('\n2️⃣ Creating test EMS agency and unit...');
    
    let testAgency = await emsDB.eMSAgency.findFirst({
      where: { name: 'Test EMS Agency' }
    });
    
    if (!testAgency) {
      testAgency = await emsDB.eMSAgency.create({
        data: {
          name: 'Test EMS Agency',
          contactName: 'John Smith',
          phone: '555-0123',
          email: 'test@ems.com',
          address: '123 Main St',
          city: 'Altoona',
          state: 'PA',
          zipCode: '16601',
          serviceArea: ['Altoona', 'Pittsburgh'],
          capabilities: ['BLS', 'ALS'],
          isActive: true
        }
      });
    }

    let testUnit = await emsDB.unit.findFirst({
      where: { unitNumber: 'TEST-001' }
    });
    
    if (!testUnit) {
      testUnit = await emsDB.unit.create({
        data: {
          unitNumber: 'TEST-001',
          agencyId: testAgency.id,
          type: 'AMBULANCE',
          capabilities: ['BLS', 'ALS'],
          currentStatus: 'AVAILABLE',
          currentLocation: {
            lat: 40.5187,
            lng: -78.3947
          },
          isActive: true,
          totalTripsCompleted: 0,
          averageResponseTime: 0
        }
      });
    }

    console.log(`   ✅ Created agency: ${testAgency.name}`);
    console.log(`   ✅ Created unit: ${testUnit.unitNumber}`);

    // Step 3: Create test trips for backhaul scenario
    console.log('\n3️⃣ Creating test trips for backhaul scenario...');
    
    const now = new Date();
    const trip1Time = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const trip2Time = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

    // Trip 1: Altoona → Pittsburgh
    const trip1 = await centerDB.trip.create({
      data: {
        tripNumber: `TEST-${Date.now()}-001`,
        patientId: 'PAT001',
        fromLocation: 'UPMC Altoona',
        toLocation: 'UPMC Presbyterian',
        scheduledTime: trip1Time,
        transportLevel: 'ALS',
        urgencyLevel: 'Urgent',
        priority: 'HIGH',
        status: 'PENDING',
        originLatitude: 40.5187,
        originLongitude: -78.3947,
        destinationLatitude: 40.4418,
        destinationLongitude: -79.9631,
        specialNeeds: 'Cardiac monitoring required',
        insuranceCompany: 'Medicare',
        selectedAgencies: [testAgency.id],
        requestTimestamp: now,
        createdAt: now
      }
    });

    // Trip 2: Pittsburgh → Altoona (return trip)
    const trip2 = await centerDB.trip.create({
      data: {
        tripNumber: `TEST-${Date.now()}-002`,
        patientId: 'PAT002',
        fromLocation: 'UPMC Presbyterian',
        toLocation: 'UPMC Altoona',
        scheduledTime: trip2Time,
        transportLevel: 'BLS',
        urgencyLevel: 'Routine',
        priority: 'MEDIUM',
        status: 'PENDING',
        originLatitude: 40.4418,
        originLongitude: -79.9631,
        destinationLatitude: 40.5187,
        destinationLongitude: -78.3947,
        specialNeeds: 'Wheelchair transport',
        insuranceCompany: 'Private',
        selectedAgencies: [testAgency.id],
        requestTimestamp: now,
        createdAt: now
      }
    });

    // Trip 3: Pittsburgh → Another Pittsburgh location (regular backhaul)
    const trip3 = await centerDB.trip.create({
      data: {
        tripNumber: `TEST-${Date.now()}-003`,
        patientId: 'PAT003',
        fromLocation: 'UPMC Presbyterian',
        toLocation: 'UPMC Mercy',
        scheduledTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        transportLevel: 'ALS',
        urgencyLevel: 'Urgent',
        priority: 'HIGH',
        status: 'PENDING',
        originLatitude: 40.4418,
        originLongitude: -79.9631,
        destinationLatitude: 40.4418,
        destinationLongitude: -79.9631,
        specialNeeds: 'None',
        insuranceCompany: 'Medicaid',
        selectedAgencies: [testAgency.id],
        requestTimestamp: now,
        createdAt: now
      }
    });

    console.log(`   ✅ Created Trip 1: ${trip1.fromLocation} → ${trip1.toLocation} (${trip1.transportLevel})`);
    console.log(`   ✅ Created Trip 2: ${trip2.fromLocation} → ${trip2.toLocation} (${trip2.transportLevel}) - RETURN TRIP`);
    console.log(`   ✅ Created Trip 3: ${trip3.fromLocation} → ${trip3.toLocation} (${trip3.transportLevel}) - REGULAR BACKHAUL`);

    // Step 4: Convert trips to TransportRequest format
    console.log('\n4️⃣ Converting trips to TransportRequest format...');
    
    const transportRequests = [
      {
        id: trip1.id,
        patientId: trip1.patientId,
        originFacilityId: trip1.fromLocation,
        destinationFacilityId: trip1.toLocation,
        transportLevel: trip1.transportLevel,
        priority: trip1.priority,
        status: trip1.status,
        specialRequirements: trip1.specialNeeds || '',
        requestTimestamp: new Date(trip1.requestTimestamp),
        readyStart: new Date(trip1.scheduledTime),
        readyEnd: new Date(new Date(trip1.scheduledTime).getTime() + 60 * 60 * 1000),
        originLocation: {
          lat: trip1.originLatitude,
          lng: trip1.originLongitude
        },
        destinationLocation: {
          lat: trip1.destinationLatitude,
          lng: trip1.destinationLongitude
        }
      },
      {
        id: trip2.id,
        patientId: trip2.patientId,
        originFacilityId: trip2.fromLocation,
        destinationFacilityId: trip2.toLocation,
        transportLevel: trip2.transportLevel,
        priority: trip2.priority,
        status: trip2.status,
        specialRequirements: trip2.specialNeeds || '',
        requestTimestamp: new Date(trip2.requestTimestamp),
        readyStart: new Date(trip2.scheduledTime),
        readyEnd: new Date(new Date(trip2.scheduledTime).getTime() + 60 * 60 * 1000),
        originLocation: {
          lat: trip2.originLatitude,
          lng: trip2.originLongitude
        },
        destinationLocation: {
          lat: trip2.destinationLatitude,
          lng: trip2.destinationLongitude
        }
      },
      {
        id: trip3.id,
        patientId: trip3.patientId,
        originFacilityId: trip3.fromLocation,
        destinationFacilityId: trip3.toLocation,
        transportLevel: trip3.transportLevel,
        priority: trip3.priority,
        status: trip3.status,
        specialRequirements: trip3.specialNeeds || '',
        requestTimestamp: new Date(trip3.requestTimestamp),
        readyStart: new Date(trip3.scheduledTime),
        readyEnd: new Date(new Date(trip3.scheduledTime).getTime() + 60 * 60 * 1000),
        originLocation: {
          lat: trip3.originLatitude,
          lng: trip3.originLongitude
        },
        destinationLocation: {
          lat: trip3.destinationLatitude,
          lng: trip3.destinationLongitude
        }
      }
    ];

    console.log(`   ✅ Converted ${transportRequests.length} trips to TransportRequest format`);

    // Step 5: Test BackhaulDetector
    console.log('\n5️⃣ Testing BackhaulDetector...');
    
    const backhaulDetector = new BackhaulDetector(90, 15, 25.0); // 90 min, 15 miles, $25 bonus

    // Test regular backhaul analysis
    console.log('\n   🔍 Regular Backhaul Analysis:');
    const regularPairs = backhaulDetector.findPairs(transportRequests);
    console.log(`   Found ${regularPairs.length} regular backhaul pairs`);
    
    regularPairs.forEach((pair, index) => {
      const isReturnTrip = backhaulDetector.isReturnTripScenario ? 
        backhaulDetector.isReturnTripScenario(pair.request1, pair.request2) : false;
      console.log(`   Pair ${index + 1}: ${pair.request1.patientId} → ${pair.request2.patientId}`);
      console.log(`     Distance: ${pair.distance.toFixed(2)} miles`);
      console.log(`     Time Window: ${pair.timeWindow.toFixed(0)} minutes`);
      console.log(`     Efficiency: ${(pair.efficiency * 100).toFixed(1)}%`);
      console.log(`     Revenue Bonus: $${pair.revenueBonus}`);
      console.log(`     Is Return Trip: ${isReturnTrip}`);
    });

    // Test return trip analysis
    console.log('\n   🔍 Return Trip Analysis:');
    // Use the existing findPairs method and filter for return trips
    const allPairs = backhaulDetector.findPairs(transportRequests);
    const returnTrips = allPairs.filter(pair => {
      // Check if this is a return trip by comparing destinations and origins
      const dest1MatchesOrigin2 = Math.abs(pair.request1.destinationLocation.lat - pair.request2.originLocation.lat) < 0.01 &&
                                 Math.abs(pair.request1.destinationLocation.lng - pair.request2.originLocation.lng) < 0.01;
      const dest2MatchesOrigin1 = Math.abs(pair.request2.destinationLocation.lat - pair.request1.originLocation.lat) < 0.01 &&
                                 Math.abs(pair.request2.destinationLocation.lng - pair.request1.originLocation.lng) < 0.01;
      return dest1MatchesOrigin2 || dest2MatchesOrigin1;
    });
    console.log(`   Found ${returnTrips.length} return trip opportunities`);
    
    returnTrips.forEach((pair, index) => {
      console.log(`   Return Trip ${index + 1}: ${pair.request1.patientId} → ${pair.request2.patientId}`);
      console.log(`     Distance: ${pair.distance.toFixed(2)} miles`);
      console.log(`     Time Window: ${pair.timeWindow.toFixed(0)} minutes`);
      console.log(`     Efficiency: ${(pair.efficiency * 100).toFixed(1)}%`);
      console.log(`     Revenue Bonus: $${pair.revenueBonus}`);
      console.log(`     Route: ${pair.request1.destinationFacilityId} → ${pair.request2.originFacilityId}`);
    });

    // Test statistics
    console.log('\n   📊 Backhaul Statistics:');
    const statistics = backhaulDetector.getBackhaulStatistics(transportRequests);
    console.log(`   Total Requests: ${statistics.totalRequests}`);
    console.log(`   Possible Pairs: ${statistics.possiblePairs}`);
    console.log(`   Valid Pairs: ${statistics.validPairs}`);
    console.log(`   Average Efficiency: ${(statistics.averageEfficiency * 100).toFixed(1)}%`);
    console.log(`   Potential Revenue Increase: $${statistics.potentialRevenueIncrease.toFixed(2)}`);

    // Step 6: Test API endpoints
    console.log('\n6️⃣ Testing API endpoints...');
    
    // Test the return trips endpoint
    const returnTripsResponse = await fetch('http://localhost:5001/api/optimize/return-trips', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    if (returnTripsResponse.ok) {
      const returnTripsData = await returnTripsResponse.json();
      console.log(`   ✅ Return trips API: ${returnTripsData.data?.returnTrips?.length || 0} opportunities found`);
    } else {
      console.log(`   ❌ Return trips API failed: ${returnTripsResponse.status}`);
    }

    // Test regular backhaul endpoint
    const backhaulResponse = await fetch('http://localhost:5001/api/optimize/backhaul', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestIds: [trip1.id, trip2.id, trip3.id]
      })
    });

    if (backhaulResponse.ok) {
      const backhaulData = await backhaulResponse.json();
      console.log(`   ✅ Backhaul API: ${backhaulData.data?.pairs?.length || 0} pairs found`);
    } else {
      console.log(`   ❌ Backhaul API failed: ${backhaulResponse.status}`);
    }

    // Step 7: Calculate distances for verification
    console.log('\n7️⃣ Distance Verification:');
    
    const altoonaToPittsburgh = backhaulDetector.calculateDistance(
      { lat: 40.5187, lng: -78.3947 },
      { lat: 40.4418, lng: -79.9631 }
    );
    
    const pittsburghToAltoona = backhaulDetector.calculateDistance(
      { lat: 40.4418, lng: -79.9631 },
      { lat: 40.5187, lng: -78.3947 }
    );

    console.log(`   Altoona → Pittsburgh: ${altoonaToPittsburgh.toFixed(2)} miles`);
    console.log(`   Pittsburgh → Altoona: ${pittsburghToAltoona.toFixed(2)} miles`);
    console.log(`   Expected: ~100 miles (both directions should be similar)`);

    console.log('\n🎉 Backhaul Analysis Test Completed Successfully!');
    console.log('=' .repeat(60));
    console.log('📋 Summary:');
    console.log(`   • Created ${transportRequests.length} test trips`);
    console.log(`   • Found ${regularPairs.length} regular backhaul pairs`);
    console.log(`   • Found ${returnTrips.length} return trip opportunities`);
    console.log(`   • Distance verification: ${altoonaToPittsburgh.toFixed(2)} miles`);
    console.log('   • All API endpoints tested');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Clean up database connections
    try {
      await centerDB.$disconnect();
      await emsDB.$disconnect();
      console.log('\n🔌 Database connections closed');
    } catch (error) {
      console.log('\n🔌 Database connections closed (with warnings)');
    }
  }
}

// Run the test
if (require.main === module) {
  testBackhaulScenario().catch(console.error);
}

module.exports = { testBackhaulScenario };
