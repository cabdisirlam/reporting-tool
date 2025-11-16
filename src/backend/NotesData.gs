/**
 * NotesData.gs - Complete IPSAS Note Templates and Line Definitions
 *
 * Contains all note templates and line structures for:
 * - Statement of Financial Performance (Notes 6-29)
 * - Statement of Financial Position (Notes 30-53)
 * - Supporting Notes (Note 54)
 */

// ============================================================================
// NOTE TEMPLATES
// ============================================================================

/**
 * Returns all note templates for Position and Performance statements
 * @returns {Array} Array of note template objects
 */
function getAllNoteTemplates() {
  return [
    // =======================================================================
    // STATEMENT OF FINANCIAL PERFORMANCE - REVENUE NOTES
    // =======================================================================
    {
      noteId: 'NOTE_06',
      noteNumber: '6',
      noteName: 'Transfers from Other Government Entities',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_07',
      noteNumber: '7',
      noteName: 'Levies, Fines and Penalties',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_08',
      noteNumber: '8',
      noteName: 'Public Contributions and Donations',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_09',
      noteNumber: '9',
      noteName: 'Property Taxes Revenue',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_10',
      noteNumber: '10',
      noteName: 'Licenses, Fees and Permits',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_11',
      noteNumber: '11',
      noteName: 'Rendering of Services',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_12',
      noteNumber: '12',
      noteName: 'Sale of Goods',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_13',
      noteNumber: '13',
      noteName: 'Rental Revenue from Facilities and Equipment',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_14',
      noteNumber: '14',
      noteName: 'Finance Income',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_15',
      noteNumber: '15',
      noteName: 'Other Income',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },

    // =======================================================================
    // STATEMENT OF FINANCIAL PERFORMANCE - EXPENSE NOTES
    // =======================================================================
    {
      noteId: 'NOTE_16',
      noteNumber: '16',
      noteName: 'Use of Goods and Services',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_17',
      noteNumber: '17',
      noteName: 'Employee Costs',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_18',
      noteNumber: '18',
      noteName: 'Board Expenses',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_19',
      noteNumber: '19',
      noteName: 'Depreciation and Amortization Expense',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_20',
      noteNumber: '20',
      noteName: 'Repairs and Maintenance',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_21',
      noteNumber: '21',
      noteName: 'Contracted Services',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_22',
      noteNumber: '22',
      noteName: 'Grants and Subsidies',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_23',
      noteNumber: '23',
      noteName: 'Finance Costs',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_24',
      noteNumber: '24',
      noteName: 'Social Benefits Expenses',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_25',
      noteNumber: '25',
      noteName: 'Gain on Sale of Assets',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_26',
      noteNumber: '26',
      noteName: 'Gain/Loss on Foreign Exchange Transactions',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_27',
      noteNumber: '27',
      noteName: 'Gain/(Loss) on Fair Value Investments',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_28',
      noteNumber: '28',
      noteName: 'Impairment Loss',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_29',
      noteNumber: '29',
      noteName: 'Taxation',
      category: 'Performance',
      statementType: 'SOFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },

    // =======================================================================
    // STATEMENT OF FINANCIAL POSITION - ASSET NOTES
    // =======================================================================
    {
      noteId: 'NOTE_30',
      noteNumber: '30',
      noteName: 'Cash and Cash Equivalents',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_31',
      noteNumber: '31',
      noteName: 'Prepayments',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_32',
      noteNumber: '32',
      noteName: 'Receivables from Exchange Transactions',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_33',
      noteNumber: '33',
      noteName: 'Receivables from Non-Exchange Transactions',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_34',
      noteNumber: '34',
      noteName: 'Inventories',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_35',
      noteNumber: '35',
      noteName: 'Investments in Financial Assets',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_36',
      noteNumber: '36',
      noteName: 'Property, Plant and Equipment',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_37',
      noteNumber: '37',
      noteName: 'Intangible Assets',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_38',
      noteNumber: '38',
      noteName: 'Investment Property',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_39',
      noteNumber: '39',
      noteName: 'Biological Assets',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },

    // =======================================================================
    // STATEMENT OF FINANCIAL POSITION - LIABILITY NOTES
    // =======================================================================
    {
      noteId: 'NOTE_40',
      noteNumber: '40',
      noteName: 'Trade and Other Payables',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_41',
      noteNumber: '41',
      noteName: 'Refundable Deposits',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_42',
      noteNumber: '42',
      noteName: 'Prepayments from Customers',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_43',
      noteNumber: '43',
      noteName: 'Current Provisions',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_44',
      noteNumber: '44',
      noteName: 'Finance Lease Obligation',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_45',
      noteNumber: '45',
      noteName: 'Deferred Income',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_46',
      noteNumber: '46',
      noteName: 'Employee Benefit Obligations',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_47',
      noteNumber: '47',
      noteName: 'Borrowings',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_48',
      noteNumber: '48',
      noteName: 'Social Benefit Liabilities',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_49',
      noteNumber: '49',
      noteName: 'Non-Current Provisions',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: true,
      active: true
    },
    {
      noteId: 'NOTE_50',
      noteNumber: '50',
      noteName: 'Service Concession Arrangements',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_51',
      noteNumber: '51',
      noteName: 'Surplus Remission',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_52',
      noteNumber: '52',
      noteName: 'Taxation Payable',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: false,
      required: false,
      active: true
    },
    {
      noteId: 'NOTE_53',
      noteNumber: '53',
      noteName: 'Deferred Tax Liability',
      category: 'Position',
      statementType: 'SFP',
      hasMovementSchedule: true,
      required: false,
      active: true
    },

    // =======================================================================
    // SUPPORTING NOTES
    // =======================================================================
    {
      noteId: 'NOTE_54',
      noteNumber: '54',
      noteName: 'Cash Generated from Operations',
      category: 'CashFlow',
      statementType: 'CF',
      hasMovementSchedule: false,
      required: true,
      active: true
    }
  ];
}
