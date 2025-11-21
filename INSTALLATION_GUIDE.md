# Google Apps Script Installation Guide
## IPSAS Financial Consolidation System

This guide provides step-by-step instructions for installing and setting up the IPSAS Financial Consolidation System in Google Apps Script.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
   - [Method 1: Using Clasp CLI (Recommended)](#method-1-using-clasp-cli-recommended)
   - [Method 2: Manual Installation](#method-2-manual-installation)
3. [Initial System Configuration](#initial-system-configuration)
4. [Creating Database Structure](#creating-database-structure)
5. [User Setup](#user-setup)
6. [Testing the Installation](#testing-the-installation)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Google Account** with access to:
  - Google Apps Script
  - Google Sheets
  - Google Drive
- **Node.js** (version 14 or higher) - only needed for clasp method
- **Git** - for cloning the repository
- **Basic knowledge** of Google Apps Script and Google Sheets

---

## Installation Methods

You can install this system using either the Clasp CLI (recommended) or manually through the Apps Script editor.

---

## Method 1: Using Clasp CLI (Recommended)

Clasp is Google's official command-line tool for Apps Script development.

### Step 1: Install Clasp

```bash
npm install -g @google/clasp
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/cabdisirlam/reporting-tool.git
cd reporting-tool
```

### Step 3: Login to Google Apps Script

```bash
clasp login
```

This will:
- Open your browser
- Ask you to sign in to your Google account
- Grant clasp permission to manage your Apps Script projects

### Step 4: Create a New Apps Script Project

```bash
clasp create --type standalone --title "IPSAS Financial Consolidation System"
```

This creates:
- A new Apps Script project in your Google Drive
- A `.clasp.json` file with your project's script ID

### Step 5: Push Code to Apps Script

```bash
clasp push
```

This uploads all files to your Apps Script project:
- All `.gs` files (backend code)
- All `.html` files (frontend pages)
- All `.js` files (client-side scripts)
- All `.css` files (styles)
- `appsscript.json` (project configuration)

### Step 6: Open the Project

```bash
clasp open
```

This opens the Apps Script editor in your browser.

### Step 7: Deploy as Web App

**Option A: Using Clasp**
```bash
clasp deploy --description "Initial deployment"
```

**Option B: Via Apps Script Editor**
1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" → Choose **Web app**
3. Configure deployment:
   - **Description**: "Production v1.0"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone (or Anyone with Google account)
4. Click **Deploy**
5. Copy the **Web app URL** (you'll need this to access the system)

---

## Method 2: Manual Installation

If you prefer not to use clasp or don't have Node.js installed, follow these steps.

### Step 1: Create a New Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Rename it to "IPSAS Financial Consolidation System"

### Step 2: Download the Repository

1. Download the repository as a ZIP file from GitHub
2. Extract the files to your computer

### Step 3: Create Backend Files

For each `.gs` file in `src/backend/`, create a corresponding file:

1. In Apps Script editor, click **+** next to Files
2. Select **Script** (.gs file)
3. Name it exactly as shown (without the .gs extension)
4. Copy the content from the downloaded file
5. Paste into the Apps Script editor

**Files to create (in this order):**

1. `Utils.gs` - Helper functions (create this first as others depend on it)
2. `Auth.gs` - Authentication
3. `Code.gs` - Main entry point (this will replace the default Code.gs)
4. `EntityManagement.gs` - Entity management
5. `NoteConfiguration.gs` - Note templates
6. `DataEntry.gs` - Data entry logic
7. `Validation.gs` - Validation engine
8. `Approval.gs` - Approval workflow
9. `Reports.gs` - Report generation
10. `Statements.gs` - Financial statements
11. `Budget.gs` - Budget functions
12. `CashFlow.gs` - Cash flow statements
13. `Movements.gs` - Movement schedules
14. `Notifications.gs` - Email notifications
15. `PeriodManagement.gs` - Period operations

### Step 4: Create Frontend Files

For each `.html` file in `src/frontend/html/`, create an HTML file:

1. Click **+** next to Files
2. Select **HTML**
3. Name it exactly as shown (without the .html extension)
4. Copy the entire content (including embedded CSS and JavaScript)

**Files to create:**

1. `Login.html`
2. `Dashboard.html`
3. `AdminPanel.html`
4. `DataEntry.html`
5. `NoteEntry.html`
6. `MovementEntry.html`
7. `BudgetEntry.html`
8. `CashFlowEntry.html`
9. `ChangesInNetAssetsEntry.html`
10. `ValidationReport.html`
11. `ApprovalDashboard.html`
12. `ApprovalReview.html`
13. `EntityList.html`
14. `EntityForm.html`
15. `NoteConfig.html`
16. `Reports.html`
17. `Statements.html`

Also create `index.html` from the root directory.

### Step 5: Configure Project Settings

1. Click the gear icon (Project Settings)
2. Scroll to **Google Cloud Platform (GCP) Project**
3. Click **Change project** (if you need advanced services)

### Step 6: Enable Advanced Services

1. In the Apps Script editor, click **Services** (+ icon next to Services)
2. Find and add:
   - **Google Drive API** (version v3) - symbol: `Drive`
   - **Google Sheets API** (version v4) - symbol: `Sheets`

### Step 7: Update appsscript.json

1. In the Apps Script editor, click **Project Settings**
2. Check **Show "appsscript.json" manifest file in editor**
3. Go back to **Editor** view
4. Open `appsscript.json`
5. Replace its content with:

```json
{
  "timeZone": "Africa/Nairobi",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      },
      {
        "userSymbol": "Sheets",
        "version": "v4",
        "serviceId": "sheets"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  }
}
```

### Step 8: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure:
   - **Description**: "Initial deployment"
   - **Execute as**: Me
   - **Who has access**: Anyone (or your preference)
4. Click **Deploy**
5. **Important**: Copy the Web app URL

---

## Initial System Configuration

After deployment, you need to set up the system database and configuration.

### Step 1: Create Master Configuration Spreadsheet

1. In the Apps Script editor, select function: `setupSystem`
2. Click **Run**
3. **Authorize** the script when prompted:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to IPSAS Financial Consolidation System (unsafe)**
   - Click **Allow**

4. Check the execution log (Ctrl + Enter) for:
   - "MASTER_CONFIG spreadsheet created"
   - The spreadsheet ID
   - Confirmation that sheets were created

### Step 2: Configure Script Properties

1. In Apps Script editor, go to **Project Settings**
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add the following properties:

| Property Name | Value | Description |
|--------------|-------|-------------|
| `MASTER_CONFIG_ID` | [your spreadsheet ID] | ID of the master configuration sheet |

**How to get the Spreadsheet ID:**
- Open the spreadsheet created by `setupSystem()`
- The ID is in the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 3: Verify Master Configuration Structure

The `setupSystem()` function should have created a spreadsheet with these sheets:

1. **Entities** - Entity master data
2. **Users** - User accounts and roles
3. **NoteTemplates** - IPSAS note definitions
4. **NoteLines** - Note line items structure
5. **ValidationRules** - Validation configurations
6. **PeriodConfig** - Reporting periods
7. **SystemConfig** - System-wide settings

---

## Creating Database Structure

### Step 1: Add Sample Entities (Optional)

To test the system with sample data:

1. In Apps Script editor, select function: `createSampleEntities`
2. Click **Run**
3. This creates 5 sample entities in the Entities sheet

**Or manually add entities:**

Open the MASTER_CONFIG spreadsheet → **Entities** sheet and add:

| EntityID | EntityName | EntityType | ParentID | Status | ContactEmail |
|----------|------------|------------|----------|--------|--------------|
| ENT_001 | Kenya Revenue Authority | SAGA | | ACTIVE | kra@treasury.go.ke |
| ENT_002 | Kenya Ports Authority | SAGA | | ACTIVE | kpa@treasury.go.ke |

**Entity Types:**
- `SAGA` - State Agency/Government Agency
- `MINISTRY` - Government Ministry
- `DEPARTMENT` - Department
- `COUNTY` - County Government

### Step 2: Create First Reporting Period

1. In Apps Script editor, select function: `testCreatePeriod`
2. **Or** run this code in the Apps Script editor:

```javascript
function createFirstPeriod() {
  var result = createPeriod({
    periodName: 'Q2 2024-25',
    fiscalYear: '2024-25',
    quarter: 'Q2',
    startDate: new Date(2024, 9, 1),     // October 1, 2024
    endDate: new Date(2024, 11, 31),     // December 31, 2024
    deadlineDate: new Date(2025, 0, 15)  // January 15, 2025
  });

  Logger.log('Period created: ' + JSON.stringify(result));
}
```

3. Click **Run**
4. This creates:
   - A new spreadsheet for the period (e.g., "Q2_2024_25")
   - Multiple sheets for data storage
   - A script property with the spreadsheet ID

### Step 3: Verify Period Spreadsheet

The period spreadsheet should contain:

1. **EntityNoteData** - Actual financial data entries
2. **SubmissionStatus** - Submission tracking
3. **ValidationResults** - Validation outputs
4. **AuditLog** - Activity tracking
5. **Movements_PPE** - Property, Plant & Equipment movements
6. **Movements_Intangibles** - Intangible asset movements
7. **Movements_Inventory** - Inventory movements
8. **Budget** - Budget data
9. **CashFlow** - Cash flow data

---

## User Setup

### Step 1: Create Admin User

1. Open MASTER_CONFIG spreadsheet
2. Go to **Users** sheet
3. Add your admin account:

The system automatically creates a default admin user:
- **Email**: cabdisirlam@gmail.com
- **PIN**: 123456
- **Role**: ADMIN

**Note:** The Users sheet includes a visible **PIN** column for quick setup; when the backend first reads the sheet it hashes any value into **PINHash**/**PINSalt** and clears the plaintext cell. This keeps login easy (enter a 6-digit PIN) while maintaining secure storage.

### Step 2: Create Sample Users (Optional)

You can use the Admin Panel in the application to create additional users with different roles. All new users will receive a default PIN of 123456 and can change it after first login

**User Roles:**

- **ADMIN** - Full system access, entity & user management
- **APPROVER** - Can approve/reject submissions
- **DATA_ENTRY** - Can enter data for assigned entity
- **VIEWER** - Read-only access

---

## Testing the Installation

### Step 1: Access the Web App

1. Open the Web app URL (from deployment)
2. You should see the **Login** page

### Step 2: Login

1. Enter your email (cabdisirlam@gmail.com) and PIN (123456)
2. Click **Login**
3. You should be redirected to the **Dashboard**

### Step 3: Test Admin Panel (if you're an ADMIN)

1. From Dashboard, click **Admin Panel**
2. Verify you can see:
   - Entity Management
   - User Management
   - Period Management
   - System Configuration

### Step 4: Test Data Entry

1. Go to **Dashboard**
2. Select an entity (if you're DATA_ENTRY, your entity is pre-selected)
3. Select a reporting period
4. Click **Start Data Entry**
5. Try entering data for a note (e.g., Note 30: Cash and Cash Equivalents)
6. Verify auto-save works (save indicator should show after 30 seconds)

### Step 5: Test Validation

1. After entering some data, click **Validate**
2. Check if validation runs without errors
3. Validation results should display

### Step 6: Test Reports

1. Go to **Reports** menu
2. Try generating an entity report
3. Verify the report displays correctly

---

## Troubleshooting

### Issue: "Script function not found: doGet"

**Solution:**
- Ensure `Code.gs` contains the `doGet()` function
- Redeploy the web app

### Issue: "Authorization required"

**Solution:**
1. Run any function from the Apps Script editor
2. Click **Review Permissions**
3. Authorize the script
4. Try again

### Issue: "Cannot read property of undefined"

**Solution:**
- Verify `MASTER_CONFIG_ID` is set in Script Properties
- Ensure the spreadsheet ID is correct
- Check the spreadsheet hasn't been deleted

### Issue: "User not found" on login

**Solution:**
- Check the **Users** sheet in MASTER_CONFIG
- Verify your email is listed
- Ensure Status is "ACTIVE"
- Check PIN hash and salt columns are populated

### Issue: "Period spreadsheet not found"

**Solution:**
1. Go to Script Properties
2. Look for `PERIOD_{periodId}` property
3. If missing, run `createPeriod()` again
4. Or manually add the script property with the spreadsheet ID

### Issue: HTML pages not displaying correctly

**Solution:**
- Ensure all HTML files were created
- Check for JavaScript errors in browser console (F12)
- Verify the HTML includes embedded CSS and JavaScript
- Clear browser cache

### Issue: "Exception: Service Drive is not enabled"

**Solution:**
1. In Apps Script editor, click **Services** (+)
2. Add **Google Drive API** (v3)
3. Save and try again

### Issue: Auto-save not working

**Solution:**
- Check browser console for JavaScript errors
- Verify you have edit permissions
- Check if period is locked
- Try in a different browser

### Issue: "Access denied" for non-admin users

**Solution:**
- Verify the user's role in Users sheet
- Check EntityID is set for DATA_ENTRY users
- Ensure Status is ACTIVE
- Check authorization logic in `Auth.gs`

---

## Post-Installation Checklist

- [ ] Apps Script project created and deployed
- [ ] MASTER_CONFIG spreadsheet created
- [ ] Script properties configured
- [ ] Sample entities added
- [ ] At least one reporting period created
- [ ] Admin user created
- [ ] Successfully logged in
- [ ] Dashboard loads correctly
- [ ] Data entry works
- [ ] Validation runs
- [ ] Reports generate

---

## Next Steps

After successful installation:

1. **Customize Entities**: Add your actual entities to the Entities sheet
2. **Add Users**: Create user accounts for your team
3. **Configure Notes**: Review and customize note templates in NoteTemplates
4. **Set Validation Rules**: Configure validation rules for your needs
5. **Create Periods**: Set up your reporting periods
6. **Train Users**: Provide training for data entry officers and approvers
7. **Test Workflow**: Run through the complete workflow with sample data
8. **Go Live**: Open the period and start actual data collection

---

## Additional Resources

- **User Manual**: See `docs/USER_MANUAL.md` (if available)
- **API Documentation**: See `docs/API_DOCS.md` (if available)
- **Video Tutorials**: [Coming soon]
- **Support Email**: cabdisirlam@gmail.com
- **Contact**: 254716261111

---

## Security Recommendations

1. **Change Default PIN**: Change the default PIN (123456) to a secure 6-digit PIN after first login
2. **Restrict Access**: Set web app access to "Anyone with Google account" instead of "Anyone"
3. **Enable 2FA**: Enable two-factor authentication on your Google account
4. **Regular Backups**: Set up automatic backups of your spreadsheets
5. **Audit Trail**: Regularly review the AuditLog sheet
6. **Update Permissions**: Review user permissions quarterly
7. **Upgrade Auth**: Consider upgrading to OAuth2 authentication for production

---

## System Requirements

- **Browser**: Google Chrome (recommended), Firefox, Safari, or Edge
- **Internet**: Stable internet connection required
- **Screen Resolution**: Minimum 1280x720
- **Google Account**: Required for all users
- **JavaScript**: Must be enabled
- **Cookies**: Must be enabled for session management

---

**Installation Complete!**

You now have a fully functional IPSAS Financial Consolidation System. If you encounter any issues not covered in this guide, please contact support.

---

*Last Updated: November 2024*
*Version: 1.0.0*
*National Treasury of Kenya*
