/**
 * Add hospital data to Vercel Postgres database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hospitals = [
  {
    id: 'hosp_pgh_childrens',
    name: "Children's Hospital of Pittsburgh of UPMC",
    address: '4401 Penn Ave',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15224',
    phone: '412-692-5325',
    email: null,
    type: 'Hospital',
    capabilities: ['Pediatric Care', 'Emergency Services', 'Trauma Center'],
    region: 'Western Pennsylvania',
    latitude: 40.4676,
    longitude: -79.9533,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false
  },
  {
    id: 'hosp_pgh_allegheny',
    name: 'Allegheny General Hospital',
    address: '320 East North Avenue',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15212',
    phone: '412-359-3131',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care'],
    region: 'Western Pennsylvania',
    latitude: 40.4599,
    longitude: -80.0168,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false
  },
  {
    id: 'hosp_cleveland_main',
    name: 'Cleveland Clinic',
    address: '9500 Euclid Avenue',
    city: 'Cleveland',
    state: 'OH',
    zipCode: '44195',
    phone: '216-444-2200',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care'],
    region: 'Northeast Ohio',
    latitude: 41.5048,
    longitude: -81.6213,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false
  },
  {
    id: 'hosp_johns_hopkins',
    name: 'Johns Hopkins Hospital',
    address: '1800 Orleans Street',
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21287',
    phone: '410-955-5000',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care'],
    region: 'Mid-Atlantic',
    latitude: 39.2959,
    longitude: -76.5923,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false
  },
];

async function addHospitals() {
  console.log('🏥 Adding hospitals to Vercel Postgres database...\n');
  
  try {
    for (const h of hospitals) {
      await prisma.hospital.upsert({
        where: { id: h.id },
        update: h,
        create: h,
      });
      console.log(`✅ ${h.name}`);
    }
    console.log(`\n✅ Successfully added ${hospitals.length} hospitals`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addHospitals()
  .finally(() => prisma.$disconnect());





