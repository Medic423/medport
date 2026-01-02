const { databaseManager } = require('./src/services/databaseManager');

async function checkFacility() {
  try {
    const prisma = databaseManager.getPrismaClient();
    const name = 'Monumental Medical Center';
    
    console.log('=== Checking for "Monumental Medical Center" ===\n');
    
    // Check healthcareLocation
    const locations = await prisma.healthcareLocation.findMany({
      where: {
        locationName: { contains: name, mode: 'insensitive' }
      }
    });
    
    // Check healthcareUser
    const users = await prisma.healthcareUser.findMany({
      where: {
        facilityName: { contains: name, mode: 'insensitive' }
      }
    });
    
    // Check hospital
    const hospitals = await prisma.hospital.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' }
      }
    });
    
    console.log('HealthcareLocation records:', locations.length);
    locations.forEach(loc => {
      console.log('  - ID:', loc.id);
      console.log('    Name:', loc.locationName);
      console.log('    Active:', loc.isActive);
      console.log('    Created:', loc.createdAt);
    });
    
    console.log('\nHealthcareUser records:', users.length);
    users.forEach(user => {
      console.log('  - ID:', user.id);
      console.log('    Email:', user.email);
      console.log('    Facility:', user.facilityName);
      console.log('    Active:', user.isActive);
      console.log('    Created:', user.createdAt);
    });
    
    console.log('\nHospital records:', hospitals.length);
    hospitals.forEach(hosp => {
      console.log('  - ID:', hosp.id);
      console.log('    Name:', hosp.name);
      console.log('    Active:', hosp.isActive);
      console.log('    Created:', hosp.createdAt);
    });
    
    if (locations.length === 0 && users.length === 0 && hospitals.length === 0) {
      console.log('\n✅ CONFIRMED: "Monumental Medical Center" does NOT exist in the database');
    } else {
      console.log('\n⚠️  FOUND: "Monumental Medical Center" exists in the database');
      if (locations.length === 0 && (users.length > 0 || hospitals.length > 0)) {
        console.log('   ⚠️  PARTIAL REGISTRATION DETECTED:');
        console.log('      - User/Hospital records exist but healthcareLocation is missing');
        console.log('      - This would cause the facility to not appear in Facilities List');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

checkFacility();
