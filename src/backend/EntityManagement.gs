/**
 * EntityManagement.gs - Entity CRUD Operations
 *
 * Handles:
 * - Entity creation, update, deletion
 * - Entity listing and filtering
 * - Entity type management
 * - Entity assignments
 */

// ============================================================================
// ENTITY CRUD OPERATIONS
// ============================================================================

/**
 * Gets all entities
 * @param {Object} filters - Optional filters
 * @returns {Array} List of entities
 */
function getAllEntities(filters) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Entities');

    if (!sheet) {
      return { success: false, error: 'Entities sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const entities = [];

    // Map data to objects
    for (let i = 1; i < data.length; i++) {
      const entity = {
        id: data[i][0],
        code: data[i][1],
        name: data[i][2],
        type: data[i][3],
        sector: data[i][4],
        ministry: data[i][5],
        status: data[i][6],
        createdDate: data[i][7],
        createdBy: data[i][8]
      };

      // Apply filters
      if (filters) {
        if (filters.type && entity.type !== filters.type) continue;
        if (filters.sector && entity.sector !== filters.sector) continue;
        if (filters.status && entity.status !== filters.status) continue;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          if (!entity.name.toLowerCase().includes(searchTerm) &&
              !entity.code.toLowerCase().includes(searchTerm)) {
            continue;
          }
        }
      }

      entities.push(entity);
    }

    return {
      success: true,
      entities: entities,
      count: entities.length
    };
  } catch (error) {
    Logger.log('Error getting entities: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets a single entity by ID
 * @param {string} entityId - Entity ID
 * @returns {Object} Entity data
 */
function getEntityById(entityId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Entities');

    if (!sheet) {
      return { success: false, error: 'Entities sheet not found' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        return {
          success: true,
          entity: {
            id: data[i][0],
            code: data[i][1],
            name: data[i][2],
            type: data[i][3],
            sector: data[i][4],
            ministry: data[i][5],
            status: data[i][6],
            createdDate: data[i][7],
            createdBy: data[i][8]
          }
        };
      }
    }

    return {
      success: false,
      error: 'Entity not found'
    };
  } catch (error) {
    Logger.log('Error getting entity: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Creates a new entity
 * @param {Object} entityData - Entity data
 * @returns {Object} Result
 */
function createEntity(entityData) {
  try {
    // Validate required fields
    if (!entityData.code || !entityData.name || !entityData.type) {
      return {
        success: false,
        error: 'Code, name, and type are required'
      };
    }

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Entities');

    // Check if entity code already exists
    if (entityCodeExists(entityData.code)) {
      return {
        success: false,
        error: 'Entity code already exists'
      };
    }

    // Generate entity ID
    const entityId = 'ENT_' + Utilities.getUuid().substring(0, 8).toUpperCase();

    // Add entity
    sheet.appendRow([
      entityId,
      entityData.code.toUpperCase(),
      entityData.name,
      entityData.type,
      entityData.sector || '',
      entityData.ministry || '',
      'ACTIVE',
      new Date(),
      Session.getActiveUser().getEmail()
    ]);

    // Log activity
    logActivity(
      Session.getActiveUser().getEmail(),
      'CREATE_ENTITY',
      `Created entity: ${entityData.name} (${entityData.code})`
    );

    return {
      success: true,
      entityId: entityId,
      message: 'Entity created successfully'
    };
  } catch (error) {
    Logger.log('Error creating entity: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Updates an existing entity
 * @param {string} entityId - Entity ID
 * @param {Object} entityData - Updated entity data
 * @returns {Object} Result
 */
function updateEntity(entityId, entityData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Entities');
    const data = sheet.getDataRange().getValues();

    // Find entity row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        // Update fields (keeping ID and code unchanged)
        sheet.getRange(i + 1, 3).setValue(entityData.name || data[i][2]);
        sheet.getRange(i + 1, 4).setValue(entityData.type || data[i][3]);
        sheet.getRange(i + 1, 5).setValue(entityData.sector || data[i][4]);
        sheet.getRange(i + 1, 6).setValue(entityData.ministry || data[i][5]);
        sheet.getRange(i + 1, 7).setValue(entityData.status || data[i][6]);

        // Log activity
        logActivity(
          Session.getActiveUser().getEmail(),
          'UPDATE_ENTITY',
          `Updated entity: ${entityData.name}`
        );

        return {
          success: true,
          message: 'Entity updated successfully'
        };
      }
    }

    return {
      success: false,
      error: 'Entity not found'
    };
  } catch (error) {
    Logger.log('Error updating entity: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Deletes an entity (soft delete - sets status to INACTIVE)
 * @param {string} entityId - Entity ID
 * @returns {Object} Result
 */
function deleteEntity(entityId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
    const sheet = ss.getSheetByName('Entities');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        // Soft delete - set status to INACTIVE
        sheet.getRange(i + 1, 7).setValue('INACTIVE');

        // Log activity
        logActivity(
          Session.getActiveUser().getEmail(),
          'DELETE_ENTITY',
          `Deleted entity: ${data[i][2]}`
        );

        return {
          success: true,
          message: 'Entity deleted successfully'
        };
      }
    }

    return {
      success: false,
      error: 'Entity not found'
    };
  } catch (error) {
    Logger.log('Error deleting entity: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if entity code already exists
 * @param {string} code - Entity code
 * @returns {boolean} True if exists
 */
function entityCodeExists(code) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_CONFIG_ID);
  const sheet = ss.getSheetByName('Entities');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === code.toUpperCase()) {
      return true;
    }
  }

  return false;
}

/**
 * Gets entity types
 * @returns {Array} List of entity types
 */
function getEntityTypes() {
  return [
    'Commercial State Corporation',
    'Non-Commercial State Corporation',
    'Regulatory State Corporation',
    'Service State Corporation',
    'Research Institution',
    'Training Institution',
    'University',
    'Other'
  ];
}

/**
 * Gets entity sectors
 * @returns {Array} List of sectors
 */
function getEntitySectors() {
  return [
    'Agriculture',
    'Education',
    'Energy',
    'Finance',
    'Health',
    'Infrastructure',
    'Transport',
    'Water & Sanitation',
    'Other'
  ];
}

/**
 * Creates the Entities sheet in master config
 * @param {Spreadsheet} ss - Spreadsheet object
 */
function createEntitiesSheet(ss) {
  const sheet = ss.insertSheet('Entities');

  // Headers
  const headers = [
    'EntityID',
    'Code',
    'Name',
    'Type',
    'Sector',
    'Ministry',
    'Status',
    'CreatedDate',
    'CreatedBy'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Sample data
  sheet.appendRow([
    'ENT_001',
    'KENGEN',
    'Kenya Electricity Generating Company',
    'Commercial State Corporation',
    'Energy',
    'Ministry of Energy',
    'ACTIVE',
    new Date(),
    'system@treasury.go.ke'
  ]);

  sheet.appendRow([
    'ENT_002',
    'KPA',
    'Kenya Ports Authority',
    'Commercial State Corporation',
    'Transport',
    'Ministry of Transport',
    'ACTIVE',
    new Date(),
    'system@treasury.go.ke'
  ]);

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}
