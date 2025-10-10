const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreFromBackup() {
  try {
    console.log('🔄 Starting database restore from backup...');
    
    // Read the backup file
    const backupData = JSON.parse(fs.readFileSync('./restore-backup.json', 'utf8'));
    console.log('📁 Backup file loaded:', backupData.timestamp);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.trip.deleteMany();
    await prisma.hospital.deleteMany();
    await prisma.facility.deleteMany();
    await prisma.centerUser.deleteMany();
    await prisma.systemAnalytics.deleteMany();
    
    // Restore Center database data (main data is in center section)
    if (backupData.databases.center) {
      console.log('📊 Restoring Center database...');
      
      // Restore trips
      if (backupData.databases.center.trips && backupData.databases.center.trips.length > 0) {
        console.log(`🚗 Restoring ${backupData.databases.center.trips.length} trips...`);
        for (const trip of backupData.databases.center.trips) {
          await prisma.trip.create({
            data: {
              id: trip.id,
              tripNumber: trip.tripNumber,
              patientId: trip.patientId,
              patientWeight: trip.patientWeight,
              specialNeeds: trip.specialNeeds,
              fromLocation: trip.fromLocation,
              toLocation: trip.toLocation,
              scheduledTime: new Date(trip.scheduledTime),
              transportLevel: trip.transportLevel,
              urgencyLevel: trip.urgencyLevel,
              diagnosis: trip.diagnosis,
              mobilityLevel: trip.mobilityLevel,
              oxygenRequired: trip.oxygenRequired || false,
              monitoringRequired: trip.monitoringRequired || false,
              generateQRCode: trip.generateQRCode || false,
              qrCodeData: trip.qrCodeData,
              selectedAgencies: trip.selectedAgencies || [],
              notificationRadius: trip.notificationRadius,
              transferRequestTime: trip.transferRequestTime ? new Date(trip.transferRequestTime) : null,
              transferAcceptedTime: trip.transferAcceptedTime ? new Date(trip.transferAcceptedTime) : null,
              emsArrivalTime: trip.emsArrivalTime ? new Date(trip.emsArrivalTime) : null,
              emsDepartureTime: trip.emsDepartureTime ? new Date(trip.emsDepartureTime) : null,
              actualStartTime: trip.actualStartTime ? new Date(trip.actualStartTime) : null,
              actualEndTime: trip.actualEndTime ? new Date(trip.actualEndTime) : null,
              status: trip.status,
              priority: trip.priority,
              notes: trip.notes,
              assignedTo: trip.assignedTo,
              assignedAgencyId: trip.assignedAgencyId,
              assignedUnitId: trip.assignedUnitId,
              acceptedTimestamp: trip.acceptedTimestamp ? new Date(trip.acceptedTimestamp) : null,
              pickupTimestamp: trip.pickupTimestamp ? new Date(trip.pickupTimestamp) : null,
              completionTimestamp: trip.completionTimestamp ? new Date(trip.completionTimestamp) : null,
              createdAt: new Date(trip.createdAt),
              updatedAt: new Date(trip.updatedAt)
            }
          });
        }
      }
      
      // Restore center users
      if (backupData.databases.center.users && backupData.databases.center.users.length > 0) {
        console.log(`👥 Restoring ${backupData.databases.center.users.length} center users...`);
        for (const user of backupData.databases.center.users) {
          await prisma.centerUser.create({
            data: {
              id: user.id,
              email: user.email,
              password: user.password,
              name: user.name,
              userType: user.userType,
              isActive: user.isActive,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          });
        }
      }
    }
    
    // Restore TCC database data (hospitals, facilities, etc.)
    if (backupData.databases.tcc) {
      console.log('📊 Restoring TCC database...');
      
      // Restore hospitals
      if (backupData.databases.tcc.hospitals && backupData.databases.tcc.hospitals.length > 0) {
        console.log(`🏥 Restoring ${backupData.databases.tcc.hospitals.length} hospitals...`);
        for (const hospital of backupData.databases.tcc.hospitals) {
          await prisma.hospital.create({
            data: {
              id: hospital.id,
              name: hospital.name,
              address: hospital.address,
              city: hospital.city,
              state: hospital.state,
              zipCode: hospital.zipCode,
              phone: hospital.phone,
              email: hospital.email,
              type: hospital.type,
              capabilities: hospital.capabilities || [],
              region: hospital.region,
              coordinates: hospital.coordinates,
              latitude: hospital.latitude,
              longitude: hospital.longitude,
              operatingHours: hospital.operatingHours,
              isActive: hospital.isActive,
              requiresReview: hospital.requiresReview,
              approvedAt: hospital.approvedAt ? new Date(hospital.approvedAt) : null,
              approvedBy: hospital.approvedBy,
              createdAt: new Date(hospital.createdAt),
              updatedAt: new Date(hospital.updatedAt)
            }
          });
        }
      }
      
      // Restore facilities
      if (backupData.databases.tcc.facilities && backupData.databases.tcc.facilities.length > 0) {
        console.log(`🏢 Restoring ${backupData.databases.tcc.facilities.length} facilities...`);
        for (const facility of backupData.databases.tcc.facilities) {
          await prisma.facility.create({
            data: {
              id: facility.id,
              name: facility.name,
              type: facility.type,
              address: facility.address,
              city: facility.city,
              state: facility.state,
              zipCode: facility.zipCode,
              phone: facility.phone,
              email: facility.email,
              region: facility.region,
              isActive: facility.isActive,
              createdAt: new Date(facility.createdAt),
              updatedAt: new Date(facility.updatedAt)
            }
          });
        }
      }
      
      // Restore center users
      if (backupData.databases.tcc.centerUsers && backupData.databases.tcc.centerUsers.length > 0) {
        console.log(`👥 Restoring ${backupData.databases.tcc.centerUsers.length} center users...`);
        for (const user of backupData.databases.tcc.centerUsers) {
          await prisma.centerUser.create({
            data: {
              id: user.id,
              email: user.email,
              password: user.password,
              name: user.name,
              userType: user.userType,
              isActive: user.isActive,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          });
        }
      }
      
      
      // Restore system analytics
      if (backupData.databases.tcc.systemAnalytics && backupData.databases.tcc.systemAnalytics.length > 0) {
        console.log(`📈 Restoring ${backupData.databases.tcc.systemAnalytics.length} analytics records...`);
        for (const analytics of backupData.databases.tcc.systemAnalytics) {
          await prisma.systemAnalytics.create({
            data: {
              id: analytics.id,
              metricName: analytics.metricName,
              metricValue: analytics.metricValue,
              timestamp: new Date(analytics.timestamp),
              userId: analytics.userId,
              createdAt: new Date(analytics.createdAt),
              updatedAt: new Date(analytics.updatedAt)
            }
          });
        }
      }
    }
    
    console.log('✅ Database restore completed successfully!');
    
    // Verify the restore
    const tripCount = await prisma.trip.count();
    const hospitalCount = await prisma.hospital.count();
    const facilityCount = await prisma.facility.count();
    const userCount = await prisma.centerUser.count();
    
    console.log('📊 Restore verification:');
    console.log(`   - Trips: ${tripCount}`);
    console.log(`   - Hospitals: ${hospitalCount}`);
    console.log(`   - Facilities: ${facilityCount}`);
    console.log(`   - Users: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Error during restore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreFromBackup();
