/**
 * Auth.gs - User Authentication and Authorization
 *
 * Handles:
 * - User login/logout
 * - Session management
 * - Role-based access control
 * - User verification
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Handles user login
 * @param {Object} credentials - Email and PIN
 * @returns {Object} Login result with user info or error
 */
function handleLogin(credentials) {
  try {
    const email = credentials.email;
    const pin = credentials.pin;

    // Validate input
    if (!email || !pin) {
      return {
        success: false,
        error: 'Email and PIN are required'
      };
    }

    // Validate PIN format (exactly 6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return {
        success: false,
        error: 'PIN must be exactly 6 digits'
      };
    }

    // Get user from database
    const user = getUserByEmail(email);

    if (!user) {
      return {
        success: false,
        error: 'User not found. Please contact your administrator.'
      };
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your account has been disabled. Please contact your administrator.'
      };
    }

    // Verify PIN
    if (!verifyPIN(pin, user.pinHash, user.pinSalt)) {
      // Log failed attempt
      logLoginAttempt(email, false);

      return {
        success: false,
        error: 'Invalid PIN'
      };
    }

    // Check if user needs to change PIN
    const requirePINChange = isTemporaryPIN(pin, user.pinHash, user.pinSalt);

    // Create session only if PIN change is not required
    let session = null;
    if (!requirePINChange) {
      session = createUserSession(user);
      Logger.log('handleLogin: Session created for user: ' + user.email);
    } else {
      Logger.log('handleLogin: PIN change required for user: ' + user.email);
    }

    // Log successful login
    logLoginAttempt(email, true);

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
      session: session,
      redirectTo: redirectPage,
      requirePINChange: requirePINChange
    };

  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return {
      success: false,
      error: 'An error occurred during login. Please try again.'
    };
  }
}

/**
 * Handles user logout
 */
function handleLogout() {
  try {
    const userEmail = Session.getActiveUser().getEmail();

    // Clear session
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('sessionToken');
    userProperties.deleteProperty('userId');

    // Log logout
    logActivity(userEmail, 'LOGOUT', 'User logged out');

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    Logger.log('Logout error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Gets user by email address
 * @param {string} email - User email
 * @returns {Object|null} User object or null
 */
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

    // Find column indices
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');
    const pinHashColIndex = headers.indexOf('PINHash');
    const pinSaltColIndex = headers.indexOf('PINSalt');

    // Validate required columns exist
    if (emailColIndex === -1) {
      Logger.log('Email column not found in Users sheet');
      return null;
    }

    // Find user row
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
 * Gets user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User object or null
 */
function getUserById(userId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return {
          id: data[i][0],
          email: emailColIndex >= 0 ? data[i][emailColIndex] : '',
          name: nameColIndex >= 0 ? data[i][nameColIndex] : '',
          role: roleColIndex >= 0 ? data[i][roleColIndex] : '',
          entityId: entityIdColIndex >= 0 ? data[i][entityIdColIndex] : '',
          entityName: entityNameColIndex >= 0 ? data[i][entityNameColIndex] : '',
          status: statusColIndex >= 0 ? data[i][statusColIndex] : 'ACTIVE'
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting user by ID: ' + error.toString());
    return null;
  }
}

/**
 * Gets all users
 * @returns {Object} Result with list of users
 */
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

    // Find column indices
    const emailColIndex = headers.indexOf('Email');
    const nameColIndex = headers.indexOf('Name');
    const roleColIndex = headers.indexOf('Role');
    const entityIdColIndex = headers.indexOf('EntityID');
    const entityNameColIndex = headers.indexOf('EntityName');
    const statusColIndex = headers.indexOf('Status');

    // Map data to objects
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

    return {
      success: true,
      users: users,
      count: users.length
    };
  } catch (error) {
    Logger.log('Error getting users: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates a new user
 * @param {Object} userData - User data
 * @returns {Object} Result
 */
function createUser(userData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');

    // Generate user ID
    const userId = 'USR_' + Utilities.getUuid().substring(0, 8).toUpperCase();

    // Hash PIN with unique salt (default PIN: 123456)
    const pinData = hashPIN(userData.pin || '123456');

    // Add user (includes PINSalt column)
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

    // Send welcome email
    sendWelcomeEmail(userData.email, userData.name);

    return {
      success: true,
      userId: userId,
      message: 'User created successfully'
    };
  } catch (error) {
    Logger.log('Error creating user: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Checks if user has required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if authorized
 */
function hasRole(userRole, requiredRole) {
  const roleHierarchy = {
    'ADMIN': 4,
    'APPROVER': 3,
    'DATA_ENTRY': 2,
    'VIEWER': 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Checks if user can access entity data
 * @param {Object} user - User object
 * @param {string} entityId - Entity ID to access
 * @returns {boolean} True if authorized
 */
function canAccessEntity(user, entityId) {
  // Admins can access all entities
  if (user.role === CONFIG.ROLES.ADMIN) {
    return true;
  }

  // Approvers can access all entities
  if (user.role === CONFIG.ROLES.APPROVER) {
    return true;
  }

  // Data entry users can only access their assigned entity
  if (user.role === CONFIG.ROLES.DATA_ENTRY) {
    return user.entityId === entityId;
  }

  return false;
}

/**
 * Checks if user can edit entity data
 * @param {Object} user - User object
 * @param {string} entityId - Entity ID
 * @param {string} periodStatus - Period status
 * @returns {boolean} True if can edit
 */
function canEditEntity(user, entityId, periodStatus) {
  // Can't edit if period is closed or locked
  if (periodStatus === CONFIG.PERIOD_STATUS.CLOSED ||
      periodStatus === CONFIG.PERIOD_STATUS.LOCKED) {
    return false;
  }

  // Admins can always edit
  if (user.role === CONFIG.ROLES.ADMIN) {
    return true;
  }

  // Data entry users can edit their entity
  if (user.role === CONFIG.ROLES.DATA_ENTRY && user.entityId === entityId) {
    return true;
  }

  return false;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Creates a user session
 * @param {Object} user - User object
 * @returns {string} Session token
 */
function createUserSession(user) {
  const sessionToken = Utilities.getUuid();
  const userProperties = PropertiesService.getUserProperties();

  userProperties.setProperty('sessionToken', sessionToken);
  userProperties.setProperty('userId', user.id);
  userProperties.setProperty('sessionCreated', new Date().toISOString());

  return sessionToken;
}

/**
 * Validates session
 * @returns {boolean} True if session is valid
 */
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
      // Session expired
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

/**
 * Generates a unique random salt for PIN hashing
 * @returns {string} Random salt
 */
function generateSalt() {
  const uuid = Utilities.getUuid();
  const timestamp = new Date().getTime();
  return Utilities.base64Encode(uuid + timestamp);
}

/**
 * Hashes a PIN with a unique salt
 * @param {string} pin - Plain text PIN (6 digits)
 * @param {string} salt - Unique salt (if not provided, generates new one)
 * @returns {Object} Object containing hash and salt
 */
function hashPIN(pin, salt) {
  // Generate new salt if not provided
  if (!salt) {
    salt = generateSalt();
  }

  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    pin + salt
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  // Return both hash and salt
  return {
    hash: hash,
    salt: salt
  };
}

/**
 * Verifies a PIN against a stored hash
 * @param {string} pin - Plain text PIN
 * @param {string} storedHash - Stored hash
 * @param {string} salt - User's unique salt
 * @returns {boolean} True if PIN matches
 */
function verifyPIN(pin, storedHash, salt) {
  if (!salt) {
    // Backward compatibility: if no salt provided, use old static salt
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

/**
 * Checks if the current PIN is a temporary PIN that needs to be changed
 * @param {string} pin - Plain text PIN
 * @param {string} storedHash - Stored hash
 * @param {string} salt - User's unique salt
 * @returns {boolean} True if PIN is temporary
 */
function isTemporaryPIN(pin, storedHash, salt) {
  // Check if PIN is the default "123456"
  if (pin === '123456') {
    return true;
  }

  return false;
}

/**
 * Changes user PIN
 * @param {Object} data - Contains email, currentPIN, and newPIN
 * @returns {Object} Result
 */
function changePIN(data) {
  try {
    const { email, currentPIN, newPIN } = data;

    // Validate input
    if (!email || !currentPIN || !newPIN) {
      return {
        success: false,
        error: 'Email, current PIN, and new PIN are required'
      };
    }

    // Validate new PIN format (exactly 6 digits)
    if (!/^\d{6}$/.test(newPIN)) {
      return {
        success: false,
        error: 'New PIN must be exactly 6 digits'
      };
    }

    // Get user from database
    const user = getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify current PIN
    if (!verifyPIN(currentPIN, user.pinHash, user.pinSalt)) {
      return {
        success: false,
        error: 'Current PIN is incorrect'
      };
    }

    // Hash new PIN with new salt
    const pinData = hashPIN(newPIN);

    // Update PIN and salt in database
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    const data_range = sheet.getDataRange().getValues();
    const headers = data_range[0];

    // Find column indices
    const hashColIndex = headers.indexOf('PINHash');
    const saltColIndex = headers.indexOf('PINSalt');
    const emailColIndex = headers.indexOf('Email');

    // Validate required columns exist
    if (hashColIndex === -1) {
      return {
        success: false,
        error: 'PINHash column not found in Users sheet'
      };
    }

    if (emailColIndex === -1) {
      return {
        success: false,
        error: 'Email column not found in Users sheet'
      };
    }

    // Convert to 1-based column numbers for getRange
    const hashCol = hashColIndex + 1;
    const saltCol = saltColIndex >= 0 ? saltColIndex + 1 : -1;
    const emailCol = emailColIndex + 1;

    for (let i = 1; i < data_range.length; i++) {
      if (data_range[i][emailColIndex] === email) {
        sheet.getRange(i + 1, hashCol).setValue(pinData.hash);
        if (saltCol > 0) {
          sheet.getRange(i + 1, saltCol).setValue(pinData.salt);
        }
        break;
      }
    }

    // Log activity
    logActivity(email, 'PIN_CHANGE', 'User changed PIN');

    // Get updated user data and create session
    const updatedUser = getUserByEmail(email);
    const session = createUserSession(updatedUser);
    const redirectTo = getDefaultPageForRole(updatedUser.role);

    return {
      success: true,
      message: 'PIN changed successfully',
      redirectTo: redirectTo,
      sessionToken: session.sessionToken
    };
  } catch (error) {
    Logger.log('Error changing PIN: ' + error.toString());
    return {
      success: false,
      error: 'An error occurred while changing PIN: ' + error.toString()
    };
  }
}

/**
 * Resets user PIN
 * @param {string} email - User email
 * @returns {Object} Result
 */
function resetPIN(email) {
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Generate temporary PIN (6 random digits)
    const tempPIN = Math.floor(100000 + Math.random() * 900000).toString();
    const pinData = hashPIN(tempPIN);

    // Update PIN and salt
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const hashColIndex = headers.indexOf('PINHash');
    const saltColIndex = headers.indexOf('PINSalt');
    const emailColIndex = headers.indexOf('Email');

    // Validate required columns exist
    if (hashColIndex === -1) {
      return {
        success: false,
        error: 'PINHash column not found in Users sheet'
      };
    }

    if (emailColIndex === -1) {
      return {
        success: false,
        error: 'Email column not found in Users sheet'
      };
    }

    // Convert to 1-based column numbers for getRange
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

    // Send email with new PIN
    sendPINResetEmail(email, user.name, tempPIN);

    return {
      success: true,
      message: 'PIN reset email sent'
    };
  } catch (error) {
    Logger.log('Error resetting PIN: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets default page based on user role
 * @param {string} role - User role
 * @returns {string} Page name
 */
function getDefaultPageForRole(role) {
  // Check if system has periods configured
  const periodsExist = checkPeriodsExist();

  // If no periods exist, redirect to setup
  if (!periodsExist) {
    // Admin should go to period setup
    if (role === CONFIG.ROLES.ADMIN) {
      return 'PeriodSetup';
    }
    // Non-admin users should see a waiting page
    return 'SystemNotReady';
  }

  // Normal redirect logic when periods exist
  switch(role) {
    case CONFIG.ROLES.ADMIN:
      return 'AdminPanel';
    case CONFIG.ROLES.APPROVER:
      return 'ApprovalDashboard';
    case CONFIG.ROLES.DATA_ENTRY:
      return 'dataEntry';
    default:
      return 'dashboard';
  }
}

/**
 * Checks if any periods exist in the system
 * @returns {boolean} True if periods exist, false otherwise
 */
function checkPeriodsExist() {
  try {
    const periodsResult = getAllPeriods();
    return periodsResult.success && periodsResult.periods && periodsResult.periods.length > 0;
  } catch (error) {
    Logger.log('Error checking periods: ' + error.toString());
    return false;
  }
}

/**
 * Logs login attempt
 * @param {string} email - User email
 * @param {boolean} success - Whether login was successful
 */
function logLoginAttempt(email, success) {
  logActivity(email, success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    success ? 'User logged in' : 'Failed login attempt');
}

/**
 * Sends welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name
 */
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

/**
 * Sends PIN reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} tempPIN - Temporary PIN
 */
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
