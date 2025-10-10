const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcrypt');

async function createHealthcareUser() {
  let hospitalPrisma;
  try {
    console.log('Creating healthcare user...');
    
    hospitalPrisma = databaseManager.getHospitalDB();
    
    // Check if user already exists
    const existingUser = await hospitalPrisma.healthcareUser.findUnique({
      where: { email: 'admin@altoonaregional.org' }
    });
    
    if (existingUser) {
      console.log('User already exists, updating password...');
      const hashedPassword = await bcrypt.hash('upmc123', 10);
      await hospitalPrisma.healthcareUser.update({
        where: { email: 'admin@altoonaregional.org' },
        data: { password: hashedPassword }
      });
      console.log('Password updated successfully!');
    } else {
      console.log('Creating new user...');
      const hashedPassword = await bcrypt.hash('upmc123', 10);
      const user = await hospitalPrisma.healthcareUser.create({
        data: {
          email: 'admin@altoonaregional.org',
          password: hashedPassword,
          name: 'Healthcare Admin',
          userType: 'HEALTHCARE',
          facilityName: 'UPMC Altoona',
          facilityType: 'Hospital',
          isActive: true
        }
      });
      console.log('User created successfully:', user.id);
    }
  } catch (error) {
    console.error('Error creating healthcare user:', error);
  } finally {
    if (hospitalPrisma) {
      await hospitalPrisma.$disconnect();
    }
  }
}

createHealthcareUser();
