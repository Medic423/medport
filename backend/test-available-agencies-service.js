#!/usr/bin/env node
/**
 * Test the getAvailableAgenciesForHealthcareUser service method
 * Usage: node test-available-agencies-service.js
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

async function testService() {
  try {
    console.log('🧪 Testing getAvailableAgenciesForHealthcareUser service method...\n');
    
    // Import the service
    const { healthcareAgencyService } = await import('./src/services/healthcareAgencyService.ts');
    
    // Get a healthcare user ID from database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const healthcareUser = await prisma.healthcareUser.findFirst({
      where: {
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    if (!healthcareUser) {
      console.error('❌ No healthcare user found in database');
      await prisma.$disconnect();
      process.exit(1);
    }
    
    console.log('📋 Testing with healthcare user:');
    console.log(`   ID: ${healthcareUser.id}`);
    console.log(`   Email: ${healthcareUser.email}`);
    console.log(`   Name: ${healthcareUser.name}\n`);
    
    // Test the service method
    console.log('🔍 Calling getAvailableAgenciesForHealthcareUser...\n');
    
    try {
      const agencies = await healthcareAgencyService.getAvailableAgenciesForHealthcareUser(
        healthcareUser.id,
        50 // 50 mile radius
      );
      
      console.log('✅ Service method succeeded!');
      console.log(`   Found ${agencies.length} available agencies\n`);
      
      if (agencies.length > 0) {
        console.log('📊 Available agencies:');
        agencies.forEach((agency, index) => {
          console.log(`   ${index + 1}. ${agency.name}`);
          console.log(`      - Distance: ${agency.distance !== null ? agency.distance.toFixed(2) + ' miles' : 'N/A'}`);
          console.log(`      - Available Levels: ${agency.availableLevels?.join(', ') || 'None'}`);
          console.log(`      - Preferred: ${agency.isPreferred ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('ℹ️  No available agencies found (this is OK if none are marked as available)');
      }
      
      await prisma.$disconnect();
      process.exit(0);
      
    } catch (serviceError) {
      console.error('❌ Service method failed:');
      console.error('   Error:', serviceError.message);
      console.error('   Stack:', serviceError.stack);
      
      // Check if it's an import error
      if (serviceError.message.includes('Cannot find module') || 
          serviceError.message.includes('Failed to resolve')) {
        console.error('\n⚠️  This looks like a module import error');
        console.error('   The dynamic import of DistanceService may be failing');
      }
      
      await prisma.$disconnect();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testService();
