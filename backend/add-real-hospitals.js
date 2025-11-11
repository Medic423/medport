/**
 * Add real hospital data to production database
 * Includes Cleveland Clinic, Johns Hopkins, Penn Highlands hospitals, and Pittsburgh hospitals
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const hospitals = [
  // Pittsburgh hospitals (for higher level of care)
  {
    id: 'hosp_pgh_childrens',
    name: 'Children\'s Hospital of Pittsburgh of UPMC',
    address: '4401 Penn Ave',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15224',
    phone: '412-692-5325',
    email: null,
    type: 'Hospital',
    capabilities: ['Pediatric Care', 'Emergency Services', 'Trauma Center', 'Critical Care'],
    region: 'Western Pennsylvania',
    latitude: 40.4676,
    longitude: -79.9533,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
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
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care', 'Cardiology', 'Neurology'],
    region: 'Western Pennsylvania',
    latitude: 40.4599,
    longitude: -80.0168,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  {
    id: 'hosp_pgh_upmc',
    name: 'UPMC Presbyterian',
    address: '200 Lothrop Street',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15213',
    phone: '412-647-8762',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care', 'Transplant', 'Cardiology'],
    region: 'Western Pennsylvania',
    latitude: 40.4438,
    longitude: -79.9598,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  {
    id: 'hosp_pgh_shadyside',
    name: 'UPMC Shadyside',
    address: '5230 Centre Avenue',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15232',
    phone: '412-623-2121',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Critical Care', 'Oncology', 'Cardiology'],
    region: 'Western Pennsylvania',
    latitude: 40.4540,
    longitude: -79.9280,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  // Penn Highlands hospitals (regional destinations)
  {
    id: 'hosp_dubois',
    name: 'Penn Highlands DuBois',
    address: '100 Hospital Avenue',
    city: 'DuBois',
    state: 'PA',
    zipCode: '15801',
    phone: '814-371-2200',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Critical Care', 'Cardiology', 'Surgery'],
    region: 'Western Pennsylvania',
    latitude: 41.1217,
    longitude: -78.7589,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  {
    id: 'hosp_clearfield',
    name: 'Penn Highlands Clearfield',
    address: '809 Turnpike Avenue',
    city: 'Clearfield',
    state: 'PA',
    zipCode: '16830',
    phone: '814-768-2221',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Critical Care'],
    region: 'Western Pennsylvania',
    latitude: 41.0246,
    longitude: -78.4350,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  {
    id: 'hosp_brookville',
    name: 'Penn Highlands Brookville',
    address: '100 Hospital Road',
    city: 'Brookville',
    state: 'PA',
    zipCode: '15825',
    phone: '814-849-2200',
    email: null,
    type: 'Hospital',
    capabilities: ['Emergency Services', 'Critical Care'],
    region: 'Western Pennsylvania',
    latitude: 41.1616,
    longitude: -79.0753,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  // Cleveland Clinic
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
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care', 'Cardiology', 'Transplant'],
    region: 'Northeast Ohio',
    latitude: 41.5048,
    longitude: -81.6213,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
  // Johns Hopkins
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
    capabilities: ['Emergency Services', 'Trauma Center', 'Critical Care', 'Cardiology', 'Transplant', 'Cancer Care'],
    region: 'Mid-Atlantic',
    latitude: 39.2959,
    longitude: -76.5923,
    operatingHours: '24/7',
    isActive: true,
    requiresReview: false,
  },
];

async function addHospitals() {
  console.log('🏥 Adding real hospital data to production database...\n');
  
  for (const hospital of hospitals) {
    try {
      await prisma.hospital.upsert({
        where: { id: hospital.id },
        update: hospital,
        create: hospital,
      });
      console.log(`✅ Added/Updated: ${hospital.name}`);
    } catch (error) {
      console.error(`❌ Failed to add ${hospital.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Successfully processed ${hospitals.length} hospitals`);
}

addHospitals()
  .catch(console.error)
  .finally(() => prisma.$disconnect());





