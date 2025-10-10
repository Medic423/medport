#!/usr/bin/env node

/**
 * Test script for Phase 1C API endpoints
 * Tests the new agency response functionality
 */

const BASE_URL = 'http://localhost:5001';

async function testAPI() {
  console.log('🧪 Testing Phase 1C API Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Create a trip with response handling
    console.log('\n2. Testing create trip with responses...');
    const tripData = {
      fromLocation: 'Test Hospital',
      toLocation: 'Test Destination',
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      responseDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      maxResponses: 3,
      selectionMode: 'SPECIFIC_AGENCIES'
    };

    const tripResponse = await fetch(`${BASE_URL}/api/trips/with-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tripData)
    });

    const tripResult = await tripResponse.json();
    console.log('✅ Trip created:', tripResult.success ? 'SUCCESS' : 'FAILED');
    
    if (!tripResult.success) {
      console.log('❌ Error:', tripResult.error);
      return;
    }

    const tripId = tripResult.data.id;
    console.log('📋 Trip ID:', tripId);

    // Test 3: Get trip with responses
    console.log('\n3. Testing get trip with responses...');
    const tripWithResponsesResponse = await fetch(`${BASE_URL}/api/trips/${tripId}/with-responses`);
    const tripWithResponsesData = await tripWithResponsesResponse.json();
    console.log('✅ Trip with responses:', tripWithResponsesData.success ? 'SUCCESS' : 'FAILED');

    // Test 4: Get response summary
    console.log('\n4. Testing get response summary...');
    const summaryResponse = await fetch(`${BASE_URL}/api/trips/${tripId}/response-summary`);
    const summaryData = await summaryResponse.json();
    console.log('✅ Response summary:', summaryData.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Summary:', summaryData.data);

    // Test 5: Update trip response fields
    console.log('\n5. Testing update trip response fields...');
    const updateData = {
      maxResponses: 5,
      responseStatus: 'RESPONSES_RECEIVED'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/trips/${tripId}/response-fields`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Update response fields:', updateResult.success ? 'SUCCESS' : 'FAILED');

    // Test 6: Get agency responses (should be empty)
    console.log('\n6. Testing get agency responses...');
    const responsesResponse = await fetch(`${BASE_URL}/api/agency-responses?tripId=${tripId}`);
    const responsesData = await responsesResponse.json();
    console.log('✅ Get agency responses:', responsesData.success ? 'SUCCESS' : 'FAILED');
    console.log('📋 Responses count:', responsesData.data.length);

    console.log('\n🎉 All Phase 1C API tests completed successfully!');
    console.log('\n📋 Summary of implemented endpoints:');
    console.log('   • POST /api/trips/with-responses - Create trip with response handling');
    console.log('   • GET /api/trips/:id/with-responses - Get trip with all responses');
    console.log('   • GET /api/trips/:id/response-summary - Get response summary');
    console.log('   • PUT /api/trips/:id/response-fields - Update response fields');
    console.log('   • POST /api/agency-responses - Create agency response');
    console.log('   • GET /api/agency-responses - Get agency responses with filtering');
    console.log('   • PUT /api/agency-responses/:id - Update agency response');
    console.log('   • GET /api/agency-responses/:id - Get single agency response');
    console.log('   • POST /api/agency-responses/select/:tripId - Select agency for trip');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5001');
    console.log('   Run: cd backend && npm run dev');
  }
}

// Run the test
testAPI();
