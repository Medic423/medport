import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean up existing test data (idempotent seeding)
    console.log('🧹 Cleaning up existing test data...');
    await prisma.transportRequest.deleteMany({ where: { patientId: 'PAT-001' } });
    await prisma.pickup_locations.deleteMany();
    await prisma.dropdownOption.deleteMany();
    await prisma.healthcareLocation.deleteMany();
    await prisma.healthcareAgencyPreference.deleteMany();
    await prisma.facility.deleteMany();
    await prisma.eMSAgency.deleteMany();
    await prisma.hospital.deleteMany();
    await prisma.eMSUser.deleteMany();
    await prisma.healthcareUser.deleteMany();
    await prisma.centerUser.deleteMany();
    console.log('✅ Cleanup complete');

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

    // Create Elk County EMS Agency
    const agency3 = await prisma.eMSAgency.create({
      data: {
        name: 'Elk County EMS',
        contactName: 'John Doer',
        phone: '(814) 555-0303',
        email: 'doe@elkcoems.com',
        address: '789 Main Street',
        city: 'Ridgway',
        state: 'PA',
        zipCode: '15853',
        serviceArea: ['ELK COUNTY', 'CAMERON COUNTY'],
        operatingHours: { start: '00:00', end: '23:59' },
        capabilities: ['BLS', 'ALS'],
        pricingStructure: { baseRate: 175, perMileRate: 2.75 },
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log('✅ EMS Agency created:', agency3.name);

    // Create EMS users
    const emsUser1 = await prisma.eMSUser.upsert({
      where: { email: 'doe@elkcoems.com' },
      update: {},
      create: {
        email: 'doe@elkcoems.com',
        password: await bcrypt.hash('password', 12),
        name: 'John Doer',
        agencyName: 'Elk County EMS',
        agencyId: agency3.id,
        isActive: true,
        userType: 'EMS'
      }
    });
    console.log('✅ EMS User created:', emsUser1.email);

    const emsUser2 = await prisma.eMSUser.upsert({
      where: { email: 'test@ems.com' },
      update: {},
      create: {
        email: 'test@ems.com',
        password: await bcrypt.hash('testpassword', 12),
        name: 'Test EMS User',
        agencyName: 'Altoona EMS',
        agencyId: agency1.id,
        isActive: true,
        userType: 'EMS'
      }
    });
    console.log('✅ EMS User created:', emsUser2.email);

    const emsUser3 = await prisma.eMSUser.upsert({
      where: { email: 'fferguson@movalleyems.com' },
      update: {},
      create: {
        email: 'fferguson@movalleyems.com',
        password: await bcrypt.hash('movalley123', 12),
        name: 'Frank Ferguson',
        agencyName: 'Mountain Valley EMS',
        agencyId: agency1.id,
        isActive: true,
        userType: 'EMS'
      }
    });
    console.log('✅ EMS User created:', emsUser3.email);

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
    const healthcareUser = await prisma.healthcareUser.upsert({
      where: { email: 'nurse@altoonaregional.org' },
      update: {},
      create: {
        email: 'nurse@altoonaregional.org',
        password: await bcrypt.hash('nurse123', 12),
        name: 'Sarah Johnson',
        facilityName: 'Altoona Regional Health System',
        facilityType: 'HOSPITAL',
        isActive: true
      }
    });
    console.log('✅ Healthcare user created:', healthcareUser.email);

    // Create multi-location healthcare user (chuck@ferrellhospitals.com)
    const chuckPassword = await bcrypt.hash('testpassword', 12);
    const chuckUser = await prisma.healthcareUser.upsert({
      where: { email: 'chuck@ferrellhospitals.com' },
      update: {},
      create: {
        email: 'chuck@ferrellhospitals.com',
        password: chuckPassword,
        name: 'Chuck Ferrell',
        facilityName: 'Ferrell Hospitals',
        facilityType: 'HOSPITAL',
        manageMultipleLocations: true,
        isActive: true
      }
    });
    console.log('✅ Multi-location healthcare user created:', chuckUser.email);

    // Create locations for chuck@ferrellhospitals.com
    const locations = [
      { name: 'Penn Highlands Brookville', address: '100 Hospital Road', city: 'Brookville', state: 'PA', zip: '15825', phone: '(814) 849-1852', primary: true },
      { name: 'Penn Highlands DuBois', address: '100 Hospital Avenue', city: 'DuBois', state: 'PA', zip: '15801', phone: '(814) 371-2200', primary: false },
      { name: 'Penn Highlands Mon Valley', address: '1163 Country Club Road', city: 'Monongahela', state: 'PA', zip: '15063', phone: '(724) 258-1000', primary: false },
      { name: 'Penn Highlands Clearfield', address: '809 Turnpike Avenue', city: 'Clearfield', state: 'PA', zip: '16830', phone: '(814) 765-5300', primary: false },
      { name: 'Penn Highlands Elk', address: '763 Johnsonburg Road', city: 'St. Marys', state: 'PA', zip: '15857', phone: '(814) 834-4200', primary: false },
      { name: 'Penn Highlands State College', address: '239 Colonnade Boulevard', city: 'State College', state: 'PA', zip: '16803', phone: '(814) 231-7000', primary: false },
      { name: 'Penn Highlands Connellsville', address: '401 East Murphy Avenue', city: 'Connellsville', state: 'PA', zip: '15425', phone: '(724) 628-1500', primary: false },
      { name: 'Penn Highlands Huntingdon', address: '1225 Warm Springs Avenue', city: 'Huntingdon', state: 'PA', zip: '16652', phone: '(814) 643-3300', primary: false },
      { name: 'Penn Highlands Tyrone', address: '187 Hospital Drive', city: 'Tyrone', state: 'PA', zip: '16686', phone: '(814) 684-1255', primary: false },
    ];

    for (const loc of locations) {
      await prisma.healthcareLocation.create({
        data: {
          healthcareUserId: chuckUser.id,
          locationName: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zip,
          phone: loc.phone,
          facilityType: 'HOSPITAL',
          isPrimary: loc.primary,
          isActive: true
        }
      });
      console.log(`✅ Location created: ${loc.name}`);
    }

    // Create dropdown options for all categories
    console.log('🌱 Seeding dropdown options...');
    
    const dropdownOptions = [
      // Insurance
      { category: 'insurance', value: 'Medicare' },
      { category: 'insurance', value: 'Medicaid' },
      { category: 'insurance', value: 'Aetna' },
      { category: 'insurance', value: 'Anthem Blue Cross Blue Shield' },
      { category: 'insurance', value: 'Blue Cross Blue Shield' },
      { category: 'insurance', value: 'Cigna' },
      { category: 'insurance', value: 'Humana' },
      { category: 'insurance', value: 'UnitedHealthcare' },
      { category: 'insurance', value: 'Private' },
      { category: 'insurance', value: 'Self-pay' },
      { category: 'insurance', value: 'Other' },
      
      // Diagnosis
      { category: 'diagnosis', value: 'Cardiac' },
      { category: 'diagnosis', value: 'Respiratory' },
      { category: 'diagnosis', value: 'Neurological' },
      { category: 'diagnosis', value: 'Trauma' },
      { category: 'diagnosis', value: 'Acute Myocardial Infarction' },
      { category: 'diagnosis', value: 'Stroke/CVA' },
      { category: 'diagnosis', value: 'Pneumonia' },
      { category: 'diagnosis', value: 'Congestive Heart Failure' },
      { category: 'diagnosis', value: 'COPD Exacerbation' },
      { category: 'diagnosis', value: 'Sepsis' },
      { category: 'diagnosis', value: 'Surgical Recovery' },
      { category: 'diagnosis', value: 'Dialysis' },
      { category: 'diagnosis', value: 'Oncology' },
      { category: 'diagnosis', value: 'Psychiatric Emergency' },
      { category: 'diagnosis', value: 'Other' },
      
      // Mobility
      { category: 'mobility', value: 'Ambulatory' },
      { category: 'mobility', value: 'Wheelchair' },
      { category: 'mobility', value: 'Stretcher' },
      { category: 'mobility', value: 'Bed-bound' },
      { category: 'mobility', value: 'Independent' },
      { category: 'mobility', value: 'Assistive Device Required' },
      { category: 'mobility', value: 'Wheelchair Bound' },
      { category: 'mobility', value: 'Bed Bound' },
      { category: 'mobility', value: 'Stretcher Required' },
      { category: 'mobility', value: 'Bariatric Equipment Required' },
      
      // Transport Level
      { category: 'transport-level', value: 'BLS' },
      { category: 'transport-level', value: 'ALS' },
      { category: 'transport-level', value: 'CCT' },
      { category: 'transport-level', value: 'BLS - Basic Life Support' },
      { category: 'transport-level', value: 'ALS - Advanced Life Support' },
      { category: 'transport-level', value: 'Critical Care' },
      { category: 'transport-level', value: 'Neonatal' },
      { category: 'transport-level', value: 'Bariatric' },
      { category: 'transport-level', value: 'Non-Emergency' },
      { category: 'transport-level', value: 'Other' },
      
      // Urgency
      { category: 'urgency', value: 'Routine' },
      { category: 'urgency', value: 'Urgent' },
      { category: 'urgency', value: 'Emergent' },
      { category: 'urgency', value: 'Emergency' },
      { category: 'urgency', value: 'Scheduled' },
      { category: 'urgency', value: 'Discharge' },
      
      // Special Needs
      { category: 'special-needs', value: 'Bariatric Stretcher' },
      { category: 'special-needs', value: 'Oxygen Required' },
      { category: 'special-needs', value: 'Monitoring Required' },
      { category: 'special-needs', value: 'Ventilator Required' },
    ];

    let dropdownCount = 0;
    for (const option of dropdownOptions) {
      await prisma.dropdownOption.upsert({
        where: {
          category_value: {
            category: option.category,
            value: option.value
          }
        },
        update: { isActive: true },
        create: {
          category: option.category,
          value: option.value,
          isActive: true
        }
      });
      dropdownCount++;
    }
    console.log(`✅ ${dropdownCount} dropdown options created/updated`);

    // Create pickup locations for hospitals
    console.log('🌱 Creating pickup locations...');
    const pickupLocations = [
      // Altoona Regional Health System pickup locations
      { hospitalId: hospital1.id, name: 'Emergency Department Main Entrance', description: 'Main ED entrance', contactPhone: '(814) 889-2011', floor: '1', room: 'Main Entrance' },
      { hospitalId: hospital1.id, name: 'Emergency Department Alternate', description: 'Alternate ED entrance for stretchers', contactPhone: '(814) 889-2011', floor: '1', room: 'ED Bay' },
      { hospitalId: hospital1.id, name: 'Main Hospital Entrance', description: 'Main hospital entrance', contactPhone: '(814) 889-2011', floor: '1', room: 'Lobby' },
      { hospitalId: hospital1.id, name: 'ICU Floor', description: 'ICU pickup location', contactPhone: '(814) 889-2011', floor: '3', room: 'ICU Wing' },
      { hospitalId: hospital1.id, name: 'Surgery Recovery', description: 'Post-surgical recovery pickup', contactPhone: '(814) 889-2011', floor: '2', room: 'PACU' },
      
      // UPMC Bedford pickup locations
      { hospitalId: hospital2.id, name: 'Emergency Department', description: 'Main ED entrance', contactPhone: '(814) 623-3331', floor: '1', room: 'ED Lobby' },
      { hospitalId: hospital2.id, name: 'Main Entrance', description: 'Main hospital entrance', contactPhone: '(814) 623-3331', floor: '1', room: 'Front Lobby' },
      { hospitalId: hospital2.id, name: 'ICU Entrance', description: 'ICU transfer location', contactPhone: '(814) 623-3331', floor: '2', room: 'ICU' },
    ];

    let pickupCount = 0;
    for (const loc of pickupLocations) {
      await prisma.pickup_locations.create({
        data: {
          id: `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          hospitalId: loc.hospitalId,
          name: loc.name,
          description: loc.description,
          contactPhone: loc.contactPhone,
          floor: loc.floor,
          room: loc.room,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      pickupCount++;
    }
    console.log(`✅ ${pickupCount} pickup locations created`);

    // Create pickup locations for healthcare locations (multi-location users)
    const chuckPickupLocations = [
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 849-1852', locationName: 'Penn Highlands Brookville' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main hospital entrance', contactPhone: '(814) 849-1852', locationName: 'Penn Highlands Brookville' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 371-2200', locationName: 'Penn Highlands DuBois' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 371-2200', locationName: 'Penn Highlands DuBois' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(724) 258-1000', locationName: 'Penn Highlands Mon Valley' },
      { healthcareUserId: chuckUser.id, name: 'Patient Tower', description: 'Patient tower entrance', contactPhone: '(724) 258-1000', locationName: 'Penn Highlands Mon Valley' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 765-5300', locationName: 'Penn Highlands Clearfield' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 765-5300', locationName: 'Penn Highlands Clearfield' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 834-4200', locationName: 'Penn Highlands Elk' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 834-4200', locationName: 'Penn Highlands Elk' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 231-7000', locationName: 'Penn Highlands State College' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 231-7000', locationName: 'Penn Highlands State College' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(724) 628-1500', locationName: 'Penn Highlands Connellsville' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(724) 628-1500', locationName: 'Penn Highlands Connellsville' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 643-3300', locationName: 'Penn Highlands Huntingdon' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 643-3300', locationName: 'Penn Highlands Huntingdon' },
      { healthcareUserId: chuckUser.id, name: 'Emergency Department', description: 'Main ED', contactPhone: '(814) 684-1255', locationName: 'Penn Highlands Tyrone' },
      { healthcareUserId: chuckUser.id, name: 'Main Entrance', description: 'Main entrance', contactPhone: '(814) 684-1255', locationName: 'Penn Highlands Tyrone' },
    ];

    // Get chuck's healthcare locations
    const chuckHealthcareLocations = await prisma.healthcareLocation.findMany({
      where: { healthcareUserId: chuckUser.id }
    });

    for (const loc of chuckPickupLocations) {
      const healthcareLocation = chuckHealthcareLocations.find(h => h.locationName === loc.locationName);
      if (healthcareLocation) {
        await prisma.pickup_locations.create({
          data: {
            id: `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            hospitalId: healthcareLocation.id, // Use healthcare location ID as hospitalId
            name: loc.name,
            description: loc.description,
            contactPhone: loc.contactPhone,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        pickupCount++;
      }
    }
    console.log(`✅ ${pickupCount} total pickup locations created`);

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