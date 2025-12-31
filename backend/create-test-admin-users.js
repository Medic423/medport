#!/usr/bin/env node
/**
 * Create admin users for Healthcare (UPMC Altoona) and EMS (Jet Response)
 * Usage: node backend/create-test-admin-users.js
 */

const { databaseManager } = require('./dist/services/databaseManager');
const { GeocodingService } = require('./dist/utils/geocodingService');
const bcrypt = require('bcryptjs');

async function createTestAdminUsers() {
  let prisma;
  try {
    console.log('🔧 Creating test admin users...\n');
    
    prisma = databaseManager.getPrismaClient();
    
    // ============================================
    // Healthcare User: UPMC Altoona
    // ============================================
    console.log('📋 Creating Healthcare Admin User: UPMC Altoona');
    console.log('   Address: 620 Howard Ave, Altoona, PA 16601');
    console.log('   Contact: Sally Williams, RN');
    console.log('   Phone: +1 814 889 2011\n');
    
    const healthcareEmail = 'sally.williams@upmcaltoona.org';
    const healthcarePassword = 'TestPassword123!';
    const healthcareName = 'Sally Williams, RN';
    const healthcareFacilityName = 'UPMC Altoona';
    const healthcareAddress = '620 Howard Ave';
    const healthcareCity = 'Altoona';
    const healthcareState = 'PA';
    const healthcareZipCode = '16601';
    const healthcarePhone = '+1 814 889 2011';
    
    // Geocode healthcare address
    console.log('   🔍 Geocoding healthcare address...');
    const healthcareGeocode = await GeocodingService.geocodeAddress(
      healthcareAddress,
      healthcareCity,
      healthcareState,
      healthcareZipCode,
      healthcareFacilityName
    );
    
    if (!healthcareGeocode.success) {
      console.warn('   ⚠️  Geocoding failed:', healthcareGeocode.error);
      console.log('   Continuing without coordinates...\n');
    } else {
      console.log(`   ✅ Coordinates found: ${healthcareGeocode.latitude}, ${healthcareGeocode.longitude}\n`);
    }
    
    // Check if healthcare user already exists
    const existingHealthcareUser = await prisma.healthcareUser.findUnique({
      where: { email: healthcareEmail }
    });
    
    if (existingHealthcareUser) {
      console.log('   ⚠️  Healthcare user already exists, updating...');
      await prisma.healthcareUser.update({
        where: { email: healthcareEmail },
        data: {
          password: await bcrypt.hash(healthcarePassword, 10),
          name: healthcareName,
          facilityName: healthcareFacilityName,
          facilityType: 'Hospital',
          isActive: true,
          orgAdmin: true
        }
      });
    } else {
      // Create healthcare user
      await prisma.healthcareUser.create({
        data: {
          email: healthcareEmail,
          password: await bcrypt.hash(healthcarePassword, 10),
          name: healthcareName,
          facilityName: healthcareFacilityName,
          facilityType: 'Hospital',
          userType: 'HEALTHCARE',
          isActive: true,
          orgAdmin: true
        }
      });
      console.log('   ✅ Healthcare user created');
    }
    
    // Check if hospital record already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: { name: healthcareFacilityName }
    });
    
    if (existingHospital) {
      console.log('   ⚠️  Hospital record already exists, updating...');
      await prisma.hospital.update({
        where: { id: existingHospital.id },
        data: {
          address: healthcareAddress,
          city: healthcareCity,
          state: healthcareState,
          zipCode: healthcareZipCode,
          phone: healthcarePhone,
          email: healthcareEmail,
          type: 'Hospital',
          latitude: healthcareGeocode.latitude,
          longitude: healthcareGeocode.longitude,
          isActive: true,
          requiresReview: false
        }
      });
    } else {
      // Create hospital record
      await prisma.hospital.create({
        data: {
          name: healthcareFacilityName,
          address: healthcareAddress,
          city: healthcareCity,
          state: healthcareState,
          zipCode: healthcareZipCode,
          phone: healthcarePhone,
          email: healthcareEmail,
          type: 'Hospital',
          capabilities: [],
          region: 'Central PA',
          latitude: healthcareGeocode.latitude,
          longitude: healthcareGeocode.longitude,
          isActive: true,
          requiresReview: false
        }
      });
      console.log('   ✅ Hospital record created');
    }
    
    console.log('\n');
    
    // ============================================
    // EMS User: Jet Response
    // ============================================
    console.log('📋 Creating EMS Admin User: Jet Response');
    console.log('   Address: 700 Ayers Ave, Lemoyne, PA 17043');
    console.log('   Contact: Matt Trimble');
    console.log('   Phone: 717-462-0365\n');
    
    const emsEmail = 'matt.trimble@jetresponse.com';
    const emsPassword = 'TestPassword123!';
    const emsName = 'Matt Trimble';
    const emsAgencyName = 'Jet Response';
    const emsAddress = '700 Ayers Ave';
    const emsCity = 'Lemoyne';
    const emsState = 'PA';
    const emsZipCode = '17043';
    const emsPhone = '717-462-0365';
    
    // Geocode EMS address
    console.log('   🔍 Geocoding EMS address...');
    const emsGeocode = await GeocodingService.geocodeAddress(
      emsAddress,
      emsCity,
      emsState,
      emsZipCode,
      emsAgencyName
    );
    
    if (!emsGeocode.success) {
      console.warn('   ⚠️  Geocoding failed:', emsGeocode.error);
      console.log('   Continuing without coordinates...\n');
    } else {
      console.log(`   ✅ Coordinates found: ${emsGeocode.latitude}, ${emsGeocode.longitude}\n`);
    }
    
    // Check if EMS user already exists
    const existingEMSUser = await prisma.eMSUser.findUnique({
      where: { email: emsEmail }
    });
    
    let emsAgencyId = null;
    
    // Check if EMS agency already exists
    const existingEMSAgency = await prisma.eMSAgency.findFirst({
      where: { name: emsAgencyName }
    });
    
    if (existingEMSAgency) {
      emsAgencyId = existingEMSAgency.id;
      console.log('   ⚠️  EMS Agency already exists, updating...');
      await prisma.eMSAgency.update({
        where: { id: emsAgencyId },
        data: {
          contactName: emsName,
          phone: emsPhone,
          email: emsEmail,
          address: emsAddress,
          city: emsCity,
          state: emsState,
          zipCode: emsZipCode,
          latitude: emsGeocode.latitude,
          longitude: emsGeocode.longitude,
          isActive: true
        }
      });
    } else {
      // Create EMS agency first
      const emsAgency = await prisma.eMSAgency.create({
        data: {
          name: emsAgencyName,
          contactName: emsName,
          phone: emsPhone,
          email: emsEmail,
          address: emsAddress,
          city: emsCity,
          state: emsState,
          zipCode: emsZipCode,
          serviceArea: [],
          capabilities: ['BLS', 'ALS'],
          operatingHours: { start: '00:00', end: '23:59' },
          latitude: emsGeocode.latitude,
          longitude: emsGeocode.longitude,
          isActive: true,
          status: 'ACTIVE'
        }
      });
      emsAgencyId = emsAgency.id;
      console.log('   ✅ EMS Agency created');
    }
    
    if (existingEMSUser) {
      console.log('   ⚠️  EMS user already exists, updating...');
      await prisma.eMSUser.update({
        where: { email: emsEmail },
        data: {
          password: await bcrypt.hash(emsPassword, 10),
          name: emsName,
          agencyName: emsAgencyName,
          agencyId: emsAgencyId,
          isActive: true,
          orgAdmin: true
        }
      });
    } else {
      // Create EMS user
      await prisma.eMSUser.create({
        data: {
          email: emsEmail,
          password: await bcrypt.hash(emsPassword, 10),
          name: emsName,
          agencyName: emsAgencyName,
          agencyId: emsAgencyId,
          userType: 'EMS',
          isActive: true,
          orgAdmin: true
        }
      });
      console.log('   ✅ EMS user created');
    }
    
    console.log('\n✅ All users created successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Healthcare Login Credentials:');
    console.log('   Email:', healthcareEmail);
    console.log('   Password:', healthcarePassword);
    console.log('   Name:', healthcareName);
    console.log('   Facility:', healthcareFacilityName);
    console.log('   Active: true');
    console.log('   Org Admin: true');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 EMS Login Credentials:');
    console.log('   Email:', emsEmail);
    console.log('   Password:', emsPassword);
    console.log('   Name:', emsName);
    console.log('   Agency:', emsAgencyName);
    console.log('   Active: true');
    console.log('   Org Admin: true');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

createTestAdminUsers();

