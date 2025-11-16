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

/**
 * Shows dialog to create a new period
 * Prompts admin for all required period information
 */
function showCreatePeriodDialog() {
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
 * Creates a new reporting period
 * @param {Object} periodData - Period data
 * @returns {Object} Creation result
 */
function createPeriod(periodData) {
  try {
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

    // Add period to config
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('PeriodConfig');

    sheet.appendRow([
      periodId,
      periodName,
      fiscalYear,
      quarter,
      new Date(startDate),
      new Date(endDate),
      new Date(deadlineDate),
      CONFIG.PERIOD_STATUS.CLOSED, // New periods start closed
      new Date()
    ]);

    // Create period spreadsheet
    createPeriodSpreadsheet(periodId, periodName);

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
 * Checks if period exists
 * @param {string} periodId - Period ID
 * @returns {boolean} True if exists
 */
function periodExists(periodId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
  const sheet = ss.getSheetByName('PeriodConfig');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === periodId) {
      return true;
    }
  }

  return false;
}

/**
 * Updates period status
 * @param {string} periodId - Period ID
 * @param {string} status - New status
 */
function updatePeriodStatus(periodId, status) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
  const sheet = ss.getSheetByName('PeriodConfig');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === periodId) {
      sheet.getRange(i + 1, 8).setValue(status); // Status column
      break;
    }
  }
}

/**
 * Closes all currently open periods
 */
function closeAllOpenPeriods() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
  const sheet = ss.getSheetByName('PeriodConfig');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === CONFIG.PERIOD_STATUS.OPEN) {
      sheet.getRange(i + 1, 8).setValue(CONFIG.PERIOD_STATUS.CLOSED);
    }
  }
}

/**
 * Creates period spreadsheet
 * @param {string} periodId - Period ID
 * @param {string} periodName - Period name
 * @returns {string} Spreadsheet ID
 */
function createPeriodSpreadsheet(periodId, periodName) {
  // Create new spreadsheet
  const ss = SpreadsheetApp.create(`IPSAS_${periodId}_${periodName}`);
  const ssId = ss.getId();

  // Store the ID in script properties
  PropertiesService.getScriptProperties().setProperty('PERIOD_' + periodId, ssId);

  // Create sheets
  createEntityNoteDataSheet(ss);
  createSubmissionStatusSheet(ss);

  // Delete default sheet
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log(`Period spreadsheet created: ${ssId}`);
  return ssId;
}

/**
 * Protects period spreadsheet
 * @param {string} periodId - Period ID
 */
function protectPeriodSpreadsheet(periodId) {
  const periodSs = getPeriodSpreadsheet(periodId);
  if (!periodSs) return;

  // Protect all sheets
  const sheets = periodSs.getSheets();
  sheets.forEach(sheet => {
    const protection = sheet.protect();
    protection.setDescription('Period locked - no edits allowed');

    // Only admins can edit
    protection.removeEditors(protection.getEditors());
    protection.addEditor(Session.getActiveUser().getEmail());
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
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('PeriodConfig');

    if (!sheet) {
      return { success: false, error: 'PeriodConfig sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const periods = [];

    for (let i = 1; i < data.length; i++) {
      periods.push({
        periodId: data[i][0],
        periodName: data[i][1],
        fiscalYear: data[i][2],
        quarter: data[i][3],
        startDate: data[i][4],
        endDate: data[i][5],
        deadlineDate: data[i][6],
        status: data[i][7],
        createdDate: data[i][8]
      });
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
