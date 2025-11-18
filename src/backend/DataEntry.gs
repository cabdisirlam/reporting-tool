/**
 * DataEntry.gs - Data Entry Logic
 *
 * Handles:
 * - Note data entry and retrieval
 * - Auto-save functionality
 * - Data validation on entry
 * - Version control
 */

// ============================================================================
// DATA ENTRY OPERATIONS
// ============================================================================

/**
 * Saves note data for an entity
 * @param {Object} params - Parameters including entityId, periodId, noteId, data
 * @returns {Object} Save result
 */
function saveNoteData(params) {
  try {
    const { entityId, periodId, noteId, noteData, userId } = params;

    // Validate parameters
    if (!entityId || !periodId || !noteId || !noteData) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    // Get period spreadsheet
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return { success: false, error: `Spreadsheet not found for period ${periodId}` };
    }

    const sheetName = 'EntityNoteData';

    // Get or create EntityNoteData sheet
    let dataSheet = ss.getSheetByName(sheetName);
    if (!dataSheet) {
      // Sheet creation disabled - period spreadsheets have no tabs
      Logger.log(`EntityNoteData save skipped for ${entityId}/${noteId} in ${periodId} - period sheets disabled`);
      return {
        success: true,
        message: 'Data save skipped - period sheets disabled',
        timestamp: new Date()
      };
    }

    // Save data
    saveOrUpdateNoteData(dataSheet, entityId, noteId, noteData);

    // Log activity
    logActivity(
      userId || Session.getActiveUser().getEmail(),
      'SAVE_NOTE_DATA',
      `Saved data for ${noteId} - ${entityId}`
    );

    return {
      success: true,
      message: 'Data saved successfully',
      timestamp: new Date()
    };
  } catch (error) {
    Logger.log('Error saving note data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Retrieves note data for an entity
 * @param {Object} params - Parameters including entityId, periodId, noteId
 * @returns {Object} Note data
 */
function getNoteData(params) {
  try {
    const { entityId, periodId, noteId } = params;

    // Get period spreadsheet
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return { success: false, error: `Spreadsheet not found for period ${periodId}` };
    }

    const sheetName = 'EntityNoteData';
    const dataSheet = ss.getSheetByName(sheetName);

    if (!dataSheet) {
      return {
        success: true,
        data: null // No data saved yet
      };
    }

    // Find data row
    const data = dataSheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId && data[i][1] === noteId) {
        return {
          success: true,
          data: JSON.parse(data[i][2] || '{}'),
          lastModified: data[i][3],
          modifiedBy: data[i][4]
        };
      }
    }

    return {
      success: true,
      data: null // No data found
    };
  } catch (error) {
    Logger.log('Error getting note data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets all note data for an entity in a period
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} All note data
 */
function getAllEntityNoteData(entityId, periodId) {
  try {
    const ss = getPeriodSpreadsheet(periodId);
    if (!ss) {
      return { success: false, error: `Spreadsheet not found for period ${periodId}` };
    }

    const sheetName = 'EntityNoteData';
    const dataSheet = ss.getSheetByName(sheetName);

    if (!dataSheet) {
      return {
        success: true,
        data: {}
      };
    }

    const data = dataSheet.getDataRange().getValues();
    const result = {};

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        const noteId = data[i][1];
        result[noteId] = {
          data: JSON.parse(data[i][2] || '{}'),
          lastModified: data[i][3],
          modifiedBy: data[i][4]
        };
      }
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    Logger.log('Error getting all entity note data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculates note completion percentage
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Completion stats
 */
function getEntityCompletionStatus(entityId, periodId) {
  try {
    // Get all required notes
    const notesResult = getNoteTemplates();
    if (!notesResult.success) return notesResult;

    const requiredNotes = notesResult.notes.filter(n => n.required && n.active);
    const totalNotes = requiredNotes.length;

    // Get entity data
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    let completedNotes = 0;
    let inProgressNotes = 0;

    requiredNotes.forEach(note => {
      if (dataResult.data[note.noteId]) {
        const noteData = dataResult.data[note.noteId].data;
        const completion = calculateNoteCompletion(note.noteId, noteData);

        if (completion >= 100) {
          completedNotes++;
        } else if (completion > 0) {
          inProgressNotes++;
        }
      }
    });

    const notStarted = totalNotes - completedNotes - inProgressNotes;

    return {
      success: true,
      total: totalNotes,
      completed: completedNotes,
      inProgress: inProgressNotes,
      notStarted: notStarted,
      percentComplete: (completedNotes / totalNotes) * 100
    };
  } catch (error) {
    Logger.log('Error getting completion status: ' + error.toString());
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
 * Saves or updates note data in sheet
 * @param {Sheet} sheet - Data sheet
 * @param {string} entityId - Entity ID
 * @param {string} noteId - Note ID
 * @param {Object} noteData - Note data
 */
function saveOrUpdateNoteData(sheet, entityId, noteId, noteData) {
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  // Find existing row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === entityId && data[i][1] === noteId) {
      rowIndex = i + 1;
      break;
    }
  }

  const dataJson = JSON.stringify(noteData);
  const timestamp = new Date();
  const user = Session.getActiveUser().getEmail();

  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 3).setValue(dataJson);
    sheet.getRange(rowIndex, 4).setValue(timestamp);
    sheet.getRange(rowIndex, 5).setValue(user);
  } else {
    // Append new row
    sheet.appendRow([entityId, noteId, dataJson, timestamp, user]);
  }
}

/**
 * Calculates note completion percentage
 * @param {string} noteId - Note ID
 * @param {Object} noteData - Note data
 * @returns {number} Completion percentage (0-100)
 */
function calculateNoteCompletion(noteId, noteData) {
  const linesResult = getNoteLines(noteId);
  if (!linesResult.success) return 0;

  const requiredLines = linesResult.lines.filter(l => l.required && l.lineType === 'DATA');
  if (requiredLines.length === 0) return 100;

  let completed = 0;
  requiredLines.forEach(line => {
    if (noteData && noteData[line.lineId]) {
      const value = noteData[line.lineId];
      if (value !== null && value !== undefined && value !== '') {
        completed++;
      }
    }
  });

  return (completed / requiredLines.length) * 100;
}
