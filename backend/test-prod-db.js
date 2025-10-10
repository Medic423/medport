const { PrismaClient } = require('@prisma/client');

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db?sslmode=require'
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing production DB connection...');
    await prodPrisma.$connect();
    console.log('✅ Connected to production DB');
    
    // Test a simple query
    const result = await prodPrisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prodPrisma.$disconnect();
  }
}

testConnection();
