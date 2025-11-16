/**
 * Utils.gs - Helper Functions and Utilities
 *
 * Provides:
 * - Common utility functions
 * - Formatting helpers
 * - Calculation helpers
 * - Logging functions
 */

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Logs an activity to the audit log
 * @param {string} userEmail - User email
 * @param {string} action - Action performed
 * @param {string} details - Action details
 */
function logActivity(userEmail, action, details) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    let logSheet = ss.getSheetByName('AuditLog');

    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = ss.insertSheet('AuditLog');
      logSheet.appendRow(['Timestamp', 'User', 'Action', 'Details', 'IP Address']);
      logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      logSheet.setFrozenRows(1);
    }

    // Add log entry
    logSheet.appendRow([
      new Date(),
      userEmail,
      action,
      details,
      Session.getActiveUser().getUserLoginId() // IP if available
    ]);

    // Keep only last 10000 entries
    if (logSheet.getLastRow() > 10001) {
      logSheet.deleteRow(2); // Delete oldest entry (row 2, after header)
    }
  } catch (error) {
    Logger.log('Error logging activity: ' + error.toString());
  }
}

/**
 * Gets recent activities
 * @param {number} limit - Number of activities to retrieve
 * @returns {Array} Recent activities
 */
function getRecentActivities(limit) {
  try {
    limit = limit || 50;
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const logSheet = ss.getSheetByName('AuditLog');

    if (!logSheet) {
      return [];
    }

    const lastRow = logSheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }

    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;

    const data = logSheet.getRange(startRow, 1, numRows, 5).getValues();

    return data.reverse().map(row => ({
      timestamp: row[0],
      user: row[1],
      action: row[2],
      details: row[3],
      ip: row[4]
    }));
  } catch (error) {
    Logger.log('Error getting activities: ' + error.toString());
    return [];
  }
}

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Formats a date as YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date and time
 * @param {Date} date - Date object
 * @returns {string} Formatted datetime
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculates days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Days difference
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets financial year from date
 * @param {Date} date - Date object
 * @returns {string} Financial year (e.g., "2024-25")
 */
function getFinancialYear(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  // Kenya FY starts July 1
  if (month >= 7) {
    return year + '-' + String(year + 1).substring(2);
  } else {
    return (year - 1) + '-' + String(year).substring(2);
  }
}

/**
 * Gets quarter from date
 * @param {Date} date - Date object
 * @returns {string} Quarter (e.g., "Q1")
 */
function getQuarter(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12

  // Kenya FY quarters: Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun
  if (month >= 7 && month <= 9) return 'Q1';
  if (month >= 10 && month <= 12) return 'Q2';
  if (month >= 1 && month <= 3) return 'Q3';
  return 'Q4';
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats a number as currency (KES)
 * @param {number} value - Numeric value
 * @param {number} decimals - Decimal places (default 2)
 * @returns {string} Formatted currency
 */
function formatCurrency(value, decimals) {
  if (value === null || value === undefined || value === '') return '-';

  decimals = decimals !== undefined ? decimals : 2;
  const num = parseFloat(value);

  if (isNaN(num)) return '-';

  return 'KES ' + num.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats a number with thousand separators
 * @param {number} value - Numeric value
 * @param {number} decimals - Decimal places (default 0)
 * @returns {string} Formatted number
 */
function formatNumber(value, decimals) {
  if (value === null || value === undefined || value === '') return '-';

  decimals = decimals !== undefined ? decimals : 0;
  const num = parseFloat(value);

  if (isNaN(num)) return '-';

  return num.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats a number as percentage
 * @param {number} value - Numeric value (0-1 or 0-100)
 * @param {number} decimals - Decimal places (default 1)
 * @returns {string} Formatted percentage
 */
function formatPercent(value, decimals) {
  if (value === null || value === undefined || value === '') return '-';

  decimals = decimals !== undefined ? decimals : 1;
  const num = parseFloat(value);

  if (isNaN(num)) return '-';

  // If value is between 0 and 1, assume it's a decimal percentage
  const percent = num <= 1 ? num * 100 : num;

  return percent.toFixed(decimals) + '%';
}

/**
 * Converts number to words (for financial statements)
 * @param {number} value - Numeric value
 * @returns {string} Number in words
 */
function numberToWords(value) {
  // Simplified implementation for millions/billions
  const num = parseFloat(value);

  if (isNaN(num)) return '';

  const abs = Math.abs(num);
  let result = '';

  if (abs >= 1000000000) {
    result = (num / 1000000000).toFixed(2) + ' Billion';
  } else if (abs >= 1000000) {
    result = (num / 1000000).toFixed(2) + ' Million';
  } else if (abs >= 1000) {
    result = (num / 1000).toFixed(2) + ' Thousand';
  } else {
    result = num.toFixed(2);
  }

  return num < 0 ? '(' + result + ')' : result;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates email address
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates if value is a number
 * @param {*} value - Value to check
 * @returns {boolean} True if number
 */
function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validates if value is positive
 * @param {number} value - Numeric value
 * @returns {boolean} True if positive
 */
function isPositive(value) {
  return isNumeric(value) && parseFloat(value) > 0;
}

/**
 * Validates required field
 * @param {*} value - Value to check
 * @returns {boolean} True if not empty
 */
function isRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculates variance between two values
 * @param {number} current - Current value
 * @param {number} prior - Prior value
 * @returns {Object} Variance amount and percentage
 */
function calculateVariance(current, prior) {
  const curr = parseFloat(current) || 0;
  const pr = parseFloat(prior) || 0;

  const amount = curr - pr;
  const percent = pr !== 0 ? (amount / pr) * 100 : 0;

  return {
    amount: amount,
    percent: percent,
    formatted: formatCurrency(amount) + ' (' + formatPercent(percent / 100) + ')'
  };
}

/**
 * Sums an array of numbers
 * @param {Array} values - Array of numeric values
 * @returns {number} Sum
 */
function sumArray(values) {
  return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

/**
 * Calculates percentage of total
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
function percentOfTotal(value, total) {
  const val = parseFloat(value) || 0;
  const tot = parseFloat(total) || 0;

  return tot !== 0 ? (val / tot) * 100 : 0;
}

// ============================================================================
// SPREADSHEET HELPERS
// ============================================================================

/**
 * Gets column letter from index (1-based)
 * @param {number} index - Column index (1-based)
 * @returns {string} Column letter
 */
function getColumnLetter(index) {
  let letter = '';
  while (index > 0) {
    const mod = (index - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    index = Math.floor((index - mod) / 26);
  }
  return letter;
}

/**
 * Clears all filters on a sheet
 * @param {Sheet} sheet - Sheet object
 */
function clearFilters(sheet) {
  const filter = sheet.getFilter();
  if (filter) {
    filter.remove();
  }
}

/**
 * Protects a sheet range
 * @param {Sheet} sheet - Sheet object
 * @param {string} range - A1 notation range
 * @param {Array} editors - Array of editor emails
 */
function protectRange(sheet, range, editors) {
  const protection = sheet.getRange(range).protect();
  protection.setDescription('Protected range');
  protection.removeEditors(protection.getEditors());
  if (editors && editors.length > 0) {
    protection.addEditors(editors);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Object} Error response
 */
function createErrorResponse(message, code) {
  return {
    success: false,
    error: message,
    errorCode: code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Success response
 */
function createSuccessResponse(data, message) {
  return {
    success: true,
    data: data,
    message: message || 'Operation completed successfully',
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// SHEET CREATION HELPERS
// ============================================================================

/**
 * Creates the Users sheet in master config
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createUsersSheet(ss) {
  const sheet = ss.insertSheet('Users');

  const headers = [
    'UserID', 'Email', 'Name', 'Role', 'EntityID', 'EntityName',
    'Status', 'PasswordHash', 'CreatedDate', 'CreatedBy'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Sample admin user
  const adminHash = hashPassword('admin123');
  sheet.appendRow([
    'USR_ADMIN',
    'admin@treasury.go.ke',
    'System Administrator',
    'ADMIN',
    '',
    '',
    'ACTIVE',
    adminHash,
    new Date(),
    'system'
  ]);

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Creates validation rules sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createValidationRulesSheet(ss) {
  const sheet = ss.insertSheet('ValidationRules');

  const headers = [
    'RuleID', 'RuleName', 'RuleType', 'Condition', 'ErrorMessage',
    'Severity', 'Active'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Creates period configuration sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createPeriodConfigSheet(ss) {
  const sheet = ss.insertSheet('PeriodConfig');

  const headers = [
    'PeriodID', 'PeriodName', 'FiscalYear', 'Quarter', 'StartDate',
    'EndDate', 'DeadlineDate', 'Status', 'CreatedDate'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Sample period
  sheet.appendRow([
    'PER_Q2_2024',
    'Q2 2024-25',
    '2024-25',
    'Q2',
    new Date(2024, 9, 1), // Oct 1
    new Date(2024, 11, 31), // Dec 31
    new Date(2025, 0, 15), // Jan 15
    'OPEN',
    new Date()
  ]);

  sheet.autoResizeColumns(1, headers.length);
}
