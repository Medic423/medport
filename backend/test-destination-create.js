#!/usr/bin/env node
/**
 * Test creating a healthcare destination to see the actual error
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

async function testCreate() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    
    console.log('Testing healthcare destination create...\n');
    
    // Get a healthcare user
    const user = await prisma.healthcareUser.findFirst({
      where: { isActive: true }
    });
    
    if (!user) {
      console.error('No healthcare user found');
      await prisma.$disconnect();
      process.exit(1);
    }
    
    console.log('Using healthcare user:', user.id, user.email);
    
    // Try to create a destination
    try {
      const destination = await prisma.healthcareDestination.create({
        data: {
          healthcareUserId: user.id,
          name: 'Test Destination',
          type: 'Other',
          address: '123 Test St',
          city: 'Test City',
          state: 'PA',
          zipCode: '12345',
        }
      });
      
      console.log('✅ Success! Created destination:', destination.id);
      
      // Clean up
      await prisma.healthcareDestination.delete({
        where: { id: destination.id }
      });
      console.log('✅ Test destination deleted');
      
    } catch (createError) {
      console.error('❌ Create error:', createError.message);
      console.error('Error code:', createError.code);
      console.error('Error meta:', JSON.stringify(createError.meta, null, 2));
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testCreate();
