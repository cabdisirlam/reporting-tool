/**
 * Notifications.gs - Email Notifications
 *
 * Handles:
 * - Email sending
 * - Notification templates
 * - Deadline reminders
 * - Status notifications
 */

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

/**
 * Sends an email notification
 * @param {Object} params - Notification parameters
 * @returns {Object} Send result
 */
function sendNotification(params) {
  try {
    const { to, subject, body, htmlBody, cc, bcc } = params;

    if (!to || !subject || (!body && !htmlBody)) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    const options = {};

    if (htmlBody) {
      options.htmlBody = htmlBody;
    }

    if (cc) {
      options.cc = cc;
    }

    if (bcc) {
      options.bcc = bcc;
    }

    // Send email
    GmailApp.sendEmail(to, subject, body || '', options);

    // Log notification
    logActivity(
      Session.getActiveUser().getEmail(),
      'SEND_NOTIFICATION',
      `Sent email to ${to}: ${subject}`
    );

    return {
      success: true,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    Logger.log('Error sending notification: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Sends deadline reminders to all entities
 * @param {string} periodId - Period ID
 * @returns {Object} Send result
 */
function sendDeadlineReminders(periodId) {
  try {
    // Get period details
    const period = getPeriodDetails(periodId);
    if (!period) {
      return { success: false, error: 'Period not found' };
    }

    const deadline = new Date(period.deadlineDate);
    const today = new Date();
    const daysRemaining = daysBetween(today, deadline);

    // Get all entities
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) return entitiesResult;

    let sentCount = 0;

    entitiesResult.entities.forEach(entity => {
      // Get submission status
      const statusResult = getSubmissionStatus(entity.id, periodId);

      // Only send to entities that haven't submitted
      if (!statusResult.success || statusResult.status !== CONFIG.STATUS.SUBMITTED) {
        // Get data entry officer
        const officer = getDataEntryOfficerForEntity(entity.id);
        if (officer) {
          sendDeadlineReminderEmail(officer, entity, period, daysRemaining);
          sentCount++;
        }
      }
    });

    return {
      success: true,
      message: `Sent ${sentCount} reminder(s)`
    };
  } catch (error) {
    Logger.log('Error sending deadline reminders: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Sends individual deadline reminder email
 * @param {Object} officer - Data entry officer
 * @param {Object} entity - Entity
 * @param {Object} period - Period details
 * @param {number} daysRemaining - Days until deadline
 */
function sendDeadlineReminderEmail(officer, entity, period, daysRemaining) {
  const urgency = daysRemaining <= 7 ? 'URGENT' : '';

  const subject = `${urgency ? urgency + ': ' : ''}Reporting Deadline Reminder - ${entity.name}`;

  const body = `Dear ${officer.name},\n\n` +
    `This is a reminder that the reporting deadline is approaching:\n\n` +
    `Entity: ${entity.name}\n` +
    `Period: ${period.periodName}\n` +
    `Deadline: ${formatDate(period.deadlineDate)}\n` +
    `Days Remaining: ${daysRemaining}\n\n` +
    `Please complete and submit your financial reports before the deadline.\n\n` +
    `Access the system: ${ScriptApp.getService().getUrl()}\n\n` +
    `If you have any questions, please contact the Treasury reporting team.\n\n` +
    `Best regards,\n` +
    `IPSAS Reporting System`;

  sendNotification({
    to: officer.email,
    subject: subject,
    body: body
  });
}

/**
 * Sends validation error notifications
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {Object} validationResults - Validation results
 */
function sendValidationErrorNotification(entityId, periodId, validationResults) {
  try {
    const entityResult = getEntityById(entityId);
    const entity = entityResult.success ? entityResult.entity : { name: entityId };

    const officer = getDataEntryOfficerForEntity(entityId);
    if (!officer) return;

    const subject = `Validation Errors Found - ${entity.name}`;

    let errorList = '\nErrors:\n';
    validationResults.errors.forEach((error, index) => {
      errorList += `${index + 1}. ${error.noteName}: ${error.message}\n`;
    });

    const body = `Dear ${officer.name},\n\n` +
      `Validation errors were found in your submission:\n\n` +
      `Entity: ${entity.name}\n` +
      `Period: ${periodId}\n` +
      `Errors: ${validationResults.summary.errorsCount}\n` +
      `Warnings: ${validationResults.summary.warningsCount}\n` +
      errorList +
      `\n\nPlease review and correct these errors before resubmitting.\n\n` +
      `Access the system: ${ScriptApp.getService().getUrl()}?page=dataEntry&entity=${entityId}\n\n` +
      `Best regards,\n` +
      `IPSAS Reporting System`;

    sendNotification({
      to: officer.email,
      subject: subject,
      body: body
    });
  } catch (error) {
    Logger.log('Error sending validation notification: ' + error.toString());
  }
}

/**
 * Sends batch notifications
 * @param {Array} recipients - Array of recipient objects
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Object} Send result
 */
function sendBatchNotifications(recipients, subject, body) {
  try {
    let sentCount = 0;
    let errorCount = 0;

    recipients.forEach(recipient => {
      try {
        const personalizedBody = body.replace('{{NAME}}', recipient.name);

        sendNotification({
          to: recipient.email,
          subject: subject,
          body: personalizedBody
        });

        sentCount++;
      } catch (error) {
        Logger.log(`Error sending to ${recipient.email}: ${error.toString()}`);
        errorCount++;
      }
    });

    return {
      success: true,
      sent: sentCount,
      errors: errorCount
    };
  } catch (error) {
    Logger.log('Error sending batch notifications: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// SCHEDULED NOTIFICATIONS
// ============================================================================

/**
 * Sets up automated reminder triggers
 * Can be called to create time-based triggers
 */
function setupReminderTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendAutomatedReminders') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new daily trigger at 9 AM
  ScriptApp.newTrigger('sendAutomatedReminders')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}

/**
 * Automated reminder function (triggered daily)
 */
function sendAutomatedReminders() {
  try {
    // Get active period
    const activePeriod = getActivePeriod();
    if (!activePeriod) return;

    const deadline = new Date(activePeriod.deadlineDate);
    const today = new Date();
    const daysRemaining = daysBetween(today, deadline);

    // Send reminders at 30, 14, 7, 3, and 1 days before deadline
    if ([30, 14, 7, 3, 1].includes(daysRemaining)) {
      sendDeadlineReminders(activePeriod.periodId);
    }
  } catch (error) {
    Logger.log('Error in automated reminders: ' + error.toString());
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets active period
 * @returns {Object} Active period details
 */
function getActivePeriod() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('PeriodConfig');

    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][7] === CONFIG.PERIOD_STATUS.OPEN) {
        return {
          periodId: data[i][0],
          periodName: data[i][1],
          deadlineDate: data[i][6]
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting active period: ' + error.toString());
    return null;
  }
}

/**
 * Gets period details by ID
 * @param {string} periodId - Period ID
 * @returns {Object} Period details
 */
function getPeriodDetails(periodId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('PeriodConfig');

    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === periodId) {
        return {
          periodId: data[i][0],
          periodName: data[i][1],
          fiscalYear: data[i][2],
          quarter: data[i][3],
          startDate: data[i][4],
          endDate: data[i][5],
          deadlineDate: data[i][6],
          status: data[i][7]
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting period details: ' + error.toString());
    return null;
  }
}
