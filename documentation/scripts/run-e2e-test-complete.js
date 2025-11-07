#!/usr/bin/env node

/**
 * Complete E2E Test Runner
 * Runs the full E2E test with setup and cleanup
 * 
 * This script:
 * 1. Sets up test data
 * 2. Runs the E2E test
 * 3. Cleans up test data
 * 4. Displays results
 */

const { spawn } = require('child_process');
const path = require('path');

async function runCompleteE2ETest() {
  console.log('🚀 Complete E2E Test Runner');
  console.log('============================');
  console.log('');

  try {
    // Step 1: Set up test data
    console.log('🏗️  Step 1: Setting up test data...');
    await runScript('setup-e2e-test-data.js');
    console.log('✅ Test data setup complete');
    console.log('');

    // Step 2: Verify test data
    console.log('🔍 Step 2: Verifying test data...');
    await runScript('verify-e2e-test-data.js');
    console.log('✅ Test data verification complete');
    console.log('');

    // Step 3: Run E2E test
    console.log('🧪 Step 3: Running E2E test...');
    await runScript('run-e2e-test.js');
    console.log('✅ E2E test complete');
    console.log('');

    // Step 4: Display results
    console.log('📊 Step 4: Displaying results...');
    await displayResults();
    console.log('✅ Results displayed');
    console.log('');

    // Step 5: Clean up test data
    console.log('🧹 Step 5: Cleaning up test data...');
    await runScript('cleanup-e2e-test-data.js');
    console.log('✅ Test data cleanup complete');
    console.log('');

    console.log('🎉 Complete E2E test run finished!');
    console.log('');
    console.log('📄 Check e2e-test-results.json for detailed results');

  } catch (error) {
    console.error('❌ E2E test run failed:', error.message);
    
    // Try to clean up even if test failed
    try {
      console.log('🧹 Attempting cleanup...');
      await runScript('cleanup-e2e-test-data.js');
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', 'backend')
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Script ${scriptName} failed: ${error.message}`));
    });
  });
}

async function displayResults() {
  try {
    const fs = require('fs');
    const resultsFile = path.join(__dirname, '..', 'backend', 'e2e-test-results.json');
    
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      
      console.log('📊 E2E TEST RESULTS SUMMARY');
      console.log('============================');
      console.log('');
      
      const summary = results.summary;
      console.log(`Status: ${summary.status}`);
      console.log(`Duration: ${Math.round(summary.duration / 1000)}s`);
      console.log(`Phases: ${summary.passedPhases}/${summary.totalPhases} passed`);
      console.log(`Bugs Found: ${summary.totalBugs} (${summary.criticalBugs} critical)`);
      console.log('');

      if (results.bugs && results.bugs.length > 0) {
        console.log('🐛 CRITICAL BUGS IDENTIFIED:');
        console.log('----------------------------');
        results.bugs.forEach((bug, index) => {
          if (bug.severity === 'CRITICAL') {
            console.log(`${index + 1}. ${bug.description}`);
            console.log(`   Phase: ${bug.phase}`);
            console.log(`   Error: ${bug.error}`);
            console.log(`   Impact: ${bug.impact}`);
            console.log('');
          }
        });
      }

      console.log('📄 Full results available in: e2e-test-results.json');
      console.log('');
    } else {
      console.log('⚠️  No results file found');
    }
  } catch (error) {
    console.error('❌ Error displaying results:', error.message);
  }
}

// Run the complete E2E test
runCompleteE2ETest().catch(console.error);
