# Configuration Guide - TNSC Reporting Tool

## Issue: White Screen After Login

If you're experiencing a white screen after logging in as an admin, follow these steps to diagnose and fix the issue.

## Quick Fix Steps

### Step 1: Set the Master Configuration Sheet ID

The system needs to know which Google Sheet contains your configuration data (Users, Entities, Periods, etc.).

**Option A: Using the Script Editor**

1. Open the Google Apps Script editor for your project
2. In the Script Editor, go to **Run** > **Select function** > `setMasterConfigId`
3. Or paste this in the Script Editor console and run it:

```javascript
setMasterConfigId('1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y');
```

Replace `1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y` with your actual master configuration spreadsheet ID.

**Option B: Using the Web Interface**

1. Open your deployed web app URL and add `?page=diagnostics` to the end
   - Example: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=diagnostics`
2. This will show you the current configuration status
3. Check if `MASTER_CONFIG_ID` is set correctly

### Step 2: View System Diagnostics

To see detailed diagnostic information about your system:

1. Open your web app URL
2. Add `?page=diagnostics` to the URL
3. This will show you:
   - Whether the system is properly configured
   - Current session status
   - Which sheets are present in your master config
   - Any errors accessing the configuration

Example: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=diagnostics`

### Step 3: Check the Logs

Enhanced logging has been added to help diagnose issues. To view logs:

1. Open the Google Apps Script editor
2. Go to **View** > **Logs** or **View** > **Executions**
3. Look for log entries that show:
   - `handleLogin:` - Login process
   - `validateSession:` - Session validation
   - `getCurrentUser:` - User retrieval
   - `AdminSetupPrompt:` - Admin setup page loading
   - `include:` - File includes (CSS, etc.)

### Step 4: Verify Your Configuration Sheet

Your master configuration spreadsheet should have these sheets:

- **Users** - User accounts and roles
- **Entities** - State corporations/entities
- **PeriodConfig** - Reporting periods
- **NoteTemplates** - Financial note templates
- **NoteLines** - Note line items
- **ValidationRules** - Data validation rules

If these sheets don't exist, you can create them by running `setupSystemNoUI()` from the Script Editor.

## Common Issues and Solutions

### Issue 1: "MASTER_CONFIG_ID not set"

**Solution:** Run the `setMasterConfigId()` function with your spreadsheet ID.

### Issue 2: "Cannot access spreadsheet"

**Solution:**
1. Verify the spreadsheet ID is correct
2. Make sure you have permission to access the spreadsheet
3. Check that the spreadsheet hasn't been deleted

### Issue 3: Session validation fails

**Solution:**
1. Clear your browser cache and cookies
2. Try logging in again
3. Check the logs to see why session validation is failing

### Issue 4: CSS or include errors

**Solution:**
The system now has fallback handling for CSS include errors. If you see CSS errors in the logs, check that these files exist:
- `css/main.css.html`
- `src/frontend/css/dashboard.css.html`
- `src/frontend/css/forms.css.html`
- `src/frontend/css/reports.css.html`

## How to Set the MASTER_CONFIG_ID Manually

If you need to set the configuration manually:

```javascript
// In the Google Apps Script editor, run this function:
function setMyMasterConfig() {
  var sheetId = '1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y'; // Your sheet ID
  PropertiesService.getScriptProperties().setProperty('MASTER_CONFIG_ID', sheetId);
  Logger.log('MASTER_CONFIG_ID set to: ' + sheetId);
}
```

## Getting the Spreadsheet ID

To get your spreadsheet ID:

1. Open your Google Sheet in a browser
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the long string between `/d/` and `/edit` - that's your spreadsheet ID

Example:
- URL: `https://docs.google.com/spreadsheets/d/1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y/edit?gid=1053960432#gid=1053960432`
- ID: `1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y`

## Testing the Fix

After configuring the MASTER_CONFIG_ID:

1. Clear your browser cache
2. Go to your web app URL
3. Log in with admin credentials
4. You should now see the Admin Setup Prompt page instead of a white screen
5. Choose "Continue with Existing" to proceed to the admin panel

## Still Having Issues?

If you're still experiencing problems:

1. Check the execution logs in the Script Editor
2. Visit the diagnostics page: `?page=diagnostics`
3. Look for error messages in the browser console (F12 > Console)
4. Verify all the sheets exist in your master configuration spreadsheet

## Enhanced Logging

The following functions now have enhanced logging:

- `handleLogin()` - Tracks login process
- `validateSession()` - Shows session validation status
- `getCurrentUser()` - Shows user retrieval process
- `serveAdminSetupPrompt()` - Shows template loading
- `include()` - Shows file includes

Check **View > Executions** in the Script Editor to see these logs.
