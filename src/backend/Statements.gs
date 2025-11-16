/**
 * Statements.gs - Financial Statements Generation
 *
 * Handles:
 * - Statement of Financial Position
 * - Statement of Financial Performance
 * - Cash Flow Statement
 * - Statement formatting
 */

// ============================================================================
// STATEMENT GENERATION
// ============================================================================

/**
 * Generates Statement of Financial Position (Balance Sheet)
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Statement data
 */
function generateStatementOfFinancialPosition(entityId, periodId) {
  try {
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    const data = dataResult.data;

    const statement = {
      title: 'Statement of Financial Position',
      entityId: entityId,
      period: periodId,
      asAt: getPeriodEndDate(periodId),
      assets: {
        current: calculateCurrentAssets(data),
        nonCurrent: calculateNonCurrentAssets(data),
        total: 0
      },
      liabilities: {
        current: calculateCurrentLiabilities(data),
        nonCurrent: calculateNonCurrentLiabilities(data),
        total: 0
      },
      netAssets: 0,
      equity: calculateEquity(data)
    };

    // Calculate totals
    statement.assets.total = statement.assets.current.total + statement.assets.nonCurrent.total;
    statement.liabilities.total = statement.liabilities.current.total + statement.liabilities.nonCurrent.total;
    statement.netAssets = statement.assets.total - statement.liabilities.total;

    return {
      success: true,
      statement: statement
    };
  } catch (error) {
    Logger.log('Error generating SFP: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates Statement of Financial Performance (Income Statement)
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Statement data
 */
function generateStatementOfFinancialPerformance(entityId, periodId) {
  try {
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    const data = dataResult.data;

    const statement = {
      title: 'Statement of Financial Performance',
      entityId: entityId,
      period: periodId,
      forPeriod: getPeriodRange(periodId),
      revenue: calculateRevenue(data),
      expenses: calculateExpenses(data),
      surplus: 0
    };

    // Calculate surplus/deficit
    statement.surplus = statement.revenue.total - statement.expenses.total;

    return {
      success: true,
      statement: statement
    };
  } catch (error) {
    Logger.log('Error generating SOFP: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates Cash Flow Statement
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Statement data
 */
function generateCashFlowStatement(entityId, periodId) {
  try {
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    const data = dataResult.data;
    const cfData = extractNoteData(data, 'NOTE_CF') || {};

    const statement = {
      title: 'Cash Flow Statement',
      entityId: entityId,
      period: periodId,
      forPeriod: getPeriodRange(periodId),
      operating: {
        receipts: parseFloat(cfData.operatingReceipts) || 0,
        payments: parseFloat(cfData.operatingPayments) || 0,
        net: 0
      },
      investing: {
        receipts: parseFloat(cfData.investingReceipts) || 0,
        payments: parseFloat(cfData.investingPayments) || 0,
        net: 0
      },
      financing: {
        receipts: parseFloat(cfData.financingReceipts) || 0,
        payments: parseFloat(cfData.financingPayments) || 0,
        net: 0
      },
      netIncrease: 0,
      openingCash: parseFloat(cfData.openingCash) || 0,
      closingCash: 0
    };

    // Calculate nets
    statement.operating.net = statement.operating.receipts - statement.operating.payments;
    statement.investing.net = statement.investing.receipts - statement.investing.payments;
    statement.financing.net = statement.financing.receipts - statement.financing.payments;

    // Calculate totals
    statement.netIncrease = statement.operating.net + statement.investing.net + statement.financing.net;
    statement.closingCash = statement.openingCash + statement.netIncrease;

    return {
      success: true,
      statement: statement
    };
  } catch (error) {
    Logger.log('Error generating cash flow: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates current assets
 * @param {Object} data - Entity data
 * @returns {Object} Current assets
 */
function calculateCurrentAssets(data) {
  const cash = getFieldValue(data, 'NOTE_30', 'totalCurrent', 0);
  const receivables = getFieldValue(data, 'NOTE_32', 'totalCurrent', 0);
  const inventories = getFieldValue(data, 'NOTE_34', 'totalCurrent', 0);

  return {
    cash: cash,
    receivables: receivables,
    inventories: inventories,
    total: cash + receivables + inventories
  };
}

/**
 * Calculates non-current assets
 * @param {Object} data - Entity data
 * @returns {Object} Non-current assets
 */
function calculateNonCurrentAssets(data) {
  const ppe = getFieldValue(data, 'NOTE_36', 'carryingAmount', 0);
  const intangibles = getFieldValue(data, 'NOTE_37', 'carryingAmount', 0);

  return {
    ppe: ppe,
    intangibles: intangibles,
    total: ppe + intangibles
  };
}

/**
 * Calculates current liabilities
 * @param {Object} data - Entity data
 * @returns {Object} Current liabilities
 */
function calculateCurrentLiabilities(data) {
  const payables = getFieldValue(data, 'NOTE_45', 'totalCurrent', 0);
  const borrowings = getFieldValue(data, 'NOTE_50', 'totalCurrent', 0);

  return {
    payables: payables,
    borrowings: borrowings,
    total: payables + borrowings
  };
}

/**
 * Calculates non-current liabilities
 * @param {Object} data - Entity data
 * @returns {Object} Non-current liabilities
 */
function calculateNonCurrentLiabilities(data) {
  const borrowings = getFieldValue(data, 'NOTE_50', 'totalNonCurrent', 0);

  return {
    borrowings: borrowings,
    total: borrowings
  };
}

/**
 * Calculates equity
 * @param {Object} data - Entity data
 * @returns {Object} Equity
 */
function calculateEquity(data) {
  const capital = 0;  // TODO: Extract from appropriate note
  const reserves = 0;  // TODO: Extract from appropriate note
  const retainedSurplus = 0;  // TODO: Extract from appropriate note

  return {
    capital: capital,
    reserves: reserves,
    retainedSurplus: retainedSurplus,
    total: capital + reserves + retainedSurplus
  };
}

/**
 * Calculates revenue
 * @param {Object} data - Entity data
 * @returns {Object} Revenue
 */
function calculateRevenue(data) {
  const exchangeRevenue = getFieldValue(data, 'NOTE_06', 'total', 0);
  const nonExchangeRevenue = getFieldValue(data, 'NOTE_07', 'total', 0);

  return {
    exchangeRevenue: exchangeRevenue,
    nonExchangeRevenue: nonExchangeRevenue,
    total: exchangeRevenue + nonExchangeRevenue
  };
}

/**
 * Calculates expenses
 * @param {Object} data - Entity data
 * @returns {Object} Expenses
 */
function calculateExpenses(data) {
  const employeeCosts = getFieldValue(data, 'NOTE_15', 'total', 0);
  const depreciation = getFieldValue(data, 'NOTE_16', 'total', 0);
  const other = 0;  // TODO: Extract from appropriate note

  return {
    employeeCosts: employeeCosts,
    depreciation: depreciation,
    other: other,
    total: employeeCosts + depreciation + other
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets field value from note data
 * @param {Object} data - Entity data
 * @param {string} noteId - Note ID
 * @param {string} fieldName - Field name
 * @param {number} defaultValue - Default value
 * @returns {number} Field value
 */
function getFieldValue(data, noteId, fieldName, defaultValue) {
  if (data[noteId] && data[noteId].data && data[noteId].data[fieldName]) {
    return parseFloat(data[noteId].data[fieldName]) || defaultValue;
  }
  return defaultValue;
}

/**
 * Gets period end date
 * @param {string} periodId - Period ID
 * @returns {Date} End date
 */
function getPeriodEndDate(periodId) {
  const period = getPeriodDetails(periodId);
  return period ? period.endDate : new Date();
}

/**
 * Gets period range description
 * @param {string} periodId - Period ID
 * @returns {string} Period range
 */
function getPeriodRange(periodId) {
  const period = getPeriodDetails(periodId);
  if (period) {
    return `${formatDate(period.startDate)} to ${formatDate(period.endDate)}`;
  }
  return periodId;
}
