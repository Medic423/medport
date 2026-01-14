#!/usr/bin/env node
/**
 * Compare database structures across Local Dev, Dev-SWA, and Production
 * Usage: node compare-database-structures.js
 */

const { PrismaClient } = require('@prisma/client');

// Database connection strings
const DATABASES = {
  local: process.env.DATABASE_URL_LOCAL || 'postgresql://scooper@localhost:5432/medport_ems?schema=public',
  devSWA: process.env.DATABASE_URL_DEV || 'postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require',
  production: process.env.DATABASE_URL_PROD || 'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require'
};

async function getTables(prisma, dbName) {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    return tables.map(t => t.table_name).sort();
  } catch (error) {
    console.error(`Error getting tables from ${dbName}:`, error.message);
    return [];
  }
}

async function getTableColumns(prisma, tableName, dbName) {
  try {
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    return columns;
  } catch (error) {
    console.error(`Error getting columns for ${tableName} from ${dbName}:`, error.message);
    return [];
  }
}

async function compareDatabases() {
  const results = {
    local: { tables: [], columns: {} },
    devSWA: { tables: [], columns: {} },
    production: { tables: [], columns: {} }
  };

  // Connect to each database and get structure
  for (const [dbName, connectionString] of Object.entries(DATABASES)) {
    console.log(`\n📊 Connecting to ${dbName}...`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url: connectionString }
      }
    });

    try {
      // Get all tables
      const tables = await getTables(prisma, dbName);
      results[dbName].tables = tables;
      console.log(`   ✅ Found ${tables.length} tables`);

      // Get columns for each table
      for (const table of tables) {
        const columns = await getTableColumns(prisma, table, dbName);
        results[dbName].columns[table] = columns;
      }

      await prisma.$disconnect();
    } catch (error) {
      console.error(`❌ Error connecting to ${dbName}:`, error.message);
      await prisma.$disconnect();
    }
  }

  // Compare structures
  console.log('\n\n🔍 COMPARISON RESULTS\n');
  console.log('='.repeat(80));

  // Get all unique table names across all databases
  const allTables = new Set();
  Object.values(results).forEach(db => {
    db.tables.forEach(table => allTables.add(table));
  });
  const sortedTables = Array.from(allTables).sort();

  // Compare tables
  console.log('\n📋 TABLE COMPARISON:');
  console.log('-'.repeat(80));
  console.log('Table Name'.padEnd(40) + 'Local Dev'.padEnd(15) + 'Dev-SWA'.padEnd(15) + 'Production');
  console.log('-'.repeat(80));

  sortedTables.forEach(table => {
    const localExists = results.local.tables.includes(table) ? '✅' : '❌';
    const devSWAExists = results.devSWA.tables.includes(table) ? '✅' : '❌';
    const prodExists = results.production.tables.includes(table) ? '✅' : '❌';
    
    console.log(
      table.padEnd(40) + 
      localExists.padEnd(15) + 
      devSWAExists.padEnd(15) + 
      prodExists
    );
  });

  // Find missing tables
  console.log('\n\n⚠️  MISSING TABLES:');
  console.log('-'.repeat(80));
  
  const missingInLocal = sortedTables.filter(t => !results.local.tables.includes(t));
  const missingInDevSWA = sortedTables.filter(t => !results.devSWA.tables.includes(t));
  const missingInProd = sortedTables.filter(t => !results.production.tables.includes(t));

  if (missingInLocal.length > 0) {
    console.log(`\n❌ Missing in Local Dev (${missingInLocal.length}):`);
    missingInLocal.forEach(t => console.log(`   - ${t}`));
  }
  if (missingInDevSWA.length > 0) {
    console.log(`\n❌ Missing in Dev-SWA (${missingInDevSWA.length}):`);
    missingInDevSWA.forEach(t => console.log(`   - ${t}`));
  }
  if (missingInProd.length > 0) {
    console.log(`\n❌ Missing in Production (${missingInProd.length}):`);
    missingInProd.forEach(t => console.log(`   - ${t}`));
  }

  if (missingInLocal.length === 0 && missingInDevSWA.length === 0 && missingInProd.length === 0) {
    console.log('✅ All tables exist in all environments!');
  }

  // Compare column structures for common tables
  console.log('\n\n🔍 COLUMN STRUCTURE COMPARISON:');
  console.log('-'.repeat(80));

  const commonTables = sortedTables.filter(t => 
    results.local.tables.includes(t) && 
    results.devSWA.tables.includes(t) && 
    results.production.tables.includes(t)
  );

  const columnDifferences = [];

  commonTables.forEach(table => {
    const localCols = results.local.columns[table] || [];
    const devSWACols = results.devSWA.columns[table] || [];
    const prodCols = results.production.columns[table] || [];

    const localColNames = new Set(localCols.map(c => c.column_name));
    const devSWAColNames = new Set(devSWACols.map(c => c.column_name));
    const prodColNames = new Set(prodCols.map(c => c.column_name));

    // Find differences
    const allColNames = new Set([...localColNames, ...devSWAColNames, ...prodColNames]);
    const differences = [];

    allColNames.forEach(colName => {
      const inLocal = localColNames.has(colName);
      const inDevSWA = devSWAColNames.has(colName);
      const inProd = prodColNames.has(colName);

      if (!inLocal || !inDevSWA || !inProd) {
        differences.push({
          column: colName,
          local: inLocal ? '✅' : '❌',
          devSWA: inDevSWA ? '✅' : '❌',
          production: inProd ? '✅' : '❌'
        });
      }
    });

    if (differences.length > 0) {
      columnDifferences.push({ table, differences });
    }
  });

  if (columnDifferences.length === 0) {
    console.log('✅ All columns match across all environments!');
  } else {
    console.log(`\n⚠️  Found ${columnDifferences.length} table(s) with column differences:\n`);
    columnDifferences.forEach(({ table, differences }) => {
      console.log(`\n📊 Table: ${table}`);
      console.log('   Column Name'.padEnd(30) + 'Local Dev'.padEnd(15) + 'Dev-SWA'.padEnd(15) + 'Production');
      console.log('   ' + '-'.repeat(75));
      differences.forEach(diff => {
        console.log(
          `   ${diff.column.padEnd(30)}${diff.local.padEnd(15)}${diff.devSWA.padEnd(15)}${diff.production}`
        );
      });
    });
  }

  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`Local Dev:    ${results.local.tables.length} tables`);
  console.log(`Dev-SWA:      ${results.devSWA.tables.length} tables`);
  console.log(`Production:   ${results.production.tables.length} tables`);
  console.log(`Total unique: ${sortedTables.length} tables`);

  const allAligned = 
    missingInLocal.length === 0 && 
    missingInDevSWA.length === 0 && 
    missingInProd.length === 0 &&
    columnDifferences.length === 0;

  if (allAligned) {
    console.log('\n✅ ALL DATABASES ARE ALIGNED!');
  } else {
    console.log('\n⚠️  DATABASES HAVE DIFFERENCES - See details above');
  }

  return results;
}

// Run comparison
compareDatabases()
  .then(() => {
    console.log('\n✅ Comparison complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

