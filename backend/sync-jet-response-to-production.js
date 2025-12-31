#!/usr/bin/env node
/**
 * Sync Jet Response user and agency to production database
 * 
 * IMPORTANT: This script requires production DATABASE_URL to be set
 * Usage: DATABASE_URL=<production_url> node backend/sync-jet-response-to-production.js
 * 
 * OR set it in .env.production file
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load production environment if available
dotenv.config({ path: '.env.production', override: false });

async function syncToProduction() {
  let localPrisma, prodPrisma;
  
  try {
    console.log('🔧 Syncing Jet Response to production...\n');
    
    // Check if production DATABASE_URL is set
    const prodDatabaseUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!prodDatabaseUrl || prodDatabaseUrl.includes('localhost')) {
      console.log('⚠️  Production DATABASE_URL not set or points to localhost');
      console.log('   Set PROD_DATABASE_URL environment variable to production database URL');
      console.log('   Example: PROD_DATABASE_URL=postgresql://... node sync-jet-response-to-production.js\n');
      return;
    }
    
    console.log('📋 Connecting to databases...');
    
    // Local database
    localPrisma = new PrismaClient();
    
    // Production database
    prodPrisma = new PrismaClient({
      datasources: {
        db: {
          url: prodDatabaseUrl
        }
      }
    });
    
    // Get user and agency from local
    console.log('📥 Fetching from local database...');
    const localUser = await localPrisma.eMSUser.findFirst({
      where: { email: 'chuck@traccems.com' }
    });
    
    if (!localUser) {
      console.log('❌ User not found in local database: chuck@traccems.com');
      return;
    }
    
    const localAgency = await localPrisma.eMSAgency.findFirst({
      where: { id: localUser.agencyId }
    });
    
    if (!localAgency) {
      console.log('❌ Agency not found in local database');
      return;
    }
    
    console.log('✅ Found locally:');
    console.log('   User:', localUser.name, localUser.email);
    console.log('   Agency:', localAgency.name);
    
    // Check if exists in production
    console.log('\n📤 Checking production database...');
    const existingProdUser = await prodPrisma.eMSUser.findUnique({
      where: { email: localUser.email }
    });
    
    const existingProdAgency = await prodPrisma.eMSAgency.findFirst({
      where: { name: localAgency.name }
    });
    
    // Create or update agency in production
    let prodAgency;
    if (existingProdAgency) {
      console.log('⚠️  Agency already exists in production, updating...');
      prodAgency = await prodPrisma.eMSAgency.update({
        where: { id: existingProdAgency.id },
        data: {
          contactName: localAgency.contactName,
          phone: localAgency.phone,
          email: localAgency.email,
          address: localAgency.address,
          city: localAgency.city,
          state: localAgency.state,
          zipCode: localAgency.zipCode,
          serviceArea: localAgency.serviceArea,
          capabilities: localAgency.capabilities,
          operatingHours: localAgency.operatingHours,
          latitude: localAgency.latitude,
          longitude: localAgency.longitude,
          isActive: localAgency.isActive,
          status: localAgency.status || 'ACTIVE'
        }
      });
    } else {
      console.log('✅ Creating agency in production...');
      prodAgency = await prodPrisma.eMSAgency.create({
        data: {
          name: localAgency.name,
          contactName: localAgency.contactName,
          phone: localAgency.phone,
          email: localAgency.email,
          address: localAgency.address,
          city: localAgency.city,
          state: localAgency.state,
          zipCode: localAgency.zipCode,
          serviceArea: localAgency.serviceArea,
          capabilities: localAgency.capabilities,
          operatingHours: localAgency.operatingHours,
          latitude: localAgency.latitude,
          longitude: localAgency.longitude,
          isActive: localAgency.isActive,
          status: localAgency.status || 'ACTIVE',
          requiresReview: false
        }
      });
    }
    
    console.log('✅ Agency synced:', prodAgency.name, '(ID:', prodAgency.id + ')');
    
    // Create or update user in production
    // Note: We can't copy the password hash, so we'll need to set a new one
    const tempPassword = 'TempPassword123!'; // User should change this
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    if (existingProdUser) {
      console.log('⚠️  User already exists in production, updating...');
      await prodPrisma.eMSUser.update({
        where: { id: existingProdUser.id },
        data: {
          name: localUser.name,
          agencyName: localUser.agencyName,
          agencyId: prodAgency.id,
          isActive: localUser.isActive,
          orgAdmin: localUser.orgAdmin,
          password: hashedPassword, // Reset password
          mustChangePassword: true
        }
      });
      console.log('✅ User updated in production');
    } else {
      console.log('✅ Creating user in production...');
      await prodPrisma.eMSUser.create({
        data: {
          email: localUser.email,
          password: hashedPassword,
          name: localUser.name,
          agencyName: localUser.agencyName,
          agencyId: prodAgency.id,
          userType: 'EMS',
          isActive: localUser.isActive,
          orgAdmin: localUser.orgAdmin,
          mustChangePassword: true
        }
      });
      console.log('✅ User created in production');
    }
    
    console.log('\n✅ Sync complete!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Production Credentials:');
    console.log('   Email: chuck@traccems.com');
    console.log('   Password: TempPassword123!');
    console.log('   ⚠️  Password must be changed on first login');
    console.log('═══════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error syncing to production:', error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (localPrisma) await localPrisma.$disconnect();
    if (prodPrisma) await prodPrisma.$disconnect();
  }
}

syncToProduction();

