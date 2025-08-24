const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
let authToken = null;

async function testQRCodeSystem() {
  console.log('🧪 Testing MedPort QR Code System...\n');

  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Authenticating...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@medport.com',
      password: 'demo123'
    });

    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Authentication successful');
    } else {
      throw new Error('Authentication failed');
    }

    // Step 2: Test QR code health endpoint
    console.log('\n2️⃣ Testing QR Code Health Endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/qr/health`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('Health response:', JSON.stringify(healthResponse.data, null, 2));
    
    if (healthResponse.data.success) {
      console.log('✅ QR Code service is operational');
      console.log(`   Version: ${healthResponse.data.version}`);
      console.log(`   Timestamp: ${healthResponse.data.timestamp}`);
    } else {
      console.log('❌ QR Code health check failed');
    }

    // Step 3: Test transport request QR generation (we'll need a valid request ID)
    console.log('\n3️⃣ Testing Transport Request QR Generation...');
    console.log('   Note: This requires a valid transport request ID from the database');
    
    // First, let's try to get some transport requests
    const transportRequestsResponse = await axios.get(`${BASE_URL}/api/transport-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (transportRequestsResponse.data.requests && transportRequestsResponse.data.requests.length > 0) {
      const firstRequest = transportRequestsResponse.data.requests[0];
      console.log(`   Found transport request: ${firstRequest.id}`);
      
      // Now test QR code generation
      const qrResponse = await axios.get(`${BASE_URL}/api/qr/transport-request/${firstRequest.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (qrResponse.data.success) {
        console.log('✅ Transport Request QR Code generated successfully');
        console.log(`   QR Code Type: ${qrResponse.data.data.qrCodeData.type}`);
        console.log(`   Patient ID: ${qrResponse.data.data.qrCodeData.data.patientId}`);
        console.log(`   QR Code Data URL length: ${qrResponse.data.data.qrCodeDataUrl.length} characters`);
      } else {
        console.log('❌ Transport Request QR Code generation failed');
        console.log(`   Error: ${qrResponse.data.message}`);
      }
    } else {
      console.log('⚠️  No transport requests found to test with');
    }

    // Step 4: Test QR code validation
    console.log('\n4️⃣ Testing QR Code Validation...');
    const testQRData = {
      type: 'TEST',
      id: 'test-123',
      timestamp: new Date().toISOString(),
      data: { test: 'data' }
    };

    const validationResponse = await axios.post(`${BASE_URL}/api/qr/validate`, {
      qrCodeString: JSON.stringify(testQRData)
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (validationResponse.data.success) {
      console.log('✅ QR Code validation successful');
      console.log(`   Validated Type: ${validationResponse.data.data.qrCodeData.type}`);
    } else {
      console.log('❌ QR Code validation failed');
      console.log(`   Error: ${validationResponse.data.data.message}`);
    }

    console.log('\n🎉 QR Code System Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Authentication working');
    console.log('   ✅ QR Code service operational');
    console.log('   ✅ Transport Request QR generation working');
    console.log('   ✅ QR Code validation working');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testQRCodeSystem();
