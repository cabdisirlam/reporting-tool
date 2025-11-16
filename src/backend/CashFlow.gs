/**
 * CashFlow.gs - Cash Flow Statement Functions
 *
 * Handles:
 * - Cash flow statement preparation
 * - Cash flow categorization
 * - Cash flow reconciliation
 * - Direct and indirect methods
 */

// ============================================================================
// CASH FLOW OPERATIONS
// ============================================================================

/**
 * Saves cash flow data
 * @param {Object} params - Cash flow parameters
 * @returns {Object} Save result
 */
function saveCashFlowData(params) {
  try {
    const { entityId, periodId, cashFlowData } = params;

    // Validate parameters
    if (!entityId || !periodId || !cashFlowData) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    // Validate cash flow method
    if (!cashFlowData.method || !['DIRECT', 'INDIRECT'].includes(cashFlowData.method)) {
      return {
        success: false,
        error: 'Invalid cash flow method'
      };
    }

    // Calculate totals
    const calculated = calculateCashFlowTotals(cashFlowData);

    // Save to note data
    const saveResult = saveNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_CF',
      noteData: calculated,
      userId: Session.getActiveUser().getEmail()
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error saving cash flow data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets cash flow data
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Cash flow data
 */
function getCashFlowData(entityId, periodId) {
  try {
    return getNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_CF'
    });
  } catch (error) {
    Logger.log('Error getting cash flow data: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// CASH FLOW CALCULATIONS
// ============================================================================

/**
 * Calculates cash flow totals
 * @param {Object} cfData - Cash flow data
 * @returns {Object} Calculated cash flow
 */
function calculateCashFlowTotals(cfData) {
  const calculated = { ...cfData };

  // Operating activities
  calculated.operating = calculated.operating || {};
  calculated.operating.receipts = parseFloat(calculated.operating.receipts) || 0;
  calculated.operating.payments = parseFloat(calculated.operating.payments) || 0;
  calculated.operating.net = calculated.operating.receipts + calculated.operating.payments;

  // Investing activities
  calculated.investing = calculated.investing || {};
  calculated.investing.receipts = parseFloat(calculated.investing.receipts) || 0;
  calculated.investing.payments = parseFloat(calculated.investing.payments) || 0;
  calculated.investing.net = calculated.investing.receipts + calculated.investing.payments;

  // Financing activities
  calculated.financing = calculated.financing || {};
  calculated.financing.receipts = parseFloat(calculated.financing.receipts) || 0;
  calculated.financing.payments = parseFloat(calculated.financing.payments) || 0;
  calculated.financing.net = calculated.financing.receipts + calculated.financing.payments;

  // Net increase/(decrease)
  calculated.netIncrease = calculated.operating.net +
                           calculated.investing.net +
                           calculated.financing.net;

  // Opening and closing cash
  calculated.openingCash = parseFloat(calculated.openingCash) || 0;
  calculated.closingCash = calculated.openingCash + calculated.netIncrease;

  return calculated;
}

/**
 * Prepares cash flow using direct method
 * @param {Object} entityData - Entity data
 * @returns {Object} Cash flow statement
 */
function prepareCashFlowDirect(entityData) {
  return {
    method: 'DIRECT',
    operating: {
      receipts: {
        fromCustomers: 0,
        fromGrants: 0,
        fromTax: 0,
        other: 0,
        total: 0
      },
      payments: {
        toSuppliers: 0,
        toEmployees: 0,
        interest: 0,
        other: 0,
        total: 0
      },
      net: 0
    },
    investing: prepareInvestingActivities(entityData),
    financing: prepareFinancingActivities(entityData),
    netIncrease: 0,
    openingCash: 0,
    closingCash: 0
  };
}

/**
 * Prepares cash flow using indirect method
 * @param {Object} entityData - Entity data
 * @returns {Object} Cash flow statement
 */
function prepareCashFlowIndirect(entityData) {
  return {
    method: 'INDIRECT',
    operating: {
      surplusDeficit: 0,
      adjustments: {
        depreciation: 0,
        provisionsMovement: 0,
        receivablesMovement: 0,
        payablesMovement: 0,
        inventoriesMovement: 0,
        total: 0
      },
      net: 0
    },
    investing: prepareInvestingActivities(entityData),
    financing: prepareFinancingActivities(entityData),
    netIncrease: 0,
    openingCash: 0,
    closingCash: 0
  };
}

/**
 * Prepares investing activities section
 * @param {Object} entityData - Entity data
 * @returns {Object} Investing activities
 */
function prepareInvestingActivities(entityData) {
  return {
    receipts: {
      disposalPPE: 0,
      disposalInvestments: 0,
      other: 0,
      total: 0
    },
    payments: {
      purchasePPE: 0,
      purchaseIntangibles: 0,
      purchaseInvestments: 0,
      other: 0,
      total: 0
    },
    net: 0
  };
}

/**
 * Prepares financing activities section
 * @param {Object} entityData - Entity data
 * @returns {Object} Financing activities
 */
function prepareFinancingActivities(entityData) {
  return {
    receipts: {
      borrowings: 0,
      grants: 0,
      capitalContributions: 0,
      other: 0,
      total: 0
    },
    payments: {
      repaymentBorrowings: 0,
      dividends: 0,
      other: 0,
      total: 0
    },
    net: 0
  };
}

// ============================================================================
// CASH FLOW RECONCILIATION
// ============================================================================

/**
 * Reconciles cash flow to cash note
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Reconciliation result
 */
function reconcileCashFlow(entityId, periodId) {
  try {
    // Get cash flow data
    const cfResult = getCashFlowData(entityId, periodId);
    if (!cfResult.success) return cfResult;

    // Get cash note data
    const cashResult = getNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_30'
    });
    if (!cashResult.success) return cashResult;

    const cfData = cfResult.data || {};
    const cashData = cashResult.data || {};

    const cfClosing = parseFloat(cfData.closingCash) || 0;
    const cashClosing = parseFloat(cashData.totalCurrent) || 0;

    const reconciled = Math.abs(cfClosing - cashClosing) < 0.01;

    return {
      success: true,
      reconciled: reconciled,
      cashFlow: cfClosing,
      cashNote: cashClosing,
      difference: cfClosing - cashClosing
    };
  } catch (error) {
    Logger.log('Error reconciling cash flow: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Validates cash flow statement
 * @param {Object} cfData - Cash flow data
 * @returns {Object} Validation result
 */
function validateCashFlow(cfData) {
  const errors = [];

  // Check if opening + net increase = closing
  const calculated = cfData.openingCash + cfData.netIncrease;
  const closing = cfData.closingCash;

  if (Math.abs(calculated - closing) > 0.01) {
    errors.push({
      code: 'CLOSING_MISMATCH',
      message: `Closing cash mismatch: Opening (${formatCurrency(cfData.openingCash)}) + ` +
               `Net Increase (${formatCurrency(cfData.netIncrease)}) ≠ ` +
               `Closing (${formatCurrency(closing)})`
    });
  }

  // Check if operating + investing + financing = net increase
  const netTotal = (cfData.operating?.net || 0) +
                   (cfData.investing?.net || 0) +
                   (cfData.financing?.net || 0);

  if (Math.abs(netTotal - cfData.netIncrease) > 0.01) {
    errors.push({
      code: 'NET_INCREASE_MISMATCH',
      message: 'Net increase doesn\'t match sum of activities'
    });
  }

  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Generates cash flow analysis
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Cash flow analysis
 */
function generateCashFlowAnalysis(entityId, periodId) {
  try {
    const cfResult = getCashFlowData(entityId, periodId);
    if (!cfResult.success) return cfResult;

    const cfData = cfResult.data || {};

    const analysis = {
      operatingCashRatio: calculateOperatingCashRatio(cfData),
      cashFlowCoverage: calculateCashFlowCoverage(cfData),
      cashFlowToSurplus: calculateCashFlowToSurplus(cfData),
      freeCashFlow: calculateFreeCashFlow(cfData),
      summary: ''
    };

    // Generate summary
    if (cfData.operating?.net > 0) {
      analysis.summary = 'Positive operating cash flow indicates healthy operations.';
    } else {
      analysis.summary = 'Negative operating cash flow may indicate operational challenges.';
    }

    return {
      success: true,
      analysis: analysis
    };
  } catch (error) {
    Logger.log('Error generating cash flow analysis: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculates operating cash ratio
 * @param {Object} cfData - Cash flow data
 * @returns {number} Operating cash ratio
 */
function calculateOperatingCashRatio(cfData) {
  const operating = cfData.operating?.net || 0;
  const closing = cfData.closingCash || 0;

  return closing !== 0 ? (operating / closing) * 100 : 0;
}

/**
 * Calculates cash flow coverage
 * @param {Object} cfData - Cash flow data
 * @returns {number} Cash flow coverage ratio
 */
function calculateCashFlowCoverage(cfData) {
  const operating = cfData.operating?.net || 0;
  const investing = Math.abs(cfData.investing?.net || 0);

  return investing !== 0 ? operating / investing : 0;
}

/**
 * Calculates cash flow to surplus ratio
 * @param {Object} cfData - Cash flow data
 * @returns {number} Cash flow to surplus ratio
 */
function calculateCashFlowToSurplus(cfData) {
  const operating = cfData.operating?.net || 0;
  const surplus = cfData.operating?.surplusDeficit || 0;

  return surplus !== 0 ? (operating / surplus) * 100 : 0;
}

/**
 * Calculates free cash flow
 * @param {Object} cfData - Cash flow data
 * @returns {number} Free cash flow
 */
function calculateFreeCashFlow(cfData) {
  const operating = cfData.operating?.net || 0;
  const investing = cfData.investing?.payments?.total || 0;

  return operating + investing; // Investing payments are negative
}
