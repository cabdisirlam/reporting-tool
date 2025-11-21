/**
 * @file SagaNotesConfig.gs
 * @description Configuration wrapper for Saga Notes configuration data
 */

/**
 * Gets the complete Saga Notes configuration
 * @returns {Object} The configuration object containing all note definitions
 */
function getSagaNotesConfig() {
  const props = PropertiesService.getScriptProperties();
  const storedConfig = props.getProperty('SAGA_NOTES_CONFIG');

  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (error) {
      Logger.log('Error parsing SAGA_NOTES_CONFIG: ' + error.toString());
    }
  }

  const defaultConfig = getDefaultSagaNotesConfig();
  props.setProperty('SAGA_NOTES_CONFIG', JSON.stringify(defaultConfig));
  return defaultConfig;
}

function getSagaNotesConfigJson() {
  return JSON.stringify(getSagaNotesConfig());
}

function initializeSagaNotesConfig() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SAGA_NOTES_CONFIG', JSON.stringify(getDefaultSagaNotesConfig()));
  return { success: true };
}

function getDefaultSagaNotesConfig() {
  return {
    noteTemplates: [
      { noteId: 'NOTE_06', noteNumber: '6', noteName: 'Transfers from other governments entities', category: 'Performance', statementType: 'SOFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_07', noteNumber: '7', noteName: 'Levies, Fines, and penalties', category: 'Performance', statementType: 'SOFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_08', noteNumber: '8', noteName: 'Public contributions and donations', category: 'Performance', statementType: 'SOFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_09', noteNumber: '9', noteName: 'Property taxes revenue', category: 'Performance', statementType: 'SOFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_10', noteNumber: '10', noteName: 'Licenses and permits', category: 'Performance', statementType: 'SOFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_30', noteNumber: '30', noteName: 'Cash and Cash equivalents', category: 'Position', statementType: 'SFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_36', noteNumber: '36', noteName: 'Property, Plant and Equipment', category: 'Position', statementType: 'SFP', hasMovementSchedule: true, required: true, active: true },
      { noteId: 'NOTE_40', noteNumber: '40', noteName: 'Trade and Other Payables', category: 'Position', statementType: 'SFP', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_CF', noteNumber: 'CF', noteName: 'Cash Flow Statement', category: 'CashFlow', statementType: 'SCF', hasMovementSchedule: false, required: true, active: true },
      { noteId: 'NOTE_BUDGET', noteNumber: 'BUDGET', noteName: 'Statement of Comparison of Budget and Actual', category: 'Budget', statementType: 'BUDGET', hasMovementSchedule: false, required: true, active: true }
    ]
  };
}
