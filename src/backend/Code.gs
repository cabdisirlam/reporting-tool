/**
 * IPSAS Financial Consolidation System - Main Entry Point
 * Code.gs - Main entry point and global configuration
 *
 * This file handles:
 * - Application initialization
 * - Route handling
 * - Global configuration
 * - Menu creation
 */

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================

const CONFIG = {
  APP_NAME: 'IPSAS Financial Consolidation System',
  APP_VERSION: '1.0.0',

  // Spreadsheet IDs (Configure these after creating sheets)
  // WARNING: MASTER_CONFIG_ID may be null before system setup
  MASTER_CONFIG_ID: PropertiesService.getScriptProperties().getProperty('MASTER_CONFIG_ID'),

  // User roles
  ROLES: {
    ADMIN: 'ADMIN',
    APPROVER: 'APPROVER',
    DATA_ENTRY: 'DATA_ENTRY',
    VIEWER: 'VIEWER'
  },

  // Submission statuses
  STATUS: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  },

  // Period statuses
  PERIOD_STATUS: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    LOCKED: 'LOCKED'
  },

  // User roles (alias for backward compatibility)
  USER_ROLES: {
    ADMIN: 'ADMIN',
    APPROVER: 'APPROVER',
    DATA_ENTRY: 'DATA_ENTRY',
    VIEWER: 'VIEWER'
  }
};

// ============================================================================
// CONFIGURATION HELPERS
// ============================================================================

/**
 * Gets the Master Config ID with null check
 * @returns {string} Master Config ID
 * @throws {Error} If system is not configured
 */
function getMasterConfigId() {
  const id = PropertiesService.getScriptProperties().getProperty('MASTER_CONFIG_ID');
  if (!id) {
    throw new Error('System not configured. Please run setupSystem() first to create the master configuration spreadsheet.');
  }
  return id;
}

/**
 * Checks if the system is configured
 * @returns {boolean} True if configured
 */
function isSystemConfigured() {
  const id = PropertiesService.getScriptProperties().getProperty('MASTER_CONFIG_ID');
  return !!id;
}

// ============================================================================
// WEB APP ENTRY POINTS
// ============================================================================

/**
 * Serves the main web application
 * GET request handler
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'index';
    const user = getCurrentUser();

    // Route to appropriate page
    switch(page) {
      case 'index':
        return HtmlService.createHtmlOutputFromFile('index')
          .setTitle(CONFIG.APP_NAME)
          .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png');

      case 'login':
        return HtmlService.createHtmlOutputFromFile('Login')
          .setTitle('Login - ' + CONFIG.APP_NAME);

      case 'dashboard':
        if (!user) return redirectToLogin();
        return serveDashboard(user);

      case 'dataEntry':
        if (!user) return redirectToLogin();
        return serveDataEntry(user);

      case 'reports':
        if (!user) return redirectToLogin();
        return serveReports(user);

      default:
        return HtmlService.createHtmlOutput('<h1>404 - Page Not Found</h1>');
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h1>Error loading page</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * Handles POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const user = getCurrentUser();

    if (!user && action !== 'login') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Route to appropriate handler
    let result;
    switch(action) {
      case 'login':
        result = handleLogin(e.parameter);
        break;
      case 'saveData':
        result = saveEntityData(e.parameter);
        break;
      case 'submitForApproval':
        result = submitForApproval(e.parameter);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// PAGE SERVING FUNCTIONS
// ============================================================================

/**
 * Serves the dashboard page based on user role
 */
function serveDashboard(user) {
  const template = HtmlService.createTemplateFromFile('Dashboard');
  template.user = user;
  template.role = user.role;

  return template.evaluate()
    .setTitle('Dashboard - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Serves the data entry page
 */
function serveDataEntry(user) {
  const template = HtmlService.createTemplateFromFile('DataEntry');
  template.user = user;

  return template.evaluate()
    .setTitle('Data Entry - ' + CONFIG.APP_NAME);
}

/**
 * Serves the reports page
 */
function serveReports(user) {
  const template = HtmlService.createTemplateFromFile('Reports');
  template.user = user;

  return template.evaluate()
    .setTitle('Reports - ' + CONFIG.APP_NAME);
}

/**
 * Redirects to login page
 */
function redirectToLogin() {
  return HtmlService.createHtmlOutputFromFile('Login')
    .setTitle('Login Required - ' + CONFIG.APP_NAME);
}

// ============================================================================
// HELPER FUNCTIONS FOR HTML
// ============================================================================

/**
 * Include HTML files (for template composition)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get current user from session
 */
function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  if (!email) return null;

  return getUserByEmail(email);
}

// ============================================================================
// MENU CREATION (for Spreadsheet UI)
// ============================================================================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('IPSAS System')
    .addItem('Open Dashboard', 'openDashboard')
    .addSeparator()
    .addSubMenu(ui.createMenu('Admin')
      .addItem('Manage Users', 'openUserManagement')
      .addItem('Manage Entities', 'openEntityManagement')
      .addItem('Configure Notes', 'openNoteConfig')
      .addItem('Period Management', 'openPeriodManagement')
      .addItem('Create New Period', 'showCreatePeriodDialog'))
    .addSeparator()
    .addItem('Setup System', 'setupSystem')
    .addToUi();
}

/**
 * Opens the main dashboard in a new browser window
 */
function openDashboard() {
  const url = ScriptApp.getService().getUrl() + '?page=dashboard';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Dashboard...');
}

/**
 * Opens user management
 */
function openUserManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=users';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening User Management...');
}

/**
 * Opens entity management
 */
function openEntityManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=entities';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Entity Management...');
}

/**
 * Opens note configuration
 */
function openNoteConfig() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=notes';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Note Configuration...');
}

/**
 * Opens period management
 */
function openPeriodManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=periods';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Period Management...');
}

// ============================================================================
// INSTALLATION & SETUP
// ============================================================================

/**
 * Initial system setup
 * Creates necessary spreadsheets and configurations
 */
function setupSystem() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Setup System',
    'This will create the master configuration spreadsheet. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    try {
      createMasterConfigSpreadsheet();
      ui.alert('Success', 'System setup completed successfully!', ui.ButtonSet.OK);
    } catch (error) {
      ui.alert('Error', 'Setup failed: ' + error.toString(), ui.ButtonSet.OK);
    }
  }
}

/**
 * Creates the master configuration spreadsheet
 */
function createMasterConfigSpreadsheet() {
  // Create new spreadsheet
  const ss = SpreadsheetApp.create('IPSAS_MASTER_CONFIG');
  const ssId = ss.getId();

  // Store the ID in script properties
  PropertiesService.getScriptProperties().setProperty('MASTER_CONFIG_ID', ssId);

  // Create sheets
  createEntitiesSheet(ss);
  createUsersSheet(ss);
  createNoteTemplatesSheet(ss);
  createNoteLineSheet(ss);
  createValidationRulesSheet(ss);
  createPeriodConfigSheet(ss);

  // Delete default sheet
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log('Master config spreadsheet created: ' + ssId);
  return ssId;
}

// ============================================================================
// API ENDPOINTS (called from frontend)
// ============================================================================

/**
 * Get application configuration
 */
function getAppConfig() {
  return {
    appName: CONFIG.APP_NAME,
    version: CONFIG.APP_VERSION,
    roles: CONFIG.ROLES,
    status: CONFIG.STATUS
  };
}

/**
 * Test function to verify system is working
 */
function testSystem() {
  return {
    success: true,
    message: 'System is operational',
    version: CONFIG.APP_VERSION,
    timestamp: new Date().toISOString()
  };
}
