const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcrypt');

async function createTestUsers() {
  let centerPrisma, hospitalPrisma, emsPrisma;
  
  try {
    console.log('🔧 Creating test users for all three portals...\n');
    
    // 1. Create TCC Admin User (Center Database)
    console.log('1️⃣  Creating TCC Admin user...');
    centerPrisma = databaseManager.getCenterDB();
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await centerPrisma.centerUser.upsert({
      where: { email: 'admin@tcc.com' },
      update: { 
        password: adminHashedPassword,
        name: 'TCC Administrator',
        userType: 'ADMIN'
      },
      create: {
        email: 'admin@tcc.com',
        password: adminHashedPassword,
        name: 'TCC Administrator',
        userType: 'ADMIN'
      }
    });
    console.log('✅ TCC Admin user created:', adminUser.email);
    console.log('   Password: admin123\n');
    
    // 2. Create Healthcare Test User (Hospital Database)
    console.log('2️⃣  Creating Healthcare test user...');
    hospitalPrisma = databaseManager.getHospitalDB();
    const healthcareHashedPassword = await bcrypt.hash('testpassword', 10);
    
    const healthcareUser = await hospitalPrisma.healthcareUser.upsert({
      where: { email: 'test@hospital.com' },
      update: { 
        password: healthcareHashedPassword,
        name: 'Test Hospital User',
        userType: 'HEALTHCARE'
      },
      create: {
        email: 'test@hospital.com',
        password: healthcareHashedPassword,
        name: 'Test Hospital User',
        userType: 'HEALTHCARE',
        facilityName: 'Test Hospital',
        facilityType: 'Hospital',
        isActive: true
      }
    });
    console.log('✅ Healthcare user created:', healthcareUser.email);
    console.log('   Password: testpassword\n');
    
    // 3. Create EMS Test User (EMS Database)
    console.log('3️⃣  Creating EMS test user...');
    emsPrisma = databaseManager.getEMSDB();
    const emsHashedPassword = await bcrypt.hash('testpassword', 10);
    
    // First check if we have any agencies
    const agency = await emsPrisma.eMSAgency.findFirst();
    let agencyId = null;
    let agencyName = 'Test EMS Agency';
    
    if (agency) {
      agencyId = agency.id;
      agencyName = agency.name;
      console.log('   Found existing agency:', agencyName);
    } else {
      console.log('   No agencies found, will create user without agency link');
    }
    
    const emsUser = await emsPrisma.eMSUser.upsert({
      where: { email: 'test@ems.com' },
      update: { 
        password: emsHashedPassword,
        name: 'Test EMS User',
        userType: 'EMS',
        agencyId: agencyId,
        agencyName: agencyName
      },
      create: {
        email: 'test@ems.com',
        password: emsHashedPassword,
        name: 'Test EMS User',
        userType: 'EMS',
        agencyId: agencyId,
        agencyName: agencyName,
        isActive: true
      }
    });
    console.log('✅ EMS user created:', emsUser.email);
    console.log('   Password: testpassword\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('✅ All test users created successfully!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 Login Credentials:\n');
    console.log('🏥 Healthcare Portal:');
    console.log('   Email: test@hospital.com');
    console.log('   Password: testpassword\n');
    console.log('🚑 EMS Agency Portal:');
    console.log('   Email: test@ems.com');
    console.log('   Password: testpassword\n');
    console.log('🏢 Transport Center (TCC):');
    console.log('   Email: admin@tcc.com');
    console.log('   Password: admin123\n');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  } finally {
    if (centerPrisma) await centerPrisma.$disconnect();
    if (hospitalPrisma) await hospitalPrisma.$disconnect();
    if (emsPrisma) await emsPrisma.$disconnect();
  }
}

createTestUsers();


