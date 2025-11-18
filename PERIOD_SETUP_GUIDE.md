# Period Setup Guide

## Overview

This guide explains how the reporting system handles period configuration and provides instructions for administrators to manage reporting periods.

## Initial Period Setup

### Automatic Initialization

The system automatically creates the default period in two scenarios:

**1. During Initial System Setup** (Recommended)
When you run `setupSystemNoUI()` from `Code.gs`, the system will:
1. Create the master configuration spreadsheet
2. Set up all required sheets (Users, Entities, PeriodConfig, etc.)
3. **Automatically create Q2 2025/26** as the default period
4. **Open the period** for immediate data entry

**2. On First Admin Login** (Fallback)
If the system setup didn't create a period, when you log in to the admin dashboard, the system will:
1. **Check System Health**: Verify that all required components are configured
2. **Create Default Period**: If no periods exist, automatically create **Q2 2025/26** as the initial reporting period
3. **Activate Period**: Open the default period for data entry
4. **Display Alerts**: Show system health warnings and initialization status on the dashboard

### Default Period Details

- **Period Name**: Q2 2025/26
- **Fiscal Year**: 2025-26
- **Quarter**: Q2
- **Start Date**: October 1, 2025
- **End Date**: December 31, 2025
- **Deadline**: January 15, 2026 (15 days after quarter end)
- **Initial Status**: OPEN (active for data entry)

## Period Management

### Dashboard Features

#### Admin Dashboard

When you log in as an administrator, you'll see:

1. **System Health Alerts**: At the top of the dashboard
   - Red alerts for critical issues
   - Yellow alerts for warnings
   - Blue alerts for informational messages

2. **Active Period Section**: Shows the currently active period
   - Period name and fiscal year
   - Current status (OPEN, CLOSED, or LOCKED)
   - Submission deadline
   - Quick action buttons to manage periods

3. **Period Management Card**: Quick access to period administration
   - "Manage Periods" button - View all periods
   - "Create Period" button - Add a new reporting period

### Creating New Periods

You can create new periods in two ways:

#### Method 1: From Admin Dashboard
1. Click the **"Create Period"** button on the Period Management card
2. You'll be redirected to the Period Setup page

#### Method 2: From Admin Panel
1. Click **"Admin Panel"** in the navigation
2. Select the **"Period Management"** tab
3. Fill in the period creation form:
   - **Quarter**: Select Q1, Q2, Q3, or Q4
   - **Fiscal Year**: Select the fiscal year (e.g., "2025-26")
   - **Start Date**: Enter the period start date
   - **End Date**: Enter the period end date
   - **Deadline**: Enter the submission deadline
   - **Status**: Select initial status (CLOSED recommended)
4. Click **"Create Period"**

### Period Status Management

Periods can have three statuses:

#### 1. OPEN
- **Description**: Active for data entry
- **Rules**:
  - Only ONE period can be OPEN at a time
  - Opening a period automatically closes all other open periods
  - Users can submit and edit their data
- **Actions Available**: Close, Lock

#### 2. CLOSED
- **Description**: Not accepting submissions (soft close)
- **Rules**:
  - Users cannot submit new data
  - Admins can still access the data
  - Can be reopened if needed
- **Actions Available**: Open

#### 3. LOCKED
- **Description**: Permanently locked (hard lock)
- **Rules**:
  - Cannot be reopened
  - No changes allowed by anyone
  - Requires all entities to have submitted before locking
  - Spreadsheet protection is applied
- **Actions Available**: None (permanent)

### Activating/Deactivating Periods

#### To Activate a Period (Open)
1. Go to **Admin Panel → Period Management**
2. Find the period you want to activate
3. Click the **"Open"** button
4. Confirm the action
5. The system will:
   - Close all other open periods
   - Set the selected period to OPEN
   - Make it the active period for all users

#### To Deactivate a Period (Close)
1. Go to **Admin Panel → Period Management**
2. Find the open period
3. Click the **"Close"** button
4. Confirm the action
5. The period will be set to CLOSED (can be reopened later)

#### To Permanently Lock a Period
1. Go to **Admin Panel → Period Management**
2. Find the open period you want to lock
3. Click the **"Lock"** button
4. Confirm the action
5. The system will:
   - Verify all entities have submitted
   - Set the period to LOCKED
   - Apply spreadsheet protection
   - Prevent any future changes

**Note**: You cannot lock a period if any entities have not submitted their data.

## System Architecture

### Period Data Structure

Each period is stored in the **PeriodConfig** sheet with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| PeriodID | Unique identifier | PER_Q2_202526 |
| PeriodName | Display name | Q2 2025/26 |
| SpreadsheetID | Dedicated period spreadsheet | 1abc...xyz |
| FiscalYear | Fiscal year | 2025-26 |
| Quarter | Quarter identifier | Q2 |
| StartDate | Period start date | 2025-10-01 |
| EndDate | Period end date | 2025-12-31 |
| DeadlineDate | Submission deadline | 2026-01-15 |
| Status | Current status | OPEN |
| CreatedDate | Creation timestamp | 2025-11-18 |

### Multi-Spreadsheet Architecture

The system uses a **multi-spreadsheet architecture** for better scalability:

```
MASTER_CONFIG Spreadsheet
├── Users
├── Entities
├── PeriodConfig (stores period metadata)
├── NoteTemplates
└── NoteLines

Period Q2 2025/26 Spreadsheet (separate file)
├── SubmissionStatus (tracks entity submissions)
└── EntityNoteData (stores financial data)

Period Q3 2025/26 Spreadsheet (separate file)
├── SubmissionStatus
└── EntityNoteData
```

**Benefits**:
- Better performance (smaller sheets to load)
- Easier backup and archival
- Scales to many periods without bloating master config
- Clearer data separation

## Troubleshooting

### Issue: Dashboard Shows White Screen

**Cause**: PeriodConfig sheet is empty, and no periods exist.

**Solution**: The system now auto-initializes the default period. If this doesn't happen automatically:

1. Open Google Apps Script editor
2. Run the function: `initializeDefaultPeriod()`
3. Check the logs to verify success
4. Reload your web app

### Issue: "No period is currently open" Warning

**Cause**: All periods are CLOSED or LOCKED.

**Solution**:
1. Go to **Admin Panel → Period Management**
2. Find the period you want to activate
3. Click **"Open"** to make it the active period

### Issue: Cannot Lock Period

**Cause**: Some entities have not submitted their data.

**Solution**:
1. Check the **Pending Submissions** count on the dashboard
2. Contact entities that haven't submitted
3. Once all entities have submitted, try locking again

### Issue: System Health Alerts Showing Warnings

**Cause**: System detected configuration issues.

**Actions**:
- Read the alert message carefully
- Click **"Manage Periods"** if the alert is period-related
- Contact system administrator if the issue persists

## Best Practices

### Period Naming Convention
- Use format: `Q{quarter} {fiscal_year}`
- Example: `Q2 2025/26`, `Q3 2025/26`
- Keep names consistent across periods

### Period Lifecycle
1. **Create**: Set up period with dates and deadlines
2. **Test**: Keep as CLOSED initially for testing
3. **Open**: Activate when ready for submissions
4. **Monitor**: Track submission progress
5. **Close**: Soft close when deadline passes
6. **Review**: Verify all submissions are approved
7. **Lock**: Permanently lock for archival

### Deadline Setting
- **Quarterly periods (Q1-Q3)**: 15 days after quarter end
- **Annual period (Q4)**: 60 days after fiscal year end
- Adjust based on your organization's needs

### Period Planning
- Create periods in advance
- Keep them CLOSED until ready to activate
- Only open one period at a time
- Allow sufficient time between periods for review

## Support

For additional help or to report issues:
- Contact your system administrator
- Check the audit log for detailed activity history
- Review the system health alerts on the dashboard

---

**Last Updated**: November 2025
**Version**: 1.0
