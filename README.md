# IPSAS Financial Consolidation System

A comprehensive Google Apps Script-based financial reporting system for State Agencies and Government Agencies (SAGAs) in Kenya, built on IPSAS standards.

## 🎯 Overview

This system provides a complete solution for:
- **Entity Management**: Manage 750+ SAGAs with different entity types
- **Financial Reporting**: IPSAS-compliant note templates and statements
- **Data Entry**: Structured data capture with auto-save and validation
- **Approval Workflow**: Multi-level approval process with notifications
- **Consolidation**: National-level consolidated financial statements
- **Budget Tracking**: Budget vs actual comparisons and variance analysis

## 📋 Features

### For Data Entry Officers
- ✅ Intuitive data entry forms for all IPSAS notes
- ✅ Auto-save functionality (every 30 seconds)
- ✅ Real-time validation with error highlighting
- ✅ Movement schedules for PPE, Intangibles, and Inventory
- ✅ Cash flow statement preparation (direct/indirect method)
- ✅ Budget entry and virements
- ✅ Document attachments support
- ✅ Progress tracking dashboard

### For Approvers
- ✅ Submission review dashboard
- ✅ Validation reports with drill-down capability
- ✅ Approve/reject with comments
- ✅ Email notifications
- ✅ Bulk approval options

### For Administrators
- ✅ Entity management (CRUD operations)
- ✅ User management and role assignment
- ✅ Period management (open/close/lock)
- ✅ Note configuration
- ✅ System-wide reports
- ✅ Audit trail

## 🏗️ Architecture

### Backend (Google Apps Script)
```
src/backend/
├── Code.gs                    # Main entry point, routing
├── Auth.gs                    # Authentication & authorization
├── EntityManagement.gs        # Entity CRUD operations
├── NoteConfiguration.gs       # Note templates & structures
├── DataEntry.gs               # Data entry logic
├── Validation.gs              # Validation engine
├── Approval.gs                # Approval workflow
├── Reports.gs                 # Report generation
├── Statements.gs              # Financial statements
├── Budget.gs                  # Budget functions
├── CashFlow.gs                # Cash flow statements
├── Movements.gs               # Movement schedules
├── Notifications.gs           # Email notifications
├── PeriodManagement.gs        # Period operations
└── Utils.gs                   # Helper functions
```

### Frontend
```
src/frontend/
├── html/
│   ├── Login.html             # Login page
│   ├── Dashboard.html         # Main dashboard
│   ├── DataEntry.html         # Data entry interface
│   ├── ValidationReport.html  # Validation results
│   ├── ApprovalDashboard.html # Approver view
│   ├── Reports.html           # Reports menu
│   └── ... (more pages)
├── css/
│   ├── main.css               # Global styles
│   ├── dashboard.css          # Dashboard styles
│   ├── forms.css              # Form styles
│   └── reports.css            # Report styles
└── js/
    ├── app.js                 # Main app logic
    ├── auth.js                # Authentication
    ├── dataEntry.js           # Data entry handlers
    ├── validation.js          # Client validation
    ├── movements.js           # Movement calculations
    ├── budget.js              # Budget calculations
    ├── reports.js             # Report generation
    └── utils.js               # Helper functions
```

### Database (Google Sheets)

#### MASTER_CONFIG Spreadsheet
- **Entities**: Entity master data (750+ SAGAs)
- **Users**: User accounts and roles
- **NoteTemplates**: IPSAS note definitions
- **NoteLines**: Note line items structure
- **ValidationRules**: Validation configurations
- **PeriodConfig**: Reporting periods

#### Period Spreadsheets (Q1_2024_25, Q2_2024_25, etc.)
- **EntityNoteData**: Actual financial data
- **SubmissionStatus**: Submission tracking
- **ValidationResults**: Validation outputs
- **AuditLog**: Activity tracking
- **Movements_PPE**: PPE movement schedules
- **Movements_Intangibles**: Intangible asset movements
- **Movements_Inventory**: Inventory movements

## 🚀 Installation & Setup

### Prerequisites
- Google Account with Google Apps Script access
- Node.js 14+ (for clasp CLI)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd reporting-tool
```

### Step 2: Install Dependencies
```bash
npm install -g @google/clasp
npm install
```

### Step 3: Authenticate with Google
```bash
clasp login
```

### Step 4: Create New Apps Script Project
```bash
clasp create --type standalone --title "IPSAS Financial Consolidation System"
```

This will generate a `.clasp.json` file with your script ID.

### Step 5: Push Code to Apps Script
```bash
clasp push
```

### Step 6: Deploy as Web App
```bash
clasp deploy --description "Initial deployment"
```

Or deploy via the Apps Script editor:
1. Open the project: `clasp open`
2. Click **Deploy** > **New deployment**
3. Select type: **Web app**
4. Execute as: **User accessing the web app**
5. Who has access: **Anyone**
6. Click **Deploy**

### Step 7: Initial System Setup

1. Open the deployed web app URL
2. The first time, run the setup function:
   - Open Apps Script editor
   - Run `setupSystem()` function
   - This creates the MASTER_CONFIG spreadsheet
   - Grant necessary permissions

3. Configure Script Properties:
   - Go to **Project Settings** > **Script Properties**
   - Add `MASTER_CONFIG_ID` with your spreadsheet ID

### Step 8: Add Sample Data

Run these functions in Apps Script editor:
```javascript
// Create sample entities
createSampleEntities();

// Create sample users
createSampleUsers();

// Create first reporting period
createPeriod({
  periodName: 'Q2 2024-25',
  fiscalYear: '2024-25',
  quarter: 'Q2',
  startDate: new Date(2024, 9, 1),    // Oct 1
  endDate: new Date(2024, 11, 31),    // Dec 31
  deadlineDate: new Date(2025, 0, 15) // Jan 15
});
```

## 👥 User Roles & Permissions

### ADMIN
- Full system access
- Entity management
- User management
- Period management
- System configuration

### APPROVER
- View all entity submissions
- Approve/reject submissions
- Generate consolidated reports

### DATA_ENTRY
- Enter data for assigned entity only
- Submit for approval
- View own entity reports

### VIEWER
- Read-only access
- View reports

## 📊 IPSAS Notes Implemented

### Statement of Financial Performance
- Note 6: Revenue
- Note 7: Non-Exchange Revenue
- Note 15: Employee Costs
- Note 16: Depreciation and Amortization

### Statement of Financial Position
- Note 30: Cash and Cash Equivalents
- Note 32: Receivables
- Note 36: Property, Plant and Equipment (with movement schedule)
- Note 37: Intangible Assets (with movement schedule)
- Note 38: Inventories (with movement schedule)
- Note 45: Payables
- Note 50: Borrowings

### Other Statements
- Cash Flow Statement (Direct/Indirect method)
- Budget Comparison Statement

## 🔄 Typical Workflow

### 1. Period Setup (Admin)
```
Admin → Create Period → Open Period → Notify Entities
```

### 2. Data Entry (Data Entry Officer)
```
Login → Dashboard → Start Data Entry → Complete Notes →
Auto-validation → Fix Errors → Submit for Approval
```

### 3. Approval (Approver)
```
Login → Pending Approvals → Review Submission →
Check Validation → Approve/Reject → Send Notification
```

### 4. Period Close (Admin)
```
Check All Approved → Close Period → Rollover Balances →
Generate Consolidated Reports → Lock Period
```

## 🛠️ Development

### Local Development
```bash
# Pull latest code from Apps Script
clasp pull

# Make changes locally

# Push to Apps Script
clasp push

# View logs
clasp logs
```

### Testing
```bash
# Run validation tests
google.script.run.testSystem()

# Check validation rules
google.script.run.runValidations('ENT_001', 'PER_Q2_2024')
```

## 📧 Email Notifications

The system sends automatic emails for:
- ✉️ Welcome emails (new users)
- ✉️ Password reset
- ✉️ Submission confirmations
- ✉️ Approval/rejection notifications
- ✉️ Deadline reminders (30, 14, 7, 3, 1 days before)
- ✉️ Validation error alerts

## 🔒 Security

- **Authentication**: Email/password with hashing (upgrade to OAuth recommended)
- **Authorization**: Role-based access control (RBAC)
- **Session Management**: 24-hour session timeout
- **Audit Trail**: All actions logged with user, timestamp, and IP
- **Data Protection**: Period locking prevents unauthorized changes
- **Input Validation**: Both client and server-side validation

## 📈 Performance

- **Auto-save**: Every 30 seconds to prevent data loss
- **Caching**: Script properties for configuration data
- **Batch Operations**: Bulk processing for consolidation
- **Optimized Queries**: Indexed lookups on entity ID and period ID

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Unauthorized access"
- **Solution**: Check user exists in Users sheet with correct role

**Issue**: "Period spreadsheet not found"
- **Solution**: Verify Script Properties has `PERIOD_<period_id>` set

**Issue**: "Validation errors not clearing"
- **Solution**: Re-run validation after fixing data

**Issue**: "Auto-save not working"
- **Solution**: Check browser console for errors, verify permissions

## 📞 Support

For technical support:
- **Email**: cabdisirlam@gmail.com
- **Contact**: 254716261111
- **Documentation**: See `docs/` folder
- **Issue Tracker**: GitHub Issues

## 📄 License

MIT License - National Treasury of Kenya

## 🙏 Acknowledgments

- National Treasury of Kenya
- IPSAS Board
- Solomon Ngahu
- Eric Mwarome
- Abdi Yussuf
## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Core functionality implemented
- 15 backend modules
- 16 frontend pages
- Full IPSAS note templates
- Approval workflow
- Email notifications
- Budget and cash flow tracking

---

**Built with ❤️ for the National Treasury of Kenya**
