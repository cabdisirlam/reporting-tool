# Google Sheets Database Structure Guide

This document describes the Google Sheets database structure for the IPSAS Financial Consolidation System.

## Overview

The system uses Google Sheets as a database with two main components:

1. **MASTER_CONFIG** - Single spreadsheet containing master data
2. **Period Spreadsheets** - One spreadsheet per reporting period (Q1, Q2, Q3, Q4, Annual)

## 1. MASTER_CONFIG Spreadsheet

### Sheet: Entities

Stores all SAGA entities.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| EntityID | Text | Unique entity identifier | ENT_001 |
| Code | Text | Entity short code | KENGEN |
| Name | Text | Full entity name | Kenya Electricity Generating Company |
| Type | Text | Entity type | Commercial State Corporation |
| Sector | Text | Sector classification | Energy |
| Ministry | Text | Parent ministry | Ministry of Energy |
| Status | Text | ACTIVE/INACTIVE | ACTIVE |
| CreatedDate | Date | Creation timestamp | 2024-01-15 |
| CreatedBy | Email | Creator email | admin@treasury.go.ke |

**Sample Data:**
```
ENT_001 | KENGEN | Kenya Electricity Generating Company | Commercial State Corporation | Energy | Ministry of Energy | ACTIVE
ENT_002 | KPA    | Kenya Ports Authority                 | Commercial State Corporation | Transport | Ministry of Transport | ACTIVE
```

### Sheet: Users

Stores user accounts.

| Column | Type | Description | Values |
|--------|------|-------------|--------|
| UserID | Text | Unique user ID | USR_001 |
| Email | Email | User email address | john.doe@kengen.co.ke |
| Name | Text | Full name | John Doe |
| Role | Text | User role | ADMIN/APPROVER/DATA_ENTRY/VIEWER |
| EntityID | Text | Assigned entity | ENT_001 |
| EntityName | Text | Entity name | KENGEN |
| Status | Text | Account status | ACTIVE/INACTIVE |
| PIN | Text | Temporary 6-digit PIN (optional for setup) | 123456 |
| PINHash | Text | Hashed 6-digit PIN | [hash] |
| PINSalt | Text | Unique salt for PIN | [salt] |
| CreatedDate | Date | Account creation date | 2024-01-15 |
| CreatedBy | Email | Creator | system |

**Sample Data:**
```
USR_ADMIN | cabdisirlam@gmail.com | System Administrator | ADMIN      |         |        | ACTIVE | 123456 | [hash] | [salt] | 2024-01-15 | system
USR_002   | john@kengen.co.ke     | John Doe             | DATA_ENTRY | ENT_001 | KENGEN | ACTIVE |        | [hash] | [salt] | 2024-01-15 | admin@kengen.co.ke
USR_003   | jane@kengen.co.ke     | Jane Approver        | APPROVER   |         |        | ACTIVE |        | [hash] | [salt] | 2024-01-15 | admin@kengen.co.ke
```

**PIN handling:** The `PIN` column lets administrators enter an easy-to-remember 6-digit PIN when setting up users. On first read, the Apps Script backend hashes the value into `PINHash`/`PINSalt` and clears the plaintext `PIN` cell, keeping login simple for users while preserving security.

### Sheet: NoteTemplates

Defines IPSAS note structure.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| NoteID | Text | Unique note ID | NOTE_30 |
| NoteNumber | Text | IPSAS note number | 30 |
| NoteName | Text | Note description | Cash and Cash Equivalents |
| Category | Text | Statement category | Position/Performance/CashFlow |
| StatementType | Text | Statement type | SFP/SOFP/CF |
| HasMovementSchedule | Boolean | Requires movement? | TRUE/FALSE |
| Required | Boolean | Mandatory? | TRUE/FALSE |
| Active | Boolean | Currently in use? | TRUE/FALSE |

**Sample Data:**
```
NOTE_30 | 30 | Cash and Cash Equivalents        | Position    | SFP  | FALSE | TRUE | TRUE
NOTE_36 | 36 | Property, Plant and Equipment    | Position    | SFP  | TRUE  | TRUE | TRUE
NOTE_06 | 6  | Revenue                          | Performance | SOFP | FALSE | TRUE | TRUE
```

### Sheet: NoteLines

Defines line items within notes.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| LineID | Text | Unique line ID | LINE_30_01 |
| NoteID | Text | Parent note | NOTE_30 |
| LineNumber | Text | Line number | 30.1 |
| Description | Text | Line description | Cash on hand |
| LineType | Text | DATA/TOTAL/HEADING | DATA |
| ParentLineID | Text | Parent line (for sub-items) | LINE_30_01 |
| Indent | Number | Indentation level (0-3) | 0 |
| DataType | Text | CURRENCY/TEXT/NUMBER/PERCENT | CURRENCY |
| Required | Boolean | Mandatory field? | TRUE/FALSE |
| Formula | Text | Calculation formula | SUM(30.1,30.2) |

**Sample Data:**
```
LINE_30_01    | NOTE_30 | 30.1   | Cash on hand     | DATA  |            | 0 | CURRENCY | TRUE  |
LINE_30_01_01 | NOTE_30 | 30.1.1 | Petty cash       | DATA  | LINE_30_01 | 1 | CURRENCY | FALSE |
LINE_30_TOTAL | NOTE_30 | 30.T   | Total Cash       | TOTAL |            | 0 | CURRENCY | TRUE  | SUM(30.1,30.2)
```

### Sheet: ValidationRules

Defines validation rules.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| RuleID | Text | Unique rule ID | VAL_001 |
| RuleName | Text | Rule name | Cash Flow Reconciliation |
| RuleType | Text | CROSS_NOTE/CALCULATION/RANGE | CROSS_NOTE |
| Condition | Text | Validation logic | NOTE_30.total == NOTE_CF.closing |
| ErrorMessage | Text | Error message | Cash flow doesn't reconcile |
| Severity | Text | ERROR/WARNING | ERROR |
| Active | Boolean | Rule enabled? | TRUE/FALSE |

### Sheet: PeriodConfig

Defines reporting periods.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| PeriodID | Text | Unique period ID | PER_Q2_2024 |
| PeriodName | Text | Display name | Q2 2024-25 |
| FiscalYear | Text | Fiscal year | 2024-25 |
| Quarter | Text | Quarter | Q1/Q2/Q3/Q4/ANNUAL |
| StartDate | Date | Period start | 2024-10-01 |
| EndDate | Date | Period end | 2024-12-31 |
| DeadlineDate | Date | Submission deadline | 2025-01-15 |
| Status | Text | OPEN/CLOSED/LOCKED | OPEN |
| CreatedDate | Date | Creation date | 2024-09-15 |

## 2. Period Spreadsheets

One spreadsheet created per period (e.g., "IPSAS_PER_Q2_2024_Q2 2024-25")

### Sheet: EntityNoteData

Stores actual financial data.

| Column | Type | Description |
|--------|------|-------------|
| EntityID | Text | Entity identifier |
| NoteID | Text | Note identifier |
| DataJSON | Text | JSON of all data values |
| LastModified | Timestamp | Last save time |
| ModifiedBy | Email | User who modified |

**DataJSON Structure Example:**
```json
{
  "LINE_30_01": "5000000",
  "LINE_30_01_01": "500000",
  "LINE_30_01_02": "4500000",
  "LINE_30_02": "50000000",
  "LINE_30_TOTAL": "55000000",
  "varianceExplanation": "Increased due to..."
}
```

### Sheet: SubmissionStatus

Tracks submission workflow.

| Column | Type | Description |
|--------|------|-------------|
| EntityID | Text | Entity identifier |
| Status | Text | DRAFT/SUBMITTED/APPROVED/REJECTED |
| SubmittedBy | Email | Who submitted |
| SubmittedDate | Timestamp | When submitted |
| SubmitterComments | Text | Comments from submitter |
| ReviewedBy | Email | Who reviewed |
| ReviewedDate | Timestamp | When reviewed |
| ReviewerComments | Text | Approver comments/rejection reason |
| LastUpdated | Timestamp | Last status change |

### Sheet: ValidationResults

Stores validation outputs.

| Column | Type | Description |
|--------|------|-------------|
| EntityID | Text | Entity identifier |
| RunDate | Timestamp | When validation ran |
| Status | Text | PASSED/FAILED |
| Errors | Number | Error count |
| Warnings | Number | Warning count |
| ResultsJSON | Text | Full validation results as JSON |

### Sheet: AuditLog

Activity tracking.

| Column | Type | Description |
|--------|------|-------------|
| Timestamp | Timestamp | When action occurred |
| User | Email | Who performed action |
| Action | Text | Action type |
| Details | Text | Action details |
| IPAddress | Text | User IP (if available) |

## Creating Spreadsheets

### Creating MASTER_CONFIG

Run in Apps Script:
```javascript
function setupSystem() {
  createMasterConfigSpreadsheet();
}
```

This automatically creates:
- Entities sheet with sample data
- Users sheet with admin user
- NoteTemplates sheet with IPSAS notes
- NoteLines sheet with line definitions
- ValidationRules sheet
- PeriodConfig sheet

### Creating Period Spreadsheet

Run in Apps Script:
```javascript
createPeriod({
  periodName: 'Q2 2024-25',
  fiscalYear: '2024-25',
  quarter: 'Q2',
  startDate: new Date(2024, 9, 1),
  endDate: new Date(2024, 11, 31),
  deadlineDate: new Date(2025, 0, 15)
});
```

This creates a new spreadsheet with:
- EntityNoteData sheet
- SubmissionStatus sheet
- ValidationResults sheet
- AuditLog sheet
- Movement schedule sheets (if needed)

## Data Access Patterns

### Reading Entity Data
```javascript
const data = getAllEntityNoteData('ENT_001', 'PER_Q2_2024');
```

### Saving Note Data
```javascript
saveNoteData({
  entityId: 'ENT_001',
  periodId: 'PER_Q2_2024',
  noteId: 'NOTE_30',
  noteData: { ... }
});
```

### Running Validations
```javascript
const results = runValidations('ENT_001', 'PER_Q2_2024');
```

## Backup & Maintenance

### Daily Backups
Set up automated Google Drive backups:
```javascript
function backupMasterConfig() {
  const ss = SpreadsheetApp.openById(MASTER_CONFIG_ID);
  const backup = ss.copy('BACKUP_' + new Date().toISOString());
  // Move to backup folder
}
```

### Archiving Old Periods
After year-end:
```javascript
function archivePeriod(periodId) {
  const ss = getPeriodSpreadsheet(periodId);
  // Move to archive folder
  // Mark as LOCKED in PeriodConfig
}
```

## Performance Optimization

### Indexing
- EntityID and PeriodID combinations are the primary lookup keys
- Use object caching for frequently accessed data

### Query Optimization
```javascript
// Good - Single read
const data = sheet.getDataRange().getValues();

// Bad - Multiple reads
for (let i = 1; i < 1000; i++) {
  const row = sheet.getRange(i, 1, 1, 10).getValues();
}
```

## Security

### Sheet Protection
```javascript
// Protect sheets when period is locked
function protectPeriodSheets(periodId) {
  const ss = getPeriodSpreadsheet(periodId);
  ss.getSheets().forEach(sheet => {
    const protection = sheet.protect();
    protection.removeEditors(protection.getEditors());
    protection.addEditor('admin@treasury.go.ke');
  });
}
```

### Data Validation
Use Google Sheets data validation for:
- Status fields (dropdown: ACTIVE/INACTIVE)
- Role fields (dropdown: ADMIN/APPROVER/DATA_ENTRY/VIEWER)
- Date formats

## Troubleshooting

### Common Issues

**Issue**: "Cannot read properties of undefined"
- Check if spreadsheet exists
- Verify script property `MASTER_CONFIG_ID` is set

**Issue**: "Exceeded maximum execution time"
- Break large operations into smaller batches
- Use triggers for long-running processes

**Issue**: "Permission denied"
- Check sheet sharing settings
- Verify user has edit access

---

For more information, see the main README.md file.
