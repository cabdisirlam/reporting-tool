/**
 * Approval.gs - Approval Workflow
 *
 * Handles:
 * - Submission for approval
 * - Approval/rejection workflow
 * - Status tracking
 * - Approval notifications
 */

// ============================================================================
// SUBMISSION OPERATIONS
// ============================================================================

/**
 * Submits entity data for approval
 * @param {Object} params - Submission parameters
 * @returns {Object} Submission result
 */
function submitForApproval(params) {
  try {
    const { entityId, periodId, userId, comments } = params;

    // Validate user can submit
    const user = getUserById(userId);
    if (!user || !canAccessEntity(user, entityId)) {
      return {
        success: false,
        error: 'Not authorized to submit for this entity'
      };
    }

    // Run validations first
    const validationResult = runValidations(entityId, periodId);

    // Check for errors
    if (validationResult.summary.errorsCount > 0) {
      return {
        success: false,
        error: 'Cannot submit - validation errors found',
        validationErrors: validationResult.errors
      };
    }

    // Update submission status
    updateSubmissionStatus(entityId, periodId, {
      status: CONFIG.STATUS.SUBMITTED,
      submittedBy: userId,
      submittedDate: new Date(),
      comments: comments || ''
    });

    // Send notification to approvers
    notifyApprovers(entityId, periodId, user);

    // Log activity
    logActivity(
      user.email,
      'SUBMIT_FOR_APPROVAL',
      `Submitted ${entityId} for approval`
    );

    return {
      success: true,
      message: 'Submitted for approval successfully',
      validationWarnings: validationResult.warnings
    };
  } catch (error) {
    Logger.log('Error submitting for approval: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Approves entity submission
 * @param {Object} params - Approval parameters
 * @returns {Object} Approval result
 */
function approveSubmission(params) {
  try {
    const { entityId, periodId, approverId, comments } = params;

    // Validate user is an approver
    const approver = getUserById(approverId);
    if (!approver || approver.role !== CONFIG.ROLES.APPROVER) {
      return {
        success: false,
        error: 'Not authorized to approve submissions'
      };
    }

    // Update submission status
    updateSubmissionStatus(entityId, periodId, {
      status: CONFIG.STATUS.APPROVED,
      approvedBy: approverId,
      approvedDate: new Date(),
      approverComments: comments || ''
    });

    // Notify data entry officer
    notifyDataEntryOfficer(entityId, periodId, 'APPROVED', approver);

    // Log activity
    logActivity(
      approver.email,
      'APPROVE_SUBMISSION',
      `Approved ${entityId}`
    );

    return {
      success: true,
      message: 'Submission approved successfully'
    };
  } catch (error) {
    Logger.log('Error approving submission: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Rejects entity submission
 * @param {Object} params - Rejection parameters
 * @returns {Object} Rejection result
 */
function rejectSubmission(params) {
  try {
    const { entityId, periodId, approverId, comments } = params;

    // Validate user is an approver
    const approver = getUserById(approverId);
    if (!approver || approver.role !== CONFIG.ROLES.APPROVER) {
      return {
        success: false,
        error: 'Not authorized to reject submissions'
      };
    }

    if (!comments || comments.trim() === '') {
      return {
        success: false,
        error: 'Rejection reason is required'
      };
    }

    // Update submission status
    updateSubmissionStatus(entityId, periodId, {
      status: CONFIG.STATUS.REJECTED,
      rejectedBy: approverId,
      rejectedDate: new Date(),
      rejectionReason: comments
    });

    // Notify data entry officer
    notifyDataEntryOfficer(entityId, periodId, 'REJECTED', approver, comments);

    // Log activity
    logActivity(
      approver.email,
      'REJECT_SUBMISSION',
      `Rejected ${entityId}: ${comments}`
    );

    return {
      success: true,
      message: 'Submission rejected'
    };
  } catch (error) {
    Logger.log('Error rejecting submission: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

/**
 * Updates submission status
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {Object} statusData - Status data to update
  */
function updateSubmissionStatus(entityId, periodId, statusData) {
  try {
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      Logger.log(`Error updating submission status: Spreadsheet not found for ${periodId}`);
      return;
    }

    const sheetName = 'SubmissionStatus';
    let statusSheet = ss.getSheetByName(sheetName);

    if (!statusSheet) {
      // Sheet creation disabled - period spreadsheets have no tabs
      Logger.log(`SubmissionStatus update skipped for ${entityId} in ${periodId} - period sheets disabled`);
      return;
    }

    const data = statusSheet.getDataRange().getValues();
    let rowIndex = -1;

    // Find existing row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        rowIndex = i + 1;
        break;
      }
    }

    const row = [
      entityId,
      statusData.status,
      statusData.submittedBy || data[rowIndex - 1]?.[2] || '',
      statusData.submittedDate || data[rowIndex - 1]?.[3] || '',
      statusData.comments || data[rowIndex - 1]?.[4] || '',
      statusData.approvedBy || statusData.rejectedBy || '',
      statusData.approvedDate || statusData.rejectedDate || '',
      statusData.approverComments || statusData.rejectionReason || '',
      new Date()
    ];

    if (rowIndex > 0) {
      statusSheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      statusSheet.appendRow(row);
    }
  } catch (error) {
    Logger.log('Error updating submission status: ' + error.toString());
  }
}

/**
 * Gets submission status for an entity
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
    const statusSheet = ss.getSheetByName(sheetName);

    if (!statusSheet) {
      return {
        success: true,
        status: CONFIG.STATUS.DRAFT
      };
    }

    const data = statusSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        return {
          success: true,
          status: data[i][1],
          submittedBy: data[i][2],
          submittedDate: data[i][3],
          submitterComments: data[i][4],
          reviewedBy: data[i][5],
          reviewedDate: data[i][6],
          reviewerComments: data[i][7],
          lastUpdated: data[i][8]
        };
      }
    }

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

/**
 * Gets all pending approvals
 * @param {string} periodId - Period ID
 * @returns {Array} Pending submissions
 */
function getPendingApprovals(periodId) {
  try {
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return { success: false, error: `Spreadsheet not found for period ${periodId}` };
    }

    const sheetName = 'SubmissionStatus';
    const statusSheet = ss.getSheetByName(sheetName);

    if (!statusSheet) {
      return { success: true, submissions: [] };
    }

    const data = statusSheet.getDataRange().getValues();
    const pending = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === CONFIG.STATUS.SUBMITTED) {
        // Get entity details
        const entityResult = getEntityById(data[i][0]);

        pending.push({
          entityId: data[i][0],
          entityName: entityResult.success ? entityResult.entity.name : 'Unknown',
          submittedBy: data[i][2],
          submittedDate: data[i][3],
          comments: data[i][4]
        });
      }
    }

    return {
      success: true,
      submissions: pending
    };
  } catch (error) {
    Logger.log('Error getting pending approvals: ' + error.toString());
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
 * Creates submission status sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 * @returns {Sheet} Created sheet
 */
function createSubmissionStatusSheet(periodId, ss) {
  // Sheet creation disabled - period spreadsheets have no tabs/sheets
  Logger.log('SubmissionStatus sheet creation skipped - period spreadsheets remain empty');
  return null;
}

/**
 * Notifies approvers of new submission
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {Object} submitter - Submitter user object
 */
function notifyApprovers(entityId, periodId, submitter) {
  try {
    const entityResult = getEntityById(entityId);
    const entityName = entityResult.success ? entityResult.entity.name : entityId;

    // Get all approvers
    const approvers = getAllApprovers();

    approvers.forEach(approver => {
      sendNotification({
        to: approver.email,
        subject: `New Submission for Approval: ${entityName}`,
        body: `Dear ${approver.name},\n\n` +
          `A new submission requires your approval:\n\n` +
          `Entity: ${entityName}\n` +
          `Period: ${periodId}\n` +
          `Submitted by: ${submitter.name}\n` +
          `Submitted on: ${formatDateTime(new Date())}\n\n` +
          `Please review and approve/reject at: ${ScriptApp.getService().getUrl()}?page=approvalReview&entity=${entityId}\n\n` +
          `Best regards,\n` +
          `IPSAS System`
      });
    });
  } catch (error) {
    Logger.log('Error notifying approvers: ' + error.toString());
  }
}

/**
 * Notifies data entry officer of approval/rejection
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {string} action - APPROVED or REJECTED
 * @param {Object} approver - Approver user object
 * @param {string} comments - Optional comments
 */
function notifyDataEntryOfficer(entityId, periodId, action, approver, comments) {
  try {
    const entityResult = getEntityById(entityId);
    const entityName = entityResult.success ? entityResult.entity.name : entityId;

    // Get entity data entry officer
    const officer = getDataEntryOfficerForEntity(entityId);
    if (!officer) return;

    const subject = action === 'APPROVED' ?
      `Submission Approved: ${entityName}` :
      `Submission Rejected: ${entityName}`;

    const body = `Dear ${officer.name},\n\n` +
      `Your submission has been ${action.toLowerCase()}:\n\n` +
      `Entity: ${entityName}\n` +
      `Period: ${periodId}\n` +
      `Reviewed by: ${approver.name}\n` +
      `Reviewed on: ${formatDateTime(new Date())}\n` +
      (comments ? `\nComments:\n${comments}\n` : '') +
      `\n\nBest regards,\n` +
      `IPSAS System`;

    sendNotification({
      to: officer.email,
      subject: subject,
      body: body
    });
  } catch (error) {
    Logger.log('Error notifying data entry officer: ' + error.toString());
  }
}

/**
 * Gets all approvers
 * @returns {Array} List of approvers
 */
function getAllApprovers() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    if (!sheet) {
      Logger.log('Users sheet not found');
      return [];
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find role column
    const roleCol = headers.indexOf('Role');
    const statusCol = headers.indexOf('Status');

    const approvers = [];

    // Find all approver users
    for (let i = 1; i < data.length; i++) {
      if (data[i][roleCol] === CONFIG.USER_ROLES.APPROVER &&
          data[i][statusCol] === 'ACTIVE') {
        approvers.push({
          id: data[i][0],
          email: data[i][headers.indexOf('Email')],
          name: data[i][headers.indexOf('Name')],
          role: data[i][roleCol],
          entityId: data[i][headers.indexOf('EntityID')],
          entityName: data[i][headers.indexOf('EntityName')]
        });
      }
    }

    return approvers;
  } catch (error) {
    Logger.log('Error getting approvers: ' + error.toString());
    return [];
  }
}

/**
 * Gets data entry officer for an entity
 * @param {string} entityId - Entity ID
 * @returns {Object} User object
 */
function getDataEntryOfficerForEntity(entityId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    if (!sheet) {
      Logger.log('Users sheet not found');
      return null;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find relevant columns
    const roleCol = headers.indexOf('Role');
    const entityIdCol = headers.indexOf('EntityID');
    const statusCol = headers.indexOf('Status');

    // Find data entry user for this entity
    for (let i = 1; i < data.length; i++) {
      if (data[i][roleCol] === CONFIG.USER_ROLES.DATA_ENTRY &&
          data[i][entityIdCol] === entityId &&
          data[i][statusCol] === 'ACTIVE') {
        return {
          id: data[i][0],
          email: data[i][headers.indexOf('Email')],
          name: data[i][headers.indexOf('Name')],
          role: data[i][roleCol],
          entityId: data[i][entityIdCol],
          entityName: data[i][headers.indexOf('EntityName')]
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting data entry officer: ' + error.toString());
    return null;
  }
}
