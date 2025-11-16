/**
 * NotesLineItems.gs - Complete Line Item Definitions for All Notes
 *
 * Contains detailed line structures for all IPSAS notes
 */

// ============================================================================
// NOTE LINE ITEMS
// ============================================================================

/**
 * Returns all note line items for all notes
 * @returns {Array} Array of line item objects
 */
function getAllNoteLines() {
  return [
    ...getNote06Lines(),
    ...getNote07Lines(),
    ...getNote08Lines(),
    ...getNote09Lines(),
    ...getNote10Lines(),
    ...getNote11Lines(),
    ...getNote12Lines(),
    ...getNote13Lines(),
    ...getNote14Lines(),
    ...getNote15Lines(),
    ...getNote16Lines(),
    ...getNote17Lines(),
    ...getNote18Lines(),
    ...getNote19Lines(),
    ...getNote20Lines(),
    ...getNote21Lines(),
    ...getNote22Lines(),
    ...getNote23Lines(),
    ...getNote24Lines(),
    ...getNote25Lines(),
    ...getNote26Lines(),
    ...getNote27Lines(),
    ...getNote28Lines(),
    ...getNote29Lines(),
    ...getNote30Lines(),
    ...getNote31Lines(),
    ...getNote32Lines(),
    ...getNote33Lines(),
    ...getNote34Lines(),
    ...getNote35Lines(),
    ...getNote36Lines(),
    ...getNote37Lines(),
    ...getNote38Lines(),
    ...getNote39Lines(),
    ...getNote40Lines(),
    ...getNote41Lines(),
    ...getNote42Lines(),
    ...getNote43Lines(),
    ...getNote44Lines(),
    ...getNote45Lines(),
    ...getNote46Lines(),
    ...getNote47Lines(),
    ...getNote48Lines(),
    ...getNote49Lines(),
    ...getNote50Lines(),
    ...getNote51Lines(),
    ...getNote52Lines(),
    ...getNote53Lines(),
    ...getNote54Lines()
  ];
}

// ============================================================================
// NOTE 6: Transfers from Other Government Entities
// ============================================================================
function getNote06Lines() {
  return [
    // Section a) Unconditional Grants
    { lineId: 'LINE_06_HEAD_01', noteId: 'NOTE_06', lineNumber: '6.H1', description: 'a) Unconditional Grants', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_06_01', noteId: 'NOTE_06', lineNumber: '6.1', description: 'Operational Grant', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_02', noteId: 'NOTE_06', lineNumber: '6.2', description: 'Development grants', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_03', noteId: 'NOTE_06', lineNumber: '6.3', description: 'Other Grants', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_SUBTOTAL_01', noteId: 'NOTE_06', lineNumber: '6.ST1', description: 'Total Unconditional Grants', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: 'SUM(6.1:6.3)' },

    // Section b) Conditional Grants
    { lineId: 'LINE_06_HEAD_02', noteId: 'NOTE_06', lineNumber: '6.H2', description: 'b) Conditional Grants amortised/transferred to revenue', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_06_04', noteId: 'NOTE_06', lineNumber: '6.4', description: 'Housing Development Grant', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_05', noteId: 'NOTE_06', lineNumber: '6.5', description: 'Infrastructure Grant', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_06', noteId: 'NOTE_06', lineNumber: '6.6', description: 'Library Grant', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_07', noteId: 'NOTE_06', lineNumber: '6.7', description: 'Facilities Development Grant', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_06_08', noteId: 'NOTE_06', lineNumber: '6.8', description: 'Other Organizational Grants (specify)', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },

    { lineId: 'LINE_06_TOTAL', noteId: 'NOTE_06', lineNumber: '6.T', description: 'Total Government Grants And Subsidies', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(6.ST1,6.4:6.8)' }
  ];
}

// ============================================================================
// NOTE 7: Levies, Fines and Penalties
// ============================================================================
function getNote07Lines() {
  return [
    { lineId: 'LINE_07_01', noteId: 'NOTE_07', lineNumber: '7.1', description: 'Fuel Levy', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_07_02', noteId: 'NOTE_07', lineNumber: '7.2', description: 'Other Levies (Specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_07_03', noteId: 'NOTE_07', lineNumber: '7.3', description: 'Fines', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_07_04', noteId: 'NOTE_07', lineNumber: '7.4', description: 'Penalties', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_07_TOTAL', noteId: 'NOTE_07', lineNumber: '7.T', description: 'Total', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(7.1:7.4)' }
  ];
}

// ============================================================================
// NOTE 8: Public Contributions and Donations
// ============================================================================
function getNote08Lines() {
  return [
    { lineId: 'LINE_08_01', noteId: 'NOTE_08', lineNumber: '8.1', description: 'Health Donations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_02', noteId: 'NOTE_08', lineNumber: '8.2', description: 'Research Donations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_03', noteId: 'NOTE_08', lineNumber: '8.3', description: 'Donations transferred to revenue on conditions being met', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_04', noteId: 'NOTE_08', lineNumber: '8.4', description: 'Other Public Donations (Specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_TOTAL', noteId: 'NOTE_08', lineNumber: '8.T', description: 'Total Transfers and Sponsorships', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(8.1:8.4)' },

    // Reconciliation section
    { lineId: 'LINE_08_HEAD_01', noteId: 'NOTE_08', lineNumber: '8.H1', description: 'Reconciliation Of Public Contributions and Donations', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_08_05', noteId: 'NOTE_08', lineNumber: '8.5', description: 'Balance Unspent at Beginning of The Year', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_06', noteId: 'NOTE_08', lineNumber: '8.6', description: 'Current Year Receipts', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_07', noteId: 'NOTE_08', lineNumber: '8.7', description: 'Conditions Met - Transferred to Revenue', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_08_08', noteId: 'NOTE_08', lineNumber: '8.8', description: 'Conditions To Be Met - Remain Liabilities', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' }
  ];
}

// ============================================================================
// NOTE 9: Property Taxes Revenue
// ============================================================================
function getNote09Lines() {
  return [
    { lineId: 'LINE_09_HEAD_01', noteId: 'NOTE_09', lineNumber: '9.H1', description: 'Taxable Land and Buildings', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_09_01', noteId: 'NOTE_09', lineNumber: '9.1', description: 'Residential', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_09_02', noteId: 'NOTE_09', lineNumber: '9.2', description: 'Commercial', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_09_03', noteId: 'NOTE_09', lineNumber: '9.3', description: 'State', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_09_04', noteId: 'NOTE_09', lineNumber: '9.4', description: 'Penalties', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_09_SUBTOTAL_01', noteId: 'NOTE_09', lineNumber: '9.ST1', description: 'Sub-Total Property and Taxes', lineType: 'SUBTOTAL', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: true, formula: 'SUM(9.1:9.4)' },
    { lineId: 'LINE_09_05', noteId: 'NOTE_09', lineNumber: '9.5', description: 'Income Forgone/waived', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_09_TOTAL', noteId: 'NOTE_09', lineNumber: '9.T', description: 'Total Property Taxes Revenue', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: '9.ST1-9.5' }
  ];
}

// ============================================================================
// NOTE 10: Licenses, Fees and Permits
// ============================================================================
function getNote10Lines() {
  return [
    { lineId: 'LINE_10_01', noteId: 'NOTE_10', lineNumber: '10.1', description: 'Licenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_10_02', noteId: 'NOTE_10', lineNumber: '10.2', description: 'Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_10_03', noteId: 'NOTE_10', lineNumber: '10.3', description: 'Permits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_10_TOTAL', noteId: 'NOTE_10', lineNumber: '10.T', description: 'Total', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(10.1:10.3)' }
  ];
}

// ============================================================================
// NOTE 11: Rendering of Services
// ============================================================================
function getNote11Lines() {
  return [
    { lineId: 'LINE_11_01', noteId: 'NOTE_11', lineNumber: '11.1', description: 'Tuition Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_02', noteId: 'NOTE_11', lineNumber: '11.2', description: 'Training Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_03', noteId: 'NOTE_11', lineNumber: '11.3', description: 'Health services', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_04', noteId: 'NOTE_11', lineNumber: '11.4', description: 'Service Fees (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_05', noteId: 'NOTE_11', lineNumber: '11.5', description: 'Quality Assurance', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_06', noteId: 'NOTE_11', lineNumber: '11.6', description: 'Others (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_11_TOTAL', noteId: 'NOTE_11', lineNumber: '11.T', description: 'Total Revenue from The Rendering Of Services', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(11.1:11.6)' }
  ];
}

// ============================================================================
// NOTE 12: Sale of Goods
// ============================================================================
function getNote12Lines() {
  return [
    { lineId: 'LINE_12_HEAD_01', noteId: 'NOTE_12', lineNumber: '12.H1', description: 'Sale of goods', lineType: 'HEADING', parentLineId: '', indent: 0, dataType: 'TEXT', required: false, formula: '' },
    { lineId: 'LINE_12_01', noteId: 'NOTE_12', lineNumber: '12.1', description: 'Sale of electricity', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_12_02', noteId: 'NOTE_12', lineNumber: '12.2', description: 'Sale of water', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_12_03', noteId: 'NOTE_12', lineNumber: '12.3', description: 'Sale of books', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_12_04', noteId: 'NOTE_12', lineNumber: '12.4', description: 'Sale of publications', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_12_05', noteId: 'NOTE_12', lineNumber: '12.5', description: 'Other (include in line with your organisation)', lineType: 'DATA', parentLineId: '', indent: 1, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_12_TOTAL', noteId: 'NOTE_12', lineNumber: '12.T', description: 'Total revenue from the sale of goods', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(12.1:12.5)' }
  ];
}

// ============================================================================
// NOTE 13: Rental Revenue from Facilities and Equipment
// ============================================================================
function getNote13Lines() {
  return [
    { lineId: 'LINE_13_01', noteId: 'NOTE_13', lineNumber: '13.1', description: 'Operating Lease Revenues', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_13_02', noteId: 'NOTE_13', lineNumber: '13.2', description: 'Staff Houses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_13_03', noteId: 'NOTE_13', lineNumber: '13.3', description: 'Contingent Rentals', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_13_TOTAL', noteId: 'NOTE_13', lineNumber: '13.T', description: 'Total Rentals', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(13.1:13.3)' }
  ];
}

// ============================================================================
// NOTE 14: Finance Income
// ============================================================================
function getNote14Lines() {
  return [
    { lineId: 'LINE_14_01', noteId: 'NOTE_14', lineNumber: '14.1', description: 'Cash investments and fixed deposits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_14_02', noteId: 'NOTE_14', lineNumber: '14.2', description: 'Interest income from Treasury Bills', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_14_03', noteId: 'NOTE_14', lineNumber: '14.3', description: 'Interest income from Treasury Bonds', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_14_04', noteId: 'NOTE_14', lineNumber: '14.4', description: 'Interest from outstanding debtors', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_14_TOTAL', noteId: 'NOTE_14', lineNumber: '14.T', description: 'Total finance income', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(14.1:14.4)' }
  ];
}

// ============================================================================
// NOTE 15: Other Income
// ============================================================================
function getNote15Lines() {
  return [
    { lineId: 'LINE_15_01', noteId: 'NOTE_15', lineNumber: '15.1', description: 'Insurance recoveries', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_02', noteId: 'NOTE_15', lineNumber: '15.2', description: 'Income from sale of tender', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_03', noteId: 'NOTE_15', lineNumber: '15.3', description: 'Services concession income', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_04', noteId: 'NOTE_15', lineNumber: '15.4', description: 'Skills development levy', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_05', noteId: 'NOTE_15', lineNumber: '15.5', description: 'Agency fee', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_06', noteId: 'NOTE_15', lineNumber: '15.6', description: 'Income written back', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_07', noteId: 'NOTE_15', lineNumber: '15.7', description: 'Bad debts recovered', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_08', noteId: 'NOTE_15', lineNumber: '15.8', description: 'Miscellaneous incomes (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_15_TOTAL', noteId: 'NOTE_15', lineNumber: '15.T', description: 'Total Other income', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(15.1:15.8)' }
  ];
}

// ============================================================================
// NOTE 16: Use of Goods and Services
// ============================================================================
function getNote16Lines() {
  return [
    { lineId: 'LINE_16_01', noteId: 'NOTE_16', lineNumber: '16.1', description: 'Electricity', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_02', noteId: 'NOTE_16', lineNumber: '16.2', description: 'Water', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_03', noteId: 'NOTE_16', lineNumber: '16.3', description: 'Professional Services', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_04', noteId: 'NOTE_16', lineNumber: '16.4', description: 'Subscriptions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_05', noteId: 'NOTE_16', lineNumber: '16.5', description: 'Advertising', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_06', noteId: 'NOTE_16', lineNumber: '16.6', description: 'Admin Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_07', noteId: 'NOTE_16', lineNumber: '16.7', description: 'Audit Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_08', noteId: 'NOTE_16', lineNumber: '16.8', description: 'Conferences and Delegations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_09', noteId: 'NOTE_16', lineNumber: '16.9', description: 'Consulting Fees', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_10', noteId: 'NOTE_16', lineNumber: '16.10', description: 'Consumables', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_11', noteId: 'NOTE_16', lineNumber: '16.11', description: 'Fuel and Oil', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_12', noteId: 'NOTE_16', lineNumber: '16.12', description: 'Insurance', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_13', noteId: 'NOTE_16', lineNumber: '16.13', description: 'Legal Expenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_14', noteId: 'NOTE_16', lineNumber: '16.14', description: 'Licenses and Permits', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_15', noteId: 'NOTE_16', lineNumber: '16.15', description: 'Chemicals', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_16', noteId: 'NOTE_16', lineNumber: '16.16', description: 'Water Purification Cost', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_17', noteId: 'NOTE_16', lineNumber: '16.17', description: 'Postage', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_18', noteId: 'NOTE_16', lineNumber: '16.18', description: 'Printing and Stationery', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_19', noteId: 'NOTE_16', lineNumber: '16.19', description: 'Hire Charges', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_20', noteId: 'NOTE_16', lineNumber: '16.20', description: 'Rent expenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_21', noteId: 'NOTE_16', lineNumber: '16.21', description: 'Security Costs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_22', noteId: 'NOTE_16', lineNumber: '16.22', description: 'Sewage Treatment Costs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_23', noteId: 'NOTE_16', lineNumber: '16.23', description: 'Skills Development Levies', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_24', noteId: 'NOTE_16', lineNumber: '16.24', description: 'Inventory Scrapping', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_25', noteId: 'NOTE_16', lineNumber: '16.25', description: 'Telecommunication', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_26', noteId: 'NOTE_16', lineNumber: '16.26', description: 'Training', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_27', noteId: 'NOTE_16', lineNumber: '16.27', description: 'Travel, Subsistence & Other Allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_28', noteId: 'NOTE_16', lineNumber: '16.28', description: 'Bank charges', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_29', noteId: 'NOTE_16', lineNumber: '16.29', description: 'Other General Expenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_16_TOTAL', noteId: 'NOTE_16', lineNumber: '16.T', description: 'Total Use of Goods and Services', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(16.1:16.29)' }
  ];
}

// ============================================================================
// NOTE 17: Employee Costs
// ============================================================================
function getNote17Lines() {
  return [
    { lineId: 'LINE_17_01', noteId: 'NOTE_17', lineNumber: '17.1', description: 'Salaries and wages', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_02', noteId: 'NOTE_17', lineNumber: '17.2', description: 'Employer contribution to health insurance schemes', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_03', noteId: 'NOTE_17', lineNumber: '17.3', description: 'Employer contribution to pension schemes', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_04', noteId: 'NOTE_17', lineNumber: '17.4', description: 'Travel, accommodation, subsistence, & other allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_05', noteId: 'NOTE_17', lineNumber: '17.5', description: 'Housing benefits and allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_06', noteId: 'NOTE_17', lineNumber: '17.6', description: 'Overtime payments', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_07', noteId: 'NOTE_17', lineNumber: '17.7', description: 'Performance and other bonuses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_08', noteId: 'NOTE_17', lineNumber: '17.8', description: 'Social contributions', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_09', noteId: 'NOTE_17', lineNumber: '17.9', description: 'Gratuity', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_10', noteId: 'NOTE_17', lineNumber: '17.10', description: 'Other employee related costs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_17_TOTAL', noteId: 'NOTE_17', lineNumber: '17.T', description: 'Total Employee costs', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(17.1:17.10)' }
  ];
}

// ============================================================================
// NOTE 18: Board Expenses
// ============================================================================
function getNote18Lines() {
  return [
    { lineId: 'LINE_18_01', noteId: 'NOTE_18', lineNumber: '18.1', description: 'Chairman/Directors\' Honoraria', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_02', noteId: 'NOTE_18', lineNumber: '18.2', description: 'Sitting Allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_03', noteId: 'NOTE_18', lineNumber: '18.3', description: 'Medical Insurance', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_04', noteId: 'NOTE_18', lineNumber: '18.4', description: 'Induction and Training', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_05', noteId: 'NOTE_18', lineNumber: '18.5', description: 'Travel and Accommodation', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_06', noteId: 'NOTE_18', lineNumber: '18.6', description: 'Other Allowances', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_18_TOTAL', noteId: 'NOTE_18', lineNumber: '18.T', description: 'Total Board Expenses', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(18.1:18.6)' }
  ];
}

// ============================================================================
// NOTE 19: Depreciation and Amortization Expense
// ============================================================================
function getNote19Lines() {
  return [
    { lineId: 'LINE_19_01', noteId: 'NOTE_19', lineNumber: '19.1', description: 'Property, plant and equipment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_19_02', noteId: 'NOTE_19', lineNumber: '19.2', description: 'Intangible assets', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_19_03', noteId: 'NOTE_19', lineNumber: '19.3', description: 'Investment property carried at cost', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_19_TOTAL', noteId: 'NOTE_19', lineNumber: '19.T', description: 'Total depreciation and amortization', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(19.1:19.3)' }
  ];
}

// ============================================================================
// NOTE 20: Repairs and Maintenance
// ============================================================================
function getNote20Lines() {
  return [
    { lineId: 'LINE_20_01', noteId: 'NOTE_20', lineNumber: '20.1', description: 'Property and equipment', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_02', noteId: 'NOTE_20', lineNumber: '20.2', description: 'Investment Property', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_03', noteId: 'NOTE_20', lineNumber: '20.3', description: 'Equipment and Machinery', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_04', noteId: 'NOTE_20', lineNumber: '20.4', description: 'Vehicles', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_05', noteId: 'NOTE_20', lineNumber: '20.5', description: 'Furniture and Fittings', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_06', noteId: 'NOTE_20', lineNumber: '20.6', description: 'Computers and Accessories', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_07', noteId: 'NOTE_20', lineNumber: '20.7', description: 'Others (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_20_TOTAL', noteId: 'NOTE_20', lineNumber: '20.T', description: 'Total Repairs and Maintenance', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(20.1:20.7)' }
  ];
}

// ============================================================================
// NOTE 21: Contracted Services
// ============================================================================
function getNote21Lines() {
  return [
    { lineId: 'LINE_21_01', noteId: 'NOTE_21', lineNumber: '21.1', description: 'Actuarial Valuations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_21_02', noteId: 'NOTE_21', lineNumber: '21.2', description: 'Investment Valuations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_21_03', noteId: 'NOTE_21', lineNumber: '21.3', description: 'Property Valuations', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_21_04', noteId: 'NOTE_21', lineNumber: '21.4', description: 'Others (specify)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_21_TOTAL', noteId: 'NOTE_21', lineNumber: '21.T', description: 'Total Contracted Services', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(21.1:21.4)' }
  ];
}

// ============================================================================
// NOTE 22: Grants and Subsidies
// ============================================================================
function getNote22Lines() {
  return [
    { lineId: 'LINE_22_01', noteId: 'NOTE_22', lineNumber: '22.1', description: 'Community Development', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_02', noteId: 'NOTE_22', lineNumber: '22.2', description: 'Education Initiatives and Programs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_03', noteId: 'NOTE_22', lineNumber: '22.3', description: 'Social Development', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_04', noteId: 'NOTE_22', lineNumber: '22.4', description: 'Social benefit expenses', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_05', noteId: 'NOTE_22', lineNumber: '22.5', description: 'Community Trust', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_06', noteId: 'NOTE_22', lineNumber: '22.6', description: 'Sporting Bodies', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_22_TOTAL', noteId: 'NOTE_22', lineNumber: '22.T', description: 'Total Grants and Subsidies', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(22.1:22.6)' }
  ];
}

// ============================================================================
// NOTE 23: Finance Costs
// ============================================================================
function getNote23Lines() {
  return [
    { lineId: 'LINE_23_01', noteId: 'NOTE_23', lineNumber: '23.1', description: 'Borrowings (amortized cost)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_23_02', noteId: 'NOTE_23', lineNumber: '23.2', description: 'Finance leases (amortized cost)', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_23_03', noteId: 'NOTE_23', lineNumber: '23.3', description: 'Unwinding of discount on lease liabilities', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_23_04', noteId: 'NOTE_23', lineNumber: '23.4', description: 'Interest on bank overdrafts', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_23_05', noteId: 'NOTE_23', lineNumber: '23.5', description: 'Interest on loans from commercial banks', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_23_TOTAL', noteId: 'NOTE_23', lineNumber: '23.T', description: 'Total finance costs', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(23.1:23.5)' }
  ];
}

// ============================================================================
// NOTE 24: Social Benefits Expenses
// ============================================================================
function getNote24Lines() {
  return [
    { lineId: 'LINE_24_01', noteId: 'NOTE_24', lineNumber: '24.1', description: 'Benefits to PWDs', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_24_02', noteId: 'NOTE_24', lineNumber: '24.2', description: 'Benefits to the Aged', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_24_03', noteId: 'NOTE_24', lineNumber: '24.3', description: 'Others specify', lineType: 'DATA', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: false, formula: '' },
    { lineId: 'LINE_24_TOTAL', noteId: 'NOTE_24', lineNumber: '24.T', description: 'Total Social Benefits', lineType: 'TOTAL', parentLineId: '', indent: 0, dataType: 'CURRENCY', required: true, formula: 'SUM(24.1:24.3)' }
  ];
}

// Continue in next part...
