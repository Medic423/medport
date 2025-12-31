#!/usr/bin/env node
/**
 * Test all EMS endpoints for test-ems@tcc.com user
 * Usage: API_URL="https://api.traccems.com" node test-ems-endpoints.js
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'https://api.traccems.com';
const EMAIL = 'test-ems@tcc.com';
const PASSWORD = 'testpassword123';

// Helper to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEMSEndpoints() {
  console.log('🧪 Testing EMS Endpoints for test-ems@tcc.com\n');
  console.log('API URL:', API_URL);
  console.log('Email:', EMAIL);
  console.log('═══════════════════════════════════════════════\n');
  
  let token = null;
  let userId = null;
  let agencyId = null;
  
  // Test 1: Login
  console.log('1️⃣  Testing EMS Login...');
  try {
    const loginResponse = await makeRequest(`${API_URL}/api/auth/ems/login`, {
      method: 'POST',
      body: { email: EMAIL, password: PASSWORD }
    });
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      token = loginResponse.data.token;
      userId = loginResponse.data.user?.id;
      agencyId = loginResponse.data.user?.agencyId;
      console.log('   ✅ Login successful');
      console.log('   User ID:', userId);
      console.log('   Agency ID:', agencyId);
      console.log('   Token:', token.substring(0, 20) + '...');
    } else {
      console.log('   ❌ Login failed');
      console.log('   Status:', loginResponse.status);
      console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));
      console.log('\n⚠️  Cannot continue testing without login. Fix login first.');
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }
  
  console.log('\n═══════════════════════════════════════════════\n');
  
  // Get cookies from login response
  let loginResponseCookies = '';
  try {
    const loginRes = await makeRequest(`${API_URL}/api/auth/ems/login`, {
      method: 'POST',
      body: { email: EMAIL, password: PASSWORD }
    });
    if (loginRes.headers['set-cookie']) {
      loginResponseCookies = loginRes.headers['set-cookie'].join('; ');
    }
  } catch (e) {
    // Ignore
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Cookie': loginResponseCookies
  };
  
  // Test 2: Get Agency Info
  console.log('2️⃣  Testing GET /api/auth/ems/agency/info...');
  try {
    const response = await makeRequest(`${API_URL}/api/auth/ems/agency/info`, {
      method: 'GET',
      headers: authHeaders
    });
    console.log('   Status:', response.status);
    if (response.status === 200) {
      console.log('   ✅ Success');
      console.log('   Agency Name:', response.data.data?.name || 'N/A');
    } else {
      console.log('   ❌ Failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 3: Get Units
  console.log('\n3️⃣  Testing GET /api/units...');
  try {
    const response = await makeRequest(`${API_URL}/api/units`, {
      method: 'GET',
      headers: authHeaders
    });
    console.log('   Status:', response.status);
    if (response.status === 200) {
      console.log('   ✅ Success');
      console.log('   Units Count:', Array.isArray(response.data.data) ? response.data.data.length : 'N/A');
    } else {
      console.log('   ❌ Failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 4: Get Trips/Transport Requests
  console.log('\n4️⃣  Testing GET /api/trips...');
  try {
    const response = await makeRequest(`${API_URL}/api/trips`, {
      method: 'GET',
      headers: authHeaders
    });
    console.log('   Status:', response.status);
    if (response.status === 200) {
      console.log('   ✅ Success');
      console.log('   Trips Count:', Array.isArray(response.data.data) ? response.data.data.length : 'N/A');
    } else {
      console.log('   ❌ Failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 5: Get Agency Responses
  console.log('\n5️⃣  Testing GET /api/agency-responses...');
  try {
    const response = await makeRequest(`${API_URL}/api/agency-responses`, {
      method: 'GET',
      headers: authHeaders
    });
    console.log('   Status:', response.status);
    if (response.status === 200) {
      console.log('   ✅ Success');
      console.log('   Responses Count:', Array.isArray(response.data.data) ? response.data.data.length : 'N/A');
    } else {
      console.log('   ❌ Failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 6: Get EMS Analytics
  console.log('\n6️⃣  Testing GET /api/ems/analytics...');
  try {
    const response = await makeRequest(`${API_URL}/api/ems/analytics`, {
      method: 'GET',
      headers: authHeaders
    });
    console.log('   Status:', response.status);
    if (response.status === 200) {
      console.log('   ✅ Success');
      console.log('   Analytics:', Object.keys(response.data.data || {}).join(', '));
    } else {
      console.log('   ❌ Failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 7: Update Agency Info (if agencyId exists)
  if (agencyId) {
    console.log('\n7️⃣  Testing PUT /api/auth/ems/agency/info...');
    try {
      const response = await makeRequest(`${API_URL}/api/auth/ems/agency/info`, {
        method: 'PUT',
        headers: authHeaders,
        body: {
          phone: '555-0100',
          address: '123 Test St',
          city: 'Test City',
          state: 'PA',
          zipCode: '12345'
        }
      });
      console.log('   Status:', response.status);
      if (response.status === 200) {
        console.log('   ✅ Success');
      } else {
        console.log('   ❌ Failed');
        console.log('   Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ Endpoint testing complete!');
  console.log('═══════════════════════════════════════════════');
}

testEMSEndpoints().catch(console.error);

