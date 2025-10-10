#!/usr/bin/env node

/**
 * Test script for healthcare facility registration
 * Tests the geocoding functionality with known hospital addresses
 */

const https = require('https');

// Test addresses - known hospitals that should work
const testHospitals = [
  {
    name: "Hurley Medical Center",
    address: "1 Flushing Road",
    city: "Flint",
    state: "MI",
    zipCode: "48532",
    expectedCoords: { lat: "43.0214357", lon: "-83.7045765" }
  },
  {
    name: "Johns Hopkins Hospital",
    address: "1800 Orleans St",
    city: "Baltimore",
    state: "MD",
    zipCode: "21287",
    expectedCoords: { lat: "39.2976", lon: "-76.5928" }
  },
  {
    name: "Mayo Clinic",
    address: "200 First St SW",
    city: "Rochester",
    state: "MN",
    zipCode: "55905",
    expectedCoords: { lat: "44.0225", lon: "-92.4699" }
  },
  {
    name: "Cleveland Clinic",
    address: "9500 Euclid Ave",
    city: "Cleveland",
    state: "OH",
    zipCode: "44195",
    expectedCoords: { lat: "41.5025", lon: "-81.6214" }
  }
];

// Test geocoding function
async function testGeocoding(hospital) {
  console.log(`\n🏥 Testing: ${hospital.name}`);
  console.log(`📍 Address: ${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zipCode}`);
  
  const addressVariations = [
    `${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zipCode}`,
    `${hospital.address}, ${hospital.city}, ${hospital.state}`,
    `${hospital.city}, ${hospital.state}`,
    `${hospital.name}, ${hospital.city}, ${hospital.state}`,
  ];

  const geocodingServices = [
    {
      name: 'OpenStreetMap Nominatim',
      url: (address) => `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      headers: { 'User-Agent': 'TCC-Healthcare-Test/1.0' }
    },
    {
      name: 'OpenStreetMap Nominatim (alt)',
      url: (address) => `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1&countrycodes=us`,
      headers: { 'User-Agent': 'TCC-Healthcare-Test/1.0' }
    }
  ];

  for (const addressVariation of addressVariations) {
    console.log(`  🔍 Trying address variation: "${addressVariation}"`);
    
    for (const service of geocodingServices) {
      try {
        console.log(`    📡 Testing ${service.name}...`);
        
        const response = await fetch(service.url(addressVariation), {
          method: 'GET',
          headers: service.headers,
          mode: 'cors'
        });
        
        if (!response.ok) {
          console.log(`    ❌ ${service.name} failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          
          if (result.lat && result.lon) {
            console.log(`    ✅ SUCCESS! Found coordinates: ${result.lat}, ${result.lon}`);
            console.log(`    📍 Display name: ${result.display_name}`);
            
            // Check if coordinates are close to expected
            const latDiff = Math.abs(parseFloat(result.lat) - parseFloat(hospital.expectedCoords.lat));
            const lonDiff = Math.abs(parseFloat(result.lon) - parseFloat(hospital.expectedCoords.lon));
            
            if (latDiff < 0.01 && lonDiff < 0.01) {
              console.log(`    🎯 Coordinates match expected location!`);
            } else {
              console.log(`    ⚠️  Coordinates differ from expected (${hospital.expectedCoords.lat}, ${hospital.expectedCoords.lon})`);
            }
            
            return { success: true, coords: { lat: result.lat, lon: result.lon }, service: service.name, address: addressVariation };
          }
        }
        
        console.log(`    ❌ ${service.name} returned no valid results`);
      } catch (err) {
        console.log(`    ❌ ${service.name} error: ${err.message}`);
        continue;
      }
    }
  }

  console.log(`    ❌ All geocoding attempts failed for ${hospital.name}`);
  return { success: false };
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Healthcare Facility Geocoding Tests');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const hospital of testHospitals) {
    const result = await testGeocoding(hospital);
    results.push({ hospital: hospital.name, ...result });
    
    // Add delay between requests to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    successful.forEach(r => {
      console.log(`  • ${r.hospital}: ${r.coords.lat}, ${r.coords.lon} (via ${r.service})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(r => {
      console.log(`  • ${r.hospital}: No coordinates found`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATION:');
  if (successful.length === results.length) {
    console.log('All tests passed! The geocoding system is working correctly.');
  } else if (successful.length > 0) {
    console.log('Some tests passed. Try using facility name + city format for failed hospitals.');
  } else {
    console.log('All tests failed. There may be an issue with the geocoding services.');
  }
}

// Run the tests
runTests().catch(console.error);
