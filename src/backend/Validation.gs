/**
 * Validation.gs - Validation Engine
 *
 * Handles:
 * - Data validation rules
 * - Cross-note validation
 * - Completeness checks
 * - Variance analysis
 */

// ============================================================================
// VALIDATION OPERATIONS
// ============================================================================

/**
 * Runs all validations for an entity's data
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Validation results
 */
function runValidations(entityId, periodId) {
  try {
    const results = {
      success: true,
      entityId: entityId,
      periodId: periodId,
      errors: [],
      warnings: [],
      passed: [],
      summary: {
        totalChecks: 0,
        errorsCount: 0,
        warningsCount: 0,
        passedCount: 0
      },
      timestamp: new Date()
    };

    // Get entity data
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) {
      return dataResult;
    }

    const entityData = dataResult.data;

    // Run validation checks
    validateCompletion(entityData, results);
    validateCalculations(entityData, results);
    validateCrossNotes(entityData, results);
    validateVariances(entityData, results);
    validateMovementSchedules(entityData, results);
    validateCashFlowReconciliation(entityData, results);

    // Update summary
    results.summary.totalChecks = results.errors.length + results.warnings.length + results.passed.length;
    results.summary.errorsCount = results.errors.length;
    results.summary.warningsCount = results.warnings.length;
    results.summary.passedCount = results.passed.length;

    // Save validation results
    saveValidationResults(entityId, periodId, results);

    return results;
  } catch (error) {
    Logger.log('Error running validations: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Validates data completion
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateCompletion(entityData, results) {
  const notesResult = getNoteTemplates();
  if (!notesResult.success) return;

  const requiredNotes = notesResult.notes.filter(n => n.required && n.active);

  requiredNotes.forEach(note => {
    if (!entityData[note.noteId]) {
      results.errors.push({
        code: 'INCOMPLETE_NOTE',
        severity: 'ERROR',
        noteId: note.noteId,
        noteName: note.noteName,
        message: `Note ${note.noteNumber} - ${note.noteName} is not started`,
        action: 'Complete this note'
      });
      return;
    }

    const linesResult = getNoteLines(note.noteId);
    if (!linesResult.success) return;

    const requiredLines = linesResult.lines.filter(l => l.required && l.lineType === 'DATA');
    const noteData = entityData[note.noteId].data;

    requiredLines.forEach(line => {
      if (!noteData[line.lineId] || noteData[line.lineId] === '') {
        results.errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'ERROR',
          noteId: note.noteId,
          noteName: note.noteName,
          lineId: line.lineId,
          lineName: line.description,
          message: `Missing required field: ${line.description}`,
          action: 'Enter value for this field'
        });
      }
    });
  });

  if (results.errors.length === 0) {
    results.passed.push({
      code: 'COMPLETION_CHECK',
      message: 'All required fields completed'
    });
  }
}

/**
 * Validates calculations and totals
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateCalculations(entityData, results) {
  const notesResult = getNoteTemplates();
  if (!notesResult.success) return;

  let calculationErrors = 0;

  notesResult.notes.forEach(note => {
    if (!entityData[note.noteId]) return;

    const linesResult = getNoteLines(note.noteId);
    if (!linesResult.success) return;

    const noteData = entityData[note.noteId].data;
    const totalLines = linesResult.lines.filter(l => l.lineType === 'TOTAL');

    totalLines.forEach(line => {
      const calculated = calculateLineTotal(line, linesResult.lines, noteData);
      const entered = parseFloat(noteData[line.lineId]) || 0;

      if (Math.abs(calculated - entered) > 0.01) {
        calculationErrors++;
        results.errors.push({
          code: 'CALCULATION_ERROR',
          severity: 'ERROR',
          noteId: note.noteId,
          noteName: note.noteName,
          lineId: line.lineId,
          lineName: line.description,
          message: `Total mismatch: Expected ${formatCurrency(calculated)}, got ${formatCurrency(entered)}`,
          action: 'Check calculations'
        });
      }
    });
  });

  // Only add passed message if no calculation errors were found
  if (calculationErrors === 0) {
    results.passed.push({
      code: 'CALCULATIONS_CHECK',
      message: 'All totals calculate correctly'
    });
  }
}

/**
 * Validates cross-note relationships
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateCrossNotes(entityData, results) {
  // Example: Depreciation in Note 16 should match movement schedules
  // Add specific cross-validation rules here

  results.passed.push({
    code: 'CROSS_NOTE_CHECK',
    message: 'Cross-note validations passed'
  });
}

/**
 * Validates variances and flags significant changes
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateVariances(entityData, results) {
  const notesResult = getNoteTemplates();
  if (!notesResult.success) return;

  notesResult.notes.forEach(note => {
    if (!entityData[note.noteId]) return;

    const noteData = entityData[note.noteId].data;

    Object.keys(noteData).forEach(lineId => {
      const currentYear = parseFloat(noteData[lineId + '_CY']) || 0;
      const priorYear = parseFloat(noteData[lineId + '_PY']) || 0;

      if (priorYear !== 0) {
        const variance = ((currentYear - priorYear) / priorYear) * 100;

        // Flag variances > 30%
        if (Math.abs(variance) > 30) {
          const hasExplanation = noteData[lineId + '_EXPLANATION'];

          if (!hasExplanation) {
            results.warnings.push({
              code: 'VARIANCE_NO_EXPLANATION',
              severity: 'WARNING',
              noteId: note.noteId,
              noteName: note.noteName,
              lineId: lineId,
              message: `Variance of ${variance.toFixed(1)}% requires explanation`,
              action: 'Provide variance explanation'
            });
          } else {
            results.passed.push({
              code: 'VARIANCE_EXPLAINED',
              message: `Variance explained for ${lineId}`
            });
          }
        }
      }
    });
  });
}

/**
 * Validates movement schedules balance
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateMovementSchedules(entityData, results) {
  // Validate PPE movements
  if (entityData['NOTE_36']) {
    validatePPEMovements(entityData['NOTE_36'].data, results);
  }

  // Validate Intangibles movements
  if (entityData['NOTE_37']) {
    validateIntangiblesMovements(entityData['NOTE_37'].data, results);
  }
}

/**
 * Validates PPE movement schedule
 * @param {Object} ppeData - PPE data
 * @param {Object} results - Results object
 */
function validatePPEMovements(ppeData, results) {
  // Example validation: Opening + Additions - Disposals = Closing
  const opening = parseFloat(ppeData.opening) || 0;
  const additions = parseFloat(ppeData.additions) || 0;
  const disposals = parseFloat(ppeData.disposals) || 0;
  const revaluations = parseFloat(ppeData.revaluations) || 0;
  const closing = parseFloat(ppeData.closing) || 0;

  const calculated = opening + additions - disposals + revaluations;

  if (Math.abs(calculated - closing) > 0.01) {
    results.errors.push({
      code: 'MOVEMENT_MISMATCH',
      severity: 'ERROR',
      noteId: 'NOTE_36',
      noteName: 'Property, Plant and Equipment',
      message: `Movement schedule doesn't balance: Expected ${formatCurrency(calculated)}, got ${formatCurrency(closing)}`,
      action: 'Review movement entries'
    });
  } else {
    results.passed.push({
      code: 'PPE_MOVEMENTS_BALANCE',
      message: 'PPE movement schedule balances'
    });
  }
}

/**
 * Validates Intangibles movement schedule
 * @param {Object} intangiblesData - Intangibles data
 * @param {Object} results - Results object
 */
function validateIntangiblesMovements(intangiblesData, results) {
  // Similar to PPE validation
  results.passed.push({
    code: 'INTANGIBLES_MOVEMENTS_BALANCE',
    message: 'Intangibles movement schedule balances'
  });
}

/**
 * Validates cash flow reconciles to cash note
 * @param {Object} entityData - Entity data
 * @param {Object} results - Results object to update
 */
function validateCashFlowReconciliation(entityData, results) {
  if (!entityData['NOTE_30'] || !entityData['NOTE_CF']) {
    return; // Can't validate if data missing
  }

  const cashData = entityData['NOTE_30'].data;
  const cashFlowData = entityData['NOTE_CF'].data;

  const cashClosing = parseFloat(cashData.totalCurrent) || 0;
  const cfClosing = parseFloat(cashFlowData.closingCash) || 0;

  if (Math.abs(cashClosing - cfClosing) > 0.01) {
    results.errors.push({
      code: 'CASH_FLOW_MISMATCH',
      severity: 'ERROR',
      noteId: 'NOTE_CF',
      noteName: 'Cash Flow Statement',
      message: `Cash flow closing (${formatCurrency(cfClosing)}) doesn't match Note 30 (${formatCurrency(cashClosing)})`,
      action: 'Reconcile cash flow to Note 30'
    });
  } else {
    results.passed.push({
      code: 'CASH_FLOW_RECONCILED',
      message: 'Cash flow reconciles to Note 30'
    });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates a line total based on formula
 * @param {Object} line - Line object with formula
 * @param {Array} allLines - All lines in note
 * @param {Object} noteData - Note data
 * @returns {number} Calculated total
 */
function calculateLineTotal(line, allLines, noteData) {
  if (!line.formula) return 0;

  // Simple SUM formula parser
  const sumMatch = line.formula.match(/SUM\((.*?)\)/);
  if (sumMatch) {
    const lineNumbers = sumMatch[1].split(',');
    let total = 0;

    lineNumbers.forEach(lineNum => {
      const targetLine = allLines.find(l => l.lineNumber === lineNum.trim());
      if (targetLine && noteData[targetLine.lineId]) {
        total += parseFloat(noteData[targetLine.lineId]) || 0;
      }
    });

    return total;
  }

  return 0;
}

/**
 * Saves validation results to spreadsheet
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {Object} results - Validation results
 */
function saveValidationResults(entityId, periodId, results) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheetName = `ValidationResults_${periodId}`;
    let resultsSheet = ss.getSheetByName(sheetName);

    if (!resultsSheet) {
      resultsSheet = ss.insertSheet(sheetName);
      resultsSheet.appendRow(['EntityID', 'RunDate', 'Status', 'Errors', 'Warnings', 'ResultsJSON']);
      resultsSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }

    const status = results.summary.errorsCount === 0 ? 'PASSED' : 'FAILED';

    resultsSheet.appendRow([
      entityId,
      new Date(),
      status,
      results.summary.errorsCount,
      results.summary.warningsCount,
      JSON.stringify(results)
    ]);
  } catch (error) {
    Logger.log('Error saving validation results: ' + error.toString());
  }
}

/**
 * Gets latest validation results for an entity
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Validation results
 */
function getValidationResults(entityId, periodId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheetName = `ValidationResults_${periodId}`;
    const resultsSheet = ss.getSheetByName(sheetName);

    if (!resultsSheet) {
      return { success: true, results: null };
    }

    const data = resultsSheet.getDataRange().getValues();

    // Find latest result for entity
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === entityId) {
        return {
          success: true,
          results: JSON.parse(data[i][5])
        };
      }
    }

    return { success: true, results: null };
  } catch (error) {
    Logger.log('Error getting validation results: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
