// Test script to create a trip and trigger dispatch screen
// Run: node test_dispatch.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const USER_EMAIL = 'chuck@ferrellhospitals.com';
const USER_PASSWORD = 'testpassword'; // Password from seed.ts

async function testDispatch() {
  try {
    console.log('Step 1: Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/healthcare/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\nStep 2: Get healthcare locations...');
    const locationsRes = await axios.get(`${BASE_URL}/api/healthcare/locations`, { headers });
    const locations = locationsRes.data.data || [];
    console.log(`✅ Found ${locations.length} locations`);
    
    if (locations.length === 0) {
      console.error('❌ No healthcare locations found!');
      return;
    }

    // Get destinations
    const destinationsRes = await axios.get(`${BASE_URL}/api/healthcare/destinations`, { headers });
    const destinations = destinationsRes.data.data || [];
    console.log(`✅ Found ${destinations.length} destinations`);

    if (destinations.length === 0) {
      console.error('❌ No destinations found!');
      return;
    }

    // Use first location and destination
    const fromLocationId = locations[0].id;
    const toFacilityName = destinations[0].name;

    console.log('\nStep 3: Create trip...');
    const tripData = {
      patientId: 'TEST-PATIENT-001',
      patientWeight: '75',
      specialNeeds: null,
      patientAgeCategory: 'ADULT',
      patientAgeYears: 45,
      fromLocation: locations[0].locationName,
      fromLocationId: locations[0].id,
      toLocation: toFacilityName,
      scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      priority: 'MEDIUM',
      generateQRCode: false,
      selectedAgencies: [],
      notificationRadius: undefined,
      notes: 'Test trip for dispatch screen',
      healthcareUserId: loginRes.data.user.id,
      status: 'PENDING_DISPATCH',
      diagnosis: 'General transfer',
      mobilityLevel: 'AMBULATORY',
      oxygenRequired: false,
      monitoringRequired: false,
      insuranceCompany: 'Medicare',
      createdVia: 'HEALTHCARE_PORTAL'
    };

    const tripRes = await axios.post(
      `${BASE_URL}/api/trips/enhanced`, 
      tripData, 
      { headers }
    );
    
    console.log('✅ Trip created:', tripRes.data.data.id);
    console.log('\nStep 4: Get agencies for trip...');
    
    // Now test the dispatch screen API
    const agenciesRes = await axios.get(
      `${BASE_URL}/api/healthcare/agencies/trip-agencies?tripId=${tripRes.data.data.id}&mode=HYBRID&radius=100`,
      { headers }
    );

    console.log('\n✅ Dispatch Agencies Response:');
    console.log('  Total agencies:', agenciesRes.data.data.agencies.length);
    console.log('  Preferred:', agenciesRes.data.data.preferredCount);
    console.log('  Geographic:', agenciesRes.data.data.geographicCount);
    console.log('  User agencies:', agenciesRes.data.data.userAgenciesCount);
    console.log('\nAgencies:');
    agenciesRes.data.data.agencies.forEach((agency, i) => {
      const distanceStr = agency.distance !== null ? `${agency.distance.toFixed(1)} mi` : 'N/A';
      console.log(`  ${i+1}. ${agency.name} - Preferred: ${agency.isPreferred}, Registered: ${agency.isRegistered}, UserAdded: ${agency.isUserAdded || false}, Distance: ${distanceStr}`);
    });

    console.log('\n✅ Test complete! Open dispatch screen in browser with trip ID:', tripRes.data.data.id);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Error details:', error.response.data.error);
    }
  }
}

testDispatch();

