#!/usr/bin/env node
/**
 * Clear transport requests from database
 * Usage: TARGET_DB="..." node clear-transport-data.js
 * 
 * WARNING: This will DELETE all transport requests!
 */

const { PrismaClient } = require('@prisma/client');

const TARGET_DB = process.env.TARGET_DB;

if (!TARGET_DB) {
  console.error('Usage: TARGET_DB="..." node clear-transport-data.js');
  process.exit(1);
}

async function clearTransportData() {
  console.log('⚠️  WARNING: This will DELETE all transport requests and trips!');
  console.log('Target database:', TARGET_DB.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  const targetPrisma = new PrismaClient({
    datasources: {
      db: {
        url: TARGET_DB
      }
    }
  });

  try {
    // Check current counts
    const transportRequestCount = await targetPrisma.transportRequest.count();
    
    console.log(`\nCurrent data:`);
    console.log(`  Transport Requests: ${transportRequestCount}`);
    
    if (transportRequestCount === 0) {
      console.log('\n✅ Database is already empty. Nothing to clear.');
      await targetPrisma.$disconnect();
      return;
    }

    console.log('\n🗑️  Clearing transport requests...');
    
    // Delete transport requests
    const deletedRequests = await targetPrisma.transportRequest.deleteMany({});
    console.log(`  ✅ Deleted ${deletedRequests.count} transport requests`);

    // Verify deletion
    const remainingRequests = await targetPrisma.transportRequest.count();
    
    console.log(`\n✅ Clear complete:`);
    console.log(`  Remaining Transport Requests: ${remainingRequests}`);
    
    if (remainingRequests === 0) {
      console.log('\n✅ Database cleared successfully!');
    } else {
      console.log('\n⚠️  Warning: Some data may still remain.');
    }

  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    process.exit(1);
  } finally {
    await targetPrisma.$disconnect();
  }
}

clearTransportData();

