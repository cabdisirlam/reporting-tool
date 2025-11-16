/**
 * Budget.gs - Budget Management Functions
 *
 * Handles:
 * - Budget entry and tracking
 * - Budget vs actual comparison
 * - Virements (budget transfers)
 * - Supplementary budgets
 */

// ============================================================================
// BUDGET OPERATIONS
// ============================================================================

/**
 * Saves budget data
 * @param {Object} params - Budget parameters
 * @returns {Object} Save result
 */
function saveBudgetData(params) {
  try {
    const { entityId, periodId, budgetData, budgetType } = params;

    // Validate parameters
    if (!entityId || !periodId || !budgetData) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    // Save to note data
    const saveResult = saveNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_BUD',
      noteData: {
        ...budgetData,
        budgetType: budgetType || 'ORIGINAL'
      },
      userId: Session.getActiveUser().getEmail()
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error saving budget data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets budget data
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Budget data
 */
function getBudgetData(entityId, periodId) {
  try {
    return getNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_BUD'
    });
  } catch (error) {
    Logger.log('Error getting budget data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates a virement (budget transfer)
 * @param {Object} params - Virement parameters
 * @returns {Object} Result
 */
function createVirement(params) {
  try {
    const { entityId, periodId, fromLine, toLine, amount, reason } = params;

    // Validate
    if (!entityId || !periodId || !fromLine || !toLine || !amount || !reason) {
      return {
        success: false,
        error: 'All fields are required for virement'
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be positive'
      };
    }

    // Get current budget
    const budgetResult = getBudgetData(entityId, periodId);
    if (!budgetResult.success) return budgetResult;

    const budgetData = budgetResult.data || {};

    // Check if from line has sufficient budget
    const fromBalance = parseFloat(budgetData[fromLine]) || 0;
    if (fromBalance < amount) {
      return {
        success: false,
        error: 'Insufficient budget in source line'
      };
    }

    // Apply virement
    budgetData[fromLine] = fromBalance - amount;
    budgetData[toLine] = (parseFloat(budgetData[toLine]) || 0) + amount;

    // Record virement
    if (!budgetData.virements) {
      budgetData.virements = [];
    }

    budgetData.virements.push({
      date: new Date(),
      from: fromLine,
      to: toLine,
      amount: amount,
      reason: reason,
      approvedBy: Session.getActiveUser().getEmail()
    });

    // Save updated budget
    const saveResult = saveBudgetData({
      entityId: entityId,
      periodId: periodId,
      budgetData: budgetData,
      budgetType: 'VIREMENT'
    });

    // Log activity
    logActivity(
      Session.getActiveUser().getEmail(),
      'CREATE_VIREMENT',
      `Virement: ${fromLine} to ${toLine}, ${formatCurrency(amount)}`
    );

    return saveResult;
  } catch (error) {
    Logger.log('Error creating virement: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates a supplementary budget
 * @param {Object} params - Supplementary budget parameters
 * @returns {Object} Result
 */
function createSupplementaryBudget(params) {
  try {
    const { entityId, periodId, supplementaryData, reason } = params;

    // Get current budget
    const budgetResult = getBudgetData(entityId, periodId);
    if (!budgetResult.success) return budgetResult;

    const budgetData = budgetResult.data || {};

    // Add supplementary amounts
    Object.keys(supplementaryData).forEach(line => {
      const currentAmount = parseFloat(budgetData[line]) || 0;
      const supplementary = parseFloat(supplementaryData[line]) || 0;
      budgetData[line] = currentAmount + supplementary;
    });

    // Record supplementary budget
    if (!budgetData.supplementaries) {
      budgetData.supplementaries = [];
    }

    budgetData.supplementaries.push({
      date: new Date(),
      data: supplementaryData,
      reason: reason,
      approvedBy: Session.getActiveUser().getEmail()
    });

    // Save updated budget
    const saveResult = saveBudgetData({
      entityId: entityId,
      periodId: periodId,
      budgetData: budgetData,
      budgetType: 'SUPPLEMENTARY'
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error creating supplementary budget: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// BUDGET ANALYSIS
// ============================================================================

/**
 * Generates budget vs actual comparison
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Budget comparison
 */
function generateBudgetComparison(entityId, periodId) {
  try {
    // Get budget data
    const budgetResult = getBudgetData(entityId, periodId);
    if (!budgetResult.success) return budgetResult;

    const budget = budgetResult.data || {};

    // Get actual data
    const actualResult = getAllEntityNoteData(entityId, periodId);
    if (!actualResult.success) return actualResult;

    const actual = actualResult.data;

    // Compare budget vs actual
    const comparison = {
      receipts: compareBudgetLine(budget.receipts, actual, 'revenue'),
      payments: compareBudgetLine(budget.payments, actual, 'expenses'),
      surplus: 0,
      variance: 0,
      variancePercent: 0
    };

    // Calculate surplus/deficit
    const budgetSurplus = (budget.receipts || 0) - (budget.payments || 0);
    const actualSurplus = (comparison.receipts.actual || 0) - (comparison.payments.actual || 0);

    comparison.surplus = {
      budget: budgetSurplus,
      actual: actualSurplus,
      variance: actualSurplus - budgetSurplus,
      variancePercent: budgetSurplus !== 0 ? ((actualSurplus - budgetSurplus) / budgetSurplus) * 100 : 0
    };

    return {
      success: true,
      comparison: comparison
    };
  } catch (error) {
    Logger.log('Error generating budget comparison: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Compares budget line with actual
 * @param {number} budgetAmount - Budget amount
 * @param {Object} actualData - Actual data
 * @param {string} category - Category (revenue/expenses)
 * @returns {Object} Comparison
 */
function compareBudgetLine(budgetAmount, actualData, category) {
  const budget = parseFloat(budgetAmount) || 0;
  let actual = 0;

  // Extract actual from data based on category
  if (category === 'revenue') {
    actual = getFieldValue(actualData, 'NOTE_06', 'total', 0) +
             getFieldValue(actualData, 'NOTE_07', 'total', 0);
  } else if (category === 'expenses') {
    actual = getFieldValue(actualData, 'NOTE_15', 'total', 0) +
             getFieldValue(actualData, 'NOTE_16', 'total', 0);
  }

  const variance = actual - budget;
  const variancePercent = budget !== 0 ? (variance / budget) * 100 : 0;

  return {
    budget: budget,
    actual: actual,
    variance: variance,
    variancePercent: variancePercent,
    status: getVarianceStatus(variancePercent, category)
  };
}

/**
 * Determines variance status
 * @param {number} percent - Variance percentage
 * @param {string} category - Category
 * @returns {string} Status
 */
function getVarianceStatus(percent, category) {
  const absPercent = Math.abs(percent);

  if (absPercent <= 5) return 'GOOD';
  if (absPercent <= 10) return 'ACCEPTABLE';
  if (absPercent <= 20) return 'WARNING';
  return 'CRITICAL';
}

/**
 * Gets budget utilization
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Budget utilization
 */
function getBudgetUtilization(entityId, periodId) {
  try {
    const comparisonResult = generateBudgetComparison(entityId, periodId);
    if (!comparisonResult.success) return comparisonResult;

    const comparison = comparisonResult.comparison;

    const utilization = {
      receipts: {
        budget: comparison.receipts.budget,
        actual: comparison.receipts.actual,
        percent: comparison.receipts.budget !== 0 ?
          (comparison.receipts.actual / comparison.receipts.budget) * 100 : 0
      },
      payments: {
        budget: comparison.payments.budget,
        actual: comparison.payments.actual,
        percent: comparison.payments.budget !== 0 ?
          (comparison.payments.actual / comparison.payments.budget) * 100 : 0
      }
    };

    return {
      success: true,
      utilization: utilization
    };
  } catch (error) {
    Logger.log('Error getting budget utilization: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
