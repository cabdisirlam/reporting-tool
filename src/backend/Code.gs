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
  APP_NAME: 'SAGA Financial Consolidation System',
  APP_VERSION: '1.0.0',
  // MASTER_CONFIG_ID removed - use getMasterConfigId() instead to avoid global PropertiesService call
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
    const page = (e.parameter.page || 'index');
    const token = e.parameter.token;
    const user = token ? getUserByToken(token) : null;

    const outputMode = HtmlService.XFrameOptionsMode.ALLOWALL;

    const serveLogin = () => HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle(CONFIG.APP_NAME)
      .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(outputMode);

    if (!user && page !== 'index' && page !== 'login') {
      return serveLogin();
    }

    switch(page) {
      case 'index':
      case 'login':
        return serveLogin();

      case 'dashboard':
        return serveDashboard(user, token);

      case 'dataEntry':
        return serveDataEntry(user, token);

      case 'reports':
        return serveReports(user, token);

      case 'admin':
      case 'AdminPanel':
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>You do not have permission to access this page.</p>')
            .setXFrameOptionsMode(outputMode);
        }
        return serveAdminPanel(user, token);

      case 'PeriodSetup':
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>Only administrators can set up periods.</p>')
            .setXFrameOptionsMode(outputMode);
        }
        return servePeriodSetup(user, token);

      case 'AdminSetupPrompt':
        if (user.role !== CONFIG.ROLES.ADMIN) {
          return HtmlService.createHtmlOutput('<h1>403 - Forbidden</h1><p>Only administrators can access this page.</p>')
            .setXFrameOptionsMode(outputMode);
        }
        return serveAdminSetupPrompt(user, token);

      case 'SystemNotReady':
        return serveSystemNotReady(user, token);

      case 'diagnostics':
        return showSystemDiagnostics();

      default:
        if (['ApprovalDashboard', 'BudgetEntry', 'CashFlowEntry', 'EntityList', 'EntityForm', 'UserList'].includes(page)) {
            const template = HtmlService.createTemplateFromFile(`frontend/html/${page}`);
            template.user = user;
            template.role = user.role;
            template.token = token;

            return template
                .evaluate()
                .setTitle(page + ' - ' + CONFIG.APP_NAME)
                .addMetaTag('viewport', 'width=device-width, initial-scale=1')
                .setXFrameOptionsMode(outputMode);
        }
        return HtmlService.createHtmlOutput('<h1>404 - Page Not Found</h1><p>The page "' + page + '" does not exist.</p>')
          .setXFrameOptionsMode(outputMode);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString() + ' for page: ' + (e.parameter.page || 'index'));
    return HtmlService.createHtmlOutput('<h1>Error loading page</h1><p>' + error.toString() + '</p>')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

function serveDashboard(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/Dashboard');
  template.user = user;
  template.role = user.role;
  template.roleNormalized = (user.role || '').toUpperCase();
  template.token = token;

  return template.evaluate()
    .setTitle('Dashboard - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function serveDataEntry(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/DataEntry');
  template.user = user;
  template.token = token;
  return template.evaluate()
    .setTitle('Data Entry - ' + CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function serveReports(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/Reports');
  template.user = user;
  template.token = token;
  return template.evaluate()
    .setTitle('Reports - '.concat(CONFIG.APP_NAME))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function serveAdminPanel(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/AdminPanel');
  template.user = user;
  template.token = token;
  return template.evaluate()
    .setTitle('Admin Panel - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function servePeriodSetup(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/PeriodSetup');
  template.user = user;
  template.token = token;
  return template.evaluate()
    .setTitle('Period Setup - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function serveSystemNotReady(user, token) {
  const template = HtmlService.createTemplateFromFile('frontend/html/SystemNotReady');
  template.user = user;
  template.token = token;
  return template.evaluate()
    .setTitle('System Setup In Progress - ' + CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function serveAdminSetupPrompt(user, token) {
  try {
    Logger.log('serveAdminSetupPrompt: Creating template for user: ' + user.email);
    const template = HtmlService.createTemplateFromFile('frontend/html/AdminSetupPrompt');
    template.user = user;
    template.token = token;
    Logger.log('serveAdminSetupPrompt: Evaluating template');
    const output = template.evaluate()
      .setTitle('Admin Setup - ' + CONFIG.APP_NAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    Logger.log('serveAdminSetupPrompt: Template evaluated successfully');
    return output;
  } catch (error) {
    Logger.log('serveAdminSetupPrompt: Error: ' + error.toString());
    Logger.log('serveAdminSetupPrompt: Stack: ' + error.stack);
    return HtmlService.createHtmlOutput(
      '<h1>Error Loading Admin Setup</h1>' +
      '<p>An error occurred while loading the admin setup page.</p>' +
      '<p><strong>Error:</strong> ' + error.toString() + '</p>' +
      '<p>Please check the execution logs for more details.</p>' +
      '<p><a href="?page=AdminPanel">Go to Admin Panel</a></p>'
    ).setTitle('Error - ' + CONFIG.APP_NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function redirectToLogin() {
  // Redirect to the main index page, which IS the login page
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Login Required - ' + CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================================
// HELPER FUNCTIONS FOR HTML
// ============================================================================

function include(filename) {
  try {
    Logger.log('include: Loading file: ' + filename);
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log('include: Error loading file ' + filename + ': ' + error.toString());
    // Return empty string or basic fallback CSS instead of failing
    return '/* Error loading ' + filename + ': ' + error.toString() + ' */';
  }
}

function getCurrentUser() {
  try {
    // First, validate the PIN-based session
    if (!validateSession()) {
      Logger.log('getCurrentUser: Session validation failed');
      return null;
    }

    // Get user ID from session properties
    const userId = PropertiesService.getUserProperties().getProperty('userId');
    if (!userId) {
      Logger.log('getCurrentUser: No userId found in session properties');
      return null;
    }

    Logger.log('getCurrentUser: Found userId: ' + userId);
    // Retrieve user by ID
    const user = getUserById(userId);
    if (user) {
      Logger.log('getCurrentUser: Successfully retrieved user: ' + user.email);
    } else {
      Logger.log('getCurrentUser: Failed to retrieve user by ID: ' + userId);
    }
    return user;
  } catch (error) {
    Logger.log('getCurrentUser: Error: ' + error.toString());
    return null;
  }
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
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const ss = SpreadsheetApp.create(`SAGA Master Config ${timestamp}`);
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
    ['SAGA Financial Consolidation System - Master Configuration'],
    [''],
    ['This spreadsheet contains the master configuration data for the SAGA system.'],
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

  // Initialize default period (Q2 2025/26) automatically during setup
  // Pass ssId directly since CONFIG.MASTER_CONFIG_ID won't be updated until script reloads
  Logger.log('Initializing default period...');
  try {
    const periodResult = initializeDefaultPeriod(ssId);
    if (periodResult.success) {
      Logger.log('Default period created and opened: ' + periodResult.periodId);
    } else {
      Logger.log('Warning: Could not create default period: ' + periodResult.error);
    }
  } catch (periodError) {
    Logger.log('Warning: Error creating default period: ' + periodError.toString());
  }

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
    const user = getCurrentUser();

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
      user: user,
      period: currentPeriod,
      allPeriods: periodsResult.periods,
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

/**
 * Gets data entry dashboard data for the current user
 * Shows assigned entity, active period, and submission status
 * @returns {Object} Dashboard data for data entry users
 */
function getDataEntryDashboardData() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Get the active period
    const periodsResult = getAllPeriods();
    if (!periodsResult.success) {
      return {
        success: false,
        error: 'Failed to get periods'
      };
    }

    // Find the currently open period
    let activePeriod = null;
    for (const period of periodsResult.periods) {
      if (period.status === CONFIG.PERIOD_STATUS.OPEN) {
        activePeriod = period;
        break;
      }
    }

    // If no open period, get the most recent period
    if (!activePeriod && periodsResult.periods.length > 0) {
      const sortedPeriods = periodsResult.periods.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
      activePeriod = sortedPeriods[0];
    }

    // Get submission status for this user's entity
    let submissionStatus = null;
    if (activePeriod && user.entityId) {
      const statusResult = getSubmissionStatus(user.entityId, activePeriod.periodId);
      if (statusResult.success) {
        submissionStatus = statusResult;
      }
    }

    // Get entity details
    let entityName = user.entityName || 'Unknown Entity';
    if (user.entityId) {
      const entityResult = getEntityById(user.entityId);
      if (entityResult.success) {
        entityName = entityResult.entity.name;
      }
    }

    return {
      success: true,
      period: activePeriod,
      status: submissionStatus,
      entity: entityName,
      entityId: user.entityId
    };
  } catch (error) {
    Logger.log('Error getting data entry dashboard data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets approver dashboard data
 * Shows pending approvals and approval statistics
 * @returns {Object} Dashboard data for approvers
 */
function getApproverDashboardData() {
  try {
    // Get the active period
    const periodsResult = getAllPeriods();
    if (!periodsResult.success) {
      return {
        success: false,
        error: 'Failed to get periods'
      };
    }

    // Find the currently open period
    let activePeriod = null;
    for (const period of periodsResult.periods) {
      if (period.status === CONFIG.PERIOD_STATUS.OPEN) {
        activePeriod = period;
        break;
      }
    }

    // If no open period, get the most recent period
    if (!activePeriod && periodsResult.periods.length > 0) {
      const sortedPeriods = periodsResult.periods.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
      activePeriod = sortedPeriods[0];
    }

    // Get pending approvals
    let pendingApprovals = [];
    let approvalStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    if (activePeriod) {
      const approvalsResult = getPendingApprovals(activePeriod.periodId);
      if (approvalsResult.success) {
        pendingApprovals = approvalsResult.submissions;
        approvalStats.pending = pendingApprovals.length;
      }

      // Get period stats for approved count
      const stats = getPeriodSubmissionStats(activePeriod.periodId);
      if (stats) {
        approvalStats.approved = stats.approved || 0;
        // Calculate rejected = submitted - approved
        approvalStats.rejected = (stats.submitted || 0) - approvalStats.approved - approvalStats.pending;
      }
    }

    return {
      success: true,
      period: activePeriod,
      pendingApprovals: pendingApprovals,
      stats: approvalStats
    };
  } catch (error) {
    Logger.log('Error getting approver dashboard data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets comprehensive approval dashboard data
 * Returns all submissions with entity details for filtering and sorting
 * @returns {Object} Approval dashboard data with submissions and stats
 */
function getApprovalDashboardData() {
  try {
    // Get the active period
    const periodsResult = getAllPeriods();
    if (!periodsResult.success) {
      return {
        success: false,
        error: 'Failed to get periods'
      };
    }

    // Find the currently open period
    let activePeriod = null;
    for (const period of periodsResult.periods) {
      if (period.status === CONFIG.PERIOD_STATUS.OPEN) {
        activePeriod = period;
        break;
      }
    }

    // If no open period, get the most recent period
    if (!activePeriod && periodsResult.periods.length > 0) {
      const sortedPeriods = periodsResult.periods.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
      activePeriod = sortedPeriods[0];
    }

    if (!activePeriod) {
      return {
        success: false,
        error: 'No periods found'
      };
    }

    // Get period spreadsheet
    const ss = getPeriodSpreadsheet(activePeriod.periodId);
    if (!ss) {
      return {
        success: false,
        error: `Spreadsheet not found for period ${activePeriod.periodId}`
      };
    }

    // Get submission status sheet
    const statusSheet = ss.getSheetByName('SubmissionStatus');
    const allSubmissions = [];
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    if (statusSheet) {
      const data = statusSheet.getDataRange().getValues();

      // Process all submissions
      for (let i = 1; i < data.length; i++) {
        const entityId = data[i][0];
        const status = data[i][1];
        const submittedBy = data[i][2];
        const submittedDate = data[i][3];
        const submitterComments = data[i][4];
        const reviewedBy = data[i][5];
        const reviewedDate = data[i][6];
        const reviewerComments = data[i][7];

        // Get entity details
        const entityResult = getEntityById(entityId);
        const entityName = entityResult.success ? entityResult.entity.name : 'Unknown';
        const entityCode = entityResult.success ? entityResult.entity.code : entityId;
        const entityType = entityResult.success ? entityResult.entity.type : 'Unknown';

        // Get submitter name
        let submitterName = submittedBy;
        if (submittedBy) {
          const submitterResult = getUserByEmail(submittedBy);
          if (submitterResult.success) {
            submitterName = submitterResult.user.name;
          }
        }

        allSubmissions.push({
          entityId,
          entityName,
          entityCode,
          entityType,
          status,
          submittedBy: submitterName || submittedBy,
          submittedDate,
          submitterComments,
          reviewedBy,
          reviewedDate,
          reviewerComments
        });

        // Update stats
        if (status === CONFIG.STATUS.SUBMITTED) {
          stats.pending++;
        } else if (status === CONFIG.STATUS.APPROVED) {
          stats.approved++;
        } else if (status === CONFIG.STATUS.REJECTED) {
          stats.rejected++;
        }
      }
    }

    // Get total entities count
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    stats.total = entitiesResult.success ? entitiesResult.entities.length : 0;

    return {
      success: true,
      activePeriod,
      submissions: allSubmissions,
      stats
    };
  } catch (error) {
    Logger.log('Error getting approval dashboard data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets submission data for approval review
 * @param {Object} params - Parameters with entityId and periodId
 * @returns {Object} Complete submission data for review
 */
function getSubmissionForReview(params) {
  try {
    const { entityId, periodId } = params;

    // Get entity details
    const entityResult = getEntityById(entityId);
    if (!entityResult.success) {
      return {
        success: false,
        error: 'Entity not found'
      };
    }

    // Get period details
    const periodResult = getPeriodById(periodId);
    if (!periodResult.success) {
      return {
        success: false,
        error: 'Period not found'
      };
    }

    // Get submission status
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return {
        success: false,
        error: `Spreadsheet not found for period ${periodId}`
      };
    }

    const statusSheet = ss.getSheetByName('SubmissionStatus');
    let submissionData = {
      status: 'DRAFT',
      submittedBy: null,
      submittedDate: null,
      submitterComments: null
    };

    if (statusSheet) {
      const data = statusSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === entityId) {
          submissionData = {
            status: data[i][1],
            submittedBy: data[i][2],
            submittedDate: data[i][3],
            submitterComments: data[i][4]
          };
          break;
        }
      }
    }

    // Get note data
    const noteDataSheet = ss.getSheetByName('EntityNoteData');
    const notes = [];

    if (noteDataSheet) {
      const data = noteDataSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === entityId) {
          const noteId = data[i][1];
          const dataJSON = data[i][2];

          try {
            const parsedData = JSON.parse(dataJSON || '{}');
            notes.push({
              noteNumber: noteId,
              noteName: parsedData.noteName || noteId,
              description: parsedData.description || '',
              currentYear: parsedData.total || 0,
              priorYear: parsedData.priorTotal || 0
            });
          } catch (e) {
            Logger.log('Error parsing note data for ' + noteId + ': ' + e.toString());
          }
        }
      }
    }

    // Get validation results
    const validationResult = getValidationSummary(entityId, periodId);

    // Get attachments
    const attachmentsResult = getAttachments({
      entityId: entityId,
      periodId: periodId
    });

    return {
      success: true,
      entity: entityResult.entity,
      period: periodResult.period,
      submission: {
        ...submissionData,
        notes,
        attachments: attachmentsResult.success ? attachmentsResult.attachments : []
      },
      validation: validationResult.success ? validationResult.summary : {
        errorCount: 0,
        warningCount: 0,
        passedCount: 0,
        completeness: 0,
        errors: [],
        warnings: []
      }
    };
  } catch (error) {
    Logger.log('Error getting submission for review: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets validation results for display
 * @param {Object} params - Parameters with entityId and periodId
 * @returns {Object} Validation results with errors and warnings
 */
function getValidationResults(params) {
  try {
    const { entityId, periodId } = params;

    // Get entity and period
    const entityResult = getEntityById(entityId);
    const periodResult = getPeriodById(periodId);

    if (!entityResult.success || !periodResult.success) {
      return {
        success: false,
        error: 'Entity or period not found'
      };
    }

    // Run validation
    const validationResult = runValidations(entityId, periodId);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    return {
      success: true,
      entity: entityResult.entity,
      period: periodResult.period,
      validation: validationResult.summary
    };
  } catch (error) {
    Logger.log('Error getting validation results: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Requests clarification on a submission
 * @param {Object} params - Parameters with entityId, periodId, approverId, comments
 * @returns {Object} Result of clarification request
 */
function requestClarification(params) {
  try {
    const { entityId, periodId, approverId, comments } = params;

    // Validate approver
    const approver = getUserById(approverId);
    if (!approver || approver.role !== CONFIG.ROLES.APPROVER) {
      return {
        success: false,
        error: 'Not authorized to request clarification'
      };
    }

    // Update submission status to require clarification
    updateSubmissionStatus(entityId, periodId, {
      status: CONFIG.STATUS.REJECTED,
      reviewedBy: approverId,
      reviewedDate: new Date(),
      reviewerComments: 'CLARIFICATION REQUIRED: ' + (comments || '')
    });

    // Get entity and submitter info
    const entityResult = getEntityById(entityId);
    if (entityResult.success) {
      // Send notification to data entry officer
      notifyDataEntryOfficer(entityId, periodId, 'CLARIFICATION', approver, comments);
    }

    // Log activity
    logActivity(
      approver.email,
      'REQUEST_CLARIFICATION',
      `Requested clarification for ${entityId}`
    );

    return {
      success: true,
      message: 'Clarification request sent successfully'
    };
  } catch (error) {
    Logger.log('Error requesting clarification: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets available reports list with metadata
 * @param {Object} params - Optional parameters
 * @returns {Object} List of available reports
 */
function getAvailableReports(params) {
  try {
    const user = params && params.userId ? getUserById(params.userId) : null;
    const isAdmin = user && (user.role === CONFIG.ROLES.ADMIN || user.role === CONFIG.ROLES.APPROVER);

    const reports = [
      // Entity Reports
      {
        id: 'statement_position',
        name: 'Statement of Financial Position',
        description: 'Assets, Liabilities, and Net Assets',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '📊'
      },
      {
        id: 'statement_performance',
        name: 'Statement of Financial Performance',
        description: 'Revenue, Expenses, and Surplus/Deficit',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '📈'
      },
      {
        id: 'statement_cashflow',
        name: 'Statement of Cash Flows',
        description: 'Operating, Investing, and Financing Activities',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '💰'
      },
      {
        id: 'statement_changes',
        name: 'Statement of Changes in Net Assets',
        description: 'Changes in Equity Components',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '📉'
      },
      {
        id: 'complete_financial',
        name: 'Complete Financial Statements',
        description: 'All Four Statements Combined',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '📑'
      },
      {
        id: 'notes_disclosure',
        name: 'Notes to Financial Statements',
        description: 'All 53 IPSAS Notes',
        category: 'financial_statements',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel'],
        icon: '📝'
      },
      {
        id: 'budget_comparison',
        name: 'Budget vs Actual Report',
        description: 'Budget Performance Analysis',
        category: 'analysis',
        requiresEntity: true,
        requiresPeriod: true,
        formats: ['PDF', 'Excel', 'CSV'],
        icon: '💵'
      }
    ];

    // Add consolidated reports for admins/approvers only
    if (isAdmin) {
      reports.push(
        {
          id: 'consolidated_position',
          name: 'Consolidated Statement of Position',
          description: 'All Entities Combined',
          category: 'consolidated',
          requiresEntity: false,
          requiresPeriod: true,
          formats: ['PDF', 'Excel'],
          icon: '🏛️',
          adminOnly: true
        },
        {
          id: 'consolidated_performance',
          name: 'Consolidated Statement of Performance',
          description: 'National-Level Performance',
          category: 'consolidated',
          requiresEntity: false,
          requiresPeriod: true,
          formats: ['PDF', 'Excel'],
          icon: '📊',
          adminOnly: true
        },
        {
          id: 'sector_analysis',
          name: 'Sector Analysis Report',
          description: 'By SAGA/County/MDA',
          category: 'consolidated',
          requiresEntity: false,
          requiresPeriod: true,
          formats: ['PDF', 'Excel', 'CSV'],
          icon: '🏢',
          adminOnly: true
        },
        {
          id: 'submission_progress',
          name: 'Submission Progress Report',
          description: 'Entity Submission Status',
          category: 'administration',
          requiresEntity: false,
          requiresPeriod: true,
          formats: ['PDF', 'Excel', 'CSV'],
          icon: '✅',
          adminOnly: true
        }
      );
    }

    return {
      success: true,
      reports,
      categories: [
        { id: 'financial_statements', name: 'Financial Statements', icon: '📊' },
        { id: 'analysis', name: 'Analysis Reports', icon: '📈' },
        { id: 'consolidated', name: 'Consolidated Reports', icon: '🏛️' },
        { id: 'administration', name: 'Administration', icon: '⚙️' }
      ]
    };
  } catch (error) {
    Logger.log('Error getting available reports: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates a report based on parameters
 * @param {Object} params - Report parameters
 * @returns {Object} Generated report data
 */
function generateReport(params) {
  try {
    const { reportId, entityId, periodId, format } = params;

    // Get entity and period data if required
    let entity = null;
    let period = null;

    if (entityId) {
      const entityResult = getEntityById(entityId);
      if (!entityResult.success) {
        return { success: false, error: 'Entity not found' };
      }
      entity = entityResult.entity;
    }

    if (periodId) {
      const periodResult = getPeriodById(periodId);
      if (!periodResult.success) {
        return { success: false, error: 'Period not found' };
      }
      period = periodResult.period;
    }

    // Generate report based on type
    let reportData = null;
    switch (reportId) {
      case 'statement_position':
        reportData = generateStatementOfFinancialPosition(entityId, periodId);
        break;
      case 'statement_performance':
        reportData = generateStatementOfFinancialPerformance(entityId, periodId);
        break;
      case 'statement_cashflow':
        reportData = generateCashFlowStatement(entityId, periodId);
        break;
      case 'statement_changes':
        reportData = generateStatementOfChangesInNetAssets(entityId, periodId);
        break;
      case 'complete_financial':
        reportData = getCompleteFinancialStatements({entityId, periodId});
        break;
      case 'notes_disclosure':
        reportData = generateNotesDisclosure(entityId, periodId);
        break;
      case 'budget_comparison':
        reportData = generateBudgetComparisonReport(entityId, periodId);
        break;
      case 'consolidated_position':
        reportData = generateConsolidatedPosition(periodId);
        break;
      case 'consolidated_performance':
        reportData = generateConsolidatedPerformance(periodId);
        break;
      case 'sector_analysis':
        reportData = generateSectorAnalysis(periodId);
        break;
      case 'submission_progress':
        reportData = generateSubmissionProgressReport(periodId);
        break;
      default:
        return { success: false, error: 'Unknown report type' };
    }

    if (!reportData || !reportData.success) {
      return { success: false, error: reportData ? reportData.error : 'Report generation failed' };
    }

    return {
      success: true,
      report: {
        ...reportData.statement || reportData.report,
        entity,
        period,
        generatedDate: new Date(),
        format
      }
    };
  } catch (error) {
    Logger.log('Error generating report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// NOTE: getCompleteFinancialStatements is now defined in Statements.gs
// to avoid duplication and keep statement-related functions together

/**
 * Gets admin dashboard data
 * Shows system-wide statistics
 * @returns {Object} Dashboard data for administrators
 */
function getAdminDashboardData() {
  try {
    // Run system health check and auto-initialize if needed
    const healthCheck = checkSystemHealth();

    // Get all users
    const usersResult = getAllUsers();
    const userCount = usersResult.success ? usersResult.users.length : 0;

    // Get all entities
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    const entityCount = entitiesResult.success ? entitiesResult.entities.length : 0;

    // Get the active period
    const periodsResult = getAllPeriods();
    let activePeriod = null;
    let openPeriodCount = 0;

    if (periodsResult.success) {
      // Count open periods
      openPeriodCount = periodsResult.periods.filter(p => p.status === CONFIG.PERIOD_STATUS.OPEN).length;

      // Find the currently open period
      for (const period of periodsResult.periods) {
        if (period.status === CONFIG.PERIOD_STATUS.OPEN) {
          activePeriod = period;
          break;
        }
      }

      // If no open period, get the most recent period
      if (!activePeriod && periodsResult.periods.length > 0) {
        const sortedPeriods = periodsResult.periods.sort((a, b) => {
          return new Date(b.startDate) - new Date(a.startDate);
        });
        activePeriod = sortedPeriods[0];
      }
    }

    // Get submission stats for the active period
    let submissionStats = {
      total: 0,
      submitted: 0,
      approved: 0,
      pending: 0
    };

    if (activePeriod) {
      submissionStats = getPeriodSubmissionStats(activePeriod.periodId);
    }

    return {
      success: true,
      userCount: userCount,
      entityCount: entityCount,
      openPeriodCount: openPeriodCount,
      activePeriod: activePeriod,
      stats: submissionStats,
      systemHealth: healthCheck
    };
  } catch (error) {
    Logger.log('Error getting admin dashboard data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets all users from the system
 * @param {Object} filters - Optional filters
 * @returns {Object} Result with list of users
 */
function getAllUsers(filters) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('Users');

    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const users = [];

    // Find column indices
    const idCol = headers.indexOf('UserID');
    const emailCol = headers.indexOf('Email');
    const nameCol = headers.indexOf('Name');
    const roleCol = headers.indexOf('Role');
    const entityIdCol = headers.indexOf('EntityID');
    const entityNameCol = headers.indexOf('EntityName');
    const statusCol = headers.indexOf('Status');
    const createdDateCol = headers.indexOf('CreatedDate');

    // Map data to objects
    for (let i = 1; i < data.length; i++) {
      const user = {
        id: data[i][idCol] || data[i][0],
        email: emailCol >= 0 ? data[i][emailCol] : '',
        name: nameCol >= 0 ? data[i][nameCol] : '',
        role: roleCol >= 0 ? data[i][roleCol] : '',
        entityId: entityIdCol >= 0 ? data[i][entityIdCol] : '',
        entityName: entityNameCol >= 0 ? data[i][entityNameCol] : '',
        status: statusCol >= 0 ? data[i][statusCol] : 'ACTIVE',
        createdDate: createdDateCol >= 0 ? data[i][createdDateCol] : ''
      };

      // Apply filters
      if (filters) {
        if (filters.role && user.role !== filters.role) continue;
        if (filters.status && user.status !== filters.status) continue;
        if (filters.entityId && user.entityId !== filters.entityId) continue;
      }

      users.push(user);
    }

    return {
      success: true,
      users: users,
      count: users.length
    };
  } catch (error) {
    Logger.log('Error getting users: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

