/**
 * DiagnosticUtils.gs - System Diagnostic Utilities
 *
 * Functions to help diagnose configuration and setup issues
 */

/**
 * QUICK FIX FUNCTION - Run this to set your Master Config ID
 *
 * HOW TO USE:
 * 1. Get your spreadsheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
 * 2. Replace 'YOUR_SPREADSHEET_ID_HERE' below with your actual spreadsheet ID
 * 3. Run this function from the Apps Script editor
 */
function quickFixMasterConfig() {
  // REPLACE THIS WITH YOUR ACTUAL SPREADSHEET ID
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    Logger.log('ERROR: Please edit this function and replace YOUR_SPREADSHEET_ID_HERE with your actual spreadsheet ID');
    return {
      success: false,
      error: 'Please edit the quickFixMasterConfig function and set your spreadsheet ID'
    };
  }

  const result = setMasterConfigId(SPREADSHEET_ID);
  Logger.log('Result: ' + JSON.stringify(result, null, 2));

  if (result.success) {
    Logger.log('SUCCESS! MASTER_CONFIG_ID has been set. You can now use the system.');
    Logger.log('Visit your web app URL with ?page=diagnostics to verify.');
  } else {
    Logger.log('ERROR: ' + result.error);
  }

  return result;
}

/**
 * Sets the MASTER_CONFIG_ID script property
 * @param {string} spreadsheetId - The ID of the master configuration spreadsheet
 * @returns {Object} Result of the operation
 */
function setMasterConfigId(spreadsheetId) {
  try {
    if (!spreadsheetId) {
      return {
        success: false,
        error: 'Spreadsheet ID is required'
      };
    }

    // Validate that the spreadsheet exists and is accessible
    try {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      Logger.log('setMasterConfigId: Successfully opened spreadsheet: ' + ss.getName());
    } catch (error) {
      return {
        success: false,
        error: 'Cannot access spreadsheet with ID: ' + spreadsheetId + '. Error: ' + error.toString()
      };
    }

    // Set the script property
    PropertiesService.getScriptProperties().setProperty('MASTER_CONFIG_ID', spreadsheetId);
    Logger.log('setMasterConfigId: Set MASTER_CONFIG_ID to: ' + spreadsheetId);

    return {
      success: true,
      message: 'MASTER_CONFIG_ID has been set successfully',
      spreadsheetId: spreadsheetId
    };
  } catch (error) {
    Logger.log('setMasterConfigId: Error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets current system configuration and diagnostics
 * @returns {Object} System diagnostic information
 */
function getSystemDiagnostics() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const userProperties = PropertiesService.getUserProperties();

    const masterConfigId = scriptProperties.getProperty('MASTER_CONFIG_ID');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      currentUser: Session.getActiveUser().getEmail(),
      scriptProperties: {
        MASTER_CONFIG_ID: masterConfigId || 'NOT SET'
      },
      userProperties: {
        sessionToken: userProperties.getProperty('sessionToken') ? 'SET' : 'NOT SET',
        userId: userProperties.getProperty('userId') || 'NOT SET',
        sessionCreated: userProperties.getProperty('sessionCreated') || 'NOT SET'
      },
      configStatus: {
        isConfigured: !!masterConfigId,
        canAccessSheet: false,
        sheetName: null,
        sheetsPresent: []
      }
    };

    // Check if we can access the master config spreadsheet
    if (masterConfigId) {
      try {
        const ss = SpreadsheetApp.openById(masterConfigId);
        diagnostics.configStatus.canAccessSheet = true;
        diagnostics.configStatus.sheetName = ss.getName();
        diagnostics.configStatus.sheetsPresent = ss.getSheets().map(function(sheet) {
          return sheet.getName();
        });
      } catch (error) {
        diagnostics.configStatus.error = error.toString();
      }
    }

    Logger.log('System Diagnostics: ' + JSON.stringify(diagnostics, null, 2));
    return {
      success: true,
      diagnostics: diagnostics
    };
  } catch (error) {
    Logger.log('getSystemDiagnostics: Error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Displays system diagnostics in a formatted HTML page
 * @returns {HtmlOutput} Diagnostic page
 */
function showSystemDiagnostics() {
  const result = getSystemDiagnostics();

  let html = '<html><head><title>System Diagnostics</title>';
  const styles = `
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 30px; }
    .section { margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-left: 4px solid #1a73e8; border-radius: 4px; }
    .section h2 { margin-top: 0; color: #1a73e8; font-size: 18px; }
    .property { margin: 8px 0; }
    .property-name { font-weight: bold; color: #555; }
    .property-value { color: #333; }
    .status-ok { color: #28a745; font-weight: bold; }
    .status-error { color: #dc3545; font-weight: bold; }
    .status-warning { color: #ffc107; font-weight: bold; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    .btn { display: inline-block; padding: 10px 20px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
  `;

  html += '<style>' + styles + '</style></head><body>';
  html += '<div class="container">';
  html += '<h1>System Diagnostics</h1>';

  if (result.success) {
    const diag = result.diagnostics;

    // Configuration Status
    html += '<div class="section">';
    html += '<h2>Configuration Status</h2>';
    html += '<div class="property"><span class="property-name">System Configured:</span> ';
    html += '<span class="' + (diag.configStatus.isConfigured ? 'status-ok' : 'status-error') + '">';
    html += diag.configStatus.isConfigured ? 'YES' : 'NO';
    html += '</span></div>';

    html += '<div class="property"><span class="property-name">MASTER_CONFIG_ID:</span> <span class="property-value">' + diag.scriptProperties.MASTER_CONFIG_ID + '</span></div>';

    if (diag.configStatus.isConfigured) {
      html += '<div class="property"><span class="property-name">Can Access Sheet:</span> ';
      html += '<span class="' + (diag.configStatus.canAccessSheet ? 'status-ok' : 'status-error') + '">';
      html += diag.configStatus.canAccessSheet ? 'YES' : 'NO';
      html += '</span></div>';

      if (diag.configStatus.canAccessSheet) {
        html += '<div class="property"><span class="property-name">Sheet Name:</span> <span class="property-value">' + diag.configStatus.sheetName + '</span></div>';
        html += '<div class="property"><span class="property-name">Sheets Present:</span> <span class="property-value">' + diag.configStatus.sheetsPresent.join(', ') + '</span></div>';
      } else if (diag.configStatus.error) {
        html += '<div class="property"><span class="property-name">Error:</span> <span class="status-error">' + diag.configStatus.error + '</span></div>';
      }
    }
    html += '</div>';

    // Session Info
    html += '<div class="section">';
    html += '<h2>Session Information</h2>';
    html += '<div class="property"><span class="property-name">Session Token:</span> <span class="property-value">' + diag.userProperties.sessionToken + '</span></div>';
    html += '<div class="property"><span class="property-name">User ID:</span> <span class="property-value">' + diag.userProperties.userId + '</span></div>';
    html += '<div class="property"><span class="property-name">Session Created:</span> <span class="property-value">' + diag.userProperties.sessionCreated + '</span></div>';
    html += '</div>';

    // Current User
    html += '<div class="section">';
    html += '<h2>Current User</h2>';
    html += '<div class="property"><span class="property-name">Google Account:</span> <span class="property-value">' + diag.currentUser + '</span></div>';
    html += '</div>';

    // Raw Data
    html += '<div class="section">';
    html += '<h2>Raw Diagnostic Data</h2>';
    html += '<pre>' + JSON.stringify(diag, null, 2) + '</pre>';
    html += '</div>';
  } else {
    html += '<div class="section">';
    html += '<h2 class="status-error">Error</h2>';
    html += '<p>' + result.error + '</p>';
    html += '</div>';
  }

  html += '<a href="?page=index" class="btn">Back to Login</a>';
  html += '</div></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('System Diagnostics - IPSAS System');
}
