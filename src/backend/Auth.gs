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

    // 1. Get user from spreadsheet
    const user = getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if ((user.status || '').toUpperCase() !== 'ACTIVE') {
      return { success: false, error: 'Account disabled.' };
    }

    // 2. SIMPLE CHECK: Compare input PIN directly with stored PIN
    // "pinHash" field in the object now holds the plain text PIN from the sheet
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
    
    createUserSession(user); // Cache user data for performance
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

// === USER CREATION (Stores Plaintext PIN) ===
function createUser(userData) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('Users');
    const userId = 'USR_' + Utilities.getUuid().substring(0, 8).toUpperCase();

    const plainPIN = userData.pin || '123456';
    const hashedPIN = hashPIN(plainPIN);

    sheet.appendRow([
      userId,
      userData.email,
      userData.name,
      userData.role,
      userData.entityId || '',
      userData.entityName || '',
      'ACTIVE',
      plainPIN,          // Stored as Plain Text for legacy checks
      hashedPIN.hash,    // Stored hash for future use
      hashedPIN.salt,    // Salt for hash verification
      new Date(),
      'SYSTEM'
    ]);
    
    try {
       sendWelcomeEmail(userData.email, userData.name);
    } catch(e) {
       Logger.log("Welcome email failed (check permissions): " + e.toString());
    }

    return { success: true, userId: userId, message: 'User created successfully' };
  } catch (error) {
    Logger.log('Error creating user: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// === UTILITIES ===
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
    
    // Map columns: 0:ID, 1:Email, 2:Name, 3:Role, 4:EntID, 5:EntName, 6:Status, 7:PIN
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
          pinHash: data[i][7], // Plain PIN
          pinSalt: data[i][8]
        };
      }
    }
    return null;
  } catch (e) { Logger.log(e); return null; }
}

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

function getDefaultPageForRole(role) {
  if (!checkPeriodsExist()) return (role === 'ADMIN') ? 'PeriodSetup' : 'SystemNotReady';
  if (role === 'ADMIN') return 'AdminPanel';
  if (role === 'APPROVER') return 'ApprovalDashboard';
  if (role === 'DATA_ENTRY') return 'dataEntry';
  return 'dashboard';
}

function checkPeriodsExist() {
  try { return isSystemConfigured(); } catch (e) { return false; }
}

function logLoginAttempt(email, success) {
  Logger.log(`Login attempt: ${email} - Success: ${success}`);
}

function sendWelcomeEmail(email, name) {
   GmailApp.sendEmail(email, "Welcome", "Your account is ready. Default PIN: 123456");
}

function getUserById(userId) {
  try {
    const ss = SpreadsheetApp.openById(getMasterConfigId());
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();

    // Iterate to find the User ID in the first column (Index 0)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return {
          id: data[i][0],
          email: data[i][1],
          name: data[i][2],
          role: data[i][3],
          entityId: data[i][4],
          entityName: data[i][5],
          status: data[i][6],
          pinHash: data[i][7],
          pinSalt: data[i][8]
        };
      }
    }
    return null;
  } catch (e) {
    Logger.log("Error in getUserById: " + e.toString());
    return null;
  }
}
