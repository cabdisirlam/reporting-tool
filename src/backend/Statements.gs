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
    const entityResult = getEntityById(entityId);
    const periodResult = getPeriodById(periodId);

    if (!entityResult.success || !periodResult.success) {
      return {
        success: false,
        error: 'Failed to get entity or period details'
      };
    }

    const entity = entityResult.entity;
    const period = periodResult.period;

    return {
      success: true,
      entity: {
        id: entity.id,
        name: entity.name,
        type: entity.type
      },
      period: {
        id: period.periodId,
        name: period.periodName,
        year: period.fiscalYear,
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

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Generates a PDF or Excel from financial statement
 * @param {Object} params - Parameters with html, title, entityId, periodId, reportId, format
 * @returns {Object} Result with download URL
 */
function generateStatementPDF(params) {
  try {
    Logger.log('generateStatementPDF called for: ' + params.title + ' format: ' + (params.format || 'PDF'));

    // Route to Excel if format is Excel
    if (params.format && params.format.toUpperCase() === 'EXCEL') {
      return generateStatementExcel({
        entityId: params.entityId,
        periodId: params.periodId,
        reportId: params.reportId
      });
    }

    // Get entity and period details
    const entityResult = getEntityById(params.entityId);
    const periodResult = getPeriodById(params.periodId);

    if (!entityResult.success || !periodResult.success) {
      return {
        success: false,
        error: 'Failed to get entity or period details'
      };
    }

    const entity = entityResult.entity;
    const period = periodResult.period;

    // Create full HTML document with proper styling for PDF
    const fullHTML = createPDFHTML(params.html, params.title, entity, period);

    // Create a temporary Google Doc
    const tempDoc = DocumentApp.create('Statement_' + entity.name + '_' + period.name + '_' + Date.now());
    const body = tempDoc.getBody();

    // Clear default content
    body.clear();

    // Unfortunately, DocumentApp doesn't support direct HTML insertion well
    // So we'll use a different approach: Create a blob from HTML and convert to PDF

    // Create HTML blob
    const htmlBlob = Utilities.newBlob(fullHTML, 'text/html', 'statement.html');

    // Convert HTML to PDF using Drive API
    // We need to use a different approach - create a Google Doc via Drive API

    // Alternative: Use the simpler approach of creating PDF directly from blob
    const pdfBlob = Utilities.newBlob(fullHTML, 'text/html').getAs('application/pdf');

    // Create a file name
    const fileName = sanitizeFileName(params.title + '_' + entity.name + '_' + period.name + '.pdf');

    // Save to Drive in a PDFs folder
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));

    // Make file accessible
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    Logger.log('PDF created successfully: ' + pdfFile.getId());

    return {
      success: true,
      url: pdfFile.getUrl(),
      downloadUrl: pdfFile.getDownloadUrl(),
      fileId: pdfFile.getId(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log('Error generating PDF: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates full HTML document for PDF export
 * @param {string} contentHTML - Statement content HTML
 * @param {string} title - Statement title
 * @param {Object} entity - Entity object
 * @param {Object} period - Period object
 * @returns {string} Complete HTML document
 */
function createPDFHTML(contentHTML, title, entity, period) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
        }
        .statement-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .entity-name {
            font-size: 16pt;
            font-weight: bold;
            margin: 10px 0;
        }
        .statement-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 8px 0;
        }
        .period-info {
            font-size: 11pt;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #000;
            font-weight: bold;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #ccc;
        }
        .indent-1 {
            padding-left: 30px;
        }
        .indent-2 {
            padding-left: 50px;
        }
        .total-row {
            border-top: 2px solid #000;
            border-bottom: 3px double #000;
            font-weight: bold;
        }
        .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
        }
        .note-ref {
            color: #666;
            font-size: 10pt;
        }
        h3 {
            margin-top: 30px;
            margin-bottom: 10px;
            font-size: 13pt;
        }
        @page {
            margin: 2cm;
        }
    </style>
</head>
<body>
    ${contentHTML}
</body>
</html>`;
}

/**
 * Gets or creates the PDF export folder
 * @returns {Folder} PDF folder
 */
function getOrCreatePDFFolder() {
  const folderName = 'SAGA_Statement_PDFs';

  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }

    const folder = DriveApp.createFolder(folderName);
    Logger.log('Created PDF folder: ' + folderName);
    return folder;

  } catch (error) {
    Logger.log('Error getting/creating PDF folder: ' + error.toString());
    // Fall back to root folder
    return DriveApp.getRootFolder();
  }
}

/**
 * Sanitizes a file name for use in Drive
 * @param {string} fileName - Original file name
 * @returns {string} Sanitized file name
 */
function sanitizeFileName(fileName) {
  // Remove or replace invalid characters
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200); // Limit length
}

// ============================================================================
// ADDITIONAL REPORT GENERATORS
// ============================================================================

/**
 * Generates consolidated report PDF or Excel
 * @param {Object} params - Parameters with reportType, periodId, format
 * @returns {Object} Result with download URL
 */
function generateConsolidatedReportPDF(params) {
  try {
    Logger.log('generateConsolidatedReportPDF called for: ' + params.reportType + ' format: ' + (params.format || 'PDF'));

    // Route to Excel if format is Excel
    if (params.format && params.format.toUpperCase() === 'EXCEL') {
      return generateConsolidatedExcel({
        periodId: params.periodId,
        reportType: params.reportType
      });
    }

    // Get all approved entities for the period
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) {
      return {
        success: false,
        error: 'Failed to get entities'
      };
    }

    // Get consolidated data
    const consolidatedData = calculateConsolidatedTotals(
      entitiesResult.entities.map(e => ({ entityId: e.entityId, entityName: e.name })),
      params.reportType.replace('consolidated_', '').toUpperCase()
    );

    // Create HTML for consolidated report
    const html = createConsolidatedReportHTML(consolidatedData, params);

    // Generate PDF
    const fileName = 'Consolidated_' + params.reportType + '_' + params.periodId + '.pdf';
    const pdfBlob = Utilities.newBlob(html, 'text/html').getAs('application/pdf');
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: pdfFile.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log('Error generating consolidated report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates budget comparison PDF
 * @param {Object} params - Parameters with entityId, periodId, format
 * @returns {Object} Result with PDF URL
 */
function generateBudgetComparisonPDF(params) {
  try {
    Logger.log('generateBudgetComparisonPDF called');

    // Get budget and actual data
    const budgetData = getBudgetData(params.entityId, params.periodId);
    const actualData = getActualData(params.entityId, params.periodId);

    // Create HTML for budget report
    const html = createBudgetComparisonHTML(budgetData, actualData, params);

    // Generate PDF
    const fileName = 'Budget_Comparison_' + params.entityId + '_' + params.periodId + '.pdf';
    const pdfBlob = Utilities.newBlob(html, 'text/html').getAs('application/pdf');
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: pdfFile.getUrl(),
      fileName: fileName
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
 * Generates notes disclosure PDF
 * @param {Object} params - Parameters with entityId, periodId, format
 * @returns {Object} Result with PDF URL
 */
function generateNotesDisclosurePDF(params) {
  try {
    Logger.log('generateNotesDisclosurePDF called');

    // Get all notes data
    const notesResult = getAllEntityNoteData(params.entityId, params.periodId);
    if (!notesResult.success) {
      return {
        success: false,
        error: 'Failed to get notes data'
      };
    }

    // Create HTML for notes
    const html = createNotesDisclosureHTML(notesResult.data, params);

    // Generate PDF
    const fileName = 'Notes_Disclosure_' + params.entityId + '_' + params.periodId + '.pdf';
    const pdfBlob = Utilities.newBlob(html, 'text/html').getAs('application/pdf');
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: pdfFile.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log('Error generating notes disclosure: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates submission summary PDF
 * @param {Object} params - Parameters with periodId, format
 * @returns {Object} Result with PDF URL
 */
function generateSubmissionSummaryPDF(params) {
  try {
    Logger.log('generateSubmissionSummaryPDF called');

    // Get submission summary
    const summary = getSubmissionSummaryReport(params.periodId);

    // Create HTML for summary
    const html = createSubmissionSummaryHTML(summary, params);

    // Generate PDF
    const fileName = 'Submission_Summary_' + params.periodId + '.pdf';
    const pdfBlob = Utilities.newBlob(html, 'text/html').getAs('application/pdf');
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: pdfFile.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log('Error generating submission summary: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generic report PDF generator
 * @param {Object} params - Parameters with reportId, entityId, periodId, format
 * @returns {Object} Result with PDF URL
 */
function generateReportPDF(params) {
  try {
    Logger.log('generateReportPDF called for: ' + params.reportId);

    // Create simple HTML report
    const html = createGenericReportHTML(params);

    // Generate PDF
    const fileName = sanitizeFileName(params.reportId + '_' + (params.entityId || 'consolidated') + '_' + params.periodId + '.pdf');
    const pdfBlob = Utilities.newBlob(html, 'text/html').getAs('application/pdf');
    const pdfFolder = getOrCreatePDFFolder();
    const pdfFile = pdfFolder.createFile(pdfBlob.setName(fileName));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: pdfFile.getUrl(),
      fileName: fileName,
      message: 'Report generated successfully'
    };

  } catch (error) {
    Logger.log('Error generating report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// HTML GENERATORS FOR ADDITIONAL REPORTS
// ============================================================================

/**
 * Creates HTML for consolidated report
 */
function createConsolidatedReportHTML(data, params) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #667eea; color: white; }
        .amount { text-align: right; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <h1>Consolidated Financial Report</h1>
    <h2>${params.reportType.replace('_', ' ').toUpperCase()}</h2>
    <p>Period: ${params.periodId}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table>
        <tr><th>Description</th><th class="amount">Amount (KES)</th></tr>
        <tr><td>Total Assets</td><td class="amount">${(data.summary?.totalAssets || 0).toLocaleString()}</td></tr>
        <tr><td>Total Revenue</td><td class="amount">${(data.summary?.totalRevenue || 0).toLocaleString()}</td></tr>
        <tr><td>Total Expenses</td><td class="amount">${(data.summary?.totalExpenses || 0).toLocaleString()}</td></tr>
    </table>
    <p><em>This report consolidates data from ${data.entityCount || 0} entities.</em></p>
</body>
</html>`;
}

/**
 * Creates HTML for budget comparison
 */
function createBudgetComparisonHTML(budgetData, actualData, params) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #667eea; color: white; }
        .amount { text-align: right; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <h1>Budget vs Actual Comparison</h1>
    <p>Entity: ${params.entityId}</p>
    <p>Period: ${params.periodId}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table>
        <tr><th>Category</th><th class="amount">Budget</th><th class="amount">Actual</th><th class="amount">Variance</th></tr>
        <tr><td colspan="4"><em>Budget comparison data will be populated from budget entries.</em></td></tr>
    </table>
</body>
</html>`;
}

/**
 * Creates HTML for notes disclosure
 */
function createNotesDisclosureHTML(notesData, params) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        h2 { color: #667eea; margin-top: 30px; }
        .note { margin-bottom: 20px; padding: 15px; border-left: 3px solid #667eea; }
    </style>
</head>
<body>
    <h1>Notes to Financial Statements</h1>
    <p>Entity: ${params.entityId}</p>
    <p>Period: ${params.periodId}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    ${Object.keys(notesData || {}).map((noteId, index) => `
        <div class="note">
            <h2>Note ${index + 1}: ${noteId}</h2>
            <p>${JSON.stringify(notesData[noteId].data || {}, null, 2)}</p>
        </div>
    `).join('')}
</body>
</html>`;
}

/**
 * Creates HTML for submission summary
 */
function createSubmissionSummaryHTML(summary, params) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #667eea; color: white; }
    </style>
</head>
<body>
    <h1>Submission Summary Report</h1>
    <p>Period: ${params.periodId}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table>
        <tr><th>Entity</th><th>Status</th><th>Submitted Date</th><th>Approved Date</th></tr>
        <tr><td colspan="4"><em>Submission data will be populated from approval records.</em></td></tr>
    </table>
</body>
</html>`;
}

/**
 * Creates generic HTML report
 */
function createGenericReportHTML(params) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
        h1 { color: #333; }
        .info { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 600px; }
    </style>
</head>
<body>
    <h1>Report Generated</h1>
    <div class="info">
        <p><strong>Report Type:</strong> ${params.reportId}</p>
        <p><strong>Entity:</strong> ${params.entityId || 'All'}</p>
        <p><strong>Period:</strong> ${params.periodId}</p>
        <p><strong>Format:</strong> ${params.format}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p><em>This report type is available and can be customized with specific data.</em></p>
</body>
</html>`;
}

/**
 * Helper: Get budget data
 */
function getBudgetData(entityId, periodId) {
  // Placeholder - would fetch from Budget sheet
  return {};
}

/**
 * Helper: Get actual data
 */
function getActualData(entityId, periodId) {
  // Placeholder - would fetch from entity data
  return {};
}

// ============================================================================
// EXCEL EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Generates Excel export for individual entity statements
 * @param {Object} params - Parameters with entityId, periodId, reportId
 * @returns {Object} Result with download URL
 */
function generateStatementExcel(params) {
  try {
    Logger.log('generateStatementExcel called for: ' + params.entityId);

    // Get entity and period details
    const entityResult = getEntityById(params.entityId);
    const periodResult = getPeriodById(params.periodId);

    if (!entityResult.success || !periodResult.success) {
      return {
        success: false,
        error: 'Failed to get entity or period details'
      };
    }

    const entity = entityResult.entity;
    const period = periodResult.period;

    // Get all financial statements data
    const statements = getCompleteFinancialStatements({
      entityId: params.entityId,
      periodId: params.periodId
    });

    if (!statements.success) {
      return {
        success: false,
        error: 'Failed to get statement data'
      };
    }

    // Create new spreadsheet
    const fileName = sanitizeFileName(`${entity.name}_Financial_Statements_${period.name}`);
    const spreadsheet = SpreadsheetApp.create(fileName);

    // Create sheets for each statement
    createPositionSheet(spreadsheet, statements.statements.position, entity, period);
    createPerformanceSheet(spreadsheet, statements.statements.performance, entity, period);
    createCashFlowSheet(spreadsheet, statements.statements.cashflow, entity, period);
    createChangesSheet(spreadsheet, statements.statements.changes, entity, period);

    // Delete default sheet
    const defaultSheet = spreadsheet.getSheetByName('Sheet1');
    if (defaultSheet) {
      spreadsheet.deleteSheet(defaultSheet);
    }

    // Convert to Excel and save to Drive
    const excelBlob = convertToExcel(spreadsheet);
    const excelFolder = getOrCreateExcelFolder();
    const excelFile = excelFolder.createFile(excelBlob.setName(fileName + '.xlsx'));
    excelFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Delete temporary spreadsheet
    DriveApp.getFileById(spreadsheet.getId()).setTrashed(true);

    Logger.log('Excel file created: ' + excelFile.getId());

    return {
      success: true,
      url: excelFile.getUrl(),
      downloadUrl: excelFile.getDownloadUrl(),
      fileId: excelFile.getId(),
      fileName: fileName + '.xlsx'
    };

  } catch (error) {
    Logger.log('Error generating Excel: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates consolidated Excel export (all entities)
 * @param {Object} params - Parameters with periodId, reportType
 * @returns {Object} Result with download URL
 */
function generateConsolidatedExcel(params) {
  try {
    Logger.log('generateConsolidatedExcel called for period: ' + params.periodId);

    // Get all active entities
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) {
      return {
        success: false,
        error: 'Failed to get entities'
      };
    }

    // Get period details
    const periodResult = getPeriodById(params.periodId);
    if (!periodResult.success) {
      return {
        success: false,
        error: 'Failed to get period details'
      };
    }

    const period = periodResult.period;
    const entities = entitiesResult.entities;

    // Create new spreadsheet
    const fileName = sanitizeFileName(`Consolidated_Report_${period.name}`);
    const spreadsheet = SpreadsheetApp.create(fileName);

    // Create summary sheet with consolidated totals
    createConsolidatedSummarySheet(spreadsheet, entities, params.periodId, period);

    // Create individual entity sheets
    entities.forEach((entity, index) => {
      if (index < 20) { // Limit to 20 entities to avoid timeout
        createEntitySummarySheet(spreadsheet, entity, params.periodId, period);
      }
    });

    // Delete default sheet
    const defaultSheet = spreadsheet.getSheetByName('Sheet1');
    if (defaultSheet) {
      spreadsheet.deleteSheet(defaultSheet);
    }

    // Convert to Excel and save to Drive
    const excelBlob = convertToExcel(spreadsheet);
    const excelFolder = getOrCreateExcelFolder();
    const excelFile = excelFolder.createFile(excelBlob.setName(fileName + '.xlsx'));
    excelFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Delete temporary spreadsheet
    DriveApp.getFileById(spreadsheet.getId()).setTrashed(true);

    Logger.log('Consolidated Excel created: ' + excelFile.getId());

    return {
      success: true,
      url: excelFile.getUrl(),
      downloadUrl: excelFile.getDownloadUrl(),
      fileId: excelFile.getId(),
      fileName: fileName + '.xlsx'
    };

  } catch (error) {
    Logger.log('Error generating consolidated Excel: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// EXCEL SHEET CREATION FUNCTIONS
// ============================================================================

/**
 * Creates Statement of Financial Position sheet
 */
function createPositionSheet(spreadsheet, statement, entity, period) {
  const sheet = spreadsheet.insertSheet('Financial Position');

  // Header
  sheet.getRange('A1:D1').merge().setValue('STATEMENT OF FINANCIAL POSITION');
  sheet.getRange('A2:D2').merge().setValue(entity.name || 'Entity');
  sheet.getRange('A3:D3').merge().setValue(`Period: ${period.name || ''} (${period.year || ''})`);

  // Format header
  sheet.getRange('A1:D3').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A1').setFontSize(14);

  let row = 5;

  // Column headers
  sheet.getRange(row, 1, 1, 4).setValues([['Description', 'Note', 'Current Year (KES)', 'Prior Year (KES)']]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  // Assets
  sheet.getRange(row, 1).setValue('ASSETS').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1).setValue('Current Assets').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Cash and Cash Equivalents', '30', statement.assets?.current?.cash || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Receivables', '32', statement.assets?.current?.receivables || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Inventories', '34', statement.assets?.current?.inventories || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Current Assets', '', statement.assets?.current?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  sheet.getRange(row, 1).setValue('Non-Current Assets').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Property, Plant & Equipment', '36', statement.assets?.nonCurrent?.ppe || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Intangible Assets', '37', statement.assets?.nonCurrent?.intangibles || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Non-Current Assets', '', statement.assets?.nonCurrent?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  sheet.getRange(row, 1, 1, 4).setValues([['TOTAL ASSETS', '', statement.assets?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#e8f0fe');
  row += 2;

  // Liabilities
  sheet.getRange(row, 1).setValue('LIABILITIES').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1).setValue('Current Liabilities').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Payables', '45', statement.liabilities?.current?.payables || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Current Liabilities', '', statement.liabilities?.current?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  sheet.getRange(row, 1).setValue('Non-Current Liabilities').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Borrowings', '50', statement.liabilities?.nonCurrent?.borrowings || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Non-Current Liabilities', '', statement.liabilities?.nonCurrent?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  sheet.getRange(row, 1, 1, 4).setValues([['TOTAL LIABILITIES', '', statement.liabilities?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  sheet.getRange(row, 1, 1, 4).setValues([['NET ASSETS', '', statement.netAssets || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#d4e9d4');

  // Format currency columns
  sheet.getRange(6, 3, row - 5, 2).setNumberFormat('#,##0.00');

  // Auto-resize columns
  sheet.autoResizeColumns(1, 4);
}

/**
 * Creates Statement of Financial Performance sheet
 */
function createPerformanceSheet(spreadsheet, statement, entity, period) {
  const sheet = spreadsheet.insertSheet('Financial Performance');

  // Header
  sheet.getRange('A1:D1').merge().setValue('STATEMENT OF FINANCIAL PERFORMANCE');
  sheet.getRange('A2:D2').merge().setValue(entity.name || 'Entity');
  sheet.getRange('A3:D3').merge().setValue(`Period: ${period.name || ''} (${period.year || ''})`);

  sheet.getRange('A1:D3').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A1').setFontSize(14);

  let row = 5;

  // Column headers
  sheet.getRange(row, 1, 1, 4).setValues([['Description', 'Note', 'Current Year (KES)', 'Prior Year (KES)']]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  // Revenue
  sheet.getRange(row, 1).setValue('REVENUE').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Exchange Revenue', '6', statement.revenue?.exchange || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Non-Exchange Revenue', '7', statement.revenue?.nonExchange || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Revenue', '', statement.revenue?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  // Expenses
  sheet.getRange(row, 1).setValue('EXPENSES').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Employee Costs', '15', statement.expenses?.employeeCosts || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['  Depreciation', '16', statement.expenses?.depreciation || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Total Expenses', '', statement.expenses?.total || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
  row += 2;

  // Surplus/Deficit
  sheet.getRange(row, 1, 1, 4).setValues([['SURPLUS/(DEFICIT)', '', statement.surplus || 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#d4e9d4');

  // Format currency columns
  sheet.getRange(6, 3, row - 5, 2).setNumberFormat('#,##0.00');

  sheet.autoResizeColumns(1, 4);
}

/**
 * Creates Statement of Cash Flows sheet
 */
function createCashFlowSheet(spreadsheet, statement, entity, period) {
  const sheet = spreadsheet.insertSheet('Cash Flow');

  // Header
  sheet.getRange('A1:C1').merge().setValue('STATEMENT OF CASH FLOWS');
  sheet.getRange('A2:C2').merge().setValue(entity.name || 'Entity');
  sheet.getRange('A3:C3').merge().setValue(`Period: ${period.name || ''} (${period.year || ''})`);

  sheet.getRange('A1:C3').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A1').setFontSize(14);

  let row = 5;

  // Column headers
  sheet.getRange(row, 1, 1, 3).setValues([['Description', 'Current Year (KES)', 'Prior Year (KES)']]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  // Operating Activities
  sheet.getRange(row, 1).setValue('OPERATING ACTIVITIES').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['  Cash Receipts from Operations', statement.operating?.receipts || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['  Cash Payments for Operations', -(statement.operating?.payments || 0), 0]]);
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['Net Cash from Operating Activities', statement.operating?.net || 0, 0]]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
  row += 2;

  // Investing Activities
  sheet.getRange(row, 1).setValue('INVESTING ACTIVITIES').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['  Purchase of PPE', -(statement.investing?.payments || 0), 0]]);
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['Net Cash from Investing Activities', statement.investing?.net || 0, 0]]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
  row += 2;

  // Financing Activities
  sheet.getRange(row, 1).setValue('FINANCING ACTIVITIES').setFontWeight('bold');
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['  Borrowings Received', statement.financing?.receipts || 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['  Borrowings Repaid', -(statement.financing?.payments || 0), 0]]);
  row++;
  sheet.getRange(row, 1, 1, 3).setValues([['Net Cash from Financing Activities', statement.financing?.net || 0, 0]]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
  row += 2;

  // Net Increase/Decrease
  sheet.getRange(row, 1, 1, 3).setValues([['NET INCREASE/(DECREASE) IN CASH', statement.netIncrease || 0, 0]]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  sheet.getRange(row, 1, 1, 3).setValues([['Cash at Beginning of Period', statement.openingCash || 0, 0]]);
  row++;

  sheet.getRange(row, 1, 1, 3).setValues([['CASH AT END OF PERIOD', statement.closingCash || 0, 0]]);
  sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#d4e9d4');

  // Format currency columns
  sheet.getRange(6, 2, row - 5, 2).setNumberFormat('#,##0.00');

  sheet.autoResizeColumns(1, 3);
}

/**
 * Creates Statement of Changes in Net Assets sheet
 */
function createChangesSheet(spreadsheet, statement, entity, period) {
  const sheet = spreadsheet.insertSheet('Changes in Net Assets');

  // Header
  sheet.getRange('A1:D1').merge().setValue('STATEMENT OF CHANGES IN NET ASSETS');
  sheet.getRange('A2:D2').merge().setValue(entity.name || 'Entity');
  sheet.getRange('A3:D3').merge().setValue(`Period: ${period.name || ''} (${period.year || ''})`);

  sheet.getRange('A1:D3').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A1').setFontSize(14);

  let row = 5;

  // Column headers
  sheet.getRange(row, 1, 1, 4).setValues([['Description', 'Accumulated Surplus (KES)', 'Revaluation Reserve (KES)', 'Total (KES)']]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  sheet.getRange(row, 1, 1, 4).setValues([['Opening Balance', 0, 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Surplus for the Period', 0, '-', 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Revaluation', '-', 0, 0]]);
  row++;
  sheet.getRange(row, 1, 1, 4).setValues([['Closing Balance', 0, 0, 0]]);
  sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#d4e9d4');

  // Format currency columns
  sheet.getRange(6, 2, row - 5, 3).setNumberFormat('#,##0.00');

  sheet.autoResizeColumns(1, 4);
}

/**
 * Creates consolidated summary sheet
 */
function createConsolidatedSummarySheet(spreadsheet, entities, periodId, period) {
  const sheet = spreadsheet.insertSheet('Consolidated Summary');

  // Header
  sheet.getRange('A1:D1').merge().setValue('CONSOLIDATED FINANCIAL SUMMARY');
  sheet.getRange('A2:D2').merge().setValue(`Period: ${period.name || ''} (${period.year || ''})`);
  sheet.getRange('A3:D3').merge().setValue(`Number of Entities: ${entities.length}`);

  sheet.getRange('A1:D3').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A1').setFontSize(14);

  let row = 5;

  // Column headers
  sheet.getRange(row, 1, 1, 2).setValues([['Description', 'Amount (KES)']]);
  sheet.getRange(row, 1, 1, 2).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  // Calculate consolidated totals
  let totalAssets = 0;
  let totalRevenue = 0;
  let totalExpenses = 0;

  entities.forEach(entity => {
    const entityData = getAllEntityNoteData(entity.entityId, periodId);
    if (entityData.success) {
      // Sum up totals from each entity (simplified)
      totalAssets += 1000000; // Placeholder
      totalRevenue += 500000; // Placeholder
      totalExpenses += 400000; // Placeholder
    }
  });

  sheet.getRange(row, 1, 1, 2).setValues([['Total Assets', totalAssets]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Total Revenue', totalRevenue]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Total Expenses', totalExpenses]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Net Surplus', totalRevenue - totalExpenses]]);
  sheet.getRange(row, 1, 1, 2).setFontWeight('bold').setBackground('#d4e9d4');

  // Format currency column
  sheet.getRange(6, 2, row - 5, 1).setNumberFormat('#,##0.00');

  sheet.autoResizeColumns(1, 2);
}

/**
 * Creates individual entity summary sheet
 */
function createEntitySummarySheet(spreadsheet, entity, periodId, period) {
  const sheetName = entity.name.substring(0, 30); // Limit sheet name length
  const sheet = spreadsheet.insertSheet(sheetName);

  // Header
  sheet.getRange('A1:C1').merge().setValue(entity.name);
  sheet.getRange('A2:C2').merge().setValue(`Period: ${period.name || ''}`);

  sheet.getRange('A1:C2').setFontWeight('bold').setHorizontalAlignment('center');

  let row = 4;

  // Column headers
  sheet.getRange(row, 1, 1, 2).setValues([['Item', 'Amount (KES)']]);
  sheet.getRange(row, 1, 1, 2).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  row++;

  // Get entity data
  const entityData = getAllEntityNoteData(entity.entityId, periodId);

  // Add placeholder data
  sheet.getRange(row, 1, 1, 2).setValues([['Total Assets', 1000000]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Total Revenue', 500000]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Total Expenses', 400000]]);
  row++;
  sheet.getRange(row, 1, 1, 2).setValues([['Net Surplus', 100000]]);

  // Format currency column
  sheet.getRange(5, 2, row - 4, 1).setNumberFormat('#,##0.00');

  sheet.autoResizeColumns(1, 2);
}

// ============================================================================
// EXCEL HELPER FUNCTIONS
// ============================================================================

/**
 * Converts a Google Sheets spreadsheet to Excel format
 */
function convertToExcel(spreadsheet) {
  const url = 'https://docs.google.com/spreadsheets/d/' + spreadsheet.getId() + '/export?format=xlsx';
  const params = {
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, params);
  return response.getBlob();
}

/**
 * Gets or creates Excel export folder
 */
function getOrCreateExcelFolder() {
  const folderName = 'SAGA_Statement_Excel';

  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }

    const folder = DriveApp.createFolder(folderName);
    Logger.log('Created Excel folder: ' + folderName);
    return folder;

  } catch (error) {
    Logger.log('Error getting/creating Excel folder: ' + error.toString());
    return DriveApp.getRootFolder();
  }
}
