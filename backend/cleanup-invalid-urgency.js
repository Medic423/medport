#!/usr/bin/env node

/**
 * Script to clean up invalid urgency options from database
 * Backend only accepts: Routine, Urgent, Emergent
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const VALID_URGENCY_OPTIONS = ['Routine', 'Urgent', 'Emergent'];

async function cleanupInvalidUrgency() {
  try {
    console.log('🧹 Cleaning up invalid urgency options...\n');
    
    // Get all urgency options
    const allUrgencyOptions = await prisma.dropdownOption.findMany({
      where: {
        category: 'urgency',
        isActive: true
      }
    });
    
    console.log(`Found ${allUrgencyOptions.length} urgency option(s) in database\n`);
    
    // Find invalid options (not in valid list)
    const invalidOptions = allUrgencyOptions.filter(
      opt => !VALID_URGENCY_OPTIONS.includes(opt.value)
    );
    
    if (invalidOptions.length === 0) {
      console.log('✅ No invalid urgency options found!');
      console.log('   All urgency options are valid (Routine, Urgent, Emergent)');
      return;
    }
    
    console.log(`❌ Found ${invalidOptions.length} invalid urgency option(s):`);
    invalidOptions.forEach(opt => {
      console.log(`   - "${opt.value}" (ID: ${opt.id})`);
    });
    
    // Check if any invalid option is set as default
    const currentDefault = await prisma.categoryDefault.findFirst({
      where: { category: 'urgency' },
      include: { option: true }
    });
    
    if (currentDefault && !VALID_URGENCY_OPTIONS.includes(currentDefault.option?.value || '')) {
      console.log(`\n⚠️  WARNING: Invalid option "${currentDefault.option?.value}" is set as default!`);
      console.log('   Will reset default to "Routine"');
    }
    
    // Ask for confirmation (commented out for automated use)
    console.log('\n📋 Actions to take:');
    console.log('   1. Deactivate invalid urgency options');
    if (currentDefault && !VALID_URGENCY_OPTIONS.includes(currentDefault.option?.value || '')) {
      console.log('   2. Reset default to "Routine"');
    }
    
    // Deactivate invalid options
    for (const opt of invalidOptions) {
      await prisma.dropdownOption.update({
        where: { id: opt.id },
        data: { isActive: false }
      });
      console.log(`   ✅ Deactivated: "${opt.value}"`);
    }
    
    // Reset default if invalid
    if (currentDefault && !VALID_URGENCY_OPTIONS.includes(currentDefault.option?.value || '')) {
      // Find "Routine" option
      const routineOption = await prisma.dropdownOption.findFirst({
        where: {
          category: 'urgency',
          value: 'Routine',
          isActive: true
        }
      });
      
      if (routineOption) {
        await prisma.categoryDefault.upsert({
          where: { category: 'urgency' },
          update: { optionId: routineOption.id },
          create: { category: 'urgency', optionId: routineOption.id }
        });
        console.log(`   ✅ Reset default to "Routine"`);
      }
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log('\n📊 Final state:');
    const finalOptions = await prisma.dropdownOption.findMany({
      where: {
        category: 'urgency',
        isActive: true
      },
      orderBy: { value: 'asc' }
    });
    
    console.log(`   Active urgency options: ${finalOptions.length}`);
    finalOptions.forEach(opt => {
      const isDefault = currentDefault?.optionId === opt.id ? ' (DEFAULT)' : '';
      console.log(`   - ${opt.value}${isDefault}`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvalidUrgency();

