#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up TCC database schema...');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname));
  
  console.log('📊 Generating Prisma clients...');
  execSync('npx prisma generate --schema=prisma/schema-center.prisma', { stdio: 'inherit' });
  execSync('npx prisma generate --schema=prisma/schema-hospital.prisma', { stdio: 'inherit' });
  execSync('npx prisma generate --schema=prisma/schema-ems.prisma', { stdio: 'inherit' });
  
  console.log('🗄️ Pushing database schema...');
  execSync('npx prisma db push --schema=prisma/schema-center.prisma', { stdio: 'inherit' });
  execSync('npx prisma db push --schema=prisma/schema-hospital.prisma', { stdio: 'inherit' });
  execSync('npx prisma db push --schema=prisma/schema-ems.prisma', { stdio: 'inherit' });
  
  console.log('🌱 Seeding database...');
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
