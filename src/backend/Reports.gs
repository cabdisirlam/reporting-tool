/**
 * Reports.gs - Report Generation
 *
 * Handles:
 * - Report generation
 * - Export to Excel/PDF
 * - Consolidated reports
 * - Custom report queries
 */

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generates entity report
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {string} reportType - Type of report
 * @returns {Object} Report data
 */
function generateEntityReport(entityId, periodId, reportType) {
  try {
    const entityResult = getEntityById(entityId);
    if (!entityResult.success) return entityResult;

    const entity = entityResult.entity;

    // Get all entity data
    const dataResult = getAllEntityNoteData(entityId, periodId);
    if (!dataResult.success) return dataResult;

    const reportData = {
      entity: entity,
      period: periodId,
      reportType: reportType,
      generatedDate: new Date(),
      data: {}
    };

    switch(reportType) {
      case 'COMPLETE':
        reportData.data = generateCompleteReport(entity, periodId, dataResult.data);
        break;

      case 'FINANCIAL_POSITION':
        reportData.data = generateFinancialPositionReport(dataResult.data);
        break;

      case 'FINANCIAL_PERFORMANCE':
        reportData.data = generateFinancialPerformanceReport(dataResult.data);
        break;

      case 'CASH_FLOW':
        reportData.data = generateCashFlowReport(dataResult.data);
        break;

      case 'BUDGET_COMPARISON':
        reportData.data = generateBudgetComparisonReport(dataResult.data);
        break;

      default:
        return {
          success: false,
          error: 'Invalid report type'
        };
    }

    return {
      success: true,
      report: reportData
    };
  } catch (error) {
    Logger.log('Error generating report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates consolidated report for all entities
 * @param {string} periodId - Period ID
 * @param {string} reportType - Type of report
 * @returns {Object} Consolidated report
 */
function generateConsolidatedReport(periodId, reportType) {
  try {
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) return entitiesResult;

    const consolidatedData = {
      period: periodId,
      reportType: reportType,
      generatedDate: new Date(),
      entities: [],
      totals: {}
    };

    // Aggregate data from all entities
    entitiesResult.entities.forEach(entity => {
      const dataResult = getAllEntityNoteData(entity.id, periodId);
      if (dataResult.success && dataResult.data) {
        consolidatedData.entities.push({
          entityId: entity.id,
          entityName: entity.name,
          data: dataResult.data
        });
      }
    });

    // Calculate consolidated totals
    consolidatedData.totals = calculateConsolidatedTotals(consolidatedData.entities, reportType);

    return {
      success: true,
      report: consolidatedData
    };
  } catch (error) {
    Logger.log('Error generating consolidated report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// SPECIFIC REPORT GENERATORS
// ============================================================================

/**
 * Generates complete report with all notes
 * @param {Object} entity - Entity object
 * @param {string} periodId - Period ID
 * @param {Object} data - Entity data
 * @returns {Object} Complete report
 */
function generateCompleteReport(entity, periodId, data) {
  return {
    entityInfo: {
      name: entity.name,
      code: entity.code,
      type: entity.type,
      sector: entity.sector
    },
    period: periodId,
    financialPosition: generateFinancialPositionReport(data),
    financialPerformance: generateFinancialPerformanceReport(data),
    cashFlow: generateCashFlowReport(data),
    budget: generateBudgetComparisonReport(data),
    notes: data
  };
}

/**
 * Generates financial position report
 * @param {Object} data - Entity data
 * @returns {Object} Financial position
 */
function generateFinancialPositionReport(data) {
  return {
    assets: {
      current: {
        cash: extractNoteData(data, 'NOTE_30'),
        receivables: extractNoteData(data, 'NOTE_32'),
        inventories: extractNoteData(data, 'NOTE_34')
      },
      nonCurrent: {
        ppe: extractNoteData(data, 'NOTE_36'),
        intangibles: extractNoteData(data, 'NOTE_37')
      }
    },
    liabilities: {
      current: {
        payables: extractNoteData(data, 'NOTE_45')
      },
      nonCurrent: {
        borrowings: extractNoteData(data, 'NOTE_50')
      }
    }
  };
}

/**
 * Generates financial performance report
 * @param {Object} data - Entity data
 * @returns {Object} Financial performance
 */
function generateFinancialPerformanceReport(data) {
  return {
    revenue: extractNoteData(data, 'NOTE_06'),
    nonExchangeRevenue: extractNoteData(data, 'NOTE_07'),
    expenses: {
      employeeCosts: extractNoteData(data, 'NOTE_15'),
      depreciation: extractNoteData(data, 'NOTE_16')
    }
  };
}

/**
 * Generates cash flow report
 * @param {Object} data - Entity data
 * @returns {Object} Cash flow
 */
function generateCashFlowReport(data) {
  return extractNoteData(data, 'NOTE_CF');
}

/**
 * Generates budget comparison report
 * @param {Object} data - Entity data
 * @returns {Object} Budget comparison
 */
function generateBudgetComparisonReport(data) {
  return extractNoteData(data, 'NOTE_BUD');
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Exports report to Excel
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {string} reportType - Report type
 * @returns {Object} Export result with file
 */
function exportToExcel(entityId, periodId, reportType) {
  try {
    const reportResult = generateEntityReport(entityId, periodId, reportType);
    if (!reportResult.success) return reportResult;

    // Create new spreadsheet
    const ss = SpreadsheetApp.create(`Report_${entityId}_${periodId}_${reportType}`);
    const sheet = ss.getActiveSheet();

    // Format report data to sheet
    formatReportToSheet(sheet, reportResult.report);

    return {
      success: true,
      fileId: ss.getId(),
      fileUrl: ss.getUrl(),
      fileName: ss.getName()
    };
  } catch (error) {
    Logger.log('Error exporting to Excel: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Exports report to PDF
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @param {string} reportType - Report type
 * @returns {Object} Export result with file
 */
function exportToPDF(entityId, periodId, reportType) {
  try {
    // First export to Excel
    const excelResult = exportToExcel(entityId, periodId, reportType);
    if (!excelResult.success) return excelResult;

    // Convert to PDF
    const ss = SpreadsheetApp.openById(excelResult.fileId);
    const pdfBlob = ss.getAs('application/pdf');

    // Save to Drive
    const folder = DriveApp.getRootFolder(); // Or specific folder
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName(`Report_${entityId}_${periodId}_${reportType}.pdf`);

    // Delete the temporary spreadsheet
    DriveApp.getFileById(excelResult.fileId).setTrashed(true);

    return {
      success: true,
      fileId: pdfFile.getId(),
      fileUrl: pdfFile.getUrl(),
      fileName: pdfFile.getName()
    };
  } catch (error) {
    Logger.log('Error exporting to PDF: ' + error.toString());
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
 * Extracts note data
 * @param {Object} data - Entity data
 * @param {string} noteId - Note ID
 * @returns {Object} Note data
 */
function extractNoteData(data, noteId) {
  if (data[noteId]) {
    return data[noteId].data;
  }
  return null;
}

/**
 * Calculates consolidated totals across all entities
 * @param {Array} entities - Array of entity data objects {entityId, entityName, data}
 * @param {string} reportType - Report type (FINANCIAL_POSITION, FINANCIAL_PERFORMANCE, CASH_FLOW, etc.)
 * @returns {Object} Consolidated totals aggregated from all entities
 */
function calculateConsolidatedTotals(entities, reportType) {
  try {
    Logger.log('calculateConsolidatedTotals: Processing ' + entities.length + ' entities for type ' + reportType);

    const totals = {
      entityCount: entities.length,
      reportType: reportType,
      consolidatedDate: new Date()
    };

    // Initialize consolidated financial statement structures based on report type
    switch (reportType) {
      case 'FINANCIAL_POSITION':
        totals.assets = consolidateAssets(entities);
        totals.liabilities = consolidateLiabilities(entities);
        totals.netAssets = calculateNetAssets(totals.assets, totals.liabilities);
        break;

      case 'FINANCIAL_PERFORMANCE':
        totals.revenue = consolidateRevenue(entities);
        totals.expenses = consolidateExpenses(entities);
        totals.surplus = calculateSurplusDeficit(totals.revenue, totals.expenses);
        break;

      case 'CASH_FLOW':
        totals.operating = consolidateCashFlowOperating(entities);
        totals.investing = consolidateCashFlowInvesting(entities);
        totals.financing = consolidateCashFlowFinancing(entities);
        totals.netCashFlow = calculateNetCashFlow(totals.operating, totals.investing, totals.financing);
        break;

      case 'BUDGET_COMPARISON':
        totals.budget = consolidateBudget(entities);
        totals.actual = consolidateActual(entities);
        totals.variance = calculateBudgetVariance(totals.budget, totals.actual);
        break;

      case 'COMPLETE':
        // Aggregate all statement types
        totals.financialPosition = {
          assets: consolidateAssets(entities),
          liabilities: consolidateLiabilities(entities)
        };
        totals.financialPosition.netAssets = calculateNetAssets(
          totals.financialPosition.assets,
          totals.financialPosition.liabilities
        );

        totals.financialPerformance = {
          revenue: consolidateRevenue(entities),
          expenses: consolidateExpenses(entities)
        };
        totals.financialPerformance.surplus = calculateSurplusDeficit(
          totals.financialPerformance.revenue,
          totals.financialPerformance.expenses
        );

        totals.cashFlow = {
          operating: consolidateCashFlowOperating(entities),
          investing: consolidateCashFlowInvesting(entities),
          financing: consolidateCashFlowFinancing(entities)
        };
        totals.cashFlow.netCashFlow = calculateNetCashFlow(
          totals.cashFlow.operating,
          totals.cashFlow.investing,
          totals.cashFlow.financing
        );
        break;

      default:
        Logger.log('calculateConsolidatedTotals: Unknown report type: ' + reportType);
    }

    // Add summary metadata
    totals.summary = {
      totalAssets: totals.assets ? sumObjectValues(totals.assets) : 0,
      totalRevenue: totals.revenue ? sumObjectValues(totals.revenue) : 0,
      totalExpenses: totals.expenses ? sumObjectValues(totals.expenses) : 0
    };

    Logger.log('calculateConsolidatedTotals: Consolidation complete');
    return totals;

  } catch (error) {
    Logger.log('Error in calculateConsolidatedTotals: ' + error.toString());
    return {
      error: error.toString(),
      entityCount: entities.length,
      reportType: reportType
    };
  }
}

// ============================================================================
// CONSOLIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Consolidates assets from all entities
 */
function consolidateAssets(entities) {
  const consolidated = {
    currentAssets: {
      cash: 0,
      receivables: 0,
      inventories: 0,
      prepayments: 0,
      otherCurrentAssets: 0
    },
    nonCurrentAssets: {
      propertyPlantEquipment: 0,
      intangibleAssets: 0,
      investments: 0,
      otherNonCurrentAssets: 0
    }
  };

  entities.forEach(entity => {
    if (entity.data) {
      // Aggregate current assets
      consolidated.currentAssets.cash += getNumericValue(entity.data, 'NOTE_30', 'total') || 0;
      consolidated.currentAssets.receivables += getNumericValue(entity.data, 'NOTE_32', 'total') || 0;
      consolidated.currentAssets.inventories += getNumericValue(entity.data, 'NOTE_34', 'total') || 0;
      consolidated.currentAssets.prepayments += getNumericValue(entity.data, 'NOTE_35', 'total') || 0;

      // Aggregate non-current assets
      consolidated.nonCurrentAssets.propertyPlantEquipment += getNumericValue(entity.data, 'NOTE_36', 'total') || 0;
      consolidated.nonCurrentAssets.intangibleAssets += getNumericValue(entity.data, 'NOTE_37', 'total') || 0;
      consolidated.nonCurrentAssets.investments += getNumericValue(entity.data, 'NOTE_38', 'total') || 0;
    }
  });

  // Calculate subtotals
  consolidated.currentAssets.total = sumObjectValues(consolidated.currentAssets);
  consolidated.nonCurrentAssets.total = sumObjectValues(consolidated.nonCurrentAssets);
  consolidated.total = consolidated.currentAssets.total + consolidated.nonCurrentAssets.total;

  return consolidated;
}

/**
 * Consolidates liabilities from all entities
 */
function consolidateLiabilities(entities) {
  const consolidated = {
    currentLiabilities: {
      payables: 0,
      provisions: 0,
      borrowings: 0,
      otherCurrentLiabilities: 0
    },
    nonCurrentLiabilities: {
      longTermBorrowings: 0,
      provisions: 0,
      otherNonCurrentLiabilities: 0
    }
  };

  entities.forEach(entity => {
    if (entity.data) {
      // Aggregate current liabilities
      consolidated.currentLiabilities.payables += getNumericValue(entity.data, 'NOTE_45', 'total') || 0;
      consolidated.currentLiabilities.provisions += getNumericValue(entity.data, 'NOTE_46', 'total') || 0;
      consolidated.currentLiabilities.borrowings += getNumericValue(entity.data, 'NOTE_48', 'total') || 0;

      // Aggregate non-current liabilities
      consolidated.nonCurrentLiabilities.longTermBorrowings += getNumericValue(entity.data, 'NOTE_50', 'total') || 0;
      consolidated.nonCurrentLiabilities.provisions += getNumericValue(entity.data, 'NOTE_51', 'total') || 0;
    }
  });

  // Calculate subtotals
  consolidated.currentLiabilities.total = sumObjectValues(consolidated.currentLiabilities);
  consolidated.nonCurrentLiabilities.total = sumObjectValues(consolidated.nonCurrentLiabilities);
  consolidated.total = consolidated.currentLiabilities.total + consolidated.nonCurrentLiabilities.total;

  return consolidated;
}

/**
 * Consolidates revenue from all entities
 */
function consolidateRevenue(entities) {
  const consolidated = {
    exchangeRevenue: 0,
    nonExchangeRevenue: 0,
    grants: 0,
    otherRevenue: 0
  };

  entities.forEach(entity => {
    if (entity.data) {
      consolidated.exchangeRevenue += getNumericValue(entity.data, 'NOTE_06', 'total') || 0;
      consolidated.nonExchangeRevenue += getNumericValue(entity.data, 'NOTE_07', 'total') || 0;
      consolidated.grants += getNumericValue(entity.data, 'NOTE_08', 'total') || 0;
      consolidated.otherRevenue += getNumericValue(entity.data, 'NOTE_09', 'total') || 0;
    }
  });

  consolidated.total = sumObjectValues(consolidated);
  return consolidated;
}

/**
 * Consolidates expenses from all entities
 */
function consolidateExpenses(entities) {
  const consolidated = {
    employeeCosts: 0,
    depreciation: 0,
    amortization: 0,
    grants: 0,
    otherExpenses: 0
  };

  entities.forEach(entity => {
    if (entity.data) {
      consolidated.employeeCosts += getNumericValue(entity.data, 'NOTE_15', 'total') || 0;
      consolidated.depreciation += getNumericValue(entity.data, 'NOTE_16', 'total') || 0;
      consolidated.amortization += getNumericValue(entity.data, 'NOTE_17', 'total') || 0;
      consolidated.grants += getNumericValue(entity.data, 'NOTE_18', 'total') || 0;
      consolidated.otherExpenses += getNumericValue(entity.data, 'NOTE_19', 'total') || 0;
    }
  });

  consolidated.total = sumObjectValues(consolidated);
  return consolidated;
}

/**
 * Consolidates operating cash flows
 */
function consolidateCashFlowOperating(entities) {
  let total = 0;
  entities.forEach(entity => {
    if (entity.data) {
      total += getNumericValue(entity.data, 'NOTE_CF', 'operating') || 0;
    }
  });
  return total;
}

/**
 * Consolidates investing cash flows
 */
function consolidateCashFlowInvesting(entities) {
  let total = 0;
  entities.forEach(entity => {
    if (entity.data) {
      total += getNumericValue(entity.data, 'NOTE_CF', 'investing') || 0;
    }
  });
  return total;
}

/**
 * Consolidates financing cash flows
 */
function consolidateCashFlowFinancing(entities) {
  let total = 0;
  entities.forEach(entity => {
    if (entity.data) {
      total += getNumericValue(entity.data, 'NOTE_CF', 'financing') || 0;
    }
  });
  return total;
}

/**
 * Consolidates budget data
 */
function consolidateBudget(entities) {
  let total = 0;
  entities.forEach(entity => {
    if (entity.data) {
      total += getNumericValue(entity.data, 'NOTE_BUD', 'budget') || 0;
    }
  });
  return total;
}

/**
 * Consolidates actual data
 */
function consolidateActual(entities) {
  let total = 0;
  entities.forEach(entity => {
    if (entity.data) {
      total += getNumericValue(entity.data, 'NOTE_BUD', 'actual') || 0;
    }
  });
  return total;
}

// ============================================================================
// CALCULATION HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates net assets (Assets - Liabilities)
 */
function calculateNetAssets(assets, liabilities) {
  return {
    total: (assets.total || 0) - (liabilities.total || 0),
    calculation: 'Total Assets - Total Liabilities'
  };
}

/**
 * Calculates surplus/deficit (Revenue - Expenses)
 */
function calculateSurplusDeficit(revenue, expenses) {
  return {
    total: (revenue.total || 0) - (expenses.total || 0),
    calculation: 'Total Revenue - Total Expenses'
  };
}

/**
 * Calculates net cash flow
 */
function calculateNetCashFlow(operating, investing, financing) {
  return {
    total: (operating || 0) + (investing || 0) + (financing || 0),
    calculation: 'Operating + Investing + Financing'
  };
}

/**
 * Calculates budget variance
 */
function calculateBudgetVariance(budget, actual) {
  return {
    variance: (actual || 0) - (budget || 0),
    variancePercent: budget !== 0 ? ((actual - budget) / budget) * 100 : 0,
    calculation: 'Actual - Budget'
  };
}

/**
 * Extracts numeric value from entity data
 */
function getNumericValue(data, noteId, field) {
  try {
    if (data && data[noteId] && data[noteId].data) {
      const noteData = data[noteId].data;
      if (typeof noteData === 'object' && noteData[field] !== undefined) {
        return parseFloat(noteData[field]) || 0;
      }
      // If field not specified or noteData is a number
      if (typeof noteData === 'number') {
        return noteData;
      }
    }
    return 0;
  } catch (error) {
    Logger.log('Error extracting numeric value: ' + error.toString());
    return 0;
  }
}

/**
 * Sums all numeric values in an object (excluding 'total' field to avoid double counting)
 */
function sumObjectValues(obj) {
  let sum = 0;
  for (const key in obj) {
    if (key !== 'total' && typeof obj[key] === 'number') {
      sum += obj[key];
    }
  }
  return sum;
}

/**
 * Formats report data to sheet
 * @param {Sheet} sheet - Sheet object
 * @param {Object} report - Report data
 */
function formatReportToSheet(sheet, report) {
  // Header
  sheet.appendRow(['IPSAS Financial Report']);
  sheet.appendRow(['Entity:', report.entity.name]);
  sheet.appendRow(['Period:', report.period]);
  sheet.appendRow(['Generated:', formatDateTime(report.generatedDate)]);
  sheet.appendRow([]);

  // Report data - simplified
  // Actual implementation would format based on report type
}

/**
 * Gets submission summary report
 * @param {string} periodId - Period ID
 * @returns {Object} Submission summary
 */
function getSubmissionSummaryReport(periodId) {
  try {
    const entitiesResult = getAllEntities({ status: 'ACTIVE' });
    if (!entitiesResult.success) return entitiesResult;

    const summary = {
      period: periodId,
      total: entitiesResult.entities.length,
      byStatus: {
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0
      },
      entities: []
    };

    entitiesResult.entities.forEach(entity => {
      const statusResult = getSubmissionStatus(entity.id, periodId);
      const status = statusResult.success ? statusResult.status : 'DRAFT';

      summary.byStatus[status.toLowerCase()]++;

      summary.entities.push({
        entityId: entity.id,
        entityName: entity.name,
        status: status,
        submittedDate: statusResult.submittedDate || null
      });
    });

    return {
      success: true,
      summary: summary
    };
  } catch (error) {
    Logger.log('Error getting submission summary: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
