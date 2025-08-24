const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Checking users in database...\n');
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email}) - ${user.role} - ID: ${user.id}`);
    });
    
    const agencyUsers = await prisma.agencyUser.findMany({
      select: { id: true, email: true, name: true, agencyId: true }
    });
    
    console.log(`\nFound ${agencyUsers.length} agency users:`);
    agencyUsers.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email}) - Agency ID: ${user.agencyId} - ID: ${user.id}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkUsers();
