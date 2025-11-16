/**
 * NotesLineItemsPart2.gs - Line Item Definitions for Notes 25-54
 *
 * Continuation of note line structures
 */

// ============================================================================
// NOTE 25: Gain on Sale of Assets
// ============================================================================
function getNote25Lines() {
  return [
    { lineId: 'LINE_25_01', noteId: 'NOTE_25', lineNumber: '25.1', description: 'Property, plant and equipment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_25_02', noteId: 'NOTE_25', lineNumber: '25.2', description: 'Intangible assets', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_25_03', noteId: 'NOTE_25', lineNumber: '25.3', description: 'Other assets not capitalised', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_25_TOTAL', noteId: 'NOTE_25', lineNumber: '25.T', description: 'Total gain on sale of assets', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(25.1:25.3)' }
  ];
}

// ============================================================================
// NOTE 26: Gain/Loss on Foreign Exchange Transactions
// ============================================================================
function getNote26Lines() {
  return [
    { lineId: 'LINE_26_01', noteId: 'NOTE_26', lineNumber: '26.1', description: 'Gain on foreign exchange transactions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_26_02', noteId: 'NOTE_26', lineNumber: '26.2', description: 'Loss on foreign exchange transactions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_26_TOTAL', noteId: 'NOTE_26', lineNumber: '26.T', description: 'Total Gain/Loss', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '26.1-26.2' }
  ];
}

// ============================================================================
// NOTE 27: Gain/(Loss) on Fair Value Investments
// ============================================================================
function getNote27Lines() {
  return [
    { lineId: 'LINE_27_01', noteId: 'NOTE_27', lineNumber: '27.1', description: 'Investments at Fair Value - Equity investments', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_27_02', noteId: 'NOTE_27', lineNumber: '27.2', description: 'Fair value – Investment property', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_27_03', noteId: 'NOTE_27', lineNumber: '27.3', description: 'Fair value - other financial assets (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_27_TOTAL', noteId: 'NOTE_27', lineNumber: '27.T', description: 'Total Gain', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(27.1:27.3)' }
  ];
}

// ============================================================================
// NOTE 28: Impairment Loss
// ============================================================================
function getNote28Lines() {
  return [
    { lineId: 'LINE_28_01', noteId: 'NOTE_28', lineNumber: '28.1', description: 'Property, Plant and Equipment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_28_02', noteId: 'NOTE_28', lineNumber: '28.2', description: 'Intangible Assets', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_28_TOTAL', noteId: 'NOTE_28', lineNumber: '28.T', description: 'Total Impairment Loss', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(28.1:28.2)' }
  ];
}

// ============================================================================
// NOTE 29: Taxation
// ============================================================================
function getNote29Lines() {
  return [
    { lineId: 'LINE_29_01', noteId: 'NOTE_29', lineNumber: '29.1', description: 'Current income tax charge', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_29_02', noteId: 'NOTE_29', lineNumber: '29.2', description: 'Tax charged on rental income', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_29_03', noteId: 'NOTE_29', lineNumber: '29.3', description: 'Tax charged on interest income', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_29_04', noteId: 'NOTE_29', lineNumber: '29.4', description: 'Deferred tax', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_29_05', noteId: 'NOTE_29', lineNumber: '29.5', description: 'Original and reversal of temporary differences', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_29_TOTAL', noteId: 'NOTE_29', lineNumber: '29.T', description: 'Income tax expense reported in the statement of financial performance', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(29.1:29.5)' }
  ];
}

// ============================================================================
// NOTE 30: Cash and Cash Equivalents
// ============================================================================
function getNote30Lines() {
  return [
    { lineId: 'LINE_30_01', noteId: 'NOTE_30', lineNumber: '30.1', description: 'Current Account', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_30_02', noteId: 'NOTE_30', lineNumber: '30.2', description: 'Savings Account', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_30_03', noteId: 'NOTE_30', lineNumber: '30.3', description: 'On - Call Deposits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_30_04', noteId: 'NOTE_30', lineNumber: '30.4', description: 'Fixed Deposits Account', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_30_05', noteId: 'NOTE_30', lineNumber: '30.5', description: 'Others (Specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_30_TOTAL', noteId: 'NOTE_30', lineNumber: '30.T', description: 'Total Cash and Cash Equivalents', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(30.1:30.5)' }
  ];
}

// ============================================================================
// NOTE 31: Prepayments
// ============================================================================
function getNote31Lines() {
  return [
    { lineId: 'LINE_31_01', noteId: 'NOTE_31', lineNumber: '31.1', description: 'Insurance', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_31_02', noteId: 'NOTE_31', lineNumber: '31.2', description: 'Rent', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_31_03', noteId: 'NOTE_31', lineNumber: '31.3', description: 'Water', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_31_04', noteId: 'NOTE_31', lineNumber: '31.4', description: 'Internet', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_31_05', noteId: 'NOTE_31', lineNumber: '31.5', description: 'Others specify', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_31_TOTAL', noteId: 'NOTE_31', lineNumber: '31.T', description: 'Total Prepayments', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(31.1:31.5)' }
  ];
}

// ============================================================================
// NOTE 32: Receivables from Exchange Transactions
// ============================================================================
function getNote32Lines() {
  return [
    { lineId: 'LINE_32_HEAD_01', noteId: 'NOTE_32', lineNumber: '32.H1', description: 'Receivables from Exchange Transactions (Current)', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_32_01', noteId: 'NOTE_32', lineNumber: '32.1', description: 'Service, Water and Electricity Debtors', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_32_02', noteId: 'NOTE_32', lineNumber: '32.2', description: 'Other Exchange Debtors', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_32_SUBTOTAL_01', noteId: 'NOTE_32', lineNumber: '32.ST1', description: 'Total Current Receivables', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: 'SUM(32.1:32.2)' },

    { lineId: 'LINE_32_HEAD_02', noteId: 'NOTE_32', lineNumber: '32.H2', description: 'Receivables from Exchange Transactions (Long-term)', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_32_03', noteId: 'NOTE_32', lineNumber: '32.3', description: 'Total receivables', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_32_04', noteId: 'NOTE_32', lineNumber: '32.4', description: 'Less: impairment allowance', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_32_SUBTOTAL_02', noteId: 'NOTE_32', lineNumber: '32.ST2', description: 'Total receivables', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '32.3-32.4' },
    { lineId: 'LINE_32_05', noteId: 'NOTE_32', lineNumber: '32.5', description: 'Current portion transferred to current receivables', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_32_SUBTOTAL_03', noteId: 'NOTE_32', lineNumber: '32.ST3', description: 'Total non-current receivables', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '32.ST2-32.5' },
    { lineId: 'LINE_32_TOTAL', noteId: 'NOTE_32', lineNumber: '32.T', description: 'Total receivables', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '32.ST1+32.ST3' }
  ];
}

// ============================================================================
// NOTE 33: Receivables from Non-Exchange Transactions
// ============================================================================
function getNote33Lines() {
  return [
    { lineId: 'LINE_33_01', noteId: 'NOTE_33', lineNumber: '33.1', description: 'Property tax debtors', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_33_02', noteId: 'NOTE_33', lineNumber: '33.2', description: 'Levies, fines, and penalties', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_33_03', noteId: 'NOTE_33', lineNumber: '33.3', description: 'Licences, fees and permits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_33_04', noteId: 'NOTE_33', lineNumber: '33.4', description: 'Other debtors (non-exchange transactions)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_33_05', noteId: 'NOTE_33', lineNumber: '33.5', description: 'Less: impairment allowance', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_33_TOTAL', noteId: 'NOTE_33', lineNumber: '33.T', description: 'Total receivables from non-exchange transactions', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(33.1:33.4)-33.5' }
  ];
}

// ============================================================================
// NOTE 34: Inventories
// ============================================================================
function getNote34Lines() {
  return [
    { lineId: 'LINE_34_01', noteId: 'NOTE_34', lineNumber: '34.1', description: 'Consumable stores', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_02', noteId: 'NOTE_34', lineNumber: '34.2', description: 'Medical supplies', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_03', noteId: 'NOTE_34', lineNumber: '34.3', description: 'Spare parts and meters', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_04', noteId: 'NOTE_34', lineNumber: '34.4', description: 'Water for distribution', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_05', noteId: 'NOTE_34', lineNumber: '34.5', description: 'Other goods held for resale', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_06', noteId: 'NOTE_34', lineNumber: '34.6', description: 'Catering', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_07', noteId: 'NOTE_34', lineNumber: '34.7', description: 'Less: allowance for impairment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_34_TOTAL', noteId: 'NOTE_34', lineNumber: '34.T', description: 'Total inventories at the lower of cost and net realizable value', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(34.1:34.6)-34.7' }
  ];
}

// ============================================================================
// NOTE 35: Investments in Financial Assets
// ============================================================================
function getNote35Lines() {
  return [
    { lineId: 'LINE_35_HEAD_01', noteId: 'NOTE_35', lineNumber: '35.H1', description: 'a) Investment in Treasury bills and bonds', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_35_01', noteId: 'NOTE_35', lineNumber: '35.1', description: 'Treasury Bills - CBK', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_35_02', noteId: 'NOTE_35', lineNumber: '35.2', description: 'Treasury Bonds - CBK', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_35_SUBTOTAL_01', noteId: 'NOTE_35', lineNumber: '35.ST1', description: 'Sub-total', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: 'SUM(35.1:35.2)' },

    { lineId: 'LINE_35_HEAD_02', noteId: 'NOTE_35', lineNumber: '35.H2', description: 'b) Investment with Financial Institutions/Banks', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_35_03', noteId: 'NOTE_35', lineNumber: '35.3', description: 'Bank investments (specify)', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_35_SUBTOTAL_02', noteId: 'NOTE_35', lineNumber: '35.ST2', description: 'Sub-total', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '35.3' },

    { lineId: 'LINE_35_HEAD_03', noteId: 'NOTE_35', lineNumber: '35.H3', description: 'c) Equity investments (specify)', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_35_04', noteId: 'NOTE_35', lineNumber: '35.4', description: 'Equity/shares in Entity (specify)', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_35_SUBTOTAL_03', noteId: 'NOTE_35', lineNumber: '35.ST3', description: 'Sub-total', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '35.4' },

    { lineId: 'LINE_35_TOTAL', noteId: 'NOTE_35', lineNumber: '35.T', description: 'Grand total', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(35.ST1,35.ST2,35.ST3)' }
  ];
}

// ============================================================================
// NOTE 36: Property, Plant and Equipment
// ============================================================================
function getNote36Lines() {
  return [
    { lineId: 'LINE_36_01', noteId: 'NOTE_36', lineNumber: '36.1', description: 'Land', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_02', noteId: 'NOTE_36', lineNumber: '36.2', description: 'Buildings', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_03', noteId: 'NOTE_36', lineNumber: '36.3', description: 'Motor vehicles', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_04', noteId: 'NOTE_36', lineNumber: '36.4', description: 'Furniture and fittings', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_05', noteId: 'NOTE_36', lineNumber: '36.5', description: 'Computers', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_06', noteId: 'NOTE_36', lineNumber: '36.6', description: 'Other Assets (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_07', noteId: 'NOTE_36', lineNumber: '36.7', description: 'Capital Work in progress', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_36_TOTAL', noteId: 'NOTE_36', lineNumber: '36.T', description: 'Net Book Value Total', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(36.1:36.7)' }
  ];
}

// ============================================================================
// NOTE 37: Intangible Assets
// ============================================================================
function getNote37Lines() {
  return [
    { lineId: 'LINE_37_01', noteId: 'NOTE_37', lineNumber: '37.1', description: 'Computer Software', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_37_02', noteId: 'NOTE_37', lineNumber: '37.2', description: 'Licenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_37_03', noteId: 'NOTE_37', lineNumber: '37.3', description: 'Patents', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_37_04', noteId: 'NOTE_37', lineNumber: '37.4', description: 'Others (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_37_TOTAL', noteId: 'NOTE_37', lineNumber: '37.T', description: 'Net Book Value', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(37.1:37.4)' }
  ];
}

// ============================================================================
// NOTE 38: Investment Property
// ============================================================================
function getNote38Lines() {
  return [
    { lineId: 'LINE_38_01', noteId: 'NOTE_38', lineNumber: '38.1', description: 'At beginning of the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_02', noteId: 'NOTE_38', lineNumber: '38.2', description: 'Additions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_03', noteId: 'NOTE_38', lineNumber: '38.3', description: 'Disposal during the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_04', noteId: 'NOTE_38', lineNumber: '38.4', description: 'Depreciation', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_05', noteId: 'NOTE_38', lineNumber: '38.5', description: 'Impairment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_06', noteId: 'NOTE_38', lineNumber: '38.6', description: 'Gain/(loss) in fair value (if fair value is elected)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_38_TOTAL', noteId: 'NOTE_38', lineNumber: '38.T', description: 'At end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '38.1+38.2-38.3-38.4-38.5+38.6' }
  ];
}

// ============================================================================
// NOTE 39: Biological Assets
// ============================================================================
function getNote39Lines() {
  return [
    { lineId: 'LINE_39_01', noteId: 'NOTE_39', lineNumber: '39.1', description: 'Trees in a plantation forest', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_39_02', noteId: 'NOTE_39', lineNumber: '39.2', description: 'Animals: Dairy Cattle, Pigs, Sheep', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_39_03', noteId: 'NOTE_39', lineNumber: '39.3', description: 'Others specify', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_39_TOTAL', noteId: 'NOTE_39', lineNumber: '39.T', description: 'Total', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(39.1:39.3)' }
  ];
}

// ============================================================================
// NOTE 40: Trade and Other Payables
// ============================================================================
function getNote40Lines() {
  return [
    { lineId: 'LINE_40_01', noteId: 'NOTE_40', lineNumber: '40.1', description: 'Trade payables', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_40_02', noteId: 'NOTE_40', lineNumber: '40.2', description: 'Employee payables', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_40_03', noteId: 'NOTE_40', lineNumber: '40.3', description: 'Other payables', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_40_TOTAL', noteId: 'NOTE_40', lineNumber: '40.T', description: 'Total trade and other payables', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(40.1:40.3)' }
  ];
}

// ============================================================================
// NOTE 41: Refundable Deposits
// ============================================================================
function getNote41Lines() {
  return [
    { lineId: 'LINE_41_01', noteId: 'NOTE_41', lineNumber: '41.1', description: 'Customer deposits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_41_02', noteId: 'NOTE_41', lineNumber: '41.2', description: 'Prepayments from customers', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_41_03', noteId: 'NOTE_41', lineNumber: '41.3', description: 'Other deposits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_41_TOTAL', noteId: 'NOTE_41', lineNumber: '41.T', description: 'Total deposits', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(41.1:41.3)' }
  ];
}

// ============================================================================
// NOTE 42: Prepayments from Customers
// ============================================================================
function getNote42Lines() {
  return [
    { lineId: 'LINE_42_01', noteId: 'NOTE_42', lineNumber: '42.1', description: 'Customer prepayments (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_42_TOTAL', noteId: 'NOTE_42', lineNumber: '42.T', description: 'Total Prepayments', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '42.1' }
  ];
}

// ============================================================================
// NOTE 43: Current Provisions
// ============================================================================
function getNote43Lines() {
  return [
    { lineId: 'LINE_43_01', noteId: 'NOTE_43', lineNumber: '43.1', description: 'Leave provision', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_43_02', noteId: 'NOTE_43', lineNumber: '43.2', description: 'Bonus provision', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_43_03', noteId: 'NOTE_43', lineNumber: '43.3', description: 'Gratuity Provision', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_43_04', noteId: 'NOTE_43', lineNumber: '43.4', description: 'Other provision', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_43_TOTAL', noteId: 'NOTE_43', lineNumber: '43.T', description: 'Total provisions year end', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(43.1:43.4)' }
  ];
}

// ============================================================================
// NOTE 44: Finance Lease Obligation
// ============================================================================
function getNote44Lines() {
  return [
    { lineId: 'LINE_44_01', noteId: 'NOTE_44', lineNumber: '44.1', description: 'At the start of the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_44_02', noteId: 'NOTE_44', lineNumber: '44.2', description: 'Discount interest on lease liability', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_44_03', noteId: 'NOTE_44', lineNumber: '44.3', description: 'Paid during the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_44_TOTAL', noteId: 'NOTE_44', lineNumber: '44.T', description: 'At end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '44.1+44.2-44.3' }
  ];
}

// ============================================================================
// NOTE 45: Deferred Income
// ============================================================================
function getNote45Lines() {
  return [
    { lineId: 'LINE_45_01', noteId: 'NOTE_45', lineNumber: '45.1', description: 'National Government', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_45_02', noteId: 'NOTE_45', lineNumber: '45.2', description: 'International Funders', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_45_03', noteId: 'NOTE_45', lineNumber: '45.3', description: 'Public Contributions and Donations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_45_TOTAL', noteId: 'NOTE_45', lineNumber: '45.T', description: 'Total Deferred Income', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(45.1:45.3)' }
  ];
}

// ============================================================================
// NOTE 46: Employee Benefit Obligations
// ============================================================================
function getNote46Lines() {
  return [
    { lineId: 'LINE_46_01', noteId: 'NOTE_46', lineNumber: '46.1', description: 'Defined benefit plan', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_46_02', noteId: 'NOTE_46', lineNumber: '46.2', description: 'Post-employment medical benefits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_46_03', noteId: 'NOTE_46', lineNumber: '46.3', description: 'Other Benefits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_46_TOTAL', noteId: 'NOTE_46', lineNumber: '46.T', description: 'Total Employee Benefits Obligation', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(46.1:46.3)' }
  ];
}

// ============================================================================
// NOTE 47: Borrowings
// ============================================================================
function getNote47Lines() {
  return [
    { lineId: 'LINE_47_HEAD_01', noteId: 'NOTE_47', lineNumber: '47.H1', description: 'a) External borrowings', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_47_01', noteId: 'NOTE_47', lineNumber: '47.1', description: 'Balance at beginning of the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_02', noteId: 'NOTE_47', lineNumber: '47.2', description: 'External borrowings during the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_03', noteId: 'NOTE_47', lineNumber: '47.3', description: 'Repayments during the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_SUBTOTAL_01', noteId: 'NOTE_47', lineNumber: '47.ST1', description: 'Balance at end of the year', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '47.1+47.2-47.3' },

    { lineId: 'LINE_47_HEAD_02', noteId: 'NOTE_47', lineNumber: '47.H2', description: 'b) Domestic borrowings', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_47_04', noteId: 'NOTE_47', lineNumber: '47.4', description: 'Balance at beginning of the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_05', noteId: 'NOTE_47', lineNumber: '47.5', description: 'Domestic borrowings during the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_06', noteId: 'NOTE_47', lineNumber: '47.6', description: 'Repayments during the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_47_SUBTOTAL_02', noteId: 'NOTE_47', lineNumber: '47.ST2', description: 'Balance at end of the year', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '47.4+47.5-47.6' },

    { lineId: 'LINE_47_TOTAL', noteId: 'NOTE_47', lineNumber: '47.T', description: 'Balance at end of the period - domestic and external borrowings', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '47.ST1+47.ST2' }
  ];
}

// ============================================================================
// NOTE 48: Social Benefit Liabilities
// ============================================================================
function getNote48Lines() {
  return [
    { lineId: 'LINE_48_01', noteId: 'NOTE_48', lineNumber: '48.1', description: 'Benefits to PWDs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_48_02', noteId: 'NOTE_48', lineNumber: '48.2', description: 'Benefits to the Aged', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_48_03', noteId: 'NOTE_48', lineNumber: '48.3', description: 'Others Specify', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_48_TOTAL', noteId: 'NOTE_48', lineNumber: '48.T', description: 'Total Social Benefits', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(48.1:48.3)' }
  ];
}

// ============================================================================
// NOTE 49: Non-Current Provisions
// ============================================================================
function getNote49Lines() {
  return [
    { lineId: 'LINE_49_01', noteId: 'NOTE_49', lineNumber: '49.1', description: 'Long service leave', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_49_02', noteId: 'NOTE_49', lineNumber: '49.2', description: 'Bonus Provision', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_49_03', noteId: 'NOTE_49', lineNumber: '49.3', description: 'Gratuity provisions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_49_04', noteId: 'NOTE_49', lineNumber: '49.4', description: 'Other Provisions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_49_TOTAL', noteId: 'NOTE_49', lineNumber: '49.T', description: 'Balance at the end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(49.1:49.4)' }
  ];
}

// ============================================================================
// NOTE 50: Service Concession Arrangements
// ============================================================================
function getNote50Lines() {
  return [
    { lineId: 'LINE_50_01', noteId: 'NOTE_50', lineNumber: '50.1', description: 'Fair value of service concession assets recognized under PPE', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_50_02', noteId: 'NOTE_50', lineNumber: '50.2', description: 'Accumulated depreciation to date', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_50_03', noteId: 'NOTE_50', lineNumber: '50.3', description: 'Net carrying amount', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '50.1-50.2' },
    { lineId: 'LINE_50_04', noteId: 'NOTE_50', lineNumber: '50.4', description: 'Service concession liability at beginning of the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_50_05', noteId: 'NOTE_50', lineNumber: '50.5', description: 'Service concession revenue recognized', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_50_TOTAL', noteId: 'NOTE_50', lineNumber: '50.T', description: 'Service concession liability at end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '50.4-50.5' }
  ];
}

// ============================================================================
// NOTE 51: Surplus Remission
// ============================================================================
function getNote51Lines() {
  return [
    { lineId: 'LINE_51_HEAD_01', noteId: 'NOTE_51', lineNumber: '51.H1', description: 'Surplus Remission Computation', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_51_01', noteId: 'NOTE_51', lineNumber: '51.1', description: 'Surplus for the period', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_51_02', noteId: 'NOTE_51', lineNumber: '51.2', description: 'Less: Allowable deductions by NT', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_51_03', noteId: 'NOTE_51', lineNumber: '51.3', description: '90% Computation (Included in Statement of Financial Performance)', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: '(51.1-51.2)*0.9' },

    { lineId: 'LINE_51_HEAD_02', noteId: 'NOTE_51', lineNumber: '51.H2', description: 'Surplus Remission Payable', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_51_04', noteId: 'NOTE_51', lineNumber: '51.4', description: 'Payable at the beginning of the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_51_05', noteId: 'NOTE_51', lineNumber: '51.5', description: 'Paid during the year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_51_TOTAL', noteId: 'NOTE_51', lineNumber: '51.T', description: 'Payable at end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '51.4+51.3-51.5' }
  ];
}

// ============================================================================
// NOTE 52: Taxation Payable
// ============================================================================
function getNote52Lines() {
  return [
    { lineId: 'LINE_52_01', noteId: 'NOTE_52', lineNumber: '52.1', description: 'At beginning of the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_52_02', noteId: 'NOTE_52', lineNumber: '52.2', description: 'Income tax charge for the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_52_03', noteId: 'NOTE_52', lineNumber: '52.3', description: 'Under/(over) provision in prior year/s', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_52_04', noteId: 'NOTE_52', lineNumber: '52.4', description: 'Income tax paid during the year', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_52_TOTAL', noteId: 'NOTE_52', lineNumber: '52.T', description: 'At end of the year', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '52.1+52.2+52.3-52.4' }
  ];
}

// ============================================================================
// NOTE 53: Deferred Tax Liability
// ============================================================================
function getNote53Lines() {
  return [
    { lineId: 'LINE_53_01', noteId: 'NOTE_53', lineNumber: '53.1', description: 'Accelerated capital allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_53_02', noteId: 'NOTE_53', lineNumber: '53.2', description: 'Unrealised exchange gains/(losses)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_53_03', noteId: 'NOTE_53', lineNumber: '53.3', description: 'Revaluation surplus', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_53_04', noteId: 'NOTE_53', lineNumber: '53.4', description: 'Tax losses carried forward', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_53_05', noteId: 'NOTE_53', lineNumber: '53.5', description: 'Provisions for liabilities and charges', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_53_TOTAL', noteId: 'NOTE_53', lineNumber: '53.T', description: 'Net deferred tax liability/(asset)', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(53.1:53.5)' }
  ];
}

// ============================================================================
// NOTE 54: Cash Generated from Operations
// ============================================================================
function getNote54Lines() {
  return [
    { lineId: 'LINE_54_01', noteId: 'NOTE_54', lineNumber: '54.1', description: 'Surplus for the year before tax', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_HEAD_01', noteId: 'NOTE_54', lineNumber: '54.H1', description: 'Adjusted for:', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_54_02', noteId: 'NOTE_54', lineNumber: '54.2', description: 'Depreciation', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_03', noteId: 'NOTE_54', lineNumber: '54.3', description: 'Non-cash grants received', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_04', noteId: 'NOTE_54', lineNumber: '54.4', description: 'Contributed assets', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_05', noteId: 'NOTE_54', lineNumber: '54.5', description: 'Impairment', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_06', noteId: 'NOTE_54', lineNumber: '54.6', description: 'Gains and losses on disposal of assets', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_07', noteId: 'NOTE_54', lineNumber: '54.7', description: 'Contribution to provisions', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_08', noteId: 'NOTE_54', lineNumber: '54.8', description: 'Contribution to impairment allowance', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },

    { lineId: 'LINE_54_HEAD_02', noteId: 'NOTE_54', lineNumber: '54.H2', description: 'Working capital adjustments', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_54_09', noteId: 'NOTE_54', lineNumber: '54.9', description: 'Increase in inventory', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_10', noteId: 'NOTE_54', lineNumber: '54.10', description: 'Increase in receivables', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_11', noteId: 'NOTE_54', lineNumber: '54.11', description: 'Increase in deferred income', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_12', noteId: 'NOTE_54', lineNumber: '54.12', description: 'Increase in payables', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_54_13', noteId: 'NOTE_54', lineNumber: '54.13', description: 'Increase in payments received in advance', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },

    { lineId: 'LINE_54_TOTAL', noteId: 'NOTE_54', lineNumber: '54.T', description: 'Net cash flow from operating activities', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '54.1+SUM(54.2:54.13)' }
  ];
}
