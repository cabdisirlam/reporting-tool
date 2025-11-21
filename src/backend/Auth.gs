/**
 * Auth.gs - Simple Authentication (Plaintext PINs)
 */

function handleLogin(credentials) {
  try {
    const email = (credentials && credentials.email || '').trim();
    const pin = credentials && credentials.pin ? credentials.pin.toString().trim() : '';

    if (!email || !pin) {
      return { success: false, error: 'Email and PIN are required' };
    }

    // 1. Get the user from the spreadsheet
    const user = getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if ((user.status || '').toUpperCase() !== 'ACTIVE') {
      return { success: false, error: 'Account disabled.' };
    }

    // 2. SIMPLE CHECK: Compare the input PIN directly with the stored PIN
    // The "pinHash" field now holds the plain text PIN
    if (user.pinHash.toString().trim() !== pin) {
      logLoginAttempt(email, false);
      return { success: false, error: 'Invalid PIN' };
    }

    // 3. Create Session
    const token = Utilities.getUuid();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    PropertiesService.getScriptProperties().setProperty(token, JSON.stringify({
      email: user.email,
      expiresAt: expiresAt
    }));
    
    createUserSession(user); // Cache user data
    logLoginAttempt(email, true);

    return {
      success: true,
      token: token,
      user: user,
      redirectTo: getDefaultPageForRole(user.role)
    };

  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return { success: false, error: 'Login failed: ' + error.toString() };
  }
}

// === USER CREATION (Modified to store Plaintext PIN) ===

function createUser(userData) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('Users');
    const userId = 'USR_' + Utilities.getUuid().substring(0, 8).toUpperCase();
    
    // STORE PLAIN TEXT PIN DIRECTLY
    const plainPIN = userData.pin || '123456'; 

    sheet.appendRow([
      userId,
      userData.email,
      userData.name,
      userData.role,
      userData.entityId || '',
      userData.entityName || '',
      'ACTIVE',
      plainPIN,      // Column H (formerly Hash) now stores Plain PIN
      'PLAINTEXT',   // Column I (formerly Salt) just says "PLAINTEXT"
      new Date(),
      'SYSTEM'
    ]);
    
    // Try to send email (requires permission)
    try {
       sendWelcomeEmail(userData.email, userData.name);
    } catch(e) {
       Logger.log("Could not send welcome email (permission missing?): " + e.toString());
    }

    return { success: true, userId: userId, message: 'User created successfully' };
  } catch (error) {
    Logger.log('Error creating user: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// === KEEP THESE HELPER FUNCTIONS ===

function handleLogout(token) {
  try {
    if (token) PropertiesService.getScriptProperties().deleteProperty(token);
    return { success: true };
  } catch (e) { return { success: false }; }
}

function getUserByToken(token) {
  if (!token) return null;
  try {
    const data = PropertiesService.getScriptProperties().getProperty(token);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (new Date(parsed.expiresAt) < new Date()) return null;
    return getUserByEmail(parsed.email);
  } catch (e) { return null; }
}

function getUserByEmail(email) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    
    // Assuming standard column order from setup
    // 0:ID, 1:Email, 2:Name, 3:Role, 4:EntID, 5:EntName, 6:Status, 7:PIN(Hash), 8:Salt
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        return {
          id: data[i][0],
          email: data[i][1],
          name: data[i][2],
          role: data[i][3],
          entityId: data[i][4],
          entityName: data[i][5],
          status: data[i][6],
          pinHash: data[i][7], // This is now the PLAIN PIN
          pinSalt: data[i][8]
        };
      }
    }
    return null;
  } catch (e) { Logger.log(e); return null; }
}

// Required for Session Management
function createUserSession(user) {
  const sessionToken = Utilities.getUuid();
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperties({
    'sessionToken': sessionToken,
    'userId': user.id,
    'sessionCreated': new Date().toISOString(),
    'userCache': JSON.stringify(user) 
  });
}

// Keep existing helper logic
function getDefaultPageForRole(role) {
  if (!checkPeriodsExist()) return (role === 'ADMIN') ? 'PeriodSetup' : 'SystemNotReady';
  if (role === 'ADMIN') return 'AdminPanel';
  if (role === 'APPROVER') return 'ApprovalDashboard';
  if (role === 'DATA_ENTRY') return 'dataEntry';
  return 'dashboard';
}

function checkPeriodsExist() {
  try {
    // Simple check if master config exists
    return isSystemConfigured(); 
  } catch (e) { return false; }
}

function logLoginAttempt(email, success) {
  // Placeholder for logging
  Logger.log(`Login attempt: ${email} - Success: ${success}`);
}

function sendWelcomeEmail(email, name) {
   GmailApp.sendEmail(email, "Welcome", "Your account is ready. Default PIN: 123456");
}

// Helper to get User by ID (used by other files)
function getUserById(userId) {
  const ss = SpreadsheetApp.openById(getMasterConfigId());
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
       return {
          id: data[i][0],
          email: data[i][1],
          name: data[i][2],
          role: data[i][3],
          entityId: data[i][4],
          entityName: data[i][5],
          status: data[i][6]
        };
    }
  }
  return null;
}
