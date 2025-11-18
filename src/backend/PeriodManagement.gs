/**
 * PeriodManagement.gs - Period Open/Close Operations
 *
 * Handles:
 * - Period creation
 * - Period opening/closing
 * - Rollover of opening balances
 * - Period locking
 */

// ============================================================================
// PERIOD OPERATIONS
// ============================================================================

// Column headers for PeriodConfig sheet
const PERIOD_CONFIG_HEADERS = {
  PERIOD_ID: 'PeriodID',
  PERIOD_NAME: 'PeriodName',
  SPREADSHEET_ID: 'SpreadsheetID',
  FISCAL_YEAR: 'FiscalYear',
  QUARTER: 'Quarter',
  START_DATE: 'StartDate',
  END_DATE: 'EndDate',
  DEADLINE_DATE: 'DeadlineDate',
  STATUS: 'Status',
  CREATED_DATE: 'CreatedDate'
};

/**
 * Shows dialog to create a new period
 * Prompts admin for all required period information
 * Automatically falls back to logging if UI is not available
 */
function showCreatePeriodDialog() {
  try {
    // Try to get UI context - this will fail if not in a UI context
    const ui = SpreadsheetApp.getUi();
  } catch (uiError) {
    Logger.log('UI context not available. Use createPeriod() function directly with period data.');
    Logger.log('Example: createPeriod({periodName: "Q1 2024-25", fiscalYear: "2024-25", quarter: "Q1", startDate: "2024-07-01", endDate: "2024-09-30", deadlineDate: "2024-10-15"})');
    return {
      success: false,
      error: 'UI context not available. Call createPeriod() directly instead.'
    };
  }

  // If we get here, UI is available
  const ui = SpreadsheetApp.getUi();

  try {
    // Step 1: Get Period Name
    const periodNameResponse = ui.prompt(
      'Create New Period - Step 1 of 6',
      'Enter the Period Name (e.g., "Q1 2023-2024"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (periodNameResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const periodName = periodNameResponse.getResponseText().trim();
    if (!periodName) {
      ui.alert('Error', 'Period Name is required.', ui.ButtonSet.OK);
      return;
    }

    // Step 2: Get Fiscal Year
    const fiscalYearResponse = ui.prompt(
      'Create New Period - Step 2 of 6',
      'Enter the Fiscal Year (e.g., "2023-2024"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (fiscalYearResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const fiscalYear = fiscalYearResponse.getResponseText().trim();
    if (!fiscalYear) {
      ui.alert('Error', 'Fiscal Year is required.', ui.ButtonSet.OK);
      return;
    }

    // Step 3: Get Quarter
    const quarterResponse = ui.prompt(
      'Create New Period - Step 3 of 6',
      'Enter the Quarter (e.g., "Q1", "Q2", "Q3", or "Q4"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (quarterResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const quarter = quarterResponse.getResponseText().trim().toUpperCase();
    if (!quarter || !['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
      ui.alert('Error', 'Quarter must be Q1, Q2, Q3, or Q4.', ui.ButtonSet.OK);
      return;
    }

    // Step 4: Get Start Date
    const startDateResponse = ui.prompt(
      'Create New Period - Step 4 of 6',
      'Enter the Start Date (format: YYYY-MM-DD, e.g., "2023-04-01"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (startDateResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const startDate = startDateResponse.getResponseText().trim();
    if (!startDate || !isValidDate(startDate)) {
      ui.alert('Error', 'Invalid date format. Please use YYYY-MM-DD.', ui.ButtonSet.OK);
      return;
    }

    // Step 5: Get End Date
    const endDateResponse = ui.prompt(
      'Create New Period - Step 5 of 6',
      'Enter the End Date (format: YYYY-MM-DD, e.g., "2023-06-30"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (endDateResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const endDate = endDateResponse.getResponseText().trim();
    if (!endDate || !isValidDate(endDate)) {
      ui.alert('Error', 'Invalid date format. Please use YYYY-MM-DD.', ui.ButtonSet.OK);
      return;
    }

    // Step 6: Get Deadline Date
    const deadlineDateResponse = ui.prompt(
      'Create New Period - Step 6 of 6',
      'Enter the Submission Deadline Date (format: YYYY-MM-DD, e.g., "2023-07-15"):',
      ui.ButtonSet.OK_CANCEL
    );

    if (deadlineDateResponse.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Period creation cancelled.');
      return;
    }
    const deadlineDate = deadlineDateResponse.getResponseText().trim();
    if (!deadlineDate || !isValidDate(deadlineDate)) {
      ui.alert('Error', 'Invalid date format. Please use YYYY-MM-DD.', ui.ButtonSet.OK);
      return;
    }

    // Assemble periodData object
    const periodData = {
      periodName: periodName,
      fiscalYear: fiscalYear,
      quarter: quarter,
      startDate: startDate,
      endDate: endDate,
      deadlineDate: deadlineDate
    };

    // Call the existing createPeriod function
    const result = createPeriod(periodData);

    // Show success or error alert
    if (result.success) {
      ui.alert(
        'Success',
        `Period "${periodName}" has been created successfully!\n\nPeriod ID: ${result.periodId}`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'Error',
        `Failed to create period: ${result.error}`,
        ui.ButtonSet.OK
      );
    }

  } catch (error) {
    ui.alert(
      'Error',
      `An unexpected error occurred: ${error.toString()}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Validates a date string in YYYY-MM-DD format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDate(dateString) {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }

  return dateString === date.toISOString().split('T')[0];
}

/**
 * Calculates the submission deadline based on quarter and end date
 * Rules:
 * - Q1 ends Sept 30, Q2 ends Dec 31, Q3 ends Mar 31
 * - Annual (Q4) ends June 30
 * - Quarter deadline: 15 days after end of quarter
 * - Annual deadline: 2 months (60 days) after end of year
 *
 * @param {string} quarter - Quarter (Q1, Q2, Q3, Q4 or ANNUAL)
 * @param {string} endDate - Period end date in YYYY-MM-DD format
 * @returns {string} Deadline date in YYYY-MM-DD format
 */
function calculateDeadline(quarter, endDate) {
  const end = new Date(endDate);

  // For annual period (ends June 30), add 2 months (60 days)
  if (quarter === 'Q4' || quarter === 'ANNUAL' || quarter.toUpperCase().includes('ANNUAL')) {
    const deadline = new Date(end);
    deadline.setDate(deadline.getDate() + 60); // 2 months = ~60 days
    return deadline.toISOString().split('T')[0];
  }

  // For quarterly periods (Q1, Q2, Q3), add 15 days
  const deadline = new Date(end);
  deadline.setDate(deadline.getDate() + 15);
  return deadline.toISOString().split('T')[0];
}

/**
 * Gets the standard end date for a given quarter
 * @param {string} quarter - Quarter (Q1, Q2, Q3, Q4/ANNUAL)
 * @param {string} fiscalYear - Fiscal year (e.g., "2024-2025")
 * @returns {string} End date in YYYY-MM-DD format
 */
function getQuarterEndDate(quarter, fiscalYear) {
  const years = fiscalYear.split('-');
  const startYear = parseInt(years[0]);
  const endYear = years.length > 1 ? parseInt(years[1]) : startYear + 1;

  switch(quarter.toUpperCase()) {
    case 'Q1':
      // Q1 ends September 30 of start year
      return `${startYear}-09-30`;
    case 'Q2':
      // Q2 ends December 31 of start year
      return `${startYear}-12-31`;
    case 'Q3':
      // Q3 ends March 31 of end year
      return `${endYear}-03-31`;
    case 'Q4':
    case 'ANNUAL':
      // Annual ends June 30 of end year
      return `${endYear}-06-30`;
    default:
      return null;
  }
}

/**
 * Creates a new reporting period
 * @param {Object} periodData - Period data
 * @returns {Object} Creation result
 */
function createPeriod(periodData) {
  try {
    // Only administrators can create new periods
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only admins can create periods'
      };
    }

    const { periodName, fiscalYear, quarter, startDate, endDate, deadlineDate } = periodData;

    // Validate required fields
    if (!periodName || !fiscalYear || !quarter || !startDate || !endDate || !deadlineDate) {
      return {
        success: false,
        error: 'All fields are required'
      };
    }

    // Generate period ID
    const periodId = `PER_${quarter}_${fiscalYear.replace('-', '')}`;

    // Check if period already exists
    if (periodExists(periodId)) {
      return {
        success: false,
        error: 'Period already exists'
      };
    }

    // Create dedicated spreadsheet for this period with SAGA branding and timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const periodSpreadsheet = SpreadsheetApp.create(`SAGA ${periodName} ${timestamp}`);
    const spreadsheetId = periodSpreadsheet.getId();

    // Add period to config
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('PeriodConfig');

    sheet.appendRow([
      periodId,
      periodName,
      spreadsheetId,
      fiscalYear,
      quarter,
      new Date(startDate),
      new Date(endDate),
      new Date(deadlineDate),
      CONFIG.PERIOD_STATUS.CLOSED, // New periods start closed
      new Date()
    ]);

    // Create period sheets within the period-specific spreadsheet
    createPeriodSheets(periodSpreadsheet, periodId, periodName);

    // Log activity
    logActivity(
      Session.getActiveUser().getEmail(),
      'CREATE_PERIOD',
      `Created period: ${periodName}`
    );

    return {
      success: true,
      periodId: periodId,
      message: 'Period created successfully'
    };
  } catch (error) {
    Logger.log('Error creating period: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Opens a period for data entry
 * @param {string} periodId - Period ID
 * @returns {Object} Result
 */
function openPeriod(periodId) {
  try {
    // Verify user is admin
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only admins can open periods'
      };
    }

    // Close any currently open periods
    closeAllOpenPeriods();

    // Open the period
    updatePeriodStatus(periodId, CONFIG.PERIOD_STATUS.OPEN);

    // Log activity
    logActivity(
      user.email,
      'OPEN_PERIOD',
      `Opened period: ${periodId}`
    );

    return {
      success: true,
      message: 'Period opened successfully'
    };
  } catch (error) {
    Logger.log('Error opening period: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Closes a period (soft close - can be reopened)
 * @param {string} periodId - Period ID
 * @returns {Object} Result
 */
function closePeriod(periodId) {
  try {
    // Verify user is admin
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only admins can close periods'
      };
    }

    // Close the period
    updatePeriodStatus(periodId, CONFIG.PERIOD_STATUS.CLOSED);

    // Log activity
    logActivity(
      user.email,
      'CLOSE_PERIOD',
      `Closed period: ${periodId}`
    );

    return {
      success: true,
      message: 'Period closed successfully'
    };
  } catch (error) {
    Logger.log('Error closing period: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Locks a period (hard lock - cannot be reopened)
 * @param {string} periodId - Period ID
 * @returns {Object} Result
 */
function lockPeriod(periodId) {
  try {
    // Verify user is admin
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only admins can lock periods'
      };
    }

    // Verify all entities have submitted
    const submissionStats = getPeriodSubmissionStats(periodId);
    if (submissionStats.pending > 0) {
      return {
        success: false,
        error: `Cannot lock period: ${submissionStats.pending} entities have not submitted`
      };
    }

    // Lock the period
    updatePeriodStatus(periodId, CONFIG.PERIOD_STATUS.LOCKED);

    // Protect the period spreadsheet
    protectPeriodSpreadsheet(periodId);

    // Log activity
    logActivity(
      user.email,
      'LOCK_PERIOD',
      `Locked period: ${periodId}`
    );

    return {
      success: true,
      message: 'Period locked successfully'
    };
  } catch (error) {
    Logger.log('Error locking period: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Rolls over opening balances from previous period
 * @param {string} fromPeriodId - Source period ID
 * @param {string} toPeriodId - Target period ID
 * @returns {Object} Result
 */
function rolloverOpeningBalances(fromPeriodId, toPeriodId) {
  try {
    const fromSpreadsheet = getPeriodSpreadsheet(fromPeriodId);
    const toSpreadsheet = getPeriodSpreadsheet(toPeriodId);

    if (!fromSpreadsheet || !toSpreadsheet) {
      return {
        success: false,
        error: 'Unable to locate source or target period spreadsheet for rollover'
      };
    }

    // Get all entities
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) return entitiesResult;

    let successCount = 0;
    let errorCount = 0;

    entitiesResult.entities.forEach(entity => {
      try {
        // Get closing balances from previous period
        const closingBalances = getEntityClosingBalances(entity.id, fromPeriodId);

        // Set as opening balances in new period
        setEntityOpeningBalances(entity.id, toPeriodId, closingBalances);

        successCount++;
      } catch (error) {
        Logger.log(`Error rolling over ${entity.name}: ${error.toString()}`);
        errorCount++;
      }
    });

    return {
      success: true,
      message: `Rolled over ${successCount} entities (${errorCount} errors)`
    };
  } catch (error) {
    Logger.log('Error rolling over balances: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets PeriodConfig context (sheet, data, header map)
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 * @returns {Object} Context with sheet, data array, and headerIndex map
 */
function getPeriodConfigContext(masterConfigIdOverride) {
  const masterConfigId = masterConfigIdOverride || CONFIG.MASTER_CONFIG_ID;
  const ss = SpreadsheetApp.openById(masterConfigId);
  const sheet = ss.getSheetByName('PeriodConfig');

  if (!sheet) {
    throw new Error('PeriodConfig sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0] || [];
  const headerIndex = {};

  headers.forEach((header, index) => {
    headerIndex[header] = index;
  });

  return { sheet, data, headerIndex };
}

/**
 * Builds a period object from a PeriodConfig row
 * @param {Array} row - Row data
 * @param {Object} headerIndex - Header to index map
 * @returns {Object} Period details
 */
function buildPeriodFromRow(row, headerIndex) {
  return {
    periodId: row[headerIndex[PERIOD_CONFIG_HEADERS.PERIOD_ID]],
    periodName: row[headerIndex[PERIOD_CONFIG_HEADERS.PERIOD_NAME]],
    spreadsheetId: row[headerIndex[PERIOD_CONFIG_HEADERS.SPREADSHEET_ID]],
    fiscalYear: row[headerIndex[PERIOD_CONFIG_HEADERS.FISCAL_YEAR]],
    quarter: row[headerIndex[PERIOD_CONFIG_HEADERS.QUARTER]],
    startDate: row[headerIndex[PERIOD_CONFIG_HEADERS.START_DATE]],
    endDate: row[headerIndex[PERIOD_CONFIG_HEADERS.END_DATE]],
    deadlineDate: row[headerIndex[PERIOD_CONFIG_HEADERS.DEADLINE_DATE]],
    status: row[headerIndex[PERIOD_CONFIG_HEADERS.STATUS]],
    createdDate: row[headerIndex[PERIOD_CONFIG_HEADERS.CREATED_DATE]]
  };
}

/**
 * Looks up period configuration for a given periodId
 * @param {string} periodId - Period ID
 * @returns {Object} Lookup result with period, rowIndex, and sheet
 */
function getPeriodConfig(periodId) {
  const context = getPeriodConfigContext();
  const periodIdIndex = context.headerIndex[PERIOD_CONFIG_HEADERS.PERIOD_ID];

  for (let i = 1; i < context.data.length; i++) {
    if (context.data[i][periodIdIndex] === periodId) {
      return {
        success: true,
        period: buildPeriodFromRow(context.data[i], context.headerIndex),
        rowIndex: i + 1,
        sheet: context.sheet,
        headerIndex: context.headerIndex
      };
    }
  }

  return { success: false, error: 'Period not found' };
}

/**
 * Gets period by ID (alias for getPeriodConfig for compatibility)
 * @param {string} periodId - Period ID
 * @returns {Object} Result with period data
 */
function getPeriodById(periodId) {
  return getPeriodConfig(periodId);
}

/**
 * Gets the specific Spreadsheet for a given periodId.
 * @param {string} periodId - The ID of the period (e.g., "PER_Q2_2024")
 * @returns {Spreadsheet|null} The Google Spreadsheet object or null if not found.
 */
function getPeriodSpreadsheet(periodId) {
  try {
    const masterSS = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const periodConfigSheet = masterSS.getSheetByName('PeriodConfig');
    const data = periodConfigSheet.getDataRange().getValues();
    const headers = data[0];

    const periodIdCol = headers.indexOf('PeriodID');
    const spreadsheetIdCol = headers.indexOf('SpreadsheetID'); // The new column

    if (spreadsheetIdCol === -1) {
      Logger.log('Error: "SpreadsheetID" column not found in PeriodConfig.');
      return null;
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][periodIdCol] === periodId) {
        const spreadsheetId = data[i][spreadsheetIdCol];
        if (spreadsheetId) {
          return SpreadsheetApp.openById(spreadsheetId);
        } else {
          Logger.log(`Error: Period ${periodId} is missing its SpreadsheetID.`);
          return null;
        }
      }
    }
    Logger.log(`Error: No period found with ID: ${periodId}`);
    return null;
  } catch (error) {
    Logger.log(`Error in getPeriodSpreadsheet: ${error.toString()}`);
    return null;
  }
}

/**
 * Checks if period exists
 * @param {string} periodId - Period ID
 * @returns {boolean} True if exists
 */
function periodExists(periodId) {
  try {
    return getPeriodConfig(periodId).success;
  } catch (error) {
    Logger.log('Error checking period existence: ' + error.toString());
    return false;
  }
}

/**
 * Updates period status
 * @param {string} periodId - Period ID
 * @param {string} status - New status
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 */
function updatePeriodStatus(periodId, status, masterConfigIdOverride) {
  const context = getPeriodConfigContext(masterConfigIdOverride);
  const statusIndex = context.headerIndex[PERIOD_CONFIG_HEADERS.STATUS];
  if (statusIndex === undefined) {
    throw new Error('Status column not found in PeriodConfig');
  }

  const statusCol = statusIndex + 1;
  const periodIdIndex = context.headerIndex[PERIOD_CONFIG_HEADERS.PERIOD_ID];

  for (let i = 1; i < context.data.length; i++) {
    if (context.data[i][periodIdIndex] === periodId) {
      context.sheet.getRange(i + 1, statusCol).setValue(status);
      break;
    }
  }
}

/**
 * Closes all currently open periods
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 */
function closeAllOpenPeriods(masterConfigIdOverride) {
  const context = getPeriodConfigContext(masterConfigIdOverride);
  const statusIndex = context.headerIndex[PERIOD_CONFIG_HEADERS.STATUS];
  if (statusIndex === undefined) {
    throw new Error('Status column not found in PeriodConfig');
  }

  const statusCol = statusIndex + 1;

  for (let i = 1; i < context.data.length; i++) {
    if (context.data[i][statusIndex] === CONFIG.PERIOD_STATUS.OPEN) {
      context.sheet.getRange(i + 1, statusCol).setValue(CONFIG.PERIOD_STATUS.CLOSED);
    }
  }
}

/**
 * Creates period sheets within a dedicated period spreadsheet
 * @param {Spreadsheet} ss - Spreadsheet for the period
 * @param {string} periodId - Period ID
 * @param {string} periodName - Period name
 */
function createPeriodSheets(ss, periodId, periodName) {
  Logger.log(`Creating period sheets for ${periodId}...`);

  // Remove default sheet if present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }

  // Create README sheet first
  const readmeSheet = ss.insertSheet('README', 0);
  const masterConfigId = CONFIG.MASTER_CONFIG_ID;
  const readmeContent = [
    [`SAGA Period: ${periodName}`],
    [''],
    ['This spreadsheet contains data for a specific reporting period.'],
    [''],
    ['Sheet Overview:'],
    ['- SubmissionStatus: Tracks entity submission and approval status'],
    ['- EntityNoteData: Stores financial data for all entities in this period'],
    [''],
    ['Configuration:'],
    [`- Period ID: ${periodId}`],
    [`- Period Name: ${periodName}`],
    [`- Master Config ID: ${masterConfigId || 'Not set'}`],
    [''],
    ['Important Notes:'],
    ['- All users, entities, and templates are defined in the Master Config'],
    ['- This period references the Master Config for roles and permissions'],
    ['- Do NOT delete or rename sheets'],
    ['- Use the web interface for data entry'],
    [''],
    ['Created: ' + new Date().toString()],
    ['Spreadsheet ID: ' + ss.getId()]
  ];

  readmeSheet.getRange(1, 1, readmeContent.length, 1).setValues(readmeContent);
  readmeSheet.getRange('A1').setFontWeight('bold').setFontSize(14);
  readmeSheet.getRange('A5').setFontWeight('bold');
  readmeSheet.getRange('A9').setFontWeight('bold');
  readmeSheet.getRange('A14').setFontWeight('bold');
  readmeSheet.setColumnWidth(1, 600);

  // Create data sheets with simplified names if they don't exist
  if (!ss.getSheetByName('SubmissionStatus')) {
    createSubmissionStatusSheet(ss);
  }

  if (!ss.getSheetByName('EntityNoteData')) {
    createEntityNoteDataSheet(ss);
  }

  Logger.log(`Period sheets created successfully for ${periodId}`);
}

/**
 * Protects period sheets
 * @param {string} periodId - Period ID
 */
function protectPeriodSpreadsheet(periodId) {
  const ss = getPeriodSpreadsheet(periodId);
  if (!ss) {
    Logger.log(`Unable to protect spreadsheet for ${periodId}: Spreadsheet not found.`);
    return;
  }

  // Protect period-specific sheets
  const sheetNames = [
    'SubmissionStatus',
    'EntityNoteData'
  ];

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const protection = sheet.protect();
      protection.setDescription('Period locked - no edits allowed');

      // Only admins can edit
      protection.removeEditors(protection.getEditors());
      protection.addEditor(Session.getActiveUser().getEmail());
    }
  });
}

/**
 * Gets period submission statistics
 * @param {string} periodId - Period ID
 * @returns {Object} Submission stats
 */
function getPeriodSubmissionStats(periodId) {
  const entitiesResult = getAllEntities({ status: 'ACTIVE' });
  if (!entitiesResult.success) {
    return { total: 0, submitted: 0, approved: 0, pending: 0 };
  }

  const total = entitiesResult.entities.length;
  let submitted = 0;
  let approved = 0;

  entitiesResult.entities.forEach(entity => {
    const statusResult = getSubmissionStatus(entity.id, periodId);
    if (statusResult.success) {
      if (statusResult.status === CONFIG.STATUS.SUBMITTED) submitted++;
      if (statusResult.status === CONFIG.STATUS.APPROVED) approved++;
    }
  });

  return {
    total: total,
    submitted: submitted,
    approved: approved,
    pending: total - approved
  };
}

/**
 * Gets entity closing balances
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Closing balances
 */
function getEntityClosingBalances(entityId, periodId) {
  // This would extract closing balances from all balance sheet notes
  // Simplified version
  return {};
}

/**
 * Sets entity opening balances
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {Object} balances - Opening balances
 */
function setEntityOpeningBalances(entityId, periodId, balances) {
  // This would set opening balances in the new period
  // Simplified version
}

/**
 * Gets all periods
 * @returns {Array} List of periods
 */
function getAllPeriods() {
  try {
    const context = getPeriodConfigContext();
    const periods = [];

    for (let i = 1; i < context.data.length; i++) {
      periods.push(buildPeriodFromRow(context.data[i], context.headerIndex));
    }

    return {
      success: true,
      periods: periods
    };
  } catch (error) {
    Logger.log('Error getting periods: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Resets admin sheets - archives old sheets and recreates headers/period data
 * Called from admin setup prompt after login
 * @returns {Object} Result with success status
 */
function resetAdminSheets() {
  try {
    // Verify user is admin
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only admins can reset sheets'
      };
    }

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');

    // Get all sheets in the spreadsheet
    const allSheets = ss.getSheets();
    let archivedCount = 0;

    // Archive period-specific data sheets (EntityNoteData_*, SubmissionStatus_*)
    allSheets.forEach(sheet => {
      const sheetName = sheet.getName();

      // Archive data sheets but not config sheets
      if (sheetName.startsWith('EntityNoteData_') || sheetName.startsWith('SubmissionStatus_')) {
        const archivedName = `ARCHIVED_${timestamp}_${sheetName}`;
        sheet.setName(archivedName);
        sheet.hideSheet(); // Hide archived sheets
        archivedCount++;
        Logger.log(`Archived sheet: ${sheetName} -> ${archivedName}`);
      }
    });

    // Recreate fresh period sheets for all existing periods
    const periodsResult = getAllPeriods();
    if (periodsResult.success && periodsResult.periods) {
      periodsResult.periods.forEach(period => {
        const periodSpreadsheet = getPeriodSpreadsheet(period.periodId);
        if (periodSpreadsheet) {
          createPeriodSheets(periodSpreadsheet, period.periodId, period.periodName);
        } else {
          Logger.log(`Skipping period ${period.periodId} during reset: spreadsheet not found.`);
        }
      });
    }

    // Log activity
    logActivity(
      user.email,
      'RESET_ADMIN_SHEETS',
      `Reset admin sheets - ${archivedCount} sheets archived`
    );

    return {
      success: true,
      message: `Successfully reset sheets. ${archivedCount} sheets archived with timestamp ${timestamp}.`,
      archivedCount: archivedCount
    };

  } catch (error) {
    Logger.log('Error resetting admin sheets: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Function removed - all period data now stored in master config workbook with period-specific sheet names

/**
 * Gets submission status for an entity in a period
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Submission status
  */
function getSubmissionStatus(entityId, periodId) {
  try {
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return { success: false, error: `Spreadsheet not found for period ${periodId}` };
    }

    const sheetName = 'SubmissionStatus';
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return {
        success: true,
        status: CONFIG.STATUS.DRAFT
      };
    }

    const data = sheet.getDataRange().getValues();

    // Find entity submission status
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        return {
          success: true,
          status: data[i][1] || CONFIG.STATUS.DRAFT,
          submittedBy: data[i][2],
          submittedDate: data[i][3],
          comments: data[i][4],
          approvedBy: data[i][5],
          approvedDate: data[i][6],
          approverComments: data[i][7],
          lastUpdated: data[i][8]
        };
      }
    }

    // Entity not found in submission status - default to DRAFT
    return {
      success: true,
      status: CONFIG.STATUS.DRAFT
    };
  } catch (error) {
    Logger.log('Error getting submission status: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
