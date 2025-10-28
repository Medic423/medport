const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testEMSAuthDirect() {
  try {
    console.log('Testing EMS authentication directly...');
    
    const email = 'fferguson@movalleyems.com';
    const password = 'movalley123';
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // Find EMS user
    const user = await prisma.eMSUser.findUnique({
      where: { email }
    });
    
    console.log('EMS User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ No EMS user found');
      return;
    }
    
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }
    
    // Check agency association
    if (!user.agencyId) {
      console.log('❌ User not associated with agency');
      return;
    }
    
    console.log('✅ All checks passed');
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.agencyId, // Use agency ID for EMS users
        email: user.email,
        userType: 'EMS'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    console.log('✅ Token verification successful');
    console.log('Decoded token:', decoded);
    
  } catch (error) {
    console.error('❌ Error testing EMS authentication:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

testEMSAuthDirect();
