#!/usr/bin/env node
/**
 * Verify production database backup integrity
 * Checks that backup file exists, has content, and contains expected tables/data
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = process.argv[2] || '/Volumes/Acasis/tcc-backups/production-db-backup-20260114_112521';
const BACKUP_FILE = path.join(BACKUP_DIR, 'production_postgres_backup.sql');

console.log('🔍 Verifying Production Database Backup...\n');
console.log('='.repeat(80));
console.log(`Backup Location: ${BACKUP_DIR}`);
console.log(`Backup File: ${BACKUP_FILE}\n`);

// Check if backup file exists
if (!fs.existsSync(BACKUP_FILE)) {
  console.error(`❌ ERROR: Backup file not found: ${BACKUP_FILE}`);
  process.exit(1);
}

// Get file stats
const stats = fs.statSync(BACKUP_FILE);
const fileSizeKB = (stats.size / 1024).toFixed(2);
console.log(`✅ Backup file exists`);
console.log(`   Size: ${fileSizeKB} KB (${stats.size} bytes)`);

// Read backup file
const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
const lines = backupContent.split('\n');
console.log(`   Lines: ${lines.length.toLocaleString()}`);

// Check for critical components
const checks = {
  'CREATE TABLE statements': (backupContent.match(/CREATE TABLE/g) || []).length,
  'COPY statements (data)': (backupContent.match(/COPY public\./g) || []).length,
  'Migration history table': backupContent.includes('_prisma_migrations'),
  'Critical tables': {
    'agency_responses': backupContent.includes('COPY public.agency_responses'),
    'center_users': backupContent.includes('COPY public.center_users'),
    'ems_agencies': backupContent.includes('COPY public.ems_agencies'),
    'ems_users': backupContent.includes('COPY public.ems_users'),
    'healthcare_destinations': backupContent.includes('COPY public.healthcare_destinations'),
    'transport_requests': backupContent.includes('COPY public.transport_requests'),
    'trips': backupContent.includes('CREATE TABLE public.trips'),
  },
  'Has data rows': backupContent.match(/COPY public\.\w+.*FROM stdin;/g) !== null,
  'Backup complete marker': backupContent.includes('\\.') || backupContent.includes('COMMIT'),
};

console.log('\n📊 Backup Content Verification:\n');
console.log('-'.repeat(80));

let allChecksPassed = true;

// Check CREATE TABLE count
console.log(`CREATE TABLE statements: ${checks['CREATE TABLE statements']}`);
if (checks['CREATE TABLE statements'] < 20) {
  console.log('   ⚠️  Warning: Expected at least 20 tables');
  allChecksPassed = false;
}

// Check COPY statements (data)
console.log(`COPY statements (data): ${checks['COPY statements (data)']}`);
if (checks['COPY statements (data)'] < 10) {
  console.log('   ⚠️  Warning: Expected data in at least 10 tables');
  allChecksPassed = false;
}

// Check migration history
console.log(`Migration history table: ${checks['Migration history table'] ? '✅' : '❌'}`);
if (!checks['Migration history table']) {
  allChecksPassed = false;
}

// Check critical tables
console.log('\nCritical Tables:');
Object.entries(checks['Critical tables']).forEach(([table, exists]) => {
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${table}`);
  if (!exists) {
    allChecksPassed = false;
  }
});

// Check for data rows
console.log(`\nHas data rows: ${checks['Has data rows'] ? '✅' : '❌'}`);
if (!checks['Has data rows']) {
  allChecksPassed = false;
}

// Check backup completion
console.log(`Backup complete marker: ${checks['Backup complete marker'] ? '✅' : '⚠️'}`);

// Count actual data rows in COPY statements
console.log('\n📋 Data Row Counts:');
const copyMatches = backupContent.matchAll(/COPY public\.(\w+).*FROM stdin;([\s\S]*?)(?=\n\\.|\nCOMMIT|$)/g);
const dataCounts = {};
for (const match of copyMatches) {
  const tableName = match[1];
  const dataSection = match[2];
  if (dataSection && dataSection.trim()) {
    const rowCount = dataSection.split('\n').filter(line => line.trim() && !line.startsWith('\\')).length;
    if (rowCount > 0) {
      dataCounts[tableName] = rowCount;
    }
  }
}

if (Object.keys(dataCounts).length > 0) {
  Object.entries(dataCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([table, count]) => {
      console.log(`   ${table.padEnd(40)} ${count.toString().padStart(4)} rows`);
    });
} else {
  console.log('   ⚠️  No data rows found in COPY statements');
  allChecksPassed = false;
}

// Final summary
console.log('\n' + '='.repeat(80));
if (allChecksPassed) {
  console.log('\n✅ BACKUP VERIFICATION PASSED');
  console.log('   Backup appears to be complete and valid');
  console.log('   Contains schema (CREATE TABLE) and data (COPY)');
  console.log('   Ready for restore if needed');
} else {
  console.log('\n⚠️  BACKUP VERIFICATION FAILED');
  console.log('   Some checks did not pass - review warnings above');
  console.log('   Backup may be incomplete or corrupted');
}

console.log('\n💡 To restore this backup:');
console.log(`   cd ${BACKUP_DIR}`);
console.log('   ./restore-production-database.sh');
console.log('\n⚠️  WARNING: Restore will overwrite current production database!\n');

process.exit(allChecksPassed ? 0 : 1);
