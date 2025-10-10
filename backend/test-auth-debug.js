// Test script to debug auth issues
const { PrismaClient } = require('@prisma/client');

async function testAuth() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgres://83b6f3a648992f0d604de269444988ad1248aa92f5ea7b85b794af2bc447f869:sk_53MYkpIqmD_l7bf7ex3lw@db.prisma.io:5432/postgres?sslmode=require'
      }
    }
  });

  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test healthcare users table
    console.log('Testing healthcare users...');
    const healthcareUsers = await prisma.healthcareUser.findMany();
    console.log(`✅ Found ${healthcareUsers.length} healthcare users`);
    
    // Test specific user
    const healthcareUser = await prisma.healthcareUser.findFirst({
      where: { email: 'test@hospital.com' }
    });
    console.log('Healthcare user:', healthcareUser ? '✅ Found' : '❌ Not found');
    
    // Test EMS users table
    console.log('Testing EMS users...');
    const emsUsers = await prisma.eMSUser.findMany();
    console.log(`✅ Found ${emsUsers.length} EMS users`);
    
    // Test specific EMS user
    const emsUser = await prisma.eMSUser.findFirst({
      where: { email: 'test@ems.com' }
    });
    console.log('EMS user:', emsUser ? '✅ Found' : '❌ Not found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
