const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcrypt');

async function createAdminUsers() {
  let centerPrisma;
  try {
    console.log('Creating admin users...');
    
    centerPrisma = databaseManager.getCenterDB();
    console.log('Center Prisma client:', centerPrisma);
    console.log('CenterUser model available:', !!centerPrisma?.centerUser);
    
    // Create TCC admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await centerPrisma.centerUser.upsert({
      where: { email: 'admin@tcc.com' },
      update: { 
        password: hashedPassword,
        name: 'TCC Administrator',
        userType: 'ADMIN'
      },
      create: {
        email: 'admin@tcc.com',
        password: hashedPassword,
        name: 'TCC Administrator',
        userType: 'ADMIN'
      }
    });
    
    console.log('✅ TCC Admin user created/updated:', adminUser.email);
    
    // Also create the healthcare user in the hospital database
    const hospitalPrisma = databaseManager.getHospitalDB();
    const healthcareHashedPassword = await bcrypt.hash('upmc123', 10);
    
    const healthcareUser = await hospitalPrisma.healthcareUser.upsert({
      where: { email: 'admin@altoonaregional.org' },
      update: { 
        password: healthcareHashedPassword,
        name: 'Healthcare Admin',
        userType: 'HEALTHCARE'
      },
      create: {
        email: 'admin@altoonaregional.org',
        password: healthcareHashedPassword,
        name: 'Healthcare Admin',
        userType: 'HEALTHCARE',
        facilityName: 'UPMC Altoona',
        facilityType: 'Hospital'
      }
    });
    
    console.log('✅ Healthcare user created/updated:', healthcareUser.email);
    
  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    if (centerPrisma) {
      await centerPrisma.$disconnect();
    }
  }
}

createAdminUsers();
