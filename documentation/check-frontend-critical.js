#!/usr/bin/env node

/**
 * Script to check frontend code for any hardcoded "Critical" values
 * Searches TypeScript/JavaScript files for Critical references
 */

const fs = require('fs');
const path = require('path');

function searchForCritical(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (!['node_modules', 'dist', '.git', '.next'].includes(file)) {
        searchForCritical(filePath, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Search for Critical in context of urgency
        const criticalRegex = /Critical/gi;
        const urgencyRegex = /urgency|urgencyLevel/gi;
        
        if (criticalRegex.test(content) && urgencyRegex.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.match(/Critical/i) && line.match(/urgency/i)) {
              results.push({
                file: filePath.replace(process.cwd(), ''),
                line: index + 1,
                content: line.trim()
              });
            }
          });
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }

  return results;
}

console.log('🔍 Searching frontend code for "Critical" urgency references...\n');

const frontendDir = path.join(process.cwd(), 'frontend', 'src');
const results = searchForCritical(frontendDir);

console.log(`Found ${results.length} potential "Critical" urgency reference(s):\n`);

if (results.length === 0) {
  console.log('✅ No hardcoded "Critical" urgency values found in frontend code!');
  console.log('\nThis means:');
  console.log('   - "Critical" is not hardcoded in the frontend');
  console.log('   - The issue is likely from:');
  console.log('     • Database default (but we checked - it\'s not there)');
  console.log('     • Browser cache/localStorage');
  console.log('     • State management issue');
} else {
  console.log('⚠️  Found potential "Critical" references:\n');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}:${result.line}`);
    console.log(`   ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}`);
    console.log('');
  });
  
  console.log('\n💡 Review these files to see if "Critical" is being set as a default or hardcoded value');
}





