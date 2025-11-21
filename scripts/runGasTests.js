#!/usr/bin/env node
/**
 * Helper script to run Google Apps Script test suites via clasp.
 * Executes key GAS test entry points from the repository rootDir (./src).
 */

const { spawnSync } = require('child_process');

const TEST_FUNCTIONS = [
  { name: 'Architecture test suite', functionName: 'runArchitectureTests' },
  { name: 'Attachment test suite', functionName: 'runAllAttachmentTests' }
];

function runClaspTest(functionName) {
  const result = spawnSync('npx', ['clasp', 'run', functionName], {
    stdio: 'inherit',
    env: process.env
  });
  return result.status === 0;
}

function main() {
  console.log('Starting Google Apps Script test runner...');
  console.log(`Repository rootDir: ${require('path').resolve('./src')}`);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_FUNCTIONS) {
    console.log('='.repeat(80));
    console.log(`Running ${test.name} (${test.functionName})`);
    console.log('='.repeat(80));

    const success = runClaspTest(test.functionName);
    if (success) {
      passed += 1;
      console.log(`✔ ${test.name} completed successfully`);
    } else {
      failed += 1;
      console.error(`✘ ${test.name} failed. Check output above for details.`);
    }
    console.log('');
  }

  console.log('Test run complete');
  console.log(`Total: ${TEST_FUNCTIONS.length}, Passed: ${passed}, Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
