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

/**
 * Generates Statement of Changes in Net Assets/Equity
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Statement data
 */
function generateStatementOfChangesInNetAssets(entityId, periodId) {
  try {
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    const data = dataResult.data;

    // Get opening balances
    const openingContributedCapital = getFieldValue(data, 'NOTE_EQUITY', 'openingContributedCapital', 0);
    const openingRevaluation = getFieldValue(data, 'NOTE_EQUITY', 'openingRevaluationSurplus', 0);
    const openingReserves = getFieldValue(data, 'NOTE_EQUITY', 'openingReserves', 0);
    const openingAccumulated = getFieldValue(data, 'NOTE_EQUITY', 'openingAccumulatedSurplus', 0);

    // Get movements during the period
    const surplusDeficit = getFieldValue(data, 'NOTE_EQUITY', 'currentPeriodSurplus', 0);
    const revaluationGainLoss = getFieldValue(data, 'NOTE_36', 'revaluationMovement', 0) +
                                getFieldValue(data, 'NOTE_38', 'revaluationMovement', 0);
    const transfersToReserves = getFieldValue(data, 'NOTE_EQUITY', 'transfersToReserves', 0);
    const transfersFromReserves = getFieldValue(data, 'NOTE_EQUITY', 'transfersFromReserves', 0);
    const capitalContributions = getFieldValue(data, 'NOTE_EQUITY', 'capitalContributions', 0);
    const dividendsDistributions = getFieldValue(data, 'NOTE_EQUITY', 'dividendsDistributions', 0);

    // Calculate closing balances
    const closingContributedCapital = openingContributedCapital + capitalContributions;
    const closingRevaluation = openingRevaluation + revaluationGainLoss;
    const closingReserves = openingReserves + transfersToReserves - transfersFromReserves;
    const closingAccumulated = openingAccumulated + surplusDeficit - dividendsDistributions -
                              transfersToReserves + transfersFromReserves;

    const openingTotal = openingContributedCapital + openingRevaluation + openingReserves + openingAccumulated;
    const closingTotal = closingContributedCapital + closingRevaluation + closingReserves + closingAccumulated;

    const statement = {
      title: 'Statement of Changes in Net Assets/Equity',
      entityId: entityId,
      period: periodId,
      forPeriod: getPeriodRange(periodId),
      contributedCapital: {
        opening: openingContributedCapital,
        contributions: capitalContributions,
        closing: closingContributedCapital
      },
      revaluationSurplus: {
        opening: openingRevaluation,
        revaluations: revaluationGainLoss,
        closing: closingRevaluation
      },
      reserves: {
        opening: openingReserves,
        transfersIn: transfersToReserves,
        transfersOut: transfersFromReserves,
        closing: closingReserves
      },
      accumulatedSurplus: {
        opening: openingAccumulated,
        surplusDeficit: surplusDeficit,
        dividends: dividendsDistributions,
        transfersToReserves: transfersToReserves,
        transfersFromReserves: transfersFromReserves,
        closing: closingAccumulated
      },
      totals: {
        opening: openingTotal,
        closing: closingTotal
      }
    };

    return {
      success: true,
      statement: statement
    };
  } catch (error) {
    Logger.log('Error generating statement of changes: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates all four financial statements at once
 * @param {Object} params - Parameters
 * @param {string} params.entityId - Entity ID
 * @param {string} params.periodId - Period ID
 * @returns {Object} All statements
 */
function getCompleteFinancialStatements(params) {
  try {
    const { entityId, periodId } = params;

    if (!entityId || !periodId) {
      return {
        success: false,
        error: 'Missing entityId or periodId'
      };
    }

    // Generate all statements
    const positionResult = generateStatementOfFinancialPosition(entityId, periodId);
    const performanceResult = generateStatementOfFinancialPerformance(entityId, periodId);
    const cashFlowResult = generateCashFlowStatement(entityId, periodId);
    const changesResult = generateStatementOfChangesInNetAssets(entityId, periodId);

    // Check for errors
    if (!positionResult.success) return positionResult;
    if (!performanceResult.success) return performanceResult;
    if (!cashFlowResult.success) return cashFlowResult;
    if (!changesResult.success) return changesResult;

    // Get entity and period details
    const entity = getEntityDetails(entityId);
    const period = getPeriodDetails(periodId);

    return {
      success: true,
      entity: {
        id: entity.entityId,
        name: entity.entityName,
        type: entity.entityType
      },
      period: {
        id: period.periodId,
        name: period.periodName,
        year: period.year,
        quarter: period.quarter,
        startDate: period.startDate,
        endDate: period.endDate
      },
      statements: {
        position: positionResult.statement,
        performance: performanceResult.statement,
        cashFlow: cashFlowResult.statement,
        changes: changesResult.statement
      }
    };
  } catch (error) {
    Logger.log('Error getting complete financial statements: ' + error.toString());
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
 * Calculates equity (Net Assets/Equity)
 * @param {Object} data - Entity data
 * @returns {Object} Equity
 */
function calculateEquity(data) {
  // In IPSAS, Net Assets/Equity typically includes:
  // - Accumulated surplus/deficit
  // - Revaluation surplus (from PPE, Investment Property revaluations)
  // - Reserves (various statutory and other reserves)
  // - Contributed capital (if applicable)

  // Get revaluation surplus from PPE and Investment Property
  const ppeRevaluation = getFieldValue(data, 'NOTE_36', 'revaluationSurplus', 0);
  const investmentPropertyRevaluation = getFieldValue(data, 'NOTE_38', 'revaluationSurplus', 0);
  const revaluationSurplus = ppeRevaluation + investmentPropertyRevaluation;

  // Get reserves from various sources
  const generalReserve = getFieldValue(data, 'NOTE_EQUITY', 'generalReserve', 0);
  const capitalReserve = getFieldValue(data, 'NOTE_EQUITY', 'capitalReserve', 0);
  const otherReserves = getFieldValue(data, 'NOTE_EQUITY', 'otherReserves', 0);
  const totalReserves = generalReserve + capitalReserve + otherReserves;

  // Accumulated surplus/deficit (brought forward + current period)
  const broughtForward = getFieldValue(data, 'NOTE_EQUITY', 'accumulatedSurplusBF', 0);
  const currentSurplus = getFieldValue(data, 'NOTE_EQUITY', 'currentPeriodSurplus', 0);
  const accumulatedSurplus = broughtForward + currentSurplus;

  // Contributed capital (for entities with share capital)
  const contributedCapital = getFieldValue(data, 'NOTE_EQUITY', 'contributedCapital', 0);

  const totalEquity = contributedCapital + revaluationSurplus + totalReserves + accumulatedSurplus;

  return {
    contributedCapital: contributedCapital,
    revaluationSurplus: revaluationSurplus,
    reserves: {
      general: generalReserve,
      capital: capitalReserve,
      other: otherReserves,
      total: totalReserves
    },
    accumulatedSurplus: {
      broughtForward: broughtForward,
      currentPeriod: currentSurplus,
      total: accumulatedSurplus
    },
    total: totalEquity
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
  // Revenue-like items (but shown as negative if applicable)
  const otherIncome = getFieldValue(data, 'NOTE_15', 'total', 0);

  // Operating Expenses (Notes 16-24)
  const goodsServices = getFieldValue(data, 'NOTE_16', 'total', 0);
  const employeeCosts = getFieldValue(data, 'NOTE_17', 'total', 0);
  const boardExpenses = getFieldValue(data, 'NOTE_18', 'total', 0);
  const depreciation = getFieldValue(data, 'NOTE_19', 'total', 0);
  const repairs = getFieldValue(data, 'NOTE_20', 'total', 0);
  const contractedServices = getFieldValue(data, 'NOTE_21', 'total', 0);
  const grants = getFieldValue(data, 'NOTE_22', 'total', 0);
  const financeCosts = getFieldValue(data, 'NOTE_23', 'total', 0);
  const socialBenefits = getFieldValue(data, 'NOTE_24', 'total', 0);

  // Other gains/(losses) (Notes 25-29)
  const gainLossSaleAssets = getFieldValue(data, 'NOTE_25', 'total', 0);
  const gainLossForex = getFieldValue(data, 'NOTE_26', 'total', 0);
  const gainLossFairValue = getFieldValue(data, 'NOTE_27', 'total', 0);
  const impairmentLoss = getFieldValue(data, 'NOTE_28', 'total', 0);
  const taxation = getFieldValue(data, 'NOTE_29', 'total', 0);

  // Calculate total expenses (exclude other income and gains)
  const operatingExpenses = goodsServices + employeeCosts + boardExpenses +
                           depreciation + repairs + contractedServices +
                           grants + financeCosts + socialBenefits;

  const otherExpenses = impairmentLoss + taxation;

  const totalExpenses = operatingExpenses + otherExpenses;

  return {
    // Operating expenses
    goodsServices: goodsServices,
    employeeCosts: employeeCosts,
    boardExpenses: boardExpenses,
    depreciation: depreciation,
    repairs: repairs,
    contractedServices: contractedServices,
    grants: grants,
    financeCosts: financeCosts,
    socialBenefits: socialBenefits,

    // Other items
    otherIncome: otherIncome,
    gainLossSaleAssets: gainLossSaleAssets,
    gainLossForex: gainLossForex,
    gainLossFairValue: gainLossFairValue,
    impairmentLoss: impairmentLoss,
    taxation: taxation,

    // Totals
    operatingExpenses: operatingExpenses,
    otherExpenses: otherExpenses,
    total: totalExpenses
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
