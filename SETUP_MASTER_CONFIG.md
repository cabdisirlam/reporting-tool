# Master Configuration Setup Guide

## Critical Issue: MASTER_CONFIG_ID Not Set

If you're experiencing **blank screens** or **crashes after login**, the most likely cause is that the `MASTER_CONFIG_ID` script property is not configured. This ID tells the system which Google Spreadsheet contains your Users, Entities, Periods, and other configuration data.

---

## Step 1: Get Your Master Configuration Spreadsheet ID

1. Open your **Master Configuration** Google Spreadsheet in your browser
   - This should be named something like `IPSAS_MASTER_CONFIG_YYYY-MM-DD_HHMMSS`
   - It should contain sheets: `Users`, `Entities`, `PeriodConfig`, `NoteTemplates`, `NoteLines`, `ValidationRules`

2. Look at the URL in your browser's address bar:
   ```
   https://docs.google.com/spreadsheets/d/1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y/edit#gid=0
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         This is your SPREADSHEET ID
   ```

3. **Copy the long string** between `/d/` and `/edit` - this is your Spreadsheet ID

---

## Step 2: Set the MASTER_CONFIG_ID (Choose One Method)

### Method A: Using the Quick Fix Function (EASIEST)

1. Open your Google Apps Script project (https://script.google.com)

2. Open the file `src/backend/DiagnosticUtils.gs`

3. Find the `quickFixMasterConfig()` function at the top of the file

4. Replace `'YOUR_SPREADSHEET_ID_HERE'` with your actual Spreadsheet ID from Step 1:
   ```javascript
   function quickFixMasterConfig() {
     // REPLACE THIS WITH YOUR ACTUAL SPREADSHEET ID
     const SPREADSHEET_ID = '1Xv4dkK7DT5jQpFH-JnVK-sM73BwpL_S60mIJEtdMo1Y';  // <-- PUT YOUR ID HERE

     // ... rest of function
   }
   ```

5. **Save the file** (Ctrl+S or Cmd+S)

6. **Run the function:**
   - Select `quickFixMasterConfig` from the function dropdown at the top
   - Click the **Run** button (▶️)
   - Check the **Execution log** at the bottom - you should see "SUCCESS!"

### Method B: Using Script Properties (Manual)

1. Open your Google Apps Script project

2. Click the **⚙️ Project Settings** icon on the left sidebar

3. Scroll down to **Script Properties**

4. Click **+ Add script property**

5. Enter:
   - **Property:** `MASTER_CONFIG_ID`
   - **Value:** (Paste your Spreadsheet ID from Step 1)

6. Click **Save script properties**

---

## Step 3: Verify the Configuration

1. **Deploy your web app** (if not already deployed):
   - Click **Deploy** → **Manage deployments**
   - Create a new deployment or update existing one
   - Copy the Web App URL

2. **Visit the diagnostics page:**
   - Open your Web App URL
   - Add `?page=diagnostics` to the end
   - Example: `https://script.google.com/macros/s/AK...xyz/exec?page=diagnostics`

3. **Check the diagnostics:**
   - Look for **"System Configured: YES"** in green
   - Look for **"Can Access Sheet: YES"** in green
   - Verify your sheet name and sheets present are listed

---

## Step 4: Test Login

1. Clear your browser cache or open an **Incognito/Private window**

2. Go to your Web App URL (without the `?page=diagnostics`)

3. Try logging in with your credentials

4. You should now see the dashboard without blank screens!

---

## Troubleshooting

### Still seeing "System Configured: NO"?
- Double-check you copied the entire Spreadsheet ID
- Make sure you clicked "Save" in Script Properties
- Try refreshing the Apps Script editor and re-run `quickFixMasterConfig()`

### Seeing "Can Access Sheet: NO"?
- Verify the account running the script has **Editor** access to the spreadsheet
- Check that the Spreadsheet ID is correct
- Make sure the spreadsheet hasn't been deleted

### Missing sheets error?
Your Master Config spreadsheet must have these sheets with exact names:
- `Users`
- `Entities`
- `PeriodConfig`
- `NoteTemplates`
- `NoteLines`
- `ValidationRules`

If any are missing, you need to create the Master Config spreadsheet:
1. In Apps Script, run the function `setupSystemNoUI()` from `Code.gs`
2. Check the Execution log for the new Spreadsheet ID
3. Use that ID in Step 2 above

---

## Need to Create a New Master Config?

If you don't have a Master Configuration spreadsheet yet:

1. Open Apps Script editor
2. Select the function `setupSystemNoUI` from `src/backend/Code.gs`
3. Run it (▶️)
4. Check the **Execution log** - it will show:
   - The new Spreadsheet ID
   - Confirmation that the default period (Q2 2025/26) was created and opened
5. Use that ID in Step 2 above to set `MASTER_CONFIG_ID`

**Note:** The setup now automatically creates a default period (Q2 2025/26) that is ready for data entry. All admin structures (Users, Entities, NoteTemplates, etc.) are also created during this process.

---

## Quick Reference

**Diagnostics URL Pattern:**
```
YOUR_WEB_APP_URL?page=diagnostics
```

**Key Files:**
- Configuration: `src/backend/DiagnosticUtils.gs`
- Quick Fix Function: `quickFixMasterConfig()`
- Setup Function: `setupSystemNoUI()` in `Code.gs`

**Required Script Property:**
- Property Name: `MASTER_CONFIG_ID`
- Property Value: Your Master Config Spreadsheet ID

---

**Once configured correctly, all blank screen issues related to configuration should be resolved!**
