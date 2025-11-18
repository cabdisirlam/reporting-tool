/**
 * SetupUtilities.gs - System Initialization and Setup Functions
 *
 * Handles:
 * - Initial period creation
 * - System bootstrap operations
 * - Default configuration setup
 */

/**
 * Initializes the system with a default period if PeriodConfig is empty
 * This function should be run once during initial system setup
 * Creates Q2 2025/26 as the default period and opens it
 *
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 * @returns {Object} Result with success status and message
 */
function initializeDefaultPeriod(masterConfigIdOverride) {
  try {
    Logger.log('Starting default period initialization...');

    // Get MASTER_CONFIG_ID - use override if provided (for initial setup), otherwise use CONFIG
    const masterConfigId = masterConfigIdOverride || CONFIG.MASTER_CONFIG_ID;
    if (!masterConfigId) {
      return {
        success: false,
        error: 'MASTER_CONFIG_ID is not set in CONFIG'
      };
    }

    // Open the master config spreadsheet
    const ss = SpreadsheetApp.openById(masterConfigId);
    const sheet = ss.getSheetByName('PeriodConfig');

    if (!sheet) {
      return {
        success: false,
        error: 'PeriodConfig sheet not found'
      };
    }

    // Check if periods already exist (more than just headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      Logger.log('Periods already exist. No action taken.');
      return {
        success: true,
        message: 'Periods already exist. No initialization needed.',
        skipped: true
      };
    }

    Logger.log('PeriodConfig is empty. Creating default period Q2 2025/26...');

    // Create default period: Q2 2025/26
    // Q2 runs from October 1, 2025 to December 31, 2025
    // Deadline is 15 days after quarter ends
    const periodData = {
      periodName: 'Q2 2025/26',
      fiscalYear: '2025-26',
      quarter: 'Q2',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      deadlineDate: '2026-01-15'
    };

    // Create the period (will be created as CLOSED by default)
    // We need to temporarily set a user context for this operation
    const result = createPeriodWithoutAuth(periodData, masterConfigId);

    if (!result.success) {
      return {
        success: false,
        error: `Failed to create default period: ${result.error}`
      };
    }

    Logger.log(`Default period created: ${result.periodId}`);

    // Open the period to make it active
    const openResult = openPeriodWithoutAuth(result.periodId, masterConfigId);

    if (!openResult.success) {
      Logger.log(`Warning: Period created but could not be opened: ${openResult.error}`);
      return {
        success: true,
        message: 'Default period created but not opened. Please open it manually.',
        periodId: result.periodId,
        warning: openResult.error
      };
    }

    Logger.log('Default period initialization complete!');

    return {
      success: true,
      message: 'Default period Q2 2025/26 created and opened successfully',
      periodId: result.periodId
    };

  } catch (error) {
    Logger.log('Error initializing default period: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates a period without authentication check
 * Used during system initialization
 *
 * @param {Object} periodData - Period data
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 * @returns {Object} Creation result
 */
function createPeriodWithoutAuth(periodData, masterConfigIdOverride) {
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

    // Add period to config - use override if provided, otherwise use CONFIG
    const masterConfigId = masterConfigIdOverride || CONFIG.MASTER_CONFIG_ID;
    const ss = SpreadsheetApp.openById(masterConfigId);
    const sheet = ss.getSheetByName('PeriodConfig');

    // Check if period already exists in PeriodConfig
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === periodId) {
        return {
          success: false,
          error: 'Period already exists'
        };
      }
    }

    // Create dedicated spreadsheet for this period with SAGA branding and timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const periodSpreadsheet = SpreadsheetApp.create(`SAGA ${periodName} ${timestamp}`);
    const spreadsheetId = periodSpreadsheet.getId();

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
    try {
      logActivity(
        'SYSTEM',
        'CREATE_PERIOD',
        `System initialization: Created default period ${periodName}`
      );
    } catch (logError) {
      Logger.log('Could not log activity: ' + logError.toString());
    }

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
 * Opens a period without authentication check
 * Used during system initialization
 *
 * @param {string} periodId - Period ID
 * @param {string} masterConfigIdOverride - Optional master config ID (used during initial setup)
 * @returns {Object} Result
 */
function openPeriodWithoutAuth(periodId, masterConfigIdOverride) {
  try {
    // Close any currently open periods
    closeAllOpenPeriods(masterConfigIdOverride);

    // Open the period
    updatePeriodStatus(periodId, CONFIG.PERIOD_STATUS.OPEN, masterConfigIdOverride);

    // Log activity
    try {
      logActivity(
        'SYSTEM',
        'OPEN_PERIOD',
        `System initialization: Opened period ${periodId}`
      );
    } catch (logError) {
      Logger.log('Could not log activity: ' + logError.toString());
    }

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
 * Checks system health and initializes defaults if needed
 * This is a safe function to call on every admin login
 *
 * @returns {Object} Health check result
 */
function checkSystemHealth() {
  const issues = [];
  const warnings = [];

  try {
    // Check 1: MASTER_CONFIG_ID is set
    if (!CONFIG.MASTER_CONFIG_ID) {
      issues.push('MASTER_CONFIG_ID is not configured');
      return {
        success: false,
        healthy: false,
        issues: issues
      };
    }

    // Check 2: Can access master config spreadsheet
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
      const requiredSheets = ['Users', 'Entities', 'PeriodConfig', 'NoteTemplates', 'NoteLines'];

      requiredSheets.forEach(sheetName => {
        if (!ss.getSheetByName(sheetName)) {
          issues.push(`Required sheet '${sheetName}' is missing`);
        }
      });
    } catch (e) {
      issues.push('Cannot access MASTER_CONFIG_ID spreadsheet: ' + e.toString());
      return {
        success: false,
        healthy: false,
        issues: issues
      };
    }

    // Check 3: At least one period exists
    const periodsResult = getAllPeriods();
    if (!periodsResult.success || periodsResult.periods.length === 0) {
      warnings.push('No periods configured');

      // Try to initialize default period
      const initResult = initializeDefaultPeriod();
      if (initResult.success) {
        warnings.push('Default period Q2 2025/26 was automatically created');
      } else {
        issues.push('Failed to create default period: ' + initResult.error);
      }
    }

    // Check 4: At least one period is OPEN
    if (periodsResult.success && periodsResult.periods.length > 0) {
      const openPeriods = periodsResult.periods.filter(p => p.status === CONFIG.PERIOD_STATUS.OPEN);
      if (openPeriods.length === 0) {
        warnings.push('No period is currently open for data entry');
      }
    }

    return {
      success: true,
      healthy: issues.length === 0,
      issues: issues,
      warnings: warnings
    };

  } catch (error) {
    return {
      success: false,
      healthy: false,
      error: error.toString()
    };
  }
}

/**
 * Web app accessible function to run system initialization
 * Can be called from admin panel or setup page
 */
function runSystemInitialization() {
  try {
    // Check if user is admin
    const user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        error: 'Only administrators can run system initialization'
      };
    }

    const healthCheck = checkSystemHealth();

    return {
      success: true,
      healthCheck: healthCheck,
      message: healthCheck.healthy ?
        'System is healthy' :
        'System initialization completed with warnings'
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
