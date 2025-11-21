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
 * Gets all note templates.
 * This function is CACHED for 1 hour to improve performance.
 * @returns {Array} List of note templates
 */
function getNoteTemplates() {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'noteTemplates';

    // 1. Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      Logger.log('getNoteTemplates: Found in cache.');
      return JSON.parse(cachedData);
    }

    Logger.log('getNoteTemplates: Not in cache, fetching from sheet.');

    // 2. If not in cache, get from Spreadsheet
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('NoteTemplates');
    if (!sheet) {
      return { success: false, error: 'NoteTemplates sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const notes = [];

    // Find column indices
    const noteIdCol = headers.indexOf('NoteID');
    const noteNumCol = headers.indexOf('NoteNumber');
    const noteNameCol = headers.indexOf('NoteName');
    const categoryCol = headers.indexOf('Category');
    const statementTypeCol = headers.indexOf('StatementType');
    const hasMovementCol = headers.indexOf('HasMovementSchedule');
    const requiredCol = headers.indexOf('Required');
    const activeCol = headers.indexOf('Active');

    for (let i = 1; i < data.length; i++) {
      notes.push({
        noteId: data[i][noteIdCol],
        noteNumber: data[i][noteNumCol],
        noteName: data[i][noteNameCol],
        category: data[i][categoryCol],
        statementType: data[i][statementTypeCol],
        hasMovementSchedule: data[i][hasMovementCol],
        required: data[i][requiredCol],
        active: data[i][activeCol]
      });
    }

    const result = { success: true, notes: notes };

    // 3. Store in cache for next time (expires in 1 hour)
    cache.put(cacheKey, JSON.stringify(result), 3600);

    return result;

  } catch (error) {
    Logger.log('Error getting note templates: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Gets note lines for a specific note
 * @param {string} noteId - Note ID
 * @returns {Array} Note lines
 */
function getNoteLines(noteId) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
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

  const config = getSagaNotesConfig();
  const templates = config.noteTemplates || [];
  if (templates.length === 0) {
    return;
  }

  const rows = templates.map(function(note) {
    return [
      note.noteId,
      note.noteNumber,
      note.noteName,
      note.category,
      note.statementType,
      !!note.hasMovementSchedule,
      note.required !== false,
      note.active !== false
    ];
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
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

  // Note 54 - Cash Flow Operating Activities
  const cashFlowLines = [
    // Operating Activities
    ['LINE_54_OA', 'NOTE_CF', '54.A', 'Operating Activities', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_54_OA_01', 'NOTE_CF', '54.A.1', 'Transfers from other governments', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],
    ['LINE_54_OA_02', 'NOTE_CF', '54.A.2', 'Rendering of services', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],
    ['LINE_54_OA_03', 'NOTE_CF', '54.A.3', 'Other Receipts', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],
    ['LINE_54_OA_04', 'NOTE_CF', '54.A.4', 'Use of goods and services', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],
    ['LINE_54_OA_05', 'NOTE_CF', '54.A.5', 'Employee costs', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],
    ['LINE_54_OA_06', 'NOTE_CF', '54.A.6', 'Other Payments', 'DATA', 'LINE_54_OA', 1, 'CURRENCY', false, ''],

    // Investing Activities
    ['LINE_54_IA', 'NOTE_CF', '54.B', 'Investing Activities', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_54_IA_01', 'NOTE_CF', '54.B.1', 'Purchase of PPE', 'DATA', 'LINE_54_IA', 1, 'CURRENCY', false, ''],
    ['LINE_54_IA_02', 'NOTE_CF', '54.B.2', 'Proceeds from sale of PPE', 'DATA', 'LINE_54_IA', 1, 'CURRENCY', false, ''],
    ['LINE_54_IA_03', 'NOTE_CF', '54.B.3', 'Mortgage/Car Loan Receipts', 'DATA', 'LINE_54_IA', 1, 'CURRENCY', false, ''],
    ['LINE_54_IA_04', 'NOTE_CF', '54.B.4', 'Mortgage/Car Loan Payments', 'DATA', 'LINE_54_IA', 1, 'CURRENCY', false, ''],

    // Financing Activities
    ['LINE_54_FA', 'NOTE_CF', '54.C', 'Financing Activities', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_54_FA_01', 'NOTE_CF', '54.C.1', 'Proceeds from borrowings', 'DATA', 'LINE_54_FA', 1, 'CURRENCY', false, ''],
    ['LINE_54_FA_02', 'NOTE_CF', '54.C.2', 'Repayment of borrowings', 'DATA', 'LINE_54_FA', 1, 'CURRENCY', false, '']
  ];

  // Note BUDGET - Budget vs Actual
  const budgetLines = [
    ['LINE_BUD_H1', 'NOTE_BUDGET', 'BUD.H1', 'Receipts', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_BUD_01', 'NOTE_BUDGET', 'BUD.1', 'Transfers from Other Governments', 'DATA', 'LINE_BUD_H1', 1, 'CURRENCY', false, ''],
    ['LINE_BUD_H2', 'NOTE_BUDGET', 'BUD.H2', 'Payments', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_BUD_02', 'NOTE_BUDGET', 'BUD.2', 'Employee costs', 'DATA', 'LINE_BUD_H2', 1, 'CURRENCY', false, '']
  ];

  // Note CINA - Changes in Net Assets
  const cinaLines = [
    // Current Year
    ['LINE_CINA_CY', 'NOTE_CINA', 'CINA.CY', 'Changes in Net Assets (Current Year)', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_CINA_CY_01', 'NOTE_CINA', 'CINA.CY.1', 'As at 1 July, (Current FY)', 'DATA', 'LINE_CINA_CY', 1, 'CURRENCY', true, ''],
    ['LINE_CINA_CY_02', 'NOTE_CINA', 'CINA.CY.2', 'Surplus/ (deficit) for the year', 'DATA', 'LINE_CINA_CY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_CY_03', 'NOTE_CINA', 'CINA.CY.3', 'Revaluation gain', 'DATA', 'LINE_CINA_CY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_CY_04', 'NOTE_CINA', 'CINA.CY.4', 'Capital/development grants received', 'DATA', 'LINE_CINA_CY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_CY_05', 'NOTE_CINA', 'CINA.CY.5', 'As at 30 June, (Current FY)', 'SUBTOTAL', 'LINE_CINA_CY', 1, 'CURRENCY', true, ''],

    // Prior Year
    ['LINE_CINA_PY', 'NOTE_CINA', 'CINA.PY', 'Changes in Net Assets (Prior Year)', 'HEADER', '', 0, 'TEXT', false, ''],
    ['LINE_CINA_PY_01', 'NOTE_CINA', 'CINA.PY.1', 'As at 1 July, (Previous FY)', 'DATA', 'LINE_CINA_PY', 1, 'CURRENCY', true, ''],
    ['LINE_CINA_PY_02', 'NOTE_CINA', 'CINA.PY.2', 'Surplus/ (deficit) for the year', 'DATA', 'LINE_CINA_PY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_PY_03', 'NOTE_CINA', 'CINA.PY.3', 'Revaluation gain', 'DATA', 'LINE_CINA_PY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_PY_04', 'NOTE_CINA', 'CINA.PY.4', 'Capital/development grants received', 'DATA', 'LINE_CINA_PY', 1, 'CURRENCY', false, ''],
    ['LINE_CINA_PY_05', 'NOTE_CINA', 'CINA.PY.5', 'As at 30 June, (Previous FY)', 'SUBTOTAL', 'LINE_CINA_PY', 1, 'CURRENCY', true, '']
  ];

  // Append all lines
  const allLines = [...cashLines, ...cashFlowLines, ...budgetLines, ...cinaLines];
  for (let i = 0; i < allLines.length; i++) {
    sheet.appendRow(allLines[i]);
  }

  sheet.autoResizeColumns(1, headers.length);

  return sheet;
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
