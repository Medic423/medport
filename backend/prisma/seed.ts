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

    // Create Duncansville EMS Agency
    const agency4 = await prisma.eMSAgency.create({
      data: {
        name: 'Duncansville EMS',
        contactName: 'Test User',
        phone: '(814) 555-0404',
        email: 'test@duncansvilleems.org',
        address: '321 Pine Street',
        city: 'Duncansville',
        state: 'PA',
        zipCode: '16635',
        serviceArea: ['BLAIR COUNTY', 'ALTOONA'],
        operatingHours: { start: '00:00', end: '23:59' },
        capabilities: ['BLS', 'ALS'],
        pricingStructure: { baseRate: 140, perMileRate: 2.40 },
        latitude: 40.4250,
        longitude: -78.4333,
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log('✅ EMS Agency created:', agency4.name);

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

    const emsUser4 = await prisma.eMSUser.upsert({
      where: { email: 'test@duncansvilleems.org' },
      update: {},
      create: {
        email: 'test@duncansvilleems.org',
        password: await bcrypt.hash('duncansville123', 12),
        name: 'Test Duncansville User',
        agencyName: 'Duncansville EMS',
        agencyId: agency4.id,
        isActive: true,
        userType: 'EMS'
      }
    });
    console.log('✅ EMS User created:', emsUser4.email);

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

    // Ensure dropdown categories exist (idempotent)
    // Categories are locked to fixed slugs: dropdown-1 through dropdown-7
    console.log('🌱 Seeding dropdown categories...');
    const categories = [
      { slug: 'dropdown-1', displayName: 'Transport Levels', displayOrder: 1 },
      { slug: 'dropdown-2', displayName: 'Urgency Levels', displayOrder: 2 },
      { slug: 'dropdown-3', displayName: 'Primary Diagnosis', displayOrder: 3 },
      { slug: 'dropdown-4', displayName: 'Mobility Levels', displayOrder: 4 },
      { slug: 'dropdown-5', displayName: 'Insurance Companies', displayOrder: 5 },
      { slug: 'dropdown-6', displayName: 'Secondary Insurance', displayOrder: 6 },
      { slug: 'dropdown-7', displayName: 'Special Needs', displayOrder: 7 },
    ];

    for (const cat of categories) {
      await prisma.dropdownCategory.upsert({
        where: { slug: cat.slug },
        update: { displayName: cat.displayName, displayOrder: cat.displayOrder, isActive: true },
        create: cat,
      });
    }
    console.log(`✅ Categories seeded: ${categories.length}`);

    // Create dropdown options for all categories
    console.log('🌱 Seeding dropdown options...');
    
    const dropdownOptions = [
      // Insurance (dropdown-5)
      { category: 'dropdown-5', value: 'Medicare' },
      { category: 'dropdown-5', value: 'Medicaid' },
      { category: 'dropdown-5', value: 'Aetna' },
      { category: 'dropdown-5', value: 'Anthem Blue Cross Blue Shield' },
      { category: 'dropdown-5', value: 'Blue Cross Blue Shield' },
      { category: 'dropdown-5', value: 'Cigna' },
      { category: 'dropdown-5', value: 'Humana' },
      { category: 'dropdown-5', value: 'UnitedHealthcare' },
      { category: 'dropdown-5', value: 'Private' },
      { category: 'dropdown-5', value: 'Self-pay' },
      { category: 'dropdown-5', value: 'Other' },
      
      // Diagnosis (dropdown-3)
      { category: 'dropdown-3', value: 'Cardiac' },
      { category: 'dropdown-3', value: 'Respiratory' },
      { category: 'dropdown-3', value: 'Neurological' },
      { category: 'dropdown-3', value: 'Trauma' },
      { category: 'dropdown-3', value: 'Acute Myocardial Infarction' },
      { category: 'dropdown-3', value: 'Stroke/CVA' },
      { category: 'dropdown-3', value: 'Pneumonia' },
      { category: 'dropdown-3', value: 'Congestive Heart Failure' },
      { category: 'dropdown-3', value: 'COPD Exacerbation' },
      { category: 'dropdown-3', value: 'Sepsis' },
      { category: 'dropdown-3', value: 'Surgical Recovery' },
      { category: 'dropdown-3', value: 'Dialysis' },
      { category: 'dropdown-3', value: 'Oncology' },
      { category: 'dropdown-3', value: 'Psychiatric Emergency' },
      { category: 'dropdown-3', value: 'Other' },
      
      // Mobility (dropdown-4)
      { category: 'dropdown-4', value: 'Ambulatory' },
      { category: 'dropdown-4', value: 'Wheelchair' },
      { category: 'dropdown-4', value: 'Stretcher' },
      { category: 'dropdown-4', value: 'Bed-bound' },
      { category: 'dropdown-4', value: 'Independent' },
      { category: 'dropdown-4', value: 'Assistive Device Required' },
      { category: 'dropdown-4', value: 'Wheelchair Bound' },
      { category: 'dropdown-4', value: 'Bed Bound' },
      { category: 'dropdown-4', value: 'Stretcher Required' },
      { category: 'dropdown-4', value: 'Bariatric Equipment Required' },
      
      // Transport Level (dropdown-1)
      { category: 'dropdown-1', value: 'BLS' },
      { category: 'dropdown-1', value: 'ALS' },
      { category: 'dropdown-1', value: 'CCT' },
      { category: 'dropdown-1', value: 'BLS - Basic Life Support' },
      { category: 'dropdown-1', value: 'ALS - Advanced Life Support' },
      { category: 'dropdown-1', value: 'Critical Care' },
      { category: 'dropdown-1', value: 'Neonatal' },
      { category: 'dropdown-1', value: 'Bariatric' },
      { category: 'dropdown-1', value: 'Non-Emergency' },
      { category: 'dropdown-1', value: 'Other' },
      
      // Urgency (dropdown-2)
      { category: 'dropdown-2', value: 'Routine' },
      { category: 'dropdown-2', value: 'Urgent' },
      { category: 'dropdown-2', value: 'Emergent' },
      { category: 'dropdown-2', value: 'Emergency' },
      { category: 'dropdown-2', value: 'Scheduled' },
      { category: 'dropdown-2', value: 'Discharge' },
      
      // Special Needs (dropdown-7)
      { category: 'dropdown-7', value: 'Bariatric Stretcher' },
      { category: 'dropdown-7', value: 'Oxygen Required' },
      { category: 'dropdown-7', value: 'Monitoring Required' },
      { category: 'dropdown-7', value: 'Ventilator Required' },
    ];

    let dropdownCount = 0;
    for (const option of dropdownOptions) {
      // Get category ID for linking
      const category = await prisma.dropdownCategory.findUnique({
        where: { slug: option.category },
      });
      
      await prisma.dropdownOption.upsert({
        where: {
          category_value: {
            category: option.category,
            value: option.value
          }
        },
        update: { 
          isActive: true,
          categoryId: category?.id || null
        },
        create: {
          category: option.category,
          categoryId: category?.id || null,
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