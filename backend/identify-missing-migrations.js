#!/usr/bin/env node
/**
 * Identify which migrations create the missing tables/columns
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'prisma/migrations');
const migrations = fs.readdirSync(migrationsDir)
  .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory())
  .filter(f => f !== 'migration_lock.toml')
  .sort();

console.log('🔍 Identifying Migrations for Missing Tables/Columns\n');
console.log('='.repeat(80));

const missingTables = [
  'backhaul_opportunities',
  'notification_logs',
  'notification_preferences',
  'pricing_models',
  'unit_analytics',
  'units'
];

const missingColumns = {
  'facilities': ['approvedAt', 'approvedBy', 'capabilities', 'coordinates', 'latitude', 'longitude', 'operatingHours', 'requiresReview'],
  'trips': ['actualTripTimeMinutes', 'backhaulOpportunity', 'completionTimeMinutes', 'customerSatisfaction', 'deadheadMiles', 'destinationLatitude', 'destinationLongitude', 'distanceMiles', 'efficiency', 'estimatedTripTimeMinutes', 'insuranceCompany', 'insurancePayRate', 'loadedMiles', 'maxResponses', 'originLatitude', 'originLongitude', 'perMileRate', 'performanceScore', 'pickupLocationId', 'requestTimestamp', 'responseDeadline', 'responseStatus', 'responseTimeMinutes', 'revenuePerHour', 'selectionMode', 'tripCost'],
  'system_analytics': ['createdAt'],
  'healthcare_destinations': ['contactName', 'createdAt', 'healthcareUserId', 'isActive', 'updatedAt', 'zipCode'],
  'transport_requests': [] // These columns exist in prod but not dev - different issue
};

console.log('\n📋 Checking Migrations for Missing Tables:\n');

const tableMigrations = {};

migrations.forEach(migrationName => {
  const migrationFile = path.join(migrationsDir, migrationName, 'migration.sql');
  if (!fs.existsSync(migrationFile)) return;
  
  const content = fs.readFileSync(migrationFile, 'utf8');
  
  missingTables.forEach(table => {
    // Check if this migration creates the table (not drops it)
    const createsTable = content.includes(`CREATE TABLE "${table}"`) || 
                        content.includes(`CREATE TABLE ${table}`);
    const dropsTable = content.includes(`DROP TABLE "${table}"`) || 
                      content.includes(`DROP TABLE ${table}`);
    
    if (createsTable && !dropsTable) {
      if (!tableMigrations[table]) {
        tableMigrations[table] = [];
      }
      tableMigrations[table].push({
        migration: migrationName,
        creates: true
      });
    } else if (dropsTable) {
      if (!tableMigrations[table]) {
        tableMigrations[table] = [];
      }
      tableMigrations[table].push({
        migration: migrationName,
        creates: false
      });
    }
  });
});

// Find the last migration that creates each table
Object.keys(tableMigrations).forEach(table => {
  const history = tableMigrations[table];
  const creates = history.filter(h => h.creates);
  const drops = history.filter(h => !h.creates);
  
  console.log(`\n📊 ${table}:`);
  if (creates.length > 0) {
    const lastCreate = creates[creates.length - 1];
    const lastCreateIndex = migrations.indexOf(lastCreate.migration);
    const lastDrop = drops.length > 0 ? drops[drops.length - 1] : null;
    const lastDropIndex = lastDrop ? migrations.indexOf(lastDrop.migration) : -1;
    
    if (lastDropIndex < lastCreateIndex) {
      console.log(`   ✅ Last creates: ${lastCreate.migration}`);
      console.log(`   📝 This migration should create the table`);
    } else {
      console.log(`   ⚠️  Created in ${lastCreate.migration} but dropped later`);
      console.log(`   ❌ Table should not exist according to migrations`);
    }
  } else {
    console.log(`   ❌ No migration found that creates this table`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n📋 Checking Migrations for Missing Columns:\n');

Object.keys(missingColumns).forEach(table => {
  const columns = missingColumns[table];
  if (columns.length === 0) return;
  
  console.log(`\n📊 ${table}:`);
  columns.forEach(column => {
    let foundIn = [];
    migrations.forEach(migrationName => {
      const migrationFile = path.join(migrationsDir, migrationName, 'migration.sql');
      if (!fs.existsSync(migrationFile)) return;
      
      const content = fs.readFileSync(migrationFile, 'utf8');
      const addsColumn = content.includes(`ADD COLUMN`) && 
                         (content.includes(`"${column}"`) || content.includes(`${column}`)) &&
                         content.includes(`"${table}"`);
      const dropsColumn = content.includes(`DROP COLUMN`) && 
                         (content.includes(`"${column}"`) || content.includes(`${column}`)) &&
                         content.includes(`"${table}"`);
      
      if (addsColumn && !dropsColumn) {
        foundIn.push({ migration: migrationName, action: 'adds' });
      } else if (dropsColumn) {
        foundIn.push({ migration: migrationName, action: 'drops' });
      }
    });
    
    if (foundIn.length > 0) {
      const adds = foundIn.filter(f => f.action === 'adds');
      const drops = foundIn.filter(f => f.action === 'drops');
      const lastAdd = adds.length > 0 ? adds[adds.length - 1] : null;
      const lastDrop = drops.length > 0 ? drops[drops.length - 1] : null;
      
      if (lastAdd) {
        const addIndex = migrations.indexOf(lastAdd.migration);
        const dropIndex = lastDrop ? migrations.indexOf(lastDrop.migration) : -1;
        
        if (dropIndex < addIndex) {
          console.log(`   ✅ ${column}: Added in ${lastAdd.migration}`);
        } else {
          console.log(`   ⚠️  ${column}: Added then dropped`);
        }
      }
    } else {
      console.log(`   ❌ ${column}: Not found in any migration`);
    }
  });
});

console.log('\n✅ Analysis complete!\n');
