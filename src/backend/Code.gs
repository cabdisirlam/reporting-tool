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
  MASTER_CONFIG_ID: PropertiesService.getScriptProperties().getProperty('MASTER_CONFIG_ID'),
  ROLES: {
    ADMIN: 'ADMIN',
    APPROVER: 'APPROVER',
    DATA_ENTRY: 'DATA_ENTRY',
    VIEWER: 'VIEWER'
  },
  STATUS: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  },
  PERIOD_STATUS: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    LOCKED: 'LOCKED'
  },
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

function getMasterConfigId() {
  const id = PropertiesService.getScriptProperties().getProperty('MASTER_CONFIG_ID');
  if (!id) {
    throw new Error('System not configured. Please run setupSystem() first to create the master configuration spreadsheet.');
  }
  return id;
}

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
 *
 * CORRECTED FILE PATHS
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'index';
    const user = getCurrentUser();

    // Route to appropriate page
    switch(page) {
      case 'index':
        // This is the main login page
        return HtmlService.createHtmlOutputFromFile('index')
          .setTitle(CONFIG.APP_NAME)
          .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png');

      case 'login':
        // This is the alternate login page path
        return HtmlService.createHtmlOutputFromFile('src/frontend/html/Login')
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
        // Handle other pages if they exist
        if (page === 'AdminPanel' || page === 'ApprovalDashboard' || page === 'BudgetEntry' || page === 'CashFlowEntry') {
            if (!user) return redirectToLogin();
            // This is a generic loader for other HTML files
            return HtmlService.createTemplateFromFile(`src/frontend/html/${page}`)
                .evaluate()
                .setTitle(page + ' - ' + CONFIG.APP_NAME)
                .addMetaTag('viewport', 'width=device-width, initial-scale=1');
        }
        return HtmlService.createHtmlOutput('<h1>404 - Page Not Found</h1><p>The page "' + page + '" does not exist.</p>');
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString() + ' for page: ' + (e.parameter.page || 'index'));
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
// PAGE SERVING FUNCTIONS (WITH CORRECTED PATHS)
// ============================================================================

function serveDashboard(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/Dashboard');
  template.user = user;
  template.role = user.role;

  return template.evaluate()
    .setTitle('Dashboard - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function serveDataEntry(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/DataEntry');
  template.user = user;
  return template.evaluate()
    .setTitle('Data Entry - ' + CONFIG.APP_NAME);
}

function serveReports(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/Reports');
  template.user = user;
  return template.evaluate()
    .setTitle('Reports - '.concat(CONFIG.APP_NAME));
}

function redirectToLogin() {
  // Redirect to the main index page, which IS the login page
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Login Required - ' + CONFIG.APP_NAME);
}

// ============================================================================
// HELPER FUNCTIONS FOR HTML
// ============================================================================

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  if (!email) return null;
  // This function is in Auth.gs, which is fine
  return getUserByEmail(email);
}

// ============================================================================
// MENU CREATION (for Spreadsheet UI)
// ============================================================================

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

function openDashboard() {
  const url = ScriptApp.getService().getUrl() + '?page=dashboard';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Dashboard...');
}

function openUserManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=users';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening User Management...');
}

function openEntityManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=entities';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Entity Management...');
}

function openNoteConfig() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=notes';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Note Configuration...');
}

function openPeriodManagement() {
  const url = ScriptApp.getService().getUrl() + '?page=admin&section=periods';
  const html = '<script>window.open("' + url + '"); google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Period Management...');
}

// ============================================================================
// INSTALLATION & SETUP
// ============================================================================

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

function getAppConfig() {
  return {
    appName: CONFIG.APP_NAME,
    version: CONFIG.APP_VERSION,
    roles: CONFIG.ROLES,
    status: CONFIG.STATUS
  };
}

function testSystem() {
  return {
    success: true,
    message: 'System is operational',
    version: CONFIG.APP_VERSION,
    timestamp: new Date().toISOString()
  };
}
