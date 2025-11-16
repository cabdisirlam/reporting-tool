# IPSAS Financial Notes Implementation Guide

## Overview

This system now includes **complete IPSAS note templates** for all Statement of Financial Position and Statement of Financial Performance notes (Notes 6-54).

## What's Included

### Note Templates (49 notes total)

#### **Statement of Financial Performance - Revenue (Notes 6-15)**
- Note 6: Transfers from Other Government Entities
- Note 7: Levies, Fines and Penalties
- Note 8: Public Contributions and Donations
- Note 9: Property Taxes Revenue
- Note 10: Licenses, Fees and Permits
- Note 11: Rendering of Services
- Note 12: Sale of Goods
- Note 13: Rental Revenue from Facilities and Equipment
- Note 14: Finance Income
- Note 15: Other Income

#### **Statement of Financial Performance - Expenses (Notes 16-29)**
- Note 16: Use of Goods and Services
- Note 17: Employee Costs
- Note 18: Board Expenses
- Note 19: Depreciation and Amortization Expense
- Note 20: Repairs and Maintenance
- Note 21: Contracted Services
- Note 22: Grants and Subsidies
- Note 23: Finance Costs
- Note 24: Social Benefits Expenses
- Note 25: Gain on Sale of Assets
- Note 26: Gain/Loss on Foreign Exchange Transactions
- Note 27: Gain/(Loss) on Fair Value Investments
- Note 28: Impairment Loss
- Note 29: Taxation

#### **Statement of Financial Position - Assets (Notes 30-39)**
- Note 30: Cash and Cash Equivalents
- Note 31: Prepayments
- Note 32: Receivables from Exchange Transactions
- Note 33: Receivables from Non-Exchange Transactions
- Note 34: Inventories
- Note 35: Investments in Financial Assets
- Note 36: Property, Plant and Equipment
- Note 37: Intangible Assets
- Note 38: Investment Property
- Note 39: Biological Assets

#### **Statement of Financial Position - Liabilities (Notes 40-53)**
- Note 40: Trade and Other Payables
- Note 41: Refundable Deposits
- Note 42: Prepayments from Customers
- Note 43: Current Provisions
- Note 44: Finance Lease Obligation
- Note 45: Deferred Income
- Note 46: Employee Benefit Obligations
- Note 47: Borrowings
- Note 48: Social Benefit Liabilities
- Note 49: Non-Current Provisions
- Note 50: Service Concession Arrangements
- Note 51: Surplus Remission
- Note 52: Taxation Payable
- Note 53: Deferred Tax Liability

#### **Supporting Notes**
- Note 54: Cash Generated from Operations

## File Structure

```
src/backend/
├── NotesData.gs              # All note template definitions
├── NotesLineItems.gs         # Line items for Notes 6-24
├── NotesLineItemsPart2.gs    # Line items for Notes 25-54
├── NoteConfiguration.gs      # Configuration and initialization functions
```

## Setup Instructions

### Step 1: Initialize the Notes in MASTER_CONFIG

After deploying the Apps Script project, run the initialization function:

```javascript
// In Apps Script Editor, run this function:
initializeAllIPSASNotes()
```

This function will:
1. Populate the `NoteTemplates` sheet with all 49 note definitions
2. Populate the `NoteLines` sheet with all line item structures
3. Return a summary of what was initialized

Expected output:
```
Successfully initialized 49 note templates and XXX line items
```

### Step 2: Verify the Data

Check your MASTER_CONFIG spreadsheet:

**NoteTemplates Sheet:**
- Should have 49 rows of note definitions
- Columns: NoteID, NoteNumber, NoteName, Category, StatementType, HasMovementSchedule, Required, Active

**NoteLines Sheet:**
- Should have hundreds of line items
- Columns: LineID, NoteID, LineNumber, Description, LineType, ParentLineID, Indent, DataType, Required, Formula

## Using the Notes System

### Querying Notes

#### Get all notes:
```javascript
const allNotes = getAllNoteTemplates();
```

#### Get notes by category:
```javascript
const revenueNotes = getRevenueNotes();        // Notes 6-15
const expenseNotes = getExpenseNotes();        // Notes 16-29
const assetNotes = getAssetNotes();            // Notes 30-39
const liabilityNotes = getLiabilityNotes();    // Notes 40-53
```

#### Get notes by statement type:
```javascript
const positionNotes = getNotesByStatementType('SFP');      // Statement of Financial Position
const performanceNotes = getNotesByStatementType('SOFP');  // Statement of Financial Performance
const cashFlowNotes = getNotesByStatementType('CF');       // Cash Flow Statement
```

#### Get notes with movement schedules:
```javascript
const movementNotes = getNotesWithMovementSchedules();
// Returns: PPE, Intangibles, Inventories, Investment Property, etc.
```

#### Get specific note structure:
```javascript
const note30 = getNoteStructure('30');  // Cash and Cash Equivalents
// Returns: { note: {...}, lines: [...] }
```

### Line Item Structure

Each line item has:
- **lineId**: Unique identifier (e.g., 'LINE_30_01')
- **noteId**: Parent note reference (e.g., 'NOTE_30')
- **lineNumber**: Display number (e.g., '30.1')
- **description**: Line description
- **lineType**: DATA, SUBTOTAL, TOTAL, or HEADING
- **parentLineId**: For hierarchical items
- **indent**: Indentation level (0-3)
- **dataType**: CURRENCY, TEXT, NUMBER, PERCENT
- **required**: Boolean flag
- **formula**: Calculation formula (for totals)

### Example: Note 30 (Cash and Cash Equivalents)

```javascript
{
  noteId: 'NOTE_30',
  noteNumber: '30',
  noteName: 'Cash and Cash Equivalents',
  lines: [
    {
      lineId: 'LINE_30_01',
      lineNumber: '30.1',
      description: 'Current Account',
      lineType: 'DATA',
      dataType: 'CURRENCY'
    },
    {
      lineId: 'LINE_30_02',
      lineNumber: '30.2',
      description: 'Savings Account',
      lineType: 'DATA',
      dataType: 'CURRENCY'
    },
    // ... more lines
    {
      lineId: 'LINE_30_TOTAL',
      lineNumber: '30.T',
      description: 'Total Cash and Cash Equivalents',
      lineType: 'TOTAL',
      dataType: 'CURRENCY',
      formula: 'SUM(30.1:30.5)'
    }
  ]
}
```

## Data Entry

### Saving Note Data

```javascript
saveNoteData({
  entityId: 'ENT_001',
  periodId: 'PER_Q2_2024',
  noteId: 'NOTE_30',
  noteData: {
    'LINE_30_01': 5000000,      // Current Account
    'LINE_30_02': 10000000,     // Savings Account
    'LINE_30_03': 0,            // On-Call Deposits
    'LINE_30_04': 50000000,     // Fixed Deposits
    'LINE_30_05': 500000,       // Others
    'LINE_30_TOTAL': 65500000   // Total (calculated)
  }
});
```

### Retrieving Note Data

```javascript
const data = getNoteData('ENT_001', 'PER_Q2_2024', 'NOTE_30');
```

## Notes with Movement Schedules

The following notes have `hasMovementSchedule = true`:
- Note 34: Inventories
- Note 35: Investments in Financial Assets
- Note 36: Property, Plant and Equipment (PPE)
- Note 37: Intangible Assets
- Note 38: Investment Property
- Note 43: Current Provisions
- Note 44: Finance Lease Obligation
- Note 45: Deferred Income
- Note 46: Employee Benefit Obligations
- Note 47: Borrowings
- Note 49: Non-Current Provisions
- Note 53: Deferred Tax Liability

For these notes, additional movement schedule sheets will be created in period spreadsheets.

## Formulas

Formulas are defined using line numbers:
- `SUM(30.1:30.5)` - Sum lines 30.1 through 30.5
- `6.ST1+6.4` - Add subtotal 1 and line 6.4
- `32.3-32.4` - Subtract line 32.4 from 32.3
- `(51.1-51.2)*0.9` - Calculate 90% of difference

## Validation

The system includes built-in validation rules:
1. **Required fields**: Lines marked as required must have values
2. **Formula validation**: Totals must match calculated values
3. **Cross-note validation**: Related notes must reconcile
4. **Data type validation**: Values must match expected data types

## Comparative Period

All notes support comparative period data:
- Current FY (e.g., 2024-25)
- Comparative FY (e.g., 2023-24)

Both columns are stored and can be compared for variance analysis.

## Customization

### Adding Custom Line Items

Entities can add custom lines by:
1. Using "Others (specify)" lines in the templates
2. Adding entity-specific line items in the data entry interface
3. Creating entity-specific note configurations

### Hiding Unused Notes

Notes can be deactivated by setting `active = false` in the NoteTemplates sheet.

## Next Steps

After initializing the notes:

1. **Configure validation rules** - Define cross-note validations
2. **Build data entry forms** - Create frontend forms for each note
3. **Create report templates** - Design printable note formats
4. **Implement movement schedules** - Build PPE, Intangibles, Inventory trackers
5. **Set up approval workflows** - Configure note-level approvals

## Technical Details

### Performance Optimization
- Batch operations for reading/writing
- Caching for frequently accessed notes
- Lazy loading of line items

### Data Storage
- Note data stored as JSON in EntityNoteData sheet
- One row per entity per note per period
- Efficient lookups using entity and period IDs

### Extensibility
- New notes can be added to NotesData.gs
- Line structures are flexible and hierarchical
- Support for complex formulas and calculations

## Support

For questions or issues:
- Email: cabdisirlam@gmail.com
- Phone: 254716261111

---

**Built for National Treasury of Kenya**
**IPSAS Compliant Financial Reporting System**
