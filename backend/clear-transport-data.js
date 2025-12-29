#!/usr/bin/env node
/**
 * Clear transport requests and trips from database
 * Usage: TARGET_DB="..." node clear-transport-data.js
 * 
 * WARNING: This will DELETE all transport requests and trips!
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
    const tripCount = await targetPrisma.trip?.count() || 0;
    
    console.log(`\nCurrent data:`);
    console.log(`  Transport Requests: ${transportRequestCount}`);
    console.log(`  Trips: ${tripCount}`);
    
    if (transportRequestCount === 0 && tripCount === 0) {
      console.log('\n✅ Database is already empty. Nothing to clear.');
      await targetPrisma.$disconnect();
      return;
    }

    console.log('\n🗑️  Clearing transport requests and trips...');
    
    // Delete trips first (if they exist and have foreign keys)
    try {
      if (tripCount > 0) {
        const deletedTrips = await targetPrisma.trip?.deleteMany({});
        console.log(`  ✅ Deleted ${deletedTrips?.count || 0} trips`);
      }
    } catch (error) {
      console.log(`  ⚠️  No trips table or error: ${error.message}`);
    }

    // Delete transport requests
    const deletedRequests = await targetPrisma.transportRequest.deleteMany({});
    console.log(`  ✅ Deleted ${deletedRequests.count} transport requests`);

    // Verify deletion
    const remainingRequests = await targetPrisma.transportRequest.count();
    const remainingTrips = await targetPrisma.trip?.count() || 0;
    
    console.log(`\n✅ Clear complete:`);
    console.log(`  Remaining Transport Requests: ${remainingRequests}`);
    console.log(`  Remaining Trips: ${remainingTrips}`);
    
    if (remainingRequests === 0 && remainingTrips === 0) {
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

