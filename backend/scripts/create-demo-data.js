const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoData() {
  try {
    console.log('🚀 Creating comprehensive demo data for MedPort...');

    // Step 0: Get or create demo user
    console.log('\n👤 Getting demo user...');
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@medport.com' }
    });
    if (!demoUser) {
      throw new Error('Demo user not found. Please run create-demo-user.js first.');
    }
    console.log(`✅ Using demo user: ${demoUser.name}`);

    // Step 1: Create demo facilities if they don't exist
    console.log('\n📍 Creating demo facilities...');
    const facilities = await createDemoFacilities();
    console.log(`✅ Created ${facilities.length} facilities`);

    // Step 2: Create demo agencies
    console.log('\n🚑 Creating demo agencies...');
    const agencies = await createDemoAgencies();
    console.log(`✅ Created ${agencies.length} agencies`);

    // Step 3: Create demo units
    console.log('\n🚑 Creating demo units...');
    const units = await createDemoUnits(agencies);
    console.log(`✅ Created ${units.length} units`);

    // Step 3: Create demo transport requests
    console.log('\n🚑 Creating demo transport requests...');
    const transportRequests = await createDemoTransportRequests(facilities, demoUser.id);
    console.log(`✅ Created ${transportRequests.length} transport requests`);

    // Step 4: Create demo distance matrix entries
    console.log('\n🗺️ Creating demo distance matrix...');
    const distanceEntries = await createDemoDistanceMatrix(facilities);
    console.log(`✅ Created ${distanceEntries.length} distance matrix entries`);

    console.log('\n🎉 Demo data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Facilities: ${facilities.length}`);
    console.log(`   - Agencies: ${agencies.length}`);
    console.log(`   - Units: ${units.length}`);
    console.log(`   - Transport Requests: ${transportRequests.length}`);
    console.log(`   - Distance Matrix Entries: ${distanceEntries.length}`);
    console.log('\n🔗 You can now test:');
    console.log('   1. Route Optimization (should find chaining opportunities)');
    console.log('   2. Enhanced Route Cards (should generate detailed cards)');
    console.log('   3. Export functionality (PDF, CSV, JSON, Excel)');
    console.log('   4. Comparison and analytics features');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createDemoFacilities() {
  const facilityData = [
    {
      name: 'Pennsylvania Hospital',
      address: '800 Spruce St',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19107',
      facilityType: 'HOSPITAL',
      capabilities: ['EMERGENCY', 'ICU', 'SURGERY', 'REHAB'],
      coordinates: { lat: 39.9447, lng: -75.1550 }
    },
    {
      name: 'Jefferson University Hospital',
      address: '111 S 11th St',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19107',
      facilityType: 'HOSPITAL',
      capabilities: ['EMERGENCY', 'ICU', 'SURGERY', 'CARDIOLOGY'],
      coordinates: { lat: 39.9489, lng: -75.1578 }
    },
    {
      name: 'Temple University Hospital',
      address: '3401 N Broad St',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19140',
      facilityType: 'HOSPITAL',
      capabilities: ['EMERGENCY', 'ICU', 'SURGERY', 'TRAUMA'],
      coordinates: { lat: 39.9817, lng: -75.1550 }
    },
    {
      name: 'Einstein Medical Center',
      address: '5501 Old York Rd',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19141',
      facilityType: 'HOSPITAL',
      capabilities: ['EMERGENCY', 'ICU', 'SURGERY', 'PEDIATRICS'],
      coordinates: { lat: 40.0376, lng: -75.1420 }
    },
    {
      name: 'Penn Presbyterian Medical Center',
      address: '51 N 39th St',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19104',
      facilityType: 'HOSPITAL',
      capabilities: ['EMERGENCY', 'ICU', 'SURGERY', 'ORTHOPEDICS'],
      coordinates: { lat: 39.9589, lng: -75.2000 }
    }
  ];

  const facilities = [];
  for (const data of facilityData) {
          const facility = await prisma.facility.create({
        data: {
          name: data.name,
          type: data.facilityType,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          capabilities: data.capabilities,
          coordinates: data.coordinates,
          isActive: true
        }
      });
    facilities.push(facility);
  }

  return facilities;
}

async function createDemoAgencies() {
  const agencyData = [
    {
      name: 'Philadelphia EMS',
      contactName: 'John Smith',
      phone: '215-555-0101',
      email: 'info@phillyems.com',
      address: '123 Main St',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19107',
      capabilities: ['BLS', 'ALS', 'CCT'],
      serviceArea: { radius: 50, center: { lat: 39.9447, lng: -75.1550 } },
      operatingHours: { start: '06:00', end: '18:00' },
      pricingStructure: { base: 150, perMile: 2.50 }
    },
    {
      name: 'Pennsylvania Ambulance Service',
      contactName: 'Sarah Johnson',
      phone: '215-555-0202',
      email: 'dispatch@paambulance.com',
      address: '456 Oak Ave',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19104',
      capabilities: ['BLS', 'ALS'],
      serviceArea: { radius: 40, center: { lat: 39.9589, lng: -75.2000 } },
      operatingHours: { start: '08:00', end: '20:00' },
      pricingStructure: { base: 140, perMile: 2.25 }
    }
  ];

  const agencies = [];
  for (const data of agencyData) {
    try {
      const agency = await prisma.transportAgency.create({
        data: {
          name: data.name,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          capabilities: data.capabilities,
          serviceArea: data.serviceArea,
          operatingHours: data.operatingHours,
          pricingStructure: data.pricingStructure
        }
      });
      agencies.push(agency);
    } catch (error) {
      console.log(`⚠️ Skipping agency ${data.name}: ${error.message}`);
    }
  }

  return agencies;
}

async function createDemoUnits(agencies) {
  const unitData = [
    {
      unitNumber: 'BLS-001',
      type: 'BLS',
      currentStatus: 'AVAILABLE',
      isActive: true,
      agencyId: agencies[0]?.id,
      currentLocation: { lat: 39.9447, lng: -75.1550 }
    },
    {
      unitNumber: 'BLS-002',
      type: 'BLS',
      currentStatus: 'AVAILABLE',
      isActive: true,
      agencyId: agencies[0]?.id,
      currentLocation: { lat: 39.9489, lng: -75.1578 }
    },
    {
      unitNumber: 'ALS-001',
      type: 'ALS',
      currentStatus: 'AVAILABLE',
      isActive: true,
      agencyId: agencies[0]?.id,
      currentLocation: { lat: 39.9817, lng: -75.1550 }
    },
    {
      unitNumber: 'CCT-001',
      type: 'CCT',
      currentStatus: 'AVAILABLE',
      isActive: true,
      agencyId: agencies[0]?.id,
      currentLocation: { lat: 40.0376, lng: -75.1420 }
    },
    {
      unitNumber: 'CCT-002',
      type: 'CCT',
      currentStatus: 'AVAILABLE',
      isActive: true,
      agencyId: agencies[1]?.id,
      currentLocation: { lat: 39.9589, lng: -75.2000 }
    }
  ];

  const units = [];
  for (const data of unitData) {
    try {
      const unit = await prisma.unit.create({
        data: {
          unitNumber: data.unitNumber,
          type: data.type,
          currentStatus: data.currentStatus,
          isActive: data.isActive,
          currentLocation: data.currentLocation,
          agencyId: data.agencyId
        }
      });
      units.push(unit);
    } catch (error) {
      console.log(`⚠️ Skipping unit ${data.unitNumber}: ${error.message}`);
    }
  }

  return units;
}

async function createDemoTransportRequests(facilities, demoUserId) {
  const transportRequestData = [
    {
      patientId: 'demo-patient-001',
      originFacilityId: facilities[0].id,
      destinationFacilityId: facilities[1].id,
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      status: 'PENDING',
      specialRequirements: 'Wheelchair accessible',
      pickupTimestamp: new Date('2025-01-23T10:00:00Z'),
      completionTimestamp: new Date('2025-01-23T11:00:00Z'),
      routeOptimizationScore: 75,
      chainingOpportunities: ['TEMPORAL', 'SPATIAL'],
      timeFlexibility: 30,
      revenuePotential: 150.00
    },
    {
      patientId: 'demo-patient-002',
      originFacilityId: facilities[1].id,
      destinationFacilityId: facilities[0].id,
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      status: 'PENDING',
      specialRequirements: 'Oxygen required',
      pickupTimestamp: new Date('2025-01-23T11:30:00Z'),
      completionTimestamp: new Date('2025-01-23T12:30:00Z'),
      routeOptimizationScore: 80,
      chainingOpportunities: ['RETURN_TRIP', 'TEMPORAL'],
      timeFlexibility: 45,
      revenuePotential: 160.00
    },
    {
      patientId: 'demo-patient-003',
      originFacilityId: facilities[0].id,
      destinationFacilityId: facilities[2].id,
      transportLevel: 'ALS',
      priority: 'HIGH',
      status: 'PENDING',
      specialRequirements: 'Cardiac monitoring',
      pickupTimestamp: new Date('2025-01-23T14:00:00Z'),
      completionTimestamp: new Date('2025-01-23T15:00:00Z'),
      routeOptimizationScore: 70,
      chainingOpportunities: ['MULTI_STOP', 'SPATIAL'],
      timeFlexibility: 60,
      revenuePotential: 180.00
    },
    {
      patientId: 'demo-patient-004',
      originFacilityId: facilities[2].id,
      destinationFacilityId: facilities[3].id,
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      status: 'PENDING',
      specialRequirements: 'Stretcher transport',
      pickupTimestamp: new Date('2025-01-23T15:30:00Z'),
      completionTimestamp: new Date('2025-01-23T16:30:00Z'),
      routeOptimizationScore: 65,
      chainingOpportunities: ['GEOGRAPHIC', 'TEMPORAL'],
      timeFlexibility: 40,
      revenuePotential: 140.00
    },
    {
      patientId: 'demo-patient-005',
      originFacilityId: facilities[3].id,
      destinationFacilityId: facilities[4].id,
      transportLevel: 'CCT',
      priority: 'URGENT',
      status: 'PENDING',
      specialRequirements: 'Ventilator support',
      pickupTimestamp: new Date('2025-01-23T16:00:00Z'),
      completionTimestamp: new Date('2025-01-23T17:00:00Z'),
      routeOptimizationScore: 85,
      chainingOpportunities: ['REVENUE_MAX', 'TEMPORAL'],
      timeFlexibility: 25,
      revenuePotential: 220.00
    },
    {
      patientId: 'demo-patient-006',
      originFacilityId: facilities[4].id,
      destinationFacilityId: facilities[0].id,
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      status: 'PENDING',
      specialRequirements: 'Basic transport',
      pickupTimestamp: new Date('2025-01-23T17:30:00Z'),
      completionTimestamp: new Date('2025-01-23T18:30:00Z'),
      routeOptimizationScore: 72,
      chainingOpportunities: ['RETURN_TRIP', 'SPATIAL'],
      timeFlexibility: 35,
      revenuePotential: 155.00
    }
  ];

  const transportRequests = [];
  for (const data of transportRequestData) {
    try {
      const request = await prisma.transportRequest.create({
        data: {
          patientId: data.patientId,
          originFacilityId: data.originFacilityId,
          destinationFacilityId: data.destinationFacilityId,
          transportLevel: data.transportLevel,
          priority: data.priority,
          status: data.status,
          specialRequirements: data.specialRequirements,
          pickupTimestamp: data.pickupTimestamp,
          completionTimestamp: data.completionTimestamp,
          routeOptimizationScore: data.routeOptimizationScore,
          chainingOpportunities: data.chainingOpportunities,
          timeFlexibility: data.timeFlexibility,
          revenuePotential: data.revenuePotential,
          createdById: demoUserId
        }
      });
      transportRequests.push(request);
    } catch (error) {
      console.log(`⚠️ Skipping transport request ${data.patientId}: ${error.message}`);
    }
  }

  return transportRequests;
}

async function createDemoDistanceMatrix(facilities) {
  const distanceEntries = [];
  
  // Create distance matrix entries between all facilities
  for (let i = 0; i < facilities.length; i++) {
    for (let j = 0; j < facilities.length; j++) {
      if (i !== j) {
        // Calculate approximate distances based on coordinates
        const distance = calculateDistance(
          facilities[i].coordinates.lat,
          facilities[i].coordinates.lng,
          facilities[j].coordinates.lat,
          facilities[j].coordinates.lng
        );
        
        const timeMinutes = Math.round(distance * 2.5); // Assume 2.5 min per mile
        
        try {
          const entry = await prisma.distanceMatrix.upsert({
            where: {
              fromFacilityId_toFacilityId: {
                fromFacilityId: facilities[i].id,
                toFacilityId: facilities[j].id
              }
            },
            update: {
              distanceMiles: distance,
              estimatedTimeMinutes: timeMinutes,
              trafficFactor: 1.0,
              tolls: 0.0,
              fuelEfficiency: 8.0,
              routeType: 'FASTEST'
            },
            create: {
              fromFacilityId: facilities[i].id,
              toFacilityId: facilities[j].id,
              distanceMiles: distance,
              estimatedTimeMinutes: timeMinutes,
              trafficFactor: 1.0,
              tolls: 0.0,
              fuelEfficiency: 8.0,
              routeType: 'FASTEST'
            }
          });
          distanceEntries.push(entry);
        } catch (error) {
          console.log(`⚠️ Skipping distance entry ${facilities[i].name} to ${facilities[j].name}: ${error.message}`);
        }
      }
    }
  }

  return distanceEntries;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Run the demo data creation
createDemoData();
