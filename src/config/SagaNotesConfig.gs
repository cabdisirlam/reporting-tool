/**
 * @file SagaNotesConfig.gs
 * @description Configuration wrapper for Saga Notes configuration data
 */

/**
 * Gets the complete Saga Notes configuration
 * @returns {Object} The configuration object containing all note definitions
 */
function getSagaNotesConfig() {
  const configJson = getSagaNotesConfigJson();
  return JSON.parse(configJson);
}

/**
 * Returns the raw JSON configuration as a string
 * Note: The actual JSON data is stored in saga-notes-config.json
 * This function loads it from the project properties or directly embeds it
 * @returns {string} JSON configuration string
 */
function getSagaNotesConfigJson() {
  // For now, we'll load from a separate JSON resource file
  // In Apps Script, you may need to embed this or use Properties Service
  try {
    const props = PropertiesService.getScriptProperties();
    const configData = props.getProperty('SAGA_NOTES_CONFIG');
    if (configData) {
      return configData;
    }
  } catch (e) {
    Logger.log('Could not load config from properties: ' + e.toString());
  }
  
  // Fallback: Return empty config structure
  return JSON.stringify({ notes: [] });
}

/**
 * Initializes the configuration in Script Properties
 * This should be run once to store the configuration
 */
function initializeSagaNotesConfig() {
  // This function can be used to load the JSON file content
  // and store it in Script Properties for runtime access
  Logger.log('Configuration initialization required');
  Logger.log('Please manually set SAGA_NOTES_CONFIG in Script Properties');
}
