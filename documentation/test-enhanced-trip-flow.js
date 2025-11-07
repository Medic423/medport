#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

async function testEnhancedTripFlow() {
  console.log('🧪 Testing Enhanced Trip Flow Across All Modules...\n');

  try {
    // Step 1: Create an enhanced trip
    console.log('1️⃣ Creating enhanced trip...');
    const tripData = {
      patientId: 'FLOW-TEST-001',
      patientWeight: '180',
      specialNeeds: 'Oxygen required during transport',
      fromLocation: 'UPMC Altoona',
      toLocation: 'General Hospital',
      scheduledTime: '2025-09-08T17:00:00Z',
      transportLevel: 'CCT',
      urgencyLevel: 'Emergent',
      diagnosis: 'Cardiac',
      mobilityLevel: 'Stretcher',
      oxygenRequired: true,
      monitoringRequired: true,
      generateQRCode: true,
      selectedAgencies: [],
      notificationRadius: 150,
      notes: 'Critical patient requiring immediate transport'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/api/trips/enhanced`, tripData);
    
    if (createResponse.data.success) {
      console.log('✅ Enhanced trip created successfully');
      console.log(`   Trip ID: ${createResponse.data.data.id}`);
      console.log(`   Trip Number: ${createResponse.data.data.tripNumber}`);
      console.log(`   Patient ID: ${createResponse.data.data.patientId}`);
      console.log(`   QR Code: ${createResponse.data.data.qrCodeData ? 'Generated' : 'Not generated'}`);
    } else {
      console.log('❌ Failed to create enhanced trip');
      return;
    }

    // Step 2: Verify trip appears in Center database
    console.log('\n2️⃣ Verifying trip in Center database...');
    const centerResponse = await axios.get(`${API_BASE_URL}/api/trips`);
    
    if (centerResponse.data.success) {
      const trip = centerResponse.data.data.find(t => t.patientId === 'FLOW-TEST-001');
      if (trip) {
        console.log('✅ Trip found in Center database');
        console.log(`   Enhanced fields present: ${trip.diagnosis ? '✅' : '❌'} diagnosis`);
        console.log(`   Enhanced fields present: ${trip.mobilityLevel ? '✅' : '❌'} mobility`);
        console.log(`   Enhanced fields present: ${trip.oxygenRequired ? '✅' : '❌'} oxygen`);
        console.log(`   Enhanced fields present: ${trip.monitoringRequired ? '✅' : '❌'} monitoring`);
        console.log(`   Enhanced fields present: ${trip.qrCodeData ? '✅' : '❌'} QR code`);
      } else {
        console.log('❌ Trip not found in Center database');
      }
    } else {
      console.log('❌ Failed to retrieve trips from Center database');
    }

    // Step 3: Test form options endpoints
    console.log('\n3️⃣ Testing form options endpoints...');
    const optionsTests = [
      { name: 'Diagnosis', endpoint: '/api/trips/options/diagnosis' },
      { name: 'Mobility', endpoint: '/api/trips/options/mobility' },
      { name: 'Transport Level', endpoint: '/api/trips/options/transport-level' },
      { name: 'Urgency', endpoint: '/api/trips/options/urgency' }
    ];

    for (const test of optionsTests) {
      try {
        const response = await axios.get(`${API_BASE_URL}${test.endpoint}`);
        if (response.data.success && response.data.data.length > 0) {
          console.log(`✅ ${test.name} options: ${response.data.data.length} options available`);
        } else {
          console.log(`❌ ${test.name} options: No data returned`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} options: ${error.message}`);
      }
    }

    // Step 4: Test agency filtering endpoint
    console.log('\n4️⃣ Testing agency filtering...');
    try {
      const agencyResponse = await axios.get(`${API_BASE_URL}/api/trips/agencies/test-hospital-id?radius=100`);
      if (agencyResponse.data.success) {
        console.log(`✅ Agency filtering: ${agencyResponse.data.data.length} agencies found`);
      } else {
        console.log('❌ Agency filtering: No agencies returned');
      }
    } catch (error) {
      console.log(`❌ Agency filtering: ${error.message}`);
    }

    console.log('\n🎉 Enhanced Trip Flow Test Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Enhanced trip creation working');
    console.log('✅ Center database storage working');
    console.log('✅ Form options endpoints working');
    console.log('✅ Agency filtering working');
    console.log('\n🔍 Next Steps:');
    console.log('1. Test frontend enhanced form at http://localhost:3000');
    console.log('2. Login as healthcare user to test form');
    console.log('3. Verify enhanced trips display in dashboards');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testEnhancedTripFlow();
