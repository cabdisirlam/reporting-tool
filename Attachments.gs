/**
 * Attachments.gs
 *
 * Manages document attachments using Google Drive folders
 * - Creates organized folder structure: SAGA_Attachments/Period_YYYY_QX/EntityName/
 * - Assigns unique IDs to each document
 * - Stores metadata in the Attachments sheet
 * - Provides upload, download, list, and delete functionality
 */

// ============================================================================
// FOLDER STRUCTURE MANAGEMENT
// ============================================================================

/**
 * Gets or creates the root attachments folder
 * @returns {Folder} Root SAGA_Attachments folder
 */
function getOrCreateRootAttachmentsFolder() {
  const rootFolderName = 'SAGA_Attachments';

  try {
    // Check if root folder already exists
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }

    // Create root folder
    const rootFolder = DriveApp.createFolder(rootFolderName);
    Logger.log('Created root attachments folder: ' + rootFolderName);
    return rootFolder;

  } catch (error) {
    Logger.log('Error getting/creating root attachments folder: ' + error.toString());
    throw new Error('Failed to access attachments storage');
  }
}

/**
 * Gets or creates period-specific folder
 * @param {string} periodId - Period identifier (e.g., "2024_Q1")
 * @returns {Folder} Period folder
 */
function getOrCreatePeriodFolder(periodId) {
  try {
    const rootFolder = getOrCreateRootAttachmentsFolder();
    const periodFolderName = 'Period_' + periodId;

    // Check if period folder exists
    const folders = rootFolder.getFoldersByName(periodFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }

    // Create period folder
    const periodFolder = rootFolder.createFolder(periodFolderName);
    Logger.log('Created period folder: ' + periodFolderName);
    return periodFolder;

  } catch (error) {
    Logger.log('Error getting/creating period folder: ' + error.toString());
    throw error;
  }
}

/**
 * Gets or creates entity-specific folder within a period
 * @param {string} periodId - Period identifier
 * @param {string} entityId - Entity identifier
 * @param {string} entityName - Entity name for folder label
 * @returns {Folder} Entity folder
 */
function getOrCreateEntityFolder(periodId, entityId, entityName) {
  try {
    const periodFolder = getOrCreatePeriodFolder(periodId);
    const entityFolderName = entityName || entityId;

    // Check if entity folder exists
    const folders = periodFolder.getFoldersByName(entityFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }

    // Create entity folder
    const entityFolder = periodFolder.createFolder(entityFolderName);
    Logger.log('Created entity folder: ' + entityFolderName);
    return entityFolder;

  } catch (error) {
    Logger.log('Error getting/creating entity folder: ' + error.toString());
    throw error;
  }
}

// ============================================================================
// METADATA STORAGE
// ============================================================================

/**
 * Gets or creates the Attachments metadata sheet
 * @returns {Sheet} Attachments sheet
 */
function getOrCreateAttachmentsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Attachments');

  if (!sheet) {
    sheet = ss.insertSheet('Attachments');

    // Set up headers
    const headers = [
      'Attachment ID',
      'Entity ID',
      'Entity Name',
      'Period ID',
      'Note ID',
      'File Name',
      'Original File Name',
      'File Size (bytes)',
      'MIME Type',
      'Drive File ID',
      'Drive Folder ID',
      'File URL',
      'Uploaded By',
      'Upload Date',
      'Status',
      'Description',
      'Tags'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setFrozenRows(1);

    Logger.log('Created Attachments metadata sheet');
  }

  return sheet;
}

/**
 * Saves attachment metadata to the sheet
 * @param {Object} metadata - Attachment metadata
 * @returns {string} Attachment ID
 */
function saveAttachmentMetadata(metadata) {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const attachmentId = generateUniqueId('ATT');

    const row = [
      attachmentId,
      metadata.entityId,
      metadata.entityName || '',
      metadata.periodId,
      metadata.noteId || '',
      metadata.fileName,
      metadata.originalFileName,
      metadata.fileSize,
      metadata.mimeType,
      metadata.driveFileId,
      metadata.driveFolderId,
      metadata.fileUrl,
      Session.getActiveUser().getEmail(),
      new Date(),
      'active',
      metadata.description || '',
      metadata.tags || ''
    ];

    sheet.appendRow(row);
    Logger.log('Saved attachment metadata: ' + attachmentId);
    return attachmentId;

  } catch (error) {
    Logger.log('Error saving attachment metadata: ' + error.toString());
    throw error;
  }
}

/**
 * Gets attachment metadata by ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Object} Attachment metadata
 */
function getAttachmentMetadata(attachmentId) {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === attachmentId && data[i][14] === 'active') {
        return {
          attachmentId: data[i][0],
          entityId: data[i][1],
          entityName: data[i][2],
          periodId: data[i][3],
          noteId: data[i][4],
          fileName: data[i][5],
          originalFileName: data[i][6],
          fileSize: data[i][7],
          mimeType: data[i][8],
          driveFileId: data[i][9],
          driveFolderId: data[i][10],
          fileUrl: data[i][11],
          uploadedBy: data[i][12],
          uploadDate: data[i][13],
          status: data[i][14],
          description: data[i][15],
          tags: data[i][16]
        };
      }
    }

    return null;

  } catch (error) {
    Logger.log('Error getting attachment metadata: ' + error.toString());
    return null;
  }
}

/**
 * Lists attachments for an entity/period/note
 * @param {Object} params - Filter parameters
 * @returns {Array} Array of attachment metadata
 */
function listAttachmentMetadata(params) {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const data = sheet.getDataRange().getValues();
    const attachments = [];

    for (let i = 1; i < data.length; i++) {
      // Skip deleted attachments
      if (data[i][14] !== 'active') continue;

      // Filter by entity
      if (params.entityId && data[i][1] !== params.entityId) continue;

      // Filter by period
      if (params.periodId && data[i][3] !== params.periodId) continue;

      // Filter by note
      if (params.noteId && data[i][4] !== params.noteId) continue;

      attachments.push({
        id: data[i][0],
        attachmentId: data[i][0],
        entityId: data[i][1],
        entityName: data[i][2],
        periodId: data[i][3],
        noteId: data[i][4],
        name: data[i][6], // Original file name
        fileName: data[i][5],
        size: data[i][7],
        type: data[i][8],
        mimeType: data[i][8],
        driveFileId: data[i][9],
        url: data[i][11],
        uploadedBy: data[i][12],
        uploadedDate: data[i][13],
        uploadDate: data[i][13]
      });
    }

    // Sort by upload date (newest first)
    attachments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return attachments;

  } catch (error) {
    Logger.log('Error listing attachments: ' + error.toString());
    return [];
  }
}

/**
 * Marks an attachment as deleted (soft delete)
 * @param {string} attachmentId - Attachment ID
 * @returns {boolean} Success status
 */
function markAttachmentDeleted(attachmentId) {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === attachmentId) {
        sheet.getRange(i + 1, 15).setValue('deleted');
        Logger.log('Marked attachment as deleted: ' + attachmentId);
        return true;
      }
    }

    return false;

  } catch (error) {
    Logger.log('Error marking attachment deleted: ' + error.toString());
    return false;
  }
}

// ============================================================================
// UPLOAD FUNCTIONALITY
// ============================================================================

/**
 * Uploads an attachment to Google Drive
 * @param {Object} params - Upload parameters
 * @returns {Object} Upload result with file info
 */
function uploadAttachment(params) {
  try {
    Logger.log('uploadAttachment called with params: ' + JSON.stringify({
      entityId: params.entityId,
      periodId: params.periodId,
      noteId: params.noteId,
      fileName: params.fileName
    }));

    // Validate required parameters
    if (!params.entityId || !params.periodId || !params.fileName || !params.fileData) {
      throw new Error('Missing required parameters: entityId, periodId, fileName, fileData');
    }

    // Get entity name
    const entityName = getEntityName(params.entityId);

    // Get or create the entity folder
    const entityFolder = getOrCreateEntityFolder(params.periodId, params.entityId, entityName);

    // Decode base64 file data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(params.fileData),
      params.mimeType || 'application/octet-stream',
      params.fileName
    );

    // Create file in Drive
    const file = entityFolder.createFile(blob);
    const fileId = file.getId();
    const fileUrl = file.getUrl();

    // Save metadata
    const attachmentId = saveAttachmentMetadata({
      entityId: params.entityId,
      entityName: entityName,
      periodId: params.periodId,
      noteId: params.noteId,
      fileName: params.fileName,
      originalFileName: params.fileName,
      fileSize: blob.getBytes().length,
      mimeType: params.mimeType,
      driveFileId: fileId,
      driveFolderId: entityFolder.getId(),
      fileUrl: fileUrl,
      description: params.description || '',
      tags: params.tags || ''
    });

    Logger.log('File uploaded successfully: ' + attachmentId);

    return {
      success: true,
      fileId: attachmentId,
      driveFileId: fileId,
      url: fileUrl,
      fileName: params.fileName,
      message: 'File uploaded successfully'
    };

  } catch (error) {
    Logger.log('Error uploading attachment: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// DOWNLOAD FUNCTIONALITY
// ============================================================================

/**
 * Gets download URL for an attachment
 * @param {Object} params - Parameters with fileId
 * @returns {Object} Result with download URL
 */
function getAttachmentDownloadUrl(params) {
  try {
    const metadata = getAttachmentMetadata(params.fileId);

    if (!metadata) {
      throw new Error('Attachment not found');
    }

    // Get file from Drive
    const file = DriveApp.getFileById(metadata.driveFileId);

    return {
      success: true,
      url: file.getDownloadUrl(),
      fileName: metadata.originalFileName
    };

  } catch (error) {
    Logger.log('Error getting download URL: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// LIST FUNCTIONALITY
// ============================================================================

/**
 * Gets all attachments for an entity/period/note
 * @param {Object} params - Filter parameters
 * @returns {Object} Result with attachments array
 */
function getAttachments(params) {
  try {
    const attachments = listAttachmentMetadata(params);

    return {
      success: true,
      attachments: attachments
    };

  } catch (error) {
    Logger.log('Error getting attachments: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      attachments: []
    };
  }
}

// ============================================================================
// DELETE FUNCTIONALITY
// ============================================================================

/**
 * Deletes an attachment (soft delete - marks as deleted)
 * @param {Object} params - Parameters with fileId
 * @returns {Object} Delete result
 */
function deleteAttachment(params) {
  try {
    const metadata = getAttachmentMetadata(params.fileId);

    if (!metadata) {
      throw new Error('Attachment not found');
    }

    // Soft delete in metadata
    const deleted = markAttachmentDeleted(params.fileId);

    if (!deleted) {
      throw new Error('Failed to delete attachment metadata');
    }

    // Optionally move file to trash in Drive (hard delete)
    // Uncomment if you want to actually delete files from Drive
    // try {
    //   const file = DriveApp.getFileById(metadata.driveFileId);
    //   file.setTrashed(true);
    // } catch (driveError) {
    //   Logger.log('Failed to trash Drive file: ' + driveError.toString());
    // }

    Logger.log('Attachment deleted: ' + params.fileId);

    return {
      success: true,
      message: 'Attachment deleted successfully'
    };

  } catch (error) {
    Logger.log('Error deleting attachment: ' + error.toString());
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
 * Gets entity name by ID
 * @param {string} entityId - Entity ID
 * @returns {string} Entity name
 */
function getEntityName(entityId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const entitiesSheet = ss.getSheetByName('Entities');

    if (!entitiesSheet) {
      return entityId;
    }

    const data = entitiesSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === entityId) {
        return data[i][1]; // Entity name column
      }
    }

    return entityId;

  } catch (error) {
    Logger.log('Error getting entity name: ' + error.toString());
    return entityId;
  }
}

/**
 * Generates a unique ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'ATT')
 * @returns {string} Unique ID
 */
function generateUniqueId(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return prefix + '_' + timestamp + '_' + random;
}

// ============================================================================
// ADMINISTRATIVE FUNCTIONS
// ============================================================================

/**
 * Gets statistics about attachments
 * @returns {Object} Attachment statistics
 */
function getAttachmentStatistics() {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const data = sheet.getDataRange().getValues();

    let totalAttachments = 0;
    let activeAttachments = 0;
    let deletedAttachments = 0;
    let totalSize = 0;

    for (let i = 1; i < data.length; i++) {
      totalAttachments++;
      if (data[i][14] === 'active') {
        activeAttachments++;
        totalSize += data[i][7] || 0;
      } else {
        deletedAttachments++;
      }
    }

    return {
      success: true,
      statistics: {
        totalAttachments: totalAttachments,
        activeAttachments: activeAttachments,
        deletedAttachments: deletedAttachments,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      }
    };

  } catch (error) {
    Logger.log('Error getting attachment statistics: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Cleans up deleted attachments (permanently removes from Drive)
 * WARNING: This is irreversible!
 * @returns {Object} Cleanup result
 */
function cleanupDeletedAttachments() {
  try {
    const sheet = getOrCreateAttachmentsSheet();
    const data = sheet.getDataRange().getValues();
    let cleaned = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][14] === 'deleted') {
        try {
          const file = DriveApp.getFileById(data[i][9]);
          file.setTrashed(true);
          cleaned++;
        } catch (driveError) {
          Logger.log('Failed to trash file: ' + driveError.toString());
        }
      }
    }

    return {
      success: true,
      cleaned: cleaned,
      message: cleaned + ' files moved to trash'
    };

  } catch (error) {
    Logger.log('Error cleaning up attachments: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
