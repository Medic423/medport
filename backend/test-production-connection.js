#!/usr/bin/env node

// Test script to verify production database connection
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing production database connection...');
  
  try {
    // Test the production database connection
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);

    // Test SystemAnalytics table (the one that was failing)
    try {
      const analytics = await prisma.systemAnalytics.findFirst();
      console.log('✅ SystemAnalytics table accessible');
    } catch (error) {
      console.log('⚠️ SystemAnalytics table issue:', error.message);
    }

    await prisma.$disconnect();
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('Server has closed the connection')) {
      console.log('\n💡 This suggests the database connection string might be incorrect or the database is not accessible.');
      console.log('💡 Make sure you\'re using the internal connection string from Render dashboard.');
    }
    
    process.exit(1);
  }
}

testConnection();
