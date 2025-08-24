const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOptimizationLogic() {
  try {
    console.log('🧪 Testing optimization logic step by step...\n');
    
    // Step 1: Get unassigned requests (same as optimization)
    const unassignedRequests = await prisma.transportRequest.findMany({
      where: {
        status: 'PENDING',
        assignedUnitId: null
      },
      include: {
        originFacility: true,
        destinationFacility: true
      }
    });
    
    console.log(`📋 Step 1: Found ${unassignedRequests.length} unassigned requests`);
    
    // Step 2: Get available units for each transport level
    const availableUnitsByLevel = new Map();
    for (const request of unassignedRequests) {
      const units = await prisma.unit.findMany({
        where: {
          type: request.transportLevel,
          currentStatus: 'AVAILABLE',
          isActive: true
        }
      });
      availableUnitsByLevel.set(request.transportLevel, units);
      console.log(`🚑 Step 2: Found ${units.length} available units for ${request.transportLevel}`);
    }
    
    // Step 3: Test the matching logic
    console.log('\n🔍 Step 3: Testing matching logic...');
    let totalMatches = 0;
    
    for (const request of unassignedRequests) {
      const availableUnits = availableUnitsByLevel.get(request.transportLevel) || [];
      
      if (availableUnits.length === 0) {
        console.log(`❌ No available units for ${request.transportLevel} transport level`);
        continue;
      }
      
      console.log(`\n📋 Request ${request.id}: ${request.transportLevel} from ${request.originFacility?.name} to ${request.destinationFacility?.name}`);
      console.log(`   Available units: ${availableUnits.length}`);
      
      // Find best unit for this request
      let bestUnit = null;
      let bestScore = 0;
      
      for (let i = 0; i < availableUnits.length; i++) {
        const unit = availableUnits[i];
        console.log(`   Testing unit ${unit.unitNumber} (${unit.type})`);
        
        // Check if transport levels match
        if (unit.type === request.transportLevel || 
            unit.type.toString() === request.transportLevel.toString()) {
          console.log(`   ✅ Transport level match: ${unit.type} === ${request.transportLevel}`);
          
          // Simple scoring for demo
          const score = Math.random() * 100; // Random score for testing
          console.log(`   Score: ${score.toFixed(2)}`);
          
          if (score > bestScore) {
            bestScore = score;
            bestUnit = { unit, index: i };
            console.log(`   🎯 New best unit: ${unit.unitNumber} with score ${score.toFixed(2)}`);
          }
        } else {
          console.log(`   ❌ Transport level mismatch: ${unit.type} !== ${request.transportLevel}`);
        }
      }
      
      if (bestUnit) {
        console.log(`   🎉 Best match: ${bestUnit.unit.unitNumber} with score ${bestScore.toFixed(2)}`);
        totalMatches++;
      } else {
        console.log(`   ❌ No suitable unit found`);
      }
    }
    
    console.log(`\n📊 Summary: ${totalMatches} potential matches found out of ${unassignedRequests.length} requests`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

testOptimizationLogic();
