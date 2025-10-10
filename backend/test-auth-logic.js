const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcryptjs');

async function testAuthLogic() {
  try {
    console.log('Testing authentication logic...');
    
    const email = 'fferguson@movalleyems.com';
    const password = 'movalley123';
    
    // Mimic the authentication service logic
    console.log('1. Checking Center database...');
    const centerDB = databaseManager.getCenterDB();
    let user = await centerDB.centerUser.findUnique({
      where: { email }
    });
    
    let userType = 'ADMIN';
    
    if (user) {
      console.log('User found in Center database:', user.userType);
      userType = user.userType;
    } else {
      console.log('No user found in Center database');
      
      console.log('2. Checking Hospital database...');
      const hospitalDB = databaseManager.getHospitalDB();
      user = await hospitalDB.healthcareUser.findUnique({
        where: { email }
      });
      if (user) {
        console.log('User found in Hospital database');
        userType = 'HEALTHCARE';
      } else {
        console.log('No user found in Hospital database');
        
        console.log('3. Checking EMS database...');
        const emsDB = databaseManager.getEMSDB();
        user = await emsDB.eMSUser.findUnique({
          where: { email }
        });
        if (user) {
          console.log('User found in EMS database');
          userType = 'EMS';
        } else {
          console.log('No user found in EMS database');
        }
      }
    }
    
    console.log('Final user type:', userType);
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user && userType === 'EMS') {
      console.log('Checking EMS user details...');
      console.log('Has agencyId:', !!user.agencyId);
      console.log('Is active:', user.isActive);
      
      // Test password verification
      console.log('Testing password verification...');
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);
    }
    
  } catch (error) {
    console.error('Error testing authentication logic:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAuthLogic();
