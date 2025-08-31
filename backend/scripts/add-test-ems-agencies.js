const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testAgencies = [
  {
    name: 'Altoona EMS Services',
    contactName: 'John Smith',
    phone: '(814) 555-0101',
    email: 'contact@altoonaems.com',
    address: '123 Main Street',
    city: 'Altoona',
    state: 'PA',
    zipCode: '16601',
    serviceArea: {
      counties: ['Blair', 'Cambria'],
      cities: ['Altoona', 'Hollidaysburg', 'Duncansville']
    },
    operatingHours: {
      monday: { start: '06:00', end: '18:00' },
      tuesday: { start: '06:00', end: '18:00' },
      wednesday: { start: '06:00', end: '18:00' },
      thursday: { start: '06:00', end: '18:00' },
      friday: { start: '06:00', end: '18:00' },
      saturday: { start: '08:00', end: '16:00' },
      sunday: { start: '08:00', end: '16:00' }
    },
    capabilities: {
      transportLevels: ['BLS', 'ALS'],
      specialServices: ['Cardiac Monitoring', 'IV Therapy']
    },
    pricingStructure: {
      baseRate: 250,
      perMile: 3.50,
      waitingTime: 45
    }
  },
  {
    name: 'Central PA Critical Care Transport',
    contactName: 'Dr. Sarah Johnson',
    phone: '(814) 555-0202',
    email: 'dispatch@centralpacct.com',
    address: '456 Medical Drive',
    city: 'State College',
    state: 'PA',
    zipCode: '16801',
    serviceArea: {
      counties: ['Centre', 'Blair', 'Huntingdon'],
      cities: ['State College', 'Altoona', 'Huntingdon']
    },
    operatingHours: {
      monday: { start: '00:00', end: '23:59' },
      tuesday: { start: '00:00', end: '23:59' },
      wednesday: { start: '00:00', end: '23:59' },
      thursday: { start: '00:00', end: '23:59' },
      friday: { start: '00:00', end: '23:59' },
      saturday: { start: '00:00', end: '23:59' },
      sunday: { start: '00:00', end: '23:59' }
    },
    capabilities: {
      transportLevels: ['ALS', 'CCT'],
      specialServices: ['Ventilator Support', 'ECMO', 'Cardiac Monitoring', 'ICU Nurse']
    },
    pricingStructure: {
      baseRate: 450,
      perMile: 5.00,
      waitingTime: 60
    }
  },
  {
    name: 'Mountain View Ambulance',
    contactName: 'Mike Davis',
    phone: '(814) 555-0303',
    email: 'info@mountainviewambulance.com',
    address: '789 Mountain Road',
    city: 'Johnstown',
    state: 'PA',
    zipCode: '15901',
    serviceArea: {
      counties: ['Cambria', 'Somerset'],
      cities: ['Johnstown', 'Somerset', 'Windber']
    },
    operatingHours: {
      monday: { start: '06:00', end: '22:00' },
      tuesday: { start: '06:00', end: '22:00' },
      wednesday: { start: '06:00', end: '22:00' },
      thursday: { start: '06:00', end: '22:00' },
      friday: { start: '06:00', end: '22:00' },
      saturday: { start: '08:00', end: '20:00' },
      sunday: { start: '08:00', end: '20:00' }
    },
    capabilities: {
      transportLevels: ['BLS', 'ALS'],
      specialServices: ['Wheelchair Transport', 'Bariatric Transport']
    },
    pricingStructure: {
      baseRate: 200,
      perMile: 3.00,
      waitingTime: 30
    }
  },
  {
    name: 'Pennsylvania Medical Transport',
    contactName: 'Lisa Chen',
    phone: '(717) 555-0404',
    email: 'dispatch@pamedtransport.com',
    address: '321 Healthcare Blvd',
    city: 'Harrisburg',
    state: 'PA',
    zipCode: '17101',
    serviceArea: {
      counties: ['Dauphin', 'Cumberland', 'York'],
      cities: ['Harrisburg', 'Carlisle', 'York']
    },
    operatingHours: {
      monday: { start: '00:00', end: '23:59' },
      tuesday: { start: '00:00', end: '23:59' },
      wednesday: { start: '00:00', end: '23:59' },
      thursday: { start: '00:00', end: '23:59' },
      friday: { start: '00:00', end: '23:59' },
      saturday: { start: '00:00', end: '23:59' },
      sunday: { start: '00:00', end: '23:59' }
    },
    capabilities: {
      transportLevels: ['BLS', 'ALS', 'CCT', 'OTHER'],
      specialServices: ['Ventilator Support', 'Cardiac Monitoring', 'Wheelchair Transport', 'Medical Taxi']
    },
    pricingStructure: {
      baseRate: 300,
      perMile: 4.00,
      waitingTime: 45
    }
  }
];

async function addTestAgencies() {
  try {
    console.log('Adding test EMS agencies...');

    for (const agencyData of testAgencies) {
      // Check if agency already exists
      const existingAgency = await prisma.transportAgency.findFirst({
        where: { email: agencyData.email }
      });

      if (existingAgency) {
        console.log(`Agency ${agencyData.name} already exists, skipping...`);
        continue;
      }

      // Create the agency
      const agency = await prisma.transportAgency.create({
        data: agencyData
      });

      console.log(`Created agency: ${agency.name} (ID: ${agency.id})`);

      // Create some units for each agency
      const unitTypes = agencyData.capabilities.transportLevels;
      const unitCounts = {
        'BLS': 3,
        'ALS': 2,
        'CCT': 1,
        'OTHER': 2
      };

      for (const unitType of unitTypes) {
        const count = unitCounts[unitType] || 1;
        
        for (let i = 1; i <= count; i++) {
          const unit = await prisma.unit.create({
            data: {
              agencyId: agency.id,
              unitNumber: `${agency.name.substring(0, 3).toUpperCase()}-${unitType}-${i.toString().padStart(2, '0')}`,
              type: unitType,
              capabilities: {
                specialEquipment: unitType === 'CCT' ? ['Ventilator', 'Cardiac Monitor', 'IV Pump'] : 
                                unitType === 'ALS' ? ['Cardiac Monitor', 'IV Therapy'] : 
                                unitType === 'OTHER' ? ['Wheelchair Lift'] : []
              },
              currentStatus: 'AVAILABLE',
              isActive: true
            }
          });

          // Create unit availability record
          await prisma.unitAvailability.create({
            data: {
              unitId: unit.id,
              status: 'AVAILABLE',
              location: {
                lat: 40.5187 + (Math.random() - 0.5) * 0.1,
                lng: -78.3945 + (Math.random() - 0.5) * 0.1,
                address: `${agency.city}, ${agency.state}`
              },
              shiftStart: new Date(),
              shiftEnd: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
              crewMembers: [
                { name: 'Driver', role: 'Driver', phone: agency.phone },
                { name: 'EMT', role: unitType === 'CCT' ? 'Critical Care Nurse' : 
                                   unitType === 'ALS' ? 'Paramedic' : 'EMT', 
                  phone: agency.phone }
              ],
              notes: `${unitType} unit ready for service`
            }
          });

          console.log(`  Created unit: ${unit.unitNumber}`);
        }
      }

      // Create service areas
      for (const city of agencyData.serviceArea.cities) {
        await prisma.serviceArea.create({
          data: {
            agencyId: agency.id,
            name: `${city} Service Area`,
            description: `Primary service area covering ${city} and surrounding areas`,
            geographicBoundaries: {
              center: { lat: 40.5187, lng: -78.3945 },
              radius: 25 // 25 mile radius
            },
            coverageRadius: 25,
            primaryServiceArea: city === agencyData.city,
            isActive: true
          }
        });
      }

      // Create agency profile
      await prisma.agencyProfile.create({
        data: {
          agencyId: agency.id,
          description: `Professional ${agencyData.capabilities.transportLevels.join('/')} transport services serving ${agencyData.serviceArea.counties.join(', ')} counties.`,
          website: `https://www.${agency.name.toLowerCase().replace(/\s+/g, '')}.com`,
          licenseNumber: `PA-EMS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          certifications: {
            stateLicense: 'Pennsylvania EMS License',
            insurance: 'Professional Liability Insurance',
            accreditation: 'Commission on Accreditation of Ambulance Services'
          },
          specializations: agencyData.capabilities.specialServices,
          contactPerson: agencyData.contactName,
          emergencyContact: agencyData.contactName,
          emergencyPhone: agencyData.phone
        }
      });

      console.log(`  Created profile and service areas for ${agency.name}`);
    }

    console.log('\n✅ Test EMS agencies added successfully!');
    console.log('\nAgencies created:');
    for (const agency of testAgencies) {
      console.log(`- ${agency.name} (${agency.capabilities.transportLevels.join('/')}) - ${agency.city}, ${agency.state}`);
    }

  } catch (error) {
    console.error('Error adding test agencies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestAgencies();
