/**
 * Movements.gs - Movement Schedules (PPE, Intangibles, Inventory)
 *
 * Handles:
 * - Property, Plant & Equipment movements
 * - Intangible assets movements
 * - Inventory movements
 * - Movement validation
 */

// ============================================================================
// PPE MOVEMENT OPERATIONS
// ============================================================================

/**
 * Saves PPE movement data
 * @param {Object} params - Movement parameters
 * @returns {Object} Save result
 */
function savePPEMovement(params) {
  try {
    const { entityId, periodId, movementData } = params;

    // Validate parameters
    if (!entityId || !periodId || !movementData) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    // Calculate closing balances
    const calculated = calculatePPEMovements(movementData);

    // Save to note data
    const saveResult = saveNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_36',
      noteData: calculated,
      userId: Session.getActiveUser().getEmail()
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error saving PPE movement: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets PPE movement data
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} PPE movement data
 */
function getPPEMovement(entityId, periodId) {
  try {
    return getNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_36'
    });
  } catch (error) {
    Logger.log('Error getting PPE movement: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculates PPE movements for all categories
 * @param {Object} movementData - Movement data
 * @returns {Object} Calculated movements
 */
function calculatePPEMovements(movementData) {
  const categories = ['land', 'buildings', 'vehicles', 'furniture', 'equipment', 'wip'];
  const calculated = { ...movementData };

  categories.forEach(category => {
    if (calculated[category]) {
      calculated[category] = calculateAssetMovement(calculated[category]);
    }
  });

  // Calculate totals across all categories
  calculated.totals = calculateTotalMovements(calculated, categories);

  return calculated;
}

/**
 * Calculates movement for a single asset category
 * @param {Object} categoryData - Category movement data
 * @returns {Object} Calculated movement
 */
function calculateAssetMovement(categoryData) {
  const calc = { ...categoryData };

  // Cost/Valuation
  const openingCost = parseFloat(calc.cost?.opening) || 0;
  const additions = parseFloat(calc.cost?.additions) || 0;
  const disposals = parseFloat(calc.cost?.disposals) || 0;
  const revaluations = parseFloat(calc.cost?.revaluations) || 0;
  const transfers = parseFloat(calc.cost?.transfers) || 0;

  calc.cost = calc.cost || {};
  calc.cost.closing = openingCost + additions - disposals + revaluations + transfers;

  // Accumulated Depreciation
  const openingDepn = parseFloat(calc.depreciation?.opening) || 0;
  const depnCharge = parseFloat(calc.depreciation?.charge) || 0;
  const depnDisposals = parseFloat(calc.depreciation?.disposals) || 0;

  calc.depreciation = calc.depreciation || {};
  calc.depreciation.closing = openingDepn + depnCharge - depnDisposals;

  // Carrying Amount
  calc.carryingAmount = calc.cost.closing - calc.depreciation.closing;

  return calc;
}

/**
 * Calculates total movements across all categories
 * @param {Object} data - Movement data
 * @param {Array} categories - Asset categories
 * @returns {Object} Total movements
 */
function calculateTotalMovements(data, categories) {
  const totals = {
    cost: {
      opening: 0,
      additions: 0,
      disposals: 0,
      revaluations: 0,
      transfers: 0,
      closing: 0
    },
    depreciation: {
      opening: 0,
      charge: 0,
      disposals: 0,
      closing: 0
    },
    carryingAmount: 0
  };

  categories.forEach(category => {
    if (data[category]) {
      const cat = data[category];
      totals.cost.opening += parseFloat(cat.cost?.opening) || 0;
      totals.cost.additions += parseFloat(cat.cost?.additions) || 0;
      totals.cost.disposals += parseFloat(cat.cost?.disposals) || 0;
      totals.cost.revaluations += parseFloat(cat.cost?.revaluations) || 0;
      totals.cost.transfers += parseFloat(cat.cost?.transfers) || 0;
      totals.cost.closing += parseFloat(cat.cost?.closing) || 0;

      totals.depreciation.opening += parseFloat(cat.depreciation?.opening) || 0;
      totals.depreciation.charge += parseFloat(cat.depreciation?.charge) || 0;
      totals.depreciation.disposals += parseFloat(cat.depreciation?.disposals) || 0;
      totals.depreciation.closing += parseFloat(cat.depreciation?.closing) || 0;

      totals.carryingAmount += parseFloat(cat.carryingAmount) || 0;
    }
  });

  return totals;
}

// ============================================================================
// INTANGIBLES MOVEMENT OPERATIONS
// ============================================================================

/**
 * Saves intangibles movement data
 * @param {Object} params - Movement parameters
 * @returns {Object} Save result
 */
function saveIntangiblesMovement(params) {
  try {
    const { entityId, periodId, movementData } = params;

    // Calculate movements
    const calculated = calculateIntangiblesMovements(movementData);

    // Save to note data
    const saveResult = saveNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_37',
      noteData: calculated,
      userId: Session.getActiveUser().getEmail()
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error saving intangibles movement: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculates intangibles movements
 * @param {Object} movementData - Movement data
 * @returns {Object} Calculated movements
 */
function calculateIntangiblesMovements(movementData) {
  const categories = ['software', 'licenses', 'patents', 'other'];
  const calculated = { ...movementData };

  categories.forEach(category => {
    if (calculated[category]) {
      calculated[category] = calculateAssetMovement(calculated[category]);
    }
  });

  // Calculate totals
  calculated.totals = calculateTotalMovements(calculated, categories);

  return calculated;
}

// ============================================================================
// INVENTORY MOVEMENT OPERATIONS
// ============================================================================

/**
 * Saves inventory movement data
 * @param {Object} params - Movement parameters
 * @returns {Object} Save result
 */
function saveInventoryMovement(params) {
  try {
    const { entityId, periodId, movementData } = params;

    // Calculate movements
    const calculated = calculateInventoryMovements(movementData);

    // Save to note data
    const saveResult = saveNoteData({
      entityId: entityId,
      periodId: periodId,
      noteId: 'NOTE_34',
      noteData: calculated,
      userId: Session.getActiveUser().getEmail()
    });

    return saveResult;
  } catch (error) {
    Logger.log('Error saving inventory movement: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculates inventory movements
 * @param {Object} movementData - Movement data
 * @returns {Object} Calculated movements
 */
function calculateInventoryMovements(movementData) {
  const categories = ['rawMaterials', 'workInProgress', 'finishedGoods', 'consumables'];
  const calculated = { ...movementData };

  categories.forEach(category => {
    if (calculated[category]) {
      calculated[category] = calculateInventoryMovement(calculated[category]);
    }
  });

  // Calculate totals
  calculated.totals = calculateInventoryTotals(calculated, categories);

  return calculated;
}

/**
 * Calculates inventory movement for a category
 * @param {Object} categoryData - Category movement data
 * @returns {Object} Calculated movement
 */
function calculateInventoryMovement(categoryData) {
  const opening = parseFloat(categoryData.opening) || 0;
  const purchases = parseFloat(categoryData.purchases) || 0;
  const usage = parseFloat(categoryData.usage) || 0;
  const writeOff = parseFloat(categoryData.writeOff) || 0;

  return {
    ...categoryData,
    closing: opening + purchases - usage - writeOff
  };
}

/**
 * Calculates inventory totals
 * @param {Object} data - Inventory data
 * @param {Array} categories - Inventory categories
 * @returns {Object} Total movements
 */
function calculateInventoryTotals(data, categories) {
  const totals = {
    opening: 0,
    purchases: 0,
    usage: 0,
    writeOff: 0,
    closing: 0
  };

  categories.forEach(category => {
    if (data[category]) {
      totals.opening += parseFloat(data[category].opening) || 0;
      totals.purchases += parseFloat(data[category].purchases) || 0;
      totals.usage += parseFloat(data[category].usage) || 0;
      totals.writeOff += parseFloat(data[category].writeOff) || 0;
      totals.closing += parseFloat(data[category].closing) || 0;
    }
  });

  return totals;
}

// ============================================================================
// MOVEMENT VALIDATION
// ============================================================================

/**
 * Validates PPE movement schedule
 * @param {Object} movementData - Movement data
 * @returns {Object} Validation result
 */
function validatePPEMovement(movementData) {
  const errors = [];

  const categories = ['land', 'buildings', 'vehicles', 'furniture', 'equipment', 'wip'];

  categories.forEach(category => {
    if (movementData[category]) {
      const cat = movementData[category];

      // Validate cost movement
      const costOpening = parseFloat(cat.cost?.opening) || 0;
      const costAdditions = parseFloat(cat.cost?.additions) || 0;
      const costDisposals = parseFloat(cat.cost?.disposals) || 0;
      const costRevaluations = parseFloat(cat.cost?.revaluations) || 0;
      const costTransfers = parseFloat(cat.cost?.transfers) || 0;
      const costClosing = parseFloat(cat.cost?.closing) || 0;

      const calculatedClosing = costOpening + costAdditions - costDisposals + costRevaluations + costTransfers;

      if (Math.abs(calculatedClosing - costClosing) > 0.01) {
        errors.push({
          category: category,
          field: 'cost',
          message: `Cost closing balance doesn't match: Expected ${formatCurrency(calculatedClosing)}, got ${formatCurrency(costClosing)}`
        });
      }

      // Validate depreciation can't exceed cost
      const depnClosing = parseFloat(cat.depreciation?.closing) || 0;
      if (depnClosing > costClosing) {
        errors.push({
          category: category,
          field: 'depreciation',
          message: 'Accumulated depreciation exceeds cost'
        });
      }
    }
  });

  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Gets movement summary
 * @param {string} entityId - Entity ID
 * @param {string} periodId - Period ID
 * @returns {Object} Movement summary
 */
function getMovementSummary(entityId, periodId) {
  try {
    const ppeResult = getPPEMovement(entityId, periodId);
    const intangiblesResult = getNoteData({ entityId, periodId, noteId: 'NOTE_37' });
    const inventoryResult = getNoteData({ entityId, periodId, noteId: 'NOTE_34' });  // Fixed: NOTE_34 is Inventories, not NOTE_38 (Investment Property)

    return {
      success: true,
      summary: {
        ppe: ppeResult.success ? ppeResult.data?.totals : null,
        intangibles: intangiblesResult.success ? intangiblesResult.data?.totals : null,
        inventory: inventoryResult.success ? inventoryResult.data?.totals : null
      }
    };
  } catch (error) {
    Logger.log('Error getting movement summary: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
