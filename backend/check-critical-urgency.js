#!/usr/bin/env node

/**
 * Script to check for "Critical" urgency entries in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkCriticalUrgency() {
  try {
    console.log('🔍 Checking database for "Critical" urgency entries...\n');
    
    // 1. Check if "Critical" exists as an urgency option
    console.log('1. Checking if "Critical" exists as an urgency option...');
    const criticalOption = await prisma.dropdownOption.findFirst({
      where: {
        category: 'urgency',
        value: 'Critical',
        isActive: true
      }
    });
    
    if (criticalOption) {
      console.log('   ❌ FOUND: "Critical" exists as an urgency option');
      console.log('   Details:', {
        id: criticalOption.id,
        value: criticalOption.value,
        category: criticalOption.category,
        isActive: criticalOption.isActive,
        createdAt: criticalOption.createdAt,
        updatedAt: criticalOption.updatedAt
      });
    } else {
      console.log('   ✅ NOT FOUND: "Critical" does not exist as an urgency option');
    }
    
    // 2. Check if "Critical" is set as the default
    console.log('\n2. Checking if "Critical" is set as the default urgency...');
    const criticalDefault = await prisma.categoryDefault.findFirst({
      where: {
        category: 'urgency'
      },
      include: {
        option: true
      }
    });
    
    if (criticalDefault && criticalDefault.option?.value === 'Critical') {
      console.log('   ❌ FOUND: "Critical" is set as the default urgency');
      console.log('   Details:', {
        category: criticalDefault.category,
        optionId: criticalDefault.optionId,
        optionValue: criticalDefault.option.value,
        createdAt: criticalDefault.createdAt,
        updatedAt: criticalDefault.updatedAt
      });
    } else if (criticalDefault) {
      console.log('   ✅ Current default is:', criticalDefault.option?.value || 'N/A');
      console.log('   (Not "Critical")');
    } else {
      console.log('   ✅ No default urgency is set');
    }
    
    // 3. List all urgency options
    console.log('\n3. All urgency options in database:');
    const allUrgencyOptions = await prisma.dropdownOption.findMany({
      where: {
        category: 'urgency',
        isActive: true
      },
      orderBy: {
        value: 'asc'
      }
    });
    
    if (allUrgencyOptions.length === 0) {
      console.log('   ⚠️  No urgency options found in database');
    } else {
      console.log(`   Found ${allUrgencyOptions.length} urgency option(s):`);
      allUrgencyOptions.forEach((opt, index) => {
        const isDefault = criticalDefault?.optionId === opt.id ? ' (DEFAULT)' : '';
        const isValid = ['Routine', 'Urgent', 'Emergent'].includes(opt.value) ? '✅' : '❌';
        console.log(`   ${index + 1}. ${isValid} ${opt.value}${isDefault}`);
        console.log(`      ID: ${opt.id}, Active: ${opt.isActive}, Created: ${opt.createdAt}`);
      });
    }
    
    // 4. Summary
    console.log('\n📊 SUMMARY:');
    const hasCriticalOption = !!criticalOption;
    const hasCriticalDefault = !!(criticalDefault && criticalDefault.option?.value === 'Critical');
    
    if (hasCriticalOption || hasCriticalDefault) {
      console.log('   ❌ PROBLEM FOUND: "Critical" exists in database');
      if (hasCriticalOption) {
        console.log('      - "Critical" exists as an option');
      }
      if (hasCriticalDefault) {
        console.log('      - "Critical" is set as default');
      }
      console.log('\n   💡 RECOMMENDED ACTIONS:');
      console.log('      1. Delete "Critical" from urgency options if it exists');
      console.log('      2. Remove "Critical" from defaults if it\'s set');
      console.log('      3. The backend fixes will prevent it from being used going forward');
    } else {
      console.log('   ✅ NO PROBLEM: "Critical" does not exist in database');
      console.log('      The issue was likely elsewhere (or already cleaned up)');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Error details:', error.message);
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Make sure DATABASE_URL environment variable is set');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCriticalUrgency();

