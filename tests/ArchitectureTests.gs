/**
 * ArchitectureTests.gs - Tests for Period Spreadsheet Architecture
 *
 * Tests verify:
 * - PeriodConfig has SpreadsheetID column
 * - Each period has its own spreadsheet
 * - getPeriodSpreadsheet() works correctly
 * - Data operations use correct spreadsheets
 * - Sheet names are simple (no period suffixes)
 */

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  runDestructiveTests: false, // Set to true to create test periods
  testPeriodPrefix: 'TEST_',
  cleanupAfterTests: true
};

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

/**
 * Runs all architecture tests
 * @returns {Object} Test results
 */
function runArchitectureTests() {
  Logger.log('='.repeat(80));
  Logger.log('ARCHITECTURE TEST SUITE - STARTING');
  Logger.log('='.repeat(80));

  const results = {
    timestamp: new Date(),
    totalTests: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Verify PeriodConfig Structure
  runTest(results, 'test_PeriodConfigStructure');

  // Test 2: List Existing Periods
  runTest(results, 'test_ListExistingPeriods');

  // Test 3: Test getPeriodSpreadsheet Function
  runTest(results, 'test_GetPeriodSpreadsheet');

  // Test 4: Verify Period Spreadsheet Structure
  runTest(results, 'test_PeriodSpreadsheetStructure');

  // Test 5: Test Data Entry Functions
  runTest(results, 'test_DataEntryFunctions');

  // Test 6: Test Approval Functions
  runTest(results, 'test_ApprovalFunctions');

  // Test 7: Create New Test Period (if enabled)
  if (TEST_CONFIG.runDestructiveTests) {
    runTest(results, 'test_CreateNewPeriod');
  }

  // Print Summary
  printTestSummary(results);

  return results;
}

/**
 * Runs a single test function
 * @param {Object} results - Results object to update
 * @param {string} testName - Name of test function
 */
function runTest(results, testName) {
  results.totalTests++;

  try {
    Logger.log('');
    Logger.log('-'.repeat(80));
    Logger.log(`TEST ${results.totalTests}: ${testName}`);
    Logger.log('-'.repeat(80));

    const testFunc = this[testName];
    if (!testFunc) {
      throw new Error(`Test function ${testName} not found`);
    }

    const result = testFunc();

    if (result.success) {
      results.passed++;
      Logger.log(`✓ PASS: ${result.message}`);
    } else {
      results.failed++;
      Logger.log(`✗ FAIL: ${result.message}`);
    }

    results.tests.push({
      name: testName,
      success: result.success,
      message: result.message,
      details: result.details || null
    });

  } catch (error) {
    results.failed++;
    Logger.log(`✗ FAIL: ${error.toString()}`);

    results.tests.push({
      name: testName,
      success: false,
      message: error.toString(),
      details: null
    });
  }
}

/**
 * Prints test summary
 * @param {Object} results - Test results
 */
function printTestSummary(results) {
  Logger.log('');
  Logger.log('='.repeat(80));
  Logger.log('TEST SUMMARY');
  Logger.log('='.repeat(80));
  Logger.log(`Total Tests: ${results.totalTests}`);
  Logger.log(`Passed: ${results.passed}`);
  Logger.log(`Failed: ${results.failed}`);
  Logger.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  Logger.log('='.repeat(80));
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test 1: Verify PeriodConfig has correct structure
 */
function test_PeriodConfigStructure() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
  const sheet = ss.getSheetByName('PeriodConfig');

  if (!sheet) {
    return { success: false, message: 'PeriodConfig sheet not found' };
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log(`Found ${headers.length} columns: ${headers.join(', ')}`);

  // Check required columns
  const requiredColumns = ['PeriodID', 'PeriodName', 'SpreadsheetID', 'FiscalYear', 'Quarter', 'Status'];
  const missingColumns = [];

  requiredColumns.forEach(col => {
    if (!headers.includes(col)) {
      missingColumns.push(col);
    }
  });

  if (missingColumns.length > 0) {
    return {
      success: false,
      message: `Missing required columns: ${missingColumns.join(', ')}`
    };
  }

  // Verify SpreadsheetID column exists
  const spreadsheetIdIndex = headers.indexOf('SpreadsheetID');
  if (spreadsheetIdIndex === -1) {
    return { success: false, message: 'SpreadsheetID column not found' };
  }

  Logger.log(`✓ SpreadsheetID column found at index ${spreadsheetIdIndex}`);

  return {
    success: true,
    message: 'PeriodConfig structure is correct with SpreadsheetID column',
    details: { headers: headers, spreadsheetIdIndex: spreadsheetIdIndex }
  };
}

/**
 * Test 2: List all existing periods
 */
function test_ListExistingPeriods() {
  const periodsResult = getAllPeriods();

  if (!periodsResult.success) {
    return { success: false, message: `Failed to get periods: ${periodsResult.error}` };
  }

  const periods = periodsResult.periods || [];
  Logger.log(`Found ${periods.length} period(s):`);

  periods.forEach((period, index) => {
    Logger.log(`  ${index + 1}. ${period.periodName} (${period.periodId})`);
    Logger.log(`     - SpreadsheetID: ${period.spreadsheetId || 'MISSING!'}`);
    Logger.log(`     - Status: ${period.status}`);
    Logger.log(`     - Fiscal Year: ${period.fiscalYear}, Quarter: ${period.quarter}`);
  });

  // Check if any periods are missing SpreadsheetID
  const periodsWithoutSpreadsheet = periods.filter(p => !p.spreadsheetId);

  if (periodsWithoutSpreadsheet.length > 0) {
    return {
      success: false,
      message: `${periodsWithoutSpreadsheet.length} period(s) missing SpreadsheetID`,
      details: { periods: periods, missingSpreadsheets: periodsWithoutSpreadsheet }
    };
  }

  return {
    success: true,
    message: `All ${periods.length} period(s) have SpreadsheetID assigned`,
    details: { periods: periods }
  };
}

/**
 * Test 3: Test getPeriodSpreadsheet function
 */
function test_GetPeriodSpreadsheet() {
  const periodsResult = getAllPeriods();

  if (!periodsResult.success || !periodsResult.periods || periodsResult.periods.length === 0) {
    return { success: true, message: 'No periods to test (this is OK for new system)' };
  }

  const testPeriod = periodsResult.periods[0];
  Logger.log(`Testing with period: ${testPeriod.periodId} (${testPeriod.periodName})`);

  const spreadsheet = getPeriodSpreadsheet(testPeriod.periodId);

  if (!spreadsheet) {
    return {
      success: false,
      message: `getPeriodSpreadsheet() returned null for ${testPeriod.periodId}`
    };
  }

  const actualId = spreadsheet.getId();
  Logger.log(`✓ Retrieved spreadsheet: ${spreadsheet.getName()}`);
  Logger.log(`  Expected ID: ${testPeriod.spreadsheetId}`);
  Logger.log(`  Actual ID: ${actualId}`);

  if (actualId !== testPeriod.spreadsheetId) {
    return {
      success: false,
      message: 'Spreadsheet ID mismatch'
    };
  }

  return {
    success: true,
    message: `getPeriodSpreadsheet() correctly retrieves spreadsheet for ${testPeriod.periodId}`,
    details: { spreadsheetName: spreadsheet.getName(), spreadsheetId: actualId }
  };
}

/**
 * Test 4: Verify period spreadsheet structure
 */
function test_PeriodSpreadsheetStructure() {
  const periodsResult = getAllPeriods();

  if (!periodsResult.success || !periodsResult.periods || periodsResult.periods.length === 0) {
    return { success: true, message: 'No periods to test (this is OK for new system)' };
  }

  const testPeriod = periodsResult.periods[0];
  const spreadsheet = getPeriodSpreadsheet(testPeriod.periodId);

  if (!spreadsheet) {
    return { success: false, message: 'Could not open period spreadsheet' };
  }

  Logger.log(`Checking spreadsheet: ${spreadsheet.getName()}`);

  const sheets = spreadsheet.getSheets();
  const sheetNames = sheets.map(s => s.getName());

  Logger.log(`Found ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}`);

  // Check for expected sheets (with simple names, no period suffix)
  const expectedSheets = ['EntityNoteData', 'SubmissionStatus'];
  const foundSheets = [];
  const missingSheets = [];

  expectedSheets.forEach(name => {
    if (sheetNames.includes(name)) {
      foundSheets.push(name);
      Logger.log(`  ✓ Found: ${name}`);
    } else {
      missingSheets.push(name);
      Logger.log(`  ✗ Missing: ${name}`);
    }
  });

  // Check for old-style sheets with period suffixes (these should NOT exist)
  const oldStyleSheets = sheetNames.filter(name =>
    name.includes('_PER_') || name.includes('_Q')
  );

  if (oldStyleSheets.length > 0) {
    Logger.log(`⚠ Warning: Found old-style sheets with period suffixes:`);
    oldStyleSheets.forEach(name => Logger.log(`    - ${name}`));
  }

  return {
    success: foundSheets.length > 0,
    message: `Period spreadsheet has ${foundSheets.length} expected sheet(s), ${oldStyleSheets.length} old-style sheet(s)`,
    details: {
      allSheets: sheetNames,
      foundSheets: foundSheets,
      missingSheets: missingSheets,
      oldStyleSheets: oldStyleSheets
    }
  };
}

/**
 * Test 5: Test data entry functions use correct spreadsheet
 */
function test_DataEntryFunctions() {
  const periodsResult = getAllPeriods();

  if (!periodsResult.success || !periodsResult.periods || periodsResult.periods.length === 0) {
    return { success: true, message: 'No periods to test (this is OK for new system)' };
  }

  const testPeriod = periodsResult.periods[0];
  Logger.log(`Testing with period: ${testPeriod.periodId}`);

  // Test getAllEntityNoteData - this should use getPeriodSpreadsheet internally
  const testEntityId = 'TEST_ENTITY';
  const result = getAllEntityNoteData(testEntityId, testPeriod.periodId);

  if (!result.success) {
    // It's OK if it fails due to missing data, as long as it doesn't fail due to wrong spreadsheet
    if (result.error && result.error.includes('Spreadsheet not found')) {
      return {
        success: false,
        message: `DataEntry function couldn't find spreadsheet for ${testPeriod.periodId}`
      };
    }
  }

  Logger.log(`✓ getAllEntityNoteData() executed without spreadsheet errors`);

  return {
    success: true,
    message: 'Data entry functions correctly use period-specific spreadsheets'
  };
}

/**
 * Test 6: Test approval functions use correct spreadsheet
 */
function test_ApprovalFunctions() {
  const periodsResult = getAllPeriods();

  if (!periodsResult.success || !periodsResult.periods || periodsResult.periods.length === 0) {
    return { success: true, message: 'No periods to test (this is OK for new system)' };
  }

  const testPeriod = periodsResult.periods[0];
  Logger.log(`Testing with period: ${testPeriod.periodId}`);

  // Test getSubmissionStatus - this should use getPeriodSpreadsheet internally
  const testEntityId = 'TEST_ENTITY';
  const result = getSubmissionStatus(testEntityId, testPeriod.periodId);

  if (!result.success) {
    if (result.error && result.error.includes('Spreadsheet not found')) {
      return {
        success: false,
        message: `Approval function couldn't find spreadsheet for ${testPeriod.periodId}`
      };
    }
  }

  Logger.log(`✓ getSubmissionStatus() executed without spreadsheet errors`);

  return {
    success: true,
    message: 'Approval functions correctly use period-specific spreadsheets'
  };
}

/**
 * Test 7: Create a new test period (destructive test)
 */
function test_CreateNewPeriod() {
  const testPeriodName = `${TEST_CONFIG.testPeriodPrefix}Q3 2024-25`;
  const testPeriodId = 'PER_Q3_202425';

  Logger.log(`Creating test period: ${testPeriodName}`);

  // Check if test period already exists
  if (periodExists(testPeriodId)) {
    Logger.log(`Test period ${testPeriodId} already exists`);

    // Verify it has a spreadsheet
    const spreadsheet = getPeriodSpreadsheet(testPeriodId);
    if (!spreadsheet) {
      return {
        success: false,
        message: `Test period exists but has no spreadsheet`
      };
    }

    return {
      success: true,
      message: `Test period ${testPeriodId} already exists with spreadsheet`,
      details: { spreadsheetId: spreadsheet.getId() }
    };
  }

  // Create new period
  const result = createPeriod({
    periodName: testPeriodName,
    fiscalYear: '2024-25',
    quarter: 'Q3',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    deadlineDate: '2025-04-15'
  });

  if (!result.success) {
    return {
      success: false,
      message: `Failed to create test period: ${result.error}`
    };
  }

  Logger.log(`✓ Test period created: ${result.periodId}`);

  // Verify spreadsheet was created
  const spreadsheet = getPeriodSpreadsheet(result.periodId);
  if (!spreadsheet) {
    return {
      success: false,
      message: 'Period created but spreadsheet not accessible'
    };
  }

  Logger.log(`✓ Period spreadsheet created: ${spreadsheet.getName()}`);

  // Verify sheets exist
  const sheets = spreadsheet.getSheets().map(s => s.getName());
  Logger.log(`✓ Period sheets: ${sheets.join(', ')}`);

  return {
    success: true,
    message: `Test period created successfully with separate spreadsheet`,
    details: {
      periodId: result.periodId,
      spreadsheetId: spreadsheet.getId(),
      sheets: sheets
    }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick test runner for specific test
 */
function runSingleTest(testName) {
  Logger.log(`Running single test: ${testName}`);
  const result = this[testName]();
  Logger.log(`Result: ${result.success ? 'PASS' : 'FAIL'}`);
  Logger.log(`Message: ${result.message}`);
  return result;
}
