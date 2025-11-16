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
 * @param {Object} credentials - Email and password
 * @returns {Object} Login result with user info or error
 */
function handleLogin(credentials) {
  try {
    const email = credentials.email;
    const password = credentials.password;

    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
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

    // Verify password (in production, use proper hashing)
    if (!verifyPassword(password, user.passwordHash)) {
      // Log failed attempt
      logLoginAttempt(email, false);

      return {
        success: false,
        error: 'Invalid password'
      };
    }

    // Create session
    const session = createUserSession(user);

    // Log successful login
    logLoginAttempt(email, true);

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
      redirectTo: getDefaultPageForRole(user.role)
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

    // Find email column
    const emailCol = headers.indexOf('Email');

    // Find user row
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email) {
        return {
          id: data[i][0],
          email: data[i][emailCol],
          name: data[i][headers.indexOf('Name')],
          role: data[i][headers.indexOf('Role')],
          entityId: data[i][headers.indexOf('EntityID')],
          entityName: data[i][headers.indexOf('EntityName')],
          status: data[i][headers.indexOf('Status')],
          passwordHash: data[i][headers.indexOf('PasswordHash')]
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

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return {
          id: data[i][0],
          email: data[i][headers.indexOf('Email')],
          name: data[i][headers.indexOf('Name')],
          role: data[i][headers.indexOf('Role')],
          entityId: data[i][headers.indexOf('EntityID')],
          entityName: data[i][headers.indexOf('EntityName')],
          status: data[i][headers.indexOf('Status')]
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

    // Hash password
    const passwordHash = hashPassword(userData.password || 'changeme');

    // Add user
    sheet.appendRow([
      userId,
      userData.email,
      userData.name,
      userData.role,
      userData.entityId || '',
      userData.entityName || '',
      'ACTIVE',
      passwordHash,
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
  const userProperties = PropertiesService.getUserProperties();
  const sessionToken = userProperties.getProperty('sessionToken');
  const sessionCreated = userProperties.getProperty('sessionCreated');

  if (!sessionToken || !sessionCreated) {
    return false;
  }

  // Check if session is expired (24 hours)
  const created = new Date(sessionCreated);
  const now = new Date();
  const hoursDiff = (now - created) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    // Session expired
    userProperties.deleteAllProperties();
    return false;
  }

  return true;
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

/**
 * Hashes a password (basic implementation - use better hashing in production)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
  // In production, use proper password hashing (bcrypt, scrypt, etc.)
  // This is a simplified version
  const salt = 'IPSAS_SALT_2024'; // Use random salt per user in production
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + salt
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Verifies a password
 * @param {string} password - Plain text password
 * @param {string} hash - Stored hash
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Resets user password
 * @param {string} email - User email
 * @returns {Object} Result
 */
function resetPassword(email) {
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Generate temporary password
    const tempPassword = Utilities.getUuid().substring(0, 8);
    const newHash = hashPassword(tempPassword);

    // Update password
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) { // Email column
        sheet.getRange(i + 1, 8).setValue(newHash); // PasswordHash column
        break;
      }
    }

    // Send email with new password
    sendPasswordResetEmail(email, user.name, tempPassword);

    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    Logger.log('Error resetting password: ' + error.toString());
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
  switch(role) {
    case CONFIG.ROLES.ADMIN:
      return 'admin';
    case CONFIG.ROLES.APPROVER:
      return 'approvalDashboard';
    case CONFIG.ROLES.DATA_ENTRY:
      return 'dataEntry';
    default:
      return 'dashboard';
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
    `Temporary Password: changeme\n\n` +
    `Please login and change your password immediately.\n\n` +
    `System URL: ${ScriptApp.getService().getUrl()}\n\n` +
    `Best regards,\n` +
    `IPSAS System Administrator`;

  GmailApp.sendEmail(email, subject, body);
}

/**
 * Sends password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} tempPassword - Temporary password
 */
function sendPasswordResetEmail(email, name, tempPassword) {
  const subject = 'Password Reset - IPSAS System';
  const body = `Dear ${name},\n\n` +
    `Your password has been reset.\n\n` +
    `Temporary Password: ${tempPassword}\n\n` +
    `Please login and change your password immediately.\n\n` +
    `System URL: ${ScriptApp.getService().getUrl()}\n\n` +
    `Best regards,\n` +
    `IPSAS System Administrator`;

  GmailApp.sendEmail(email, subject, body);
}
