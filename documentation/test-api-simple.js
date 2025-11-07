#!/usr/bin/env node

/**
 * Simple test to verify API endpoints are working
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('/health');
    console.log('Health status:', health.status);
    console.log('Health data:', health.data);

    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const root = await makeRequest('/');
    console.log('Root status:', root.status);
    console.log('Root data:', root.data);

    // Test trips endpoint
    console.log('\n3. Testing trips endpoint...');
    const trips = await makeRequest('/api/trips');
    console.log('Trips status:', trips.status);
    console.log('Trips data:', trips.data);

    // Test agency responses endpoint
    console.log('\n4. Testing agency responses endpoint...');
    const responses = await makeRequest('/api/agency-responses');
    console.log('Agency responses status:', responses.status);
    console.log('Agency responses data:', responses.data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5001');
  }
}

testAPI();
