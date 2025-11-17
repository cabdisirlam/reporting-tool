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
        return HtmlService.createHtmlOutputFromFile('Index')
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

      case 'admin':
      case 'AdminPanel':
        if (!user) return redirectToLogin();
        // Only admins can access admin panel
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>You do not have permission to access this page.</p>');
        }
        return serveAdminPanel(user);

      case 'PeriodSetup':
        if (!user) return redirectToLogin();
        // Only admins can access period setup
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>Only administrators can set up periods.</p>');
        }
        return servePeriodSetup(user);

      case 'AdminSetupPrompt':
        if (!user) return redirectToLogin();
        // Only admins can access setup prompt
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>Only administrators can access this page.</p>');
        }
        return serveAdminSetupPrompt(user);

      case 'SystemNotReady':
        if (!user) return redirectToLogin();
        return serveSystemNotReady(user);

      default:
        // Handle other pages if they exist
        if (page === 'ApprovalDashboard' || page === 'BudgetEntry' || page === 'CashFlowEntry') {
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

function serveAdminPanel(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/AdminPanel');
  template.user = user;
  return template.evaluate()
    .setTitle('Admin Panel - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function servePeriodSetup(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/PeriodSetup');
  template.user = user;
  return template.evaluate()
    .setTitle('Period Setup - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function serveSystemNotReady(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/SystemNotReady');
  template.user = user;
  return template.evaluate()
    .setTitle('System Setup In Progress - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function serveAdminSetupPrompt(user) {
  const template = HtmlService.createTemplateFromFile('src/frontend/html/AdminSetupPrompt');
  template.user = user;
  return template.evaluate()
    .setTitle('Admin Setup - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function redirectToLogin() {
  // Redirect to the main index page, which IS the login page
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Login Required - ' + CONFIG.APP_NAME);
}

// ============================================================================
// HELPER FUNCTIONS FOR HTML
// ============================================================================

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCurrentUser() {
  // First, validate the PIN-based session
  if (!validateSession()) {
    return null;
  }

  // Get user ID from session properties
  const userId = PropertiesService.getUserProperties().getProperty('userId');
  if (!userId) {
    return null;
  }

  // Retrieve user by ID
  return getUserById(userId);
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

/**
 * Setup system with UI prompts (call from spreadsheet menu)
 * Automatically falls back to non-UI mode if UI is not available
 */
function setupSystem() {
  try {
    // Try to get UI context - this will fail if not in a UI context
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
  } catch (error) {
    // If UI is not available, run setupSystemNoUI instead
    Logger.log('UI context not available, running setup without UI...');
    return setupSystemNoUI();
  }
}

/**
 * Setup system without UI (call from script editor)
 * Run this function directly from the script editor to create the master config
 */
function setupSystemNoUI() {
  try {
    Logger.log('Starting system setup...');
    const ssId = createMasterConfigSpreadsheet();
    Logger.log('System setup completed successfully!');
    Logger.log('Master Config Spreadsheet ID: ' + ssId);
    Logger.log('Please add this ID to Script Properties as MASTER_CONFIG_ID (it should be set automatically)');
    return ssId;
  } catch (error) {
    Logger.log('Setup failed: ' + error.toString());
    throw error;
  }
}

function createMasterConfigSpreadsheet() {
  Logger.log('Creating master configuration spreadsheet...');

  // Create new spreadsheet with timestamp
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const ss = SpreadsheetApp.create(`IPSAS_MASTER_CONFIG_${timestamp}`);
  const ssId = ss.getId();

  Logger.log('Master config spreadsheet ID: ' + ssId);

  // Store the ID in script properties
  PropertiesService.getScriptProperties().setProperty('MASTER_CONFIG_ID', ssId);

  // Create sheets in logical order
  Logger.log('Creating configuration sheets...');
  createEntitiesSheet(ss);
  createUsersSheet(ss);
  createPeriodConfigSheet(ss);
  createNoteTemplatesSheet(ss);
  createNoteLineSheet(ss);
  createValidationRulesSheet(ss);

  // Set up spreadsheet-level formatting
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());

  // Add a README sheet with instructions
  const readmeSheet = ss.insertSheet('README', 0);
  const readmeContent = [
    ['IPSAS Financial Consolidation System - Master Configuration'],
    [''],
    ['This spreadsheet contains the master configuration data for the IPSAS system.'],
    [''],
    ['Sheet Overview:'],
    ['- Entities: List of all state corporations and entities'],
    ['- Users: User accounts and permissions'],
    ['- PeriodConfig: Reporting periods (quarters, annual)'],
    ['- NoteTemplates: Financial statement note templates'],
    ['- NoteLines: Line items for each note'],
    ['- ValidationRules: Data validation rules'],
    [''],
    ['Important Notes:'],
    ['- Do NOT delete or rename sheets'],
    ['- Do NOT modify column headers'],
    ['- Use the web interface for most operations'],
    [''],
    ['Created: ' + new Date().toString()],
    ['Spreadsheet ID: ' + ssId]
  ];

  readmeSheet.getRange(1, 1, readmeContent.length, 1).setValues(readmeContent);
  readmeSheet.getRange('A1').setFontWeight('bold').setFontSize(14);
  readmeSheet.getRange('A5').setFontWeight('bold');
  readmeSheet.getRange('A13').setFontWeight('bold');
  readmeSheet.setColumnWidth(1, 600);

  // Delete default sheet
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log('Master config spreadsheet created successfully: ' + ssId);
  Logger.log('Spreadsheet URL: ' + ss.getUrl());

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

/**
 * Gets dashboard data including current period and submission stats
 * @returns {Object} Dashboard data
 */
function getDashboardData() {
  try {
    // Get current active/open period
    const periodsResult = getAllPeriods();
    if (!periodsResult.success) {
      return {
        success: false,
        error: 'Failed to get periods'
      };
    }

    // Find the most recent open or closed period
    let currentPeriod = null;
    for (const period of periodsResult.periods) {
      if (period.status === CONFIG.PERIOD_STATUS.OPEN) {
        currentPeriod = period;
        break;
      }
    }

    // If no open period, get the most recent period
    if (!currentPeriod && periodsResult.periods.length > 0) {
      // Sort by start date descending
      const sortedPeriods = periodsResult.periods.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
      currentPeriod = sortedPeriods[0];
    }

    // Get submission statistics for current period
    let stats = null;
    if (currentPeriod) {
      stats = getPeriodSubmissionStats(currentPeriod.periodId);
    }

    return {
      success: true,
      period: currentPeriod,
      stats: stats
    };
  } catch (error) {
    Logger.log('Error getting dashboard data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
