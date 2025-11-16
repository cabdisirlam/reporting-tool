/**
 * NoteConfiguration.gs - Note Templates Management
 *
 * Handles:
 * - Note template definition
 * - Note line items
 * - Note structure configuration
 * - Financial statement mappings
 */

// ============================================================================
// NOTE TEMPLATE OPERATIONS
// ============================================================================

/**
 * Gets all note templates
 * @returns {Array} List of note templates
 */
function getNoteTemplates() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('NoteTemplates');

    if (!sheet) {
      return { success: false, error: 'NoteTemplates sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const notes = [];

    for (let i = 1; i < data.length; i++) {
      notes.push({
        noteId: data[i][0],
        noteNumber: data[i][1],
        noteName: data[i][2],
        category: data[i][3],
        statementType: data[i][4],
        hasMovementSchedule: data[i][5],
        required: data[i][6],
        active: data[i][7]
      });
    }

    return {
      success: true,
      notes: notes
    };
  } catch (error) {
    Logger.log('Error getting note templates: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets note lines for a specific note
 * @param {string} noteId - Note ID
 * @returns {Array} Note lines
 */
function getNoteLines(noteId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('NoteLines');

    if (!sheet) {
      return { success: false, error: 'NoteLines sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const lines = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === noteId) {
        lines.push({
          lineId: data[i][0],
          noteId: data[i][1],
          lineNumber: data[i][2],
          description: data[i][3],
          lineType: data[i][4],
          parentLineId: data[i][5],
          indent: data[i][6],
          dataType: data[i][7],
          required: data[i][8],
          formula: data[i][9]
        });
      }
    }

    return {
      success: true,
      lines: lines
    };
  } catch (error) {
    Logger.log('Error getting note lines: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates note templates sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createNoteTemplatesSheet(ss) {
  const sheet = ss.insertSheet('NoteTemplates');

  const headers = [
    'NoteID', 'NoteNumber', 'NoteName', 'Category', 'StatementType',
    'HasMovementSchedule', 'Required', 'Active'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Add sample notes
  const sampleNotes = [
    // Statement of Financial Performance
    ['NOTE_06', '6', 'Revenue', 'Performance', 'SOFP', false, true, true],
    ['NOTE_07', '7', 'Non-Exchange Revenue', 'Performance', 'SOFP', false, true, true],
    ['NOTE_15', '15', 'Employee Costs', 'Performance', 'SOFP', false, true, true],
    ['NOTE_16', '16', 'Depreciation and Amortization', 'Performance', 'SOFP', false, true, true],

    // Statement of Financial Position
    ['NOTE_30', '30', 'Cash and Cash Equivalents', 'Position', 'SFP', false, true, true],
    ['NOTE_32', '32', 'Receivables', 'Position', 'SFP', false, true, true],
    ['NOTE_36', '36', 'Property, Plant and Equipment', 'Position', 'SFP', true, true, true],
    ['NOTE_37', '37', 'Intangible Assets', 'Position', 'SFP', true, true, true],
    ['NOTE_38', '38', 'Inventories', 'Position', 'SFP', true, true, true],
    ['NOTE_45', '45', 'Payables', 'Position', 'SFP', false, true, true],
    ['NOTE_50', '50', 'Borrowings', 'Position', 'SFP', false, true, true],

    // Cash Flow Statement
    ['NOTE_CF', 'CF', 'Cash Flow Statement', 'CashFlow', 'CF', false, true, true],

    // Budget
    ['NOTE_BUD', 'BUD', 'Budget Comparison', 'Budget', 'BUD', false, true, true]
  ];

  for (let i = 0; i < sampleNotes.length; i++) {
    sheet.appendRow(sampleNotes[i]);
  }

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Creates note lines sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createNoteLineSheet(ss) {
  const sheet = ss.insertSheet('NoteLines');

  const headers = [
    'LineID', 'NoteID', 'LineNumber', 'Description', 'LineType',
    'ParentLineID', 'Indent', 'DataType', 'Required', 'Formula'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Add sample lines for Note 30 (Cash)
  const cashLines = [
    ['LINE_30_01', 'NOTE_30', '30.1', 'Cash on hand', 'DATA', '', 0, 'CURRENCY', true, ''],
    ['LINE_30_01_01', 'NOTE_30', '30.1.1', 'Petty cash', 'DATA', 'LINE_30_01', 1, 'CURRENCY', false, ''],
    ['LINE_30_01_02', 'NOTE_30', '30.1.2', 'Cash at cashiers', 'DATA', 'LINE_30_01', 1, 'CURRENCY', false, ''],
    ['LINE_30_02', 'NOTE_30', '30.2', 'Bank accounts', 'DATA', '', 0, 'CURRENCY', true, ''],
    ['LINE_30_02_01', 'NOTE_30', '30.2.1', 'Current accounts', 'DATA', 'LINE_30_02', 1, 'CURRENCY', false, ''],
    ['LINE_30_02_02', 'NOTE_30', '30.2.2', 'Savings accounts', 'DATA', 'LINE_30_02', 1, 'CURRENCY', false, ''],
    ['LINE_30_TOTAL', 'NOTE_30', '30.T', 'Total Cash and Cash Equivalents', 'TOTAL', '', 0, 'CURRENCY', true, 'SUM(30.1,30.2)']
  ];

  for (let i = 0; i < cashLines.length; i++) {
    sheet.appendRow(cashLines[i]);
  }

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Gets complete note structure with lines
 * @param {string} noteNumber - Note number (e.g., '30')
 * @returns {Object} Note with lines
 */
function getNoteStructure(noteNumber) {
  try {
    const notesResult = getNoteTemplates();
    if (!notesResult.success) return notesResult;

    const note = notesResult.notes.find(n => n.noteNumber === noteNumber);
    if (!note) {
      return {
        success: false,
        error: 'Note not found'
      };
    }

    const linesResult = getNoteLines(note.noteId);
    if (!linesResult.success) return linesResult;

    return {
      success: true,
      note: note,
      lines: linesResult.lines
    };
  } catch (error) {
    Logger.log('Error getting note structure: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
