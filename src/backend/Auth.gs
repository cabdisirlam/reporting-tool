/**
 * Auth.gs - User Authentication and Authorization
 * (Now with user data caching to prevent 429 errors)
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

function handleLogin(credentials) {
  try {
    const email = credentials.email;
    const pin = credentials.pin;

    if (!email || !pin) {
      return { success: false, error: 'Email and PIN are required' };
    }
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: 'PIN must be exactly 6 digits' };
    }

    // 1. Get user from database (FIRST SPREADSHEET CALL)
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found. Please contact your administrator.' };
    }
    if (user.status !== 'ACTIVE') {
      return { success: false, error: 'Your account has been disabled. Please contact your administrator.' };
    }

    // 2. Verify PIN
    if (!verifyPIN(pin, user.pinHash, user.pinSalt)) {
      logLoginAttempt(email, false); // (SECOND SPREADSHEET CALL)
      return { success: false, error: 'Invalid PIN' };
    }

    // 3. Check for temporary PIN
    const requirePINChange = isTemporaryPIN(pin, user.pinHash, user.pinSalt);

    // 4. Create session and CACHE user data
    if (!requirePINChange) {
      createUserSession(user); // Caches user data in PropertiesService
      Logger.log('handleLogin: Session created for user: ' + user.email);
    } else {
      Logger.log('handleLogin: PIN change required for user: ' + user.email);
    }

    // 5. Log successful login (THIRD SPREADSHEET CALL)
    logLoginAttempt(email, true);

    // 6. Get redirect page (FOURTH SPREADSHEET CALL, via checkPeriodsExist)
    // THIS IS THE FIX FOR THE "ANNOYING ADMIN PROMPT"
    const redirectPage = getDefaultPageForRole(user.role);
    Logger.log('handleLogin: Redirecting to: ' + redirectPage);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        entityId: user.entityId,
        entityName: user.entityName
      },
      redirectTo: redirectPage,
      requirePINChange: requirePINChange,
    };

  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return { success: false, error: 'An error occurred during login. Please try again.' };
  }
}

function handleLogout() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const user = JSON.parse(userProperties.getProperty('userCache') || '{}');
    const email = user.email || Session.getActiveUser().getEmail();

    // Clear session and user cache
    userProperties.deleteProperty('sessionToken');
    userProperties.deleteProperty('userId');
    userProperties.deleteProperty('sessionCreated');
    userProperties.deleteProperty('userCache');

    logActivity(email, 'LOGOUT', 'User logged out');

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    Logger.log('Logout error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

function getUserByEmail(email) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    if (!sheet) {
      Logger.log('Users sheet not found');
      return null;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');
    const pinHashColIndex = headers.indexOf('PINHash');
    const pinSaltColIndex = headers.indexOf('PINSalt');

    if (emailColIndex === -1) {
      Logger.log('Email column not found in Users sheet');
      return null;
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === email) {
        return {
          id: data[i][0],
          email: data[i][emailColIndex],
          name: nameColIndex >= 0 ? data[i][nameColIndex] : '',
          role: roleColIndex >= 0 ? data[i][roleColIndex] : '',
          entityId: entityIdColIndex >= 0 ? data[i][entityIdColIndex] : '',
          entityName: entityNameColIndex >= 0 ? data[i][entityNameColIndex] : '',
          status: statusColIndex >= 0 ? data[i][statusColIndex] : 'ACTIVE',
          pinHash: pinHashColIndex >= 0 ? data[i][pinHashColIndex] : '',
          pinSalt: pinSaltColIndex >= 0 ? data[i][pinSaltColIndex] : null
        };
      }
    }
    return null;

  } catch (error) {
    Logger.log('Error getting user: ' + error.toString());
    return null;
  }
}

/**
 * Gets user by ID.
 * THIS IS NOW CACHED. It only hits the sheet if the cache is empty.
 */
function getUserById(userId) {
  // 1. Try to get from cache first
  const userCache = PropertiesService.getUserProperties().getProperty('userCache');
  if (userCache) {
    try {
      const user = JSON.parse(userCache);
      // Make sure cache is for the correct user
      if (user.id === userId) {
        Logger.log('getUserById: Found user in cache.');
        return user;
      }
    } catch (parseError) {
      Logger.log('getUserById: Error parsing user cache: ' + parseError.toString());
      // Clear corrupted cache
      PropertiesService.getUserProperties().deleteProperty('userCache');
    }
  }

  // 2. If not in cache, get from Spreadsheet (SLOW)
  Logger.log('getUserById: User not in cache, fetching from sheet.');
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        const user = {
          id: data[i][0],
          email: emailColIndex >= 0 ? data[i][emailColIndex] : '',
          name: nameColIndex >= 0 ? data[i][nameColIndex] : '',
          role: roleColIndex >= 0 ? data[i][roleColIndex] : '',
          entityId: entityIdColIndex >= 0 ? data[i][entityIdColIndex] : '',
          entityName: entityNameColIndex >= 0 ? data[i][entityNameColIndex] : '',
          status: statusColIndex >= 0 ? data[i][statusColIndex] : 'ACTIVE'
        };
        // Save to cache for next time
        PropertiesService.getUserProperties().setProperty('userCache', JSON.stringify(user));
        return user;
      }
    }
    return null;

  } catch (error) {
    Logger.log('Error getting user by ID: ' + error.toString());
    return null;
  }
}

function getAllUsers() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const users = [];
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');

    for (let i = 1; i < data.length; i++) {
      users.push({
        id: data[i][0],
        email: emailColIndex >= 0 ? data[i][emailColIndex] : '',
        name: nameColIndex >= 0 ? data[i][nameColIndex] : '',
        role: roleColIndex >= 0 ? data[i][roleColIndex] : '',
        entityId: entityIdColIndex >= 0 ? data[i][entityIdColIndex] : '',
        entityName: entityNameColIndex >= 0 ? data[i][entityNameColIndex] : '',
        status: statusColIndex >= 0 ? data[i][statusColIndex] : 'ACTIVE'
      });
    }

    return { success: true, users: users, count: users.length };

  } catch (error) {
    Logger.log('Error getting users: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

function createUser(userData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    const userId = 'USR_' + Utilities.getUuid().substring(0, 8).toUpperCase();
    const pinData = hashPIN(userData.pin || '123456');

    sheet.appendRow([
      userId,
      userData.email,
      userData.name,
      userData.role,
      userData.entityId || '',
      userData.entityName || '',
      'ACTIVE',
      pinData.hash,
      pinData.salt,
      new Date(),
      Session.getActiveUser().getEmail()
    ]);

    sendWelcomeEmail(userData.email, userData.name);

    return { success: true, userId: userId, message: 'User created successfully' };

  } catch (error) {
    Logger.log('Error creating user: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Updates an existing user
 * @param {string} userId - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Object} Result with success status
 */
function updateUser(userId, userData) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const idColIndex = 0; // UserID is always first column
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');

    if (emailColIndex === -1 || nameColIndex === -1 || roleColIndex === -1) {
      return { success: false, error: 'Required columns not found in Users sheet' };
    }

    // Find the user row
    let userRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIndex] === userId) {
        userRow = i;
        break;
      }
    }

    if (userRow === -1) {
      return { success: false, error: 'User not found' };
    }

    // Update the user data
    const rowNumber = userRow + 1; // Sheet rows are 1-indexed

    if (userData.email !== undefined && emailColIndex >= 0) {
      sheet.getRange(rowNumber, emailColIndex + 1).setValue(userData.email);
    }
    if (userData.name !== undefined && nameColIndex >= 0) {
      sheet.getRange(rowNumber, nameColIndex + 1).setValue(userData.name);
    }
    if (userData.role !== undefined && roleColIndex >= 0) {
      sheet.getRange(rowNumber, roleColIndex + 1).setValue(userData.role);
    }
    if (userData.entityId !== undefined && entityIdColIndex >= 0) {
      sheet.getRange(rowNumber, entityIdColIndex + 1).setValue(userData.entityId || '');
    }
    if (userData.entityName !== undefined && entityNameColIndex >= 0) {
      sheet.getRange(rowNumber, entityNameColIndex + 1).setValue(userData.entityName || '');
    }
    if (userData.status !== undefined && statusColIndex >= 0) {
      sheet.getRange(rowNumber, statusColIndex + 1).setValue(userData.status);
    }

    // Clear user cache if updating current user
    const userProperties = PropertiesService.getUserProperties();
    const currentUserId = userProperties.getProperty('userId');
    if (currentUserId === userId) {
      userProperties.deleteProperty('userCache');
      Logger.log('updateUser: Cleared cache for current user');
    }

    // Log the update
    logActivity(
      Session.getActiveUser().getEmail(),
      'USER_UPDATE',
      'Updated user: ' + userId
    );

    return {
      success: true,
      message: 'User updated successfully',
      userId: userId
    };

  } catch (error) {
    Logger.log('Error updating user: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Deletes (deactivates) a user
 * @param {string} userId - User ID to delete
 * @returns {Object} Result with success status
 */
function deleteUser(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // We don't actually delete users, we just deactivate them
    return updateUser(userId, { status: 'INACTIVE' });

  } catch (error) {
    Logger.log('Error deleting user: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

function hasRole(userRole, requiredRole) {
  const roleHierarchy = {
    'ADMIN': 4,
    'APPROVER': 3,
    'DATA_ENTRY': 2,
    'VIEWER': 1
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

function canAccessEntity(user, entityId) {
  if (user.role === CONFIG.ROLES.ADMIN) {
    return true;
  }
  if (user.role === CONFIG.ROLES.APPROVER) {
    return true;
  }
  if (user.role === CONFIG.ROLES.DATA_ENTRY) {
    return user.entityId === entityId;
  }
  return false;
}

function canEditEntity(user, entityId, periodStatus) {
  if (periodStatus === CONFIG.PERIOD_STATUS.CLOSED ||
      periodStatus === CONFIG.PERIOD_STATUS.LOCKED) {
    return false;
  }
  if (user.role === CONFIG.ROLES.ADMIN) {
    return true;
  }
  if (user.role === CONFIG.ROLES.DATA_ENTRY && user.entityId === entityId) {
    return true;
  }
  return false;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Creates a user session AND caches the user object
 * @param {Object} user - User object
 */
function createUserSession(user) {
  const sessionToken = Utilities.getUuid();
  const userProperties = PropertiesService.getUserProperties();

  // Cache all user data to prevent re-fetching on every page load
  const userCacheData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    entityId: user.entityId,
    entityName: user.entityName
  };

  userProperties.setProperties({
    'sessionToken': sessionToken,
    'userId': user.id,
    'sessionCreated': new Date().toISOString(),
    'userCache': JSON.stringify(userCacheData) // <-- THE CACHE
  });
}

function validateSession() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const sessionToken = userProperties.getProperty('sessionToken');
    const sessionCreated = userProperties.getProperty('sessionCreated');

    if (!sessionToken || !sessionCreated) {
      Logger.log('validateSession: No session token or creation time found');
      return false;
    }

    // Check if session is expired (24 hours)
    const created = new Date(sessionCreated);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      Logger.log('validateSession: Session expired (age: ' + hoursDiff + ' hours)');
      userProperties.deleteAllProperties();
      return false;
    }

    Logger.log('validateSession: Session valid (age: ' + hoursDiff.toFixed(2) + ' hours)');
    return true;

  } catch (error) {
    Logger.log('validateSession: Error: ' + error.toString());
    return false;
  }
}

// ============================================================================
// PIN MANAGEMENT
// ============================================================================

function generateSalt() {
  const uuid = Utilities.getUuid();
  const timestamp = new Date().getTime();
  return Utilities.base64Encode(uuid + timestamp);
}

function hashPIN(pin, salt) {
  if (!salt) {
    salt = generateSalt();
  }

  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    pin + salt
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  return { hash: hash, salt: salt };
}

function verifyPIN(pin, storedHash, salt) {
  if (!salt) {
    // Legacy support
    const legacySalt = 'IPSAS_SALT_2024';
    const legacyHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      pin + legacySalt
    ).map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    return legacyHash === storedHash;
  }

  const result = hashPIN(pin, salt);
  return result.hash === storedHash;
}

function isTemporaryPIN(pin, storedHash, salt) {
  if (pin === '123456') {
    return true;
  }
  return false;
}

function changePIN(data) {
  try {
    const { email, currentPIN, newPIN } = data;
    if (!email || !currentPIN || !newPIN) {
      return { success: false, error: 'Email, current PIN, and new PIN are required' };
    }
    if (!/^\d{6}$/.test(newPIN)) {
      return { success: false, error: 'New PIN must be exactly 6 digits' };
    }

    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (!verifyPIN(currentPIN, user.pinHash, user.pinSalt)) {
      return { success: false, error: 'Current PIN is incorrect' };
    }

    const pinData = hashPIN(newPIN);

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    const data_range = sheet.getDataRange().getValues();
    const headers = data_range[0];

    const hashColIndex = headers.indexOf('PINHash');
    const saltColIndex = headers.indexOf('PINSalt');
    const emailColIndex = headers.indexOf('Email');

    if (hashColIndex === -1 || emailColIndex === -1) {
      return { success: false, error: 'User sheet is missing required columns (PINHash or Email)' };
    }

    const hashCol = hashColIndex + 1;
    const saltCol = saltColIndex >= 0 ? saltColIndex + 1 : -1;

    for (let i = 1; i < data_range.length; i++) {
      if (data_range[i][emailColIndex] === email) {
        sheet.getRange(i + 1, hashCol).setValue(pinData.hash);
        if (saltCol > 0) {
          sheet.getRange(i + 1, saltCol).setValue(pinData.salt);
        }
        break;
      }
    }

    logActivity(email, 'PIN_CHANGE', 'User changed PIN');

    const updatedUser = getUserByEmail(email);
    createUserSession(updatedUser); // Create new session with updated data
    const redirectTo = getDefaultPageForRole(updatedUser.role);

    return {
      success: true,
      message: 'PIN changed successfully',
      redirectTo: redirectTo,
    };

  } catch (error) {
    Logger.log('Error changing PIN: ' + error.toString());
    return { success: false, error: 'An error occurred while changing PIN: ' + error.toString() };
  }
}

function resetPIN(email) {
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const tempPIN = Math.floor(100000 + Math.random() * 900000).toString();
    const pinData = hashPIN(tempPIN);

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const hashColIndex = headers.indexOf('PINHash');
    const saltColIndex = headers.indexOf('PINSalt');
    const emailColIndex = headers.indexOf('Email');

    if (hashColIndex === -1 || emailColIndex === -1) {
      return { success: false, error: 'User sheet is missing required columns' };
    }

    const hashCol = hashColIndex + 1;
    const saltCol = saltColIndex >= 0 ? saltColIndex + 1 : -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === email) {
        sheet.getRange(i + 1, hashCol).setValue(pinData.hash);
        if (saltCol > 0) {
          sheet.getRange(i + 1, saltCol).setValue(pinData.salt);
        }
        break;
      }
    }

    sendPINResetEmail(email, user.name, tempPIN);
    return { success: true, message: 'PIN reset email sent' };

  } catch (error) {
    Logger.log('Error resetting PIN: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDefaultPageForRole(role) {
  // Check if system has periods configured
  const periodsExist = checkPeriodsExist(); // This opens MASTER_CONFIG

  if (!periodsExist) {
    if (role === CONFIG.ROLES.ADMIN) {
      return 'PeriodSetup';
    }
    return 'SystemNotReady';
  }

  // Normal redirect logic when periods exist
  switch(role) {
    case CONFIG.ROLES.ADMIN:
      return 'AdminPanel';
    case CONFIG.ROLES.APPROVER:
      return 'ApprovalDashboard';
    case CONFIG.ROLES.DATA_ENTRY:
      return 'DataEntry';
    default:
      return 'Dashboard';
  }
}

function checkPeriodsExist() {
  try {
    const periodsResult = getAllPeriods(); // This is the heavy call
    return periodsResult.success && periodsResult.periods && periodsResult.periods.length > 0;
  } catch (error) {
    Logger.log('Error checking periods: ' + error.toString());
    return false;
  }
}

function logLoginAttempt(email, success) {
  logActivity(email, success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    success ? 'User logged in' : 'Failed login attempt');
}

function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to IPSAS Financial Consolidation System';
  const body = `Dear ${name},\n\n` +
    `Your account has been created in the IPSAS Financial Consolidation System.\n\n` +
    `Email: ${email}\n` +
    `Temporary PIN: 123456\n\n` +
    `Please login and change your PIN immediately.\n\n` +
    `System URL: ${ScriptApp.getService().getUrl()}\n\n` +
    `Best regards,\n` +
    `IPSAS System Administrator`;
  GmailApp.sendEmail(email, subject, body);
}

function sendPINResetEmail(email, name, tempPIN) {
  const subject = 'PIN Reset - IPSAS System';
  const body = `Dear ${name},\n\n` +
    `Your PIN has been reset.\n\n` +
    `Temporary PIN: ${tempPIN}\n\n` +
    `Please login and change your PIN immediately.\n\n` +
    `System URL: ${ScriptApp.getService().getUrl()}\n\n` +
    `Best regards,\n` +
    `IPSAS System Administrator`;
  GmailApp.sendEmail(email, subject, body);
}
