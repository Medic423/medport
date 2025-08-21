const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuth() {
  try {
    console.log('🧪 Testing MedPort Authentication System...\n');

    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@medport.com',
      password: 'testpassword123',
      name: 'Test User',
      role: 'USER'
    });
    console.log('✅ Registration successful:', registerResponse.data.message);
    const token = registerResponse.data.token;
    console.log('   Token received:', token.substring(0, 20) + '...\n');

    // Test 2: User Login
    console.log('2. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@medport.com',
      password: 'testpassword123'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   User role:', loginResponse.data.user.role, '\n');

    // Test 3: Protected Route Access
    console.log('3. Testing Protected Route Access...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful:', profileResponse.data.user.name, '\n');

    // Test 4: Dashboard Access
    console.log('4. Testing Dashboard Access...');
    const dashboardResponse = await axios.get(`${BASE_URL}/protected/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard access successful:', dashboardResponse.data.message, '\n');

    console.log('🎉 All authentication tests passed successfully!');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.data);
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run the test
testAuth();
