#!/usr/bin/env node

// Test script to verify center login flow
const fetch = require('node-fetch');

async function testCenterLogin() {
  console.log('🧪 Testing Center Login Flow...\n');
  
  try {
    // Step 1: Test center login
    console.log('1️⃣ Testing center login...');
    const loginResponse = await fetch('http://localhost:5001/api/siloed-auth/center-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'center@medport.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    
    console.log('✅ Login successful');
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   User Type: ${loginData.user.userType}`);
    console.log(`   Token: ${loginData.token.substring(0, 50)}...`);
    
    const token = loginData.token;
    
    // Step 2: Test navigation endpoint
    console.log('\n2️⃣ Testing navigation endpoint...');
    const navResponse = await fetch('http://localhost:5001/api/simple-navigation/navigation', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const navData = await navResponse.json();
    
    if (!navData.success) {
      throw new Error(`Navigation failed: ${navData.message}`);
    }
    
    console.log('✅ Navigation successful');
    console.log(`   User Type: ${navData.data.userType}`);
    console.log(`   Menu Items: ${navData.data.navigation.length}`);
    navData.data.navigation.forEach(item => {
      console.log(`     - ${item.name} (${item.path})`);
    });
    
    // Step 3: Test landing page endpoint
    console.log('\n3️⃣ Testing landing page endpoint...');
    const landingResponse = await fetch('http://localhost:5001/api/simple-navigation/landing-page', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const landingData = await landingResponse.json();
    
    if (!landingData.success) {
      throw new Error(`Landing page failed: ${landingData.message}`);
    }
    
    console.log('✅ Landing page successful');
    console.log(`   User Type: ${landingData.data.userType}`);
    console.log(`   Landing Page: ${landingData.data.landingPage}`);
    
    // Step 4: Verify user type consistency
    console.log('\n4️⃣ Verifying user type consistency...');
    const expectedUserType = 'center';
    const actualUserType = navData.data.userType;
    
    if (actualUserType === expectedUserType) {
      console.log('✅ User type consistency verified');
      console.log(`   Expected: ${expectedUserType}`);
      console.log(`   Actual: ${actualUserType}`);
    } else {
      throw new Error(`User type mismatch: expected ${expectedUserType}, got ${actualUserType}`);
    }
    
    console.log('\n🎉 All tests passed! Center login flow is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`   - Login: ✅ Success`);
    console.log(`   - Navigation: ✅ ${navData.data.navigation.length} menu items`);
    console.log(`   - Landing Page: ✅ ${landingData.data.landingPage}`);
    console.log(`   - User Type: ✅ ${actualUserType}`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCenterLogin();
