#!/usr/bin/env node
/**
 * SMS Diagnostics Script
 * Checks SMS configuration and service availability
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();
dotenv.config({ path: join(__dirname, '.env.local'), override: true });

async function runDiagnostics() {
  console.log('========================================');
  console.log('📱 SMS DIAGNOSTICS');
  console.log('========================================\n');

  // 1. Feature Flag Check
  console.log('1️⃣ Feature Flag Status:');
  console.log('   AZURE_SMS_ENABLED:', process.env.AZURE_SMS_ENABLED || 'NOT SET');
  console.log('   Enabled Check:', process.env.AZURE_SMS_ENABLED === 'true' ? '✅ ENABLED' : '❌ DISABLED');
  console.log('   Type:', typeof process.env.AZURE_SMS_ENABLED);
  console.log('   Raw Value:', JSON.stringify(process.env.AZURE_SMS_ENABLED));
  console.log('');

  // 2. Azure Configuration
  console.log('2️⃣ Azure Configuration:');
  console.log('   Connection String:', process.env.AZURE_COMMUNICATION_CONNECTION_STRING ? '✅ SET' : '❌ NOT SET');
  if (process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
    const connStr = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    const preview = connStr.substring(0, 20) + '...' + connStr.substring(connStr.length - 10);
    console.log('   Preview:', preview);
  }
  console.log('   Phone Number:', process.env.AZURE_SMS_PHONE_NUMBER || '❌ NOT SET');
  console.log('');

  // 3. Service Availability
  console.log('3️⃣ Service Availability:');
  const fs = await import('fs');
  const services = {
    azureSMSService: 'src/services/azureSMSService.ts',
    smsMessageComposer: 'src/services/smsMessageComposer.ts',
    tripSMSService: 'src/services/tripSMSService.ts'
  };

  for (const [name, path] of Object.entries(services)) {
    try {
      // Check if file exists (relative to backend directory)
      const servicePath = join(__dirname, path);
      const exists = fs.existsSync(servicePath);
      if (exists) {
        console.log(`   ${name}: ✅ File exists`);
      } else {
        console.log(`   ${name}: ❌ File not found at ${servicePath}`);
      }
    } catch (err) {
      console.log(`   ${name}: ❌ Error - ${err.message}`);
    }
  }
  console.log('');

  // 4. Test Agency Info
  console.log('4️⃣ Test Agency:');
  console.log('   Name: Elk County EMS');
  console.log('   Phone: +18146950813');
  console.log('   Accepts Notifications: true');
  console.log('');

  // 5. Summary
  console.log('========================================');
  console.log('📊 SUMMARY');
  console.log('========================================');
  const smsEnabled = process.env.AZURE_SMS_ENABLED === 'true';
  const hasConnectionString = !!process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const hasPhoneNumber = !!process.env.AZURE_SMS_PHONE_NUMBER;

  console.log('SMS Feature Flag:', smsEnabled ? '✅ ENABLED' : '❌ DISABLED');
  console.log('Connection String:', hasConnectionString ? '✅ SET' : '❌ MISSING');
  console.log('Phone Number:', hasPhoneNumber ? '✅ SET' : '⚠️  NOT SET (may use default)');

  if (smsEnabled && hasConnectionString) {
    console.log('\n✅ SMS should be functional!');
    if (!hasPhoneNumber) {
      console.log('⚠️  Note: Phone number not set, may use default from Azure');
    }
  } else {
    console.log('\n❌ SMS is NOT properly configured:');
    if (!smsEnabled) {
      console.log('   - Feature flag is disabled');
    }
    if (!hasConnectionString) {
      console.log('   - Connection string is missing');
    }
  }
  console.log('========================================\n');
}

runDiagnostics().catch(err => {
  console.error('Error running diagnostics:', err);
  process.exit(1);
});
console.log('');

// 4. Test Agency Info
console.log('4️⃣ Test Agency:');
console.log('   Name: Elk County EMS');
console.log('   Phone: +18146950813');
console.log('   Accepts Notifications: true');
console.log('');

// 5. Summary
console.log('========================================');
console.log('📊 SUMMARY');
console.log('========================================');
const smsEnabled = process.env.AZURE_SMS_ENABLED === 'true';
const hasConnectionString = !!process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const hasPhoneNumber = !!process.env.AZURE_SMS_PHONE_NUMBER;

console.log('SMS Feature Flag:', smsEnabled ? '✅ ENABLED' : '❌ DISABLED');
console.log('Connection String:', hasConnectionString ? '✅ SET' : '❌ MISSING');
console.log('Phone Number:', hasPhoneNumber ? '✅ SET' : '⚠️  NOT SET (may use default)');

if (smsEnabled && hasConnectionString) {
  console.log('\n✅ SMS should be functional!');
  if (!hasPhoneNumber) {
    console.log('⚠️  Note: Phone number not set, may use default from Azure');
  }
} else {
  console.log('\n❌ SMS is NOT properly configured:');
  if (!smsEnabled) {
    console.log('   - Feature flag is disabled');
  }
  if (!hasConnectionString) {
    console.log('   - Connection string is missing');
  }
}
console.log('========================================\n');

