import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.centerUser.upsert({
      where: { email: 'admin@tcc.com' },
      update: {},
      create: {
        email: 'admin@tcc.com',
        password: hashedPassword,
        name: 'TCC Administrator',
        userType: 'ADMIN'
      }
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create regular user
    const regularUser = await prisma.centerUser.upsert({
      where: { email: 'user@tcc.com' },
      update: {},
      create: {
        email: 'user@tcc.com',
        password: hashedPassword,
        name: 'TCC User',
        userType: 'USER'
      }
    });
    console.log('✅ Regular user created:', regularUser.email);

    // Create sample hospitals
    const hospital1 = await prisma.hospital.create({
      data: {
        name: 'Altoona Regional Health System',
        address: '620 Howard Ave',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        phone: '(814) 889-2011',
        email: 'info@altoonaregional.org',
        type: 'HOSPITAL',
        capabilities: ['EMERGENCY', 'SURGERY', 'ICU', 'RADIOLOGY'],
        region: 'ALTOONA',
        coordinates: { lat: 40.5187, lng: -78.3947 },
        operatingHours: '24/7',
        isActive: true
      }
    });
    console.log('✅ Hospital created:', hospital1.name);

    const hospital2 = await prisma.hospital.create({
      data: {
        name: 'UPMC Bedford',
        address: '10455 Lincoln Hwy',
        city: 'Everett',
        state: 'PA',
        zipCode: '15537',
        phone: '(814) 623-3331',
        email: 'info@upmc.edu',
        type: 'HOSPITAL',
        capabilities: ['EMERGENCY', 'SURGERY', 'ICU'],
        region: 'BEDFORD',
        coordinates: { lat: 40.0115, lng: -78.3734 },
        operatingHours: '24/7',
        isActive: true
      }
    });
    console.log('✅ Hospital created:', hospital2.name);

    // Create sample EMS agencies
    const agency1 = await prisma.eMSAgency.create({
      data: {
        name: 'Altoona EMS',
        contactName: 'John Smith',
        phone: '(814) 555-0101',
        email: 'dispatch@altoonaems.com',
        address: '123 Main St',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        serviceArea: ['ALTOONA', 'BEDFORD'],
        operatingHours: { start: '06:00', end: '18:00' },
        capabilities: ['BLS', 'ALS', 'CCT'],
        pricingStructure: { baseRate: 150, perMileRate: 2.50 },
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log('✅ EMS Agency created:', agency1.name);

    const agency2 = await prisma.eMSAgency.create({
      data: {
        name: 'Bedford Ambulance Service',
        contactName: 'Jane Doe',
        phone: '(814) 555-0202',
        email: 'info@bedfordambulance.com',
        address: '456 Oak Ave',
        city: 'Bedford',
        state: 'PA',
        zipCode: '15522',
        serviceArea: ['BEDFORD', 'ALTOONA'],
        operatingHours: { start: '00:00', end: '23:59' },
        capabilities: ['BLS', 'ALS'],
        pricingStructure: { baseRate: 125, perMileRate: 2.25 },
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log('✅ EMS Agency created:', agency2.name);

    // Create sample facilities
    const facility1 = await prisma.facility.create({
      data: {
        name: 'Altoona Regional Emergency Department',
        type: 'HOSPITAL',
        address: '620 Howard Ave',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        phone: '(814) 889-2011',
        email: 'emergency@altoonaregional.org',
        region: 'Central PA',
        coordinates: { lat: 40.5187, lng: -78.3947 },
        isActive: true
      }
    });
    console.log('✅ Facility created:', facility1.name);

    const facility2 = await prisma.facility.create({
      data: {
        name: 'UPMC Bedford Emergency Department',
        type: 'HOSPITAL',
        address: '10455 Lincoln Hwy',
        city: 'Everett',
        state: 'PA',
        zipCode: '15537',
        phone: '(814) 623-3331',
        email: 'emergency@upmc.edu',
        region: 'Central PA',
        coordinates: { lat: 40.0115, lng: -78.3734 },
        isActive: true
      }
    });
    console.log('✅ Facility created:', facility2.name);

    // Create sample healthcare user
    const healthcareUser = await prisma.healthcareUser.create({
      data: {
        email: 'nurse@altoonaregional.org',
        password: await bcrypt.hash('nurse123', 12),
        name: 'Sarah Johnson',
        facilityName: 'Altoona Regional Health System',
        facilityType: 'HOSPITAL',
        isActive: true
      }
    });
    console.log('✅ Healthcare user created:', healthcareUser.email);

    // Create sample transport request
    const transportRequest = await prisma.transportRequest.create({
      data: {
        patientId: 'PAT-001',
        originFacilityId: facility1.id,
        destinationFacilityId: facility2.id,
        transportLevel: 'ALS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: 'Oxygen required',
        createdById: healthcareUser.id
      }
    });
    console.log('✅ Transport request created:', transportRequest.id);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });