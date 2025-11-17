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

    // Create period sheets within master config workbook
    createPeriodSheets(periodId, periodName);

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
 * Creates period sheets within master config workbook
 * @param {string} periodId - Period ID
 * @param {string} periodName - Period name
 */
function createPeriodSheets(periodId, periodName) {
  Logger.log(`Creating period sheets for ${periodId} in master config workbook...`);

  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);

  // Create data sheets with period-specific names
  createSubmissionStatusSheet(periodId, ss);
  createEntityNoteDataSheet(periodId, ss);

  Logger.log(`Period sheets created successfully for ${periodId}`);
}

/**
 * Protects period sheets
 * @param {string} periodId - Period ID
 */
function protectPeriodSpreadsheet(periodId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);

  // Protect period-specific sheets
  const sheetNames = [
    `SubmissionStatus_${periodId}`,
    `EntityNoteData_${periodId}`
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
        createPeriodSheets(period.periodId, period.periodName);
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
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheetName = `SubmissionStatus_${periodId}`;
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
          submittedDate: data[i][2],
          submittedBy: data[i][3],
          approvedDate: data[i][4],
          approvedBy: data[i][5],
          comments: data[i][6]
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
