#!/usr/bin/env node
/**
 * Sync users across environments (Local Dev, Dev Azure, Production Azure)
 * 
 * Usage:
 *   # Export users from source environment
 *   SOURCE_DB="postgresql://..." node sync-users-across-environments.js export users.json
 * 
 *   # Import users to target environment
 *   TARGET_DB="postgresql://..." node sync-users-across-environments.js import users.json
 * 
 *   # Sync from dev to production (preserves passwords)
 *   SOURCE_DB="..." TARGET_DB="..." node sync-users-across-environments.js sync
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const SOURCE_DB = process.env.SOURCE_DB;
const TARGET_DB = process.env.TARGET_DB;
const command = process.argv[2];
const filePath = process.argv[3];

if (!command || !['export', 'import', 'sync'].includes(command)) {
  console.error('Usage:');
  console.error('  Export: SOURCE_DB="..." node sync-users-across-environments.js export users.json');
  console.error('  Import: TARGET_DB="..." node sync-users-across-environments.js import users.json');
  console.error('  Sync:   SOURCE_DB="..." TARGET_DB="..." node sync-users-across-environments.js sync');
  process.exit(1);
}

async function exportUsers(sourcePrisma, outputFile) {
  try {
    console.log('📤 Exporting users from source database...\n');
    
    // Export CenterUsers (check for optional columns)
    let centerUsers;
    try {
      centerUsers = await sourcePrisma.$queryRaw`
        SELECT id, email, password, name, "userType", 
               phone, "emailNotifications", "smsNotifications",
               "isActive", "isDeleted", "createdAt", "updatedAt"
        FROM center_users
        WHERE "isDeleted" = false
        ORDER BY email;
      `;
    } catch (error) {
      // Fallback if optional columns don't exist
      centerUsers = await sourcePrisma.$queryRaw`
        SELECT id, email, password, name, "userType",
               "isActive", "isDeleted", "createdAt", "updatedAt"
        FROM center_users
        WHERE "isDeleted" = false
        ORDER BY email;
      `;
      // Add defaults for missing columns
      centerUsers = centerUsers.map(u => ({
        ...u,
        phone: null,
        emailNotifications: true,
        smsNotifications: false
      }));
    }
    
    // Export HealthcareUsers
    let healthcareUsers;
    try {
      healthcareUsers = await sourcePrisma.$queryRaw`
        SELECT id, email, password, name, "facilityName", "facilityType", phone,
               "isSubUser", "parentUserId", "mustChangePassword", "orgAdmin",
               "isDeleted", "createdAt", "updatedAt"
        FROM healthcare_users
        WHERE "isDeleted" = false
        ORDER BY email;
      `;
    } catch (error) {
      healthcareUsers = await sourcePrisma.$queryRaw`
        SELECT id, email, password, name, "facilityName", "facilityType",
               "isSubUser", "parentUserId", "mustChangePassword", "orgAdmin",
               "isDeleted", "createdAt", "updatedAt"
        FROM healthcare_users
        WHERE "isDeleted" = false
        ORDER BY email;
      `;
      healthcareUsers = healthcareUsers.map(u => ({ ...u, phone: null }));
    }
    
    // Export EMSUsers
    const emsUsers = await sourcePrisma.$queryRaw`
      SELECT id, email, password, name, "agencyName", "agencyId", "userType",
             "isActive", "isSubUser", "parentUserId", "mustChangePassword", "orgAdmin",
             "isDeleted", "createdAt", "updatedAt"
      FROM ems_users
      WHERE "isDeleted" = false
      ORDER BY email;
    `;
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      centerUsers: centerUsers,
      healthcareUsers: healthcareUsers,
      emsUsers: emsUsers
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${centerUsers.length} CenterUsers`);
    console.log(`✅ Exported ${healthcareUsers.length} HealthcareUsers`);
    console.log(`✅ Exported ${emsUsers.length} EMSUsers`);
    console.log(`\n📁 Saved to: ${outputFile}`);
    
    return exportData;
  } catch (error) {
    console.error('❌ Error exporting users:', error.message);
    throw error;
  }
}

async function importUsers(targetPrisma, inputFile) {
  try {
    console.log('📥 Importing users to target database...\n');
    
    const importData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    let imported = { centerUsers: 0, healthcareUsers: 0, emsUsers: 0 };
    let updated = { centerUsers: 0, healthcareUsers: 0, emsUsers: 0 };
    
    // Import CenterUsers
    for (const user of importData.centerUsers || []) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO center_users (id, email, password, name, "userType", phone, 
                                    "emailNotifications", "smsNotifications", "isActive", 
                                    "isDeleted", "createdAt", "updatedAt")
          VALUES (${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.userType}, 
                  ${user.phone || null}, ${user.emailNotifications ?? true}, ${user.smsNotifications ?? false}, 
                  ${user.isActive}, ${user.isDeleted}, ${user.createdAt}::timestamp, ${user.updatedAt}::timestamp)
          ON CONFLICT (email) DO UPDATE
          SET password = EXCLUDED.password,
              name = EXCLUDED.name,
              "userType" = EXCLUDED."userType",
              phone = EXCLUDED.phone,
              "emailNotifications" = EXCLUDED."emailNotifications",
              "smsNotifications" = EXCLUDED."smsNotifications",
              "isActive" = EXCLUDED."isActive",
              "isDeleted" = EXCLUDED."isDeleted",
              "updatedAt" = NOW();
        `;
        const exists = await targetPrisma.$queryRaw`
          SELECT email FROM center_users WHERE email = ${user.email} AND id != ${user.id}
        `;
        if (exists && exists.length > 0) {
          updated.centerUsers++;
        } else {
          imported.centerUsers++;
        }
      } catch (error) {
        console.error(`⚠️  Error importing CenterUser ${user.email}:`, error.message);
      }
    }
    
    // Import HealthcareUsers
    for (const user of importData.healthcareUsers || []) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO healthcare_users (id, email, password, name, "facilityName", "facilityType", 
                                        "isSubUser", "parentUserId", "mustChangePassword", 
                                        "orgAdmin", "isDeleted", "createdAt", "updatedAt")
          VALUES (${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.facilityName}, 
                  ${user.facilityType}, ${user.isSubUser}, ${user.parentUserId}, 
                  ${user.mustChangePassword}, ${user.orgAdmin}, ${user.isDeleted}, 
                  ${user.createdAt}::timestamp, ${user.updatedAt}::timestamp)
          ON CONFLICT (email) DO UPDATE
          SET password = EXCLUDED.password,
              name = EXCLUDED.name,
              "facilityName" = EXCLUDED."facilityName",
              "facilityType" = EXCLUDED."facilityType",
              "isSubUser" = EXCLUDED."isSubUser",
              "parentUserId" = EXCLUDED."parentUserId",
              "mustChangePassword" = EXCLUDED."mustChangePassword",
              "orgAdmin" = EXCLUDED."orgAdmin",
              "isDeleted" = EXCLUDED."isDeleted",
              "updatedAt" = NOW();
        `;
        const exists = await targetPrisma.$queryRaw`
          SELECT email FROM healthcare_users WHERE email = ${user.email} AND id != ${user.id}
        `;
        if (exists && exists.length > 0) {
          updated.healthcareUsers++;
        } else {
          imported.healthcareUsers++;
        }
      } catch (error) {
        console.error(`⚠️  Error importing HealthcareUser ${user.email}:`, error.message);
      }
    }
    
    // Import EMSUsers
    for (const user of importData.emsUsers || []) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO ems_users (id, email, password, name, "agencyName", "agencyId", "userType",
                                 "isActive", "isSubUser", "parentUserId", "mustChangePassword", 
                                 "orgAdmin", "isDeleted", "createdAt", "updatedAt")
          VALUES (${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.agencyName}, 
                  ${user.agencyId}, ${user.userType}, ${user.isActive}, ${user.isSubUser}, 
                  ${user.parentUserId}, ${user.mustChangePassword}, ${user.orgAdmin}, 
                  ${user.isDeleted}, ${user.createdAt}::timestamp, ${user.updatedAt}::timestamp)
          ON CONFLICT (email) DO UPDATE
          SET password = EXCLUDED.password,
              name = EXCLUDED.name,
              "agencyName" = EXCLUDED."agencyName",
              "agencyId" = EXCLUDED."agencyId",
              "userType" = EXCLUDED."userType",
              "isActive" = EXCLUDED."isActive",
              "isSubUser" = EXCLUDED."isSubUser",
              "parentUserId" = EXCLUDED."parentUserId",
              "mustChangePassword" = EXCLUDED."mustChangePassword",
              "orgAdmin" = EXCLUDED."orgAdmin",
              "isDeleted" = EXCLUDED."isDeleted",
              "updatedAt" = NOW();
        `;
        const exists = await targetPrisma.$queryRaw`
          SELECT email FROM ems_users WHERE email = ${user.email} AND id != ${user.id}
        `;
        if (exists && exists.length > 0) {
          updated.emsUsers++;
        } else {
          imported.emsUsers++;
        }
      } catch (error) {
        console.error(`⚠️  Error importing EMSUser ${user.email}:`, error.message);
      }
    }
    
    console.log('\n✅ Import Summary:');
    console.log(`   CenterUsers: ${imported.centerUsers} imported, ${updated.centerUsers} updated`);
    console.log(`   HealthcareUsers: ${imported.healthcareUsers} imported, ${updated.healthcareUsers} updated`);
    console.log(`   EMSUsers: ${imported.emsUsers} imported, ${updated.emsUsers} updated`);
    
  } catch (error) {
    console.error('❌ Error importing users:', error.message);
    throw error;
  }
}

async function syncUsers(sourcePrisma, targetPrisma) {
  try {
    console.log('🔄 Syncing users from source to target database...\n');
    
    // Export to temp file
    const tempFile = path.join(__dirname, 'temp-users-export.json');
    await exportUsers(sourcePrisma, tempFile);
    
    // Import from temp file
    await importUsers(targetPrisma, tempFile);
    
    // Clean up
    fs.unlinkSync(tempFile);
    
    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Error syncing users:', error.message);
    throw error;
  }
}

async function main() {
  let sourcePrisma, targetPrisma;
  
  try {
    if (command === 'export') {
      if (!SOURCE_DB) {
        console.error('❌ SOURCE_DB environment variable required for export');
        process.exit(1);
      }
      sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
      await exportUsers(sourcePrisma, filePath || 'users-export.json');
    } else if (command === 'import') {
      if (!TARGET_DB) {
        console.error('❌ TARGET_DB environment variable required for import');
        process.exit(1);
      }
      if (!filePath) {
        console.error('❌ Import file path required');
        process.exit(1);
      }
      targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });
      await importUsers(targetPrisma, filePath);
    } else if (command === 'sync') {
      if (!SOURCE_DB || !TARGET_DB) {
        console.error('❌ Both SOURCE_DB and TARGET_DB environment variables required for sync');
        process.exit(1);
      }
      sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
      targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });
      await syncUsers(sourcePrisma, targetPrisma);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (sourcePrisma) await sourcePrisma.$disconnect();
    if (targetPrisma) await targetPrisma.$disconnect();
  }
}

main();

