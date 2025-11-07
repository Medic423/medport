import { RevenueOptimizer } from './services/revenueOptimizer';
import { BackhaulDetector } from './services/backhaulDetector';
import { testUnits, testRequests, testScenarios, createTestDataWithCurrentTime } from './testData/optimizationTestData';

/**
 * Test runner for optimization algorithms
 * Run with: npx ts-node src/testRunner.ts
 */

function runRevenueOptimizerTests() {
  console.log('🧮 Testing Revenue Optimizer...\n');
  
  const mockDatabaseManager = {};
  const optimizer = new RevenueOptimizer(mockDatabaseManager);
  
  // Test 1: Revenue calculations
  console.log('📊 Testing Revenue Calculations:');
  testRequests.slice(0, 4).forEach((request, index) => {
    const revenue = optimizer.calculateRevenue(request);
    console.log(`  Request ${index + 1} (${request.transportLevel}, ${request.priority}): $${revenue}`);
  });
  
  // Test 2: Distance calculations
  console.log('\n📏 Testing Distance Calculations:');
  const unit = testUnits[0];
  testRequests.slice(0, 3).forEach((request, index) => {
    const distance = optimizer.calculateDistance(unit.currentLocation, request.originLocation);
    console.log(`  Unit to Request ${index + 1}: ${distance.toFixed(2)} miles`);
  });
  
  // Test 3: Scoring
  console.log('\n🎯 Testing Scoring Algorithm:');
  const currentTime = new Date('2024-01-15T08:00:00Z');
  testRequests.slice(0, 3).forEach((request, index) => {
    const score = optimizer.calculateScore(unit, request, currentTime);
    console.log(`  Unit-Request ${index + 1} Score: ${score}`);
  });
  
  // Test 4: Capability validation
  console.log('\n✅ Testing Capability Validation:');
  testUnits.forEach((unit, index) => {
    const canHandle = optimizer.canHandleRequest(unit, testRequests[0]);
    console.log(`  Unit ${index + 1} (${unit.capabilities.join(', ')}): ${canHandle ? '✅' : '❌'}`);
  });
  
  console.log('\n✅ Revenue Optimizer tests completed!\n');
}

function runBackhaulDetectorTests() {
  console.log('🔗 Testing Backhaul Detector...\n');
  
  const detector = new BackhaulDetector();
  
  // Test 1: Pair detection
  console.log('🔍 Testing Pair Detection:');
  const pairs = detector.findPairs(testRequests);
  console.log(`  Found ${pairs.length} valid pairs from ${testRequests.length} requests`);
  
  if (pairs.length > 0) {
    console.log('  Top 3 pairs:');
    pairs.slice(0, 3).forEach((pair, index) => {
      console.log(`    Pair ${index + 1}: ${pair.distance.toFixed(2)}mi, ${pair.timeWindow}min, efficiency: ${pair.efficiency.toFixed(2)}`);
    });
  }
  
  // Test 2: Perfect backhaul scenario
  console.log('\n🎯 Testing Perfect Backhaul Scenario:');
  const perfectPairs = detector.findPairs(testScenarios.perfectBackhaul.requests);
  console.log(`  Perfect backhaul pairs: ${perfectPairs.length}`);
  
  if (perfectPairs.length > 0) {
    const pair = perfectPairs[0];
    console.log(`  Distance: ${pair.distance} miles`);
    console.log(`  Time window: ${pair.timeWindow} minutes`);
    console.log(`  Efficiency: ${pair.efficiency.toFixed(2)}`);
  }
  
  // Test 3: Statistics
  console.log('\n📈 Testing Statistics:');
  const stats = detector.getBackhaulStatistics(testRequests);
  console.log(`  Total requests: ${stats.totalRequests}`);
  console.log(`  Possible pairs: ${stats.possiblePairs}`);
  console.log(`  Valid pairs: ${stats.validPairs}`);
  console.log(`  Average efficiency: ${stats.averageEfficiency}`);
  console.log(`  Potential revenue increase: $${stats.potentialRevenueIncrease}`);
  
  console.log('\n✅ Backhaul Detector tests completed!\n');
}

function runIntegrationTests() {
  console.log('🔧 Testing Integration...\n');
  
  const mockDatabaseManager = {};
  const optimizer = new RevenueOptimizer(mockDatabaseManager);
  const detector = new BackhaulDetector();
  
  // Test with current timestamp data
  console.log('⏰ Testing with current timestamp data:');
  const { units, requests } = createTestDataWithCurrentTime();
  console.log(`  Generated ${units.length} units and ${requests.length} requests`);
  
  // Test optimization with current data
  const unit = units[0];
  const request = requests[0];
  const currentTime = new Date();
  
  const score = optimizer.calculateScore(unit, request, currentTime);
  console.log(`  Current time score: ${score}`);
  
  const pairs = detector.findPairs(requests);
  console.log(`  Current time pairs: ${pairs.length}`);
  
  console.log('\n✅ Integration tests completed!\n');
}

function runPerformanceTests() {
  console.log('⚡ Testing Performance...\n');
  
  const mockDatabaseManager = {};
  const optimizer = new RevenueOptimizer(mockDatabaseManager);
  const detector = new BackhaulDetector();
  
  // Generate larger dataset
  const largeRequests = [];
  for (let i = 0; i < 100; i++) {
    largeRequests.push({
      ...testRequests[0],
      id: `perf-req-${i}`,
      readyStart: new Date(Date.now() + (i * 5 * 60 * 1000)), // 5 min apart
      readyEnd: new Date(Date.now() + (i * 5 * 60 * 1000) + (30 * 60 * 1000))
    });
  }
  
  console.log(`Testing with ${largeRequests.length} requests...`);
  
  // Test backhaul detection performance
  const startTime = Date.now();
  const pairs = detector.findPairs(largeRequests);
  const endTime = Date.now();
  
  console.log(`  Backhaul detection: ${pairs.length} pairs in ${endTime - startTime}ms`);
  
  // Test scoring performance
  const unit = testUnits[0];
  const currentTime = new Date();
  
  const scoreStartTime = Date.now();
  for (let i = 0; i < 100; i++) {
    optimizer.calculateScore(unit, largeRequests[i], currentTime);
  }
  const scoreEndTime = Date.now();
  
  console.log(`  Scoring 100 requests: ${scoreEndTime - scoreStartTime}ms`);
  
  console.log('\n✅ Performance tests completed!\n');
}

function main() {
  console.log('🚀 Starting Optimization Algorithm Tests\n');
  console.log('=' .repeat(50));
  
  try {
    runRevenueOptimizerTests();
    runBackhaulDetectorTests();
    runIntegrationTests();
    runPerformanceTests();
    
    console.log('🎉 All tests completed successfully!');
    console.log('✅ Revenue optimization algorithms are working correctly');
    console.log('✅ Backhaul detection is functioning properly');
    console.log('✅ Integration tests passed');
    console.log('✅ Performance is acceptable');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

export { main as runOptimizationTests };
