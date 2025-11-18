/**
 * Comprehensive Attachment System Test Suite
 *
 * This script tests all aspects of the attachment functionality:
 * - Folder creation
 * - File upload
 * - Metadata storage
 * - File retrieval
 * - File download
 * - File deletion
 * - Statistics
 */

/**
 * Run all attachment tests
 */
function runAllAttachmentTests() {
  Logger.log('========================================');
  Logger.log('STARTING ATTACHMENT SYSTEM TESTS');
  Logger.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Folder Structure
  testFolderCreation(results);

  // Test 2: File Upload
  testFileUpload(results);

  // Test 3: Metadata Storage
  testMetadataStorage(results);

  // Test 4: File Retrieval
  testFileRetrieval(results);

  // Test 5: Download URL
  testDownloadUrl(results);

  // Test 6: File Deletion
  testFileDeletion(results);

  // Test 7: Statistics
  testStatistics(results);

  // Print summary
  Logger.log('\n========================================');
  Logger.log('TEST SUMMARY');
  Logger.log('========================================');
  Logger.log('Total Tests: ' + results.total);
  Logger.log('Passed: ' + results.passed);
  Logger.log('Failed: ' + results.failed);
  Logger.log('Success Rate: ' + ((results.passed / results.total) * 100).toFixed(1) + '%');
  Logger.log('========================================\n');

  return results;
}

/**
 * Test 1: Folder Creation
 */
function testFolderCreation(results) {
  results.total++;
  Logger.log('TEST 1: Folder Creation');
  Logger.log('------------------------');

  try {
    // Create root folder
    const rootFolder = getOrCreateRootAttachmentsFolder();
    if (!rootFolder) {
      throw new Error('Failed to create root folder');
    }
    Logger.log('✓ Root folder created: ' + rootFolder.getName());

    // Create period folder
    const testPeriodId = '2024_Q1';
    const periodFolder = getOrCreatePeriodFolder(testPeriodId);
    if (!periodFolder) {
      throw new Error('Failed to create period folder');
    }
    Logger.log('✓ Period folder created: ' + periodFolder.getName());

    // Create entity folder
    const testEntityId = 'TEST_001';
    const testEntityName = 'Test Entity';
    const entityFolder = getOrCreateEntityFolder(testPeriodId, testEntityId, testEntityName);
    if (!entityFolder) {
      throw new Error('Failed to create entity folder');
    }
    Logger.log('✓ Entity folder created: ' + entityFolder.getName());

    // Verify folder hierarchy
    const parentFolder = entityFolder.getParents().next();
    if (parentFolder.getName() !== 'Period_' + testPeriodId) {
      throw new Error('Incorrect folder hierarchy');
    }
    Logger.log('✓ Folder hierarchy verified');

    results.passed++;
    Logger.log('✅ TEST 1 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 1 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 2: File Upload
 */
function testFileUpload(results) {
  results.total++;
  Logger.log('TEST 2: File Upload');
  Logger.log('-------------------');

  try {
    // Create test file data (small PDF)
    const testFileName = 'test-document.pdf';
    const testContent = 'This is a test PDF document for attachment testing.';
    const base64Data = Utilities.base64Encode(testContent);

    // Upload file
    const uploadResult = uploadAttachment({
      entityId: 'TEST_001',
      periodId: '2024_Q1',
      noteId: 'NOTE_1',
      fileName: testFileName,
      fileData: base64Data,
      mimeType: 'application/pdf',
      description: 'Test document upload'
    });

    if (!uploadResult.success) {
      throw new Error('Upload failed: ' + uploadResult.error);
    }
    Logger.log('✓ File uploaded successfully');
    Logger.log('  - File ID: ' + uploadResult.fileId);
    Logger.log('  - Drive ID: ' + uploadResult.driveFileId);

    // Verify file exists in Drive
    const file = DriveApp.getFileById(uploadResult.driveFileId);
    if (file.getName() !== testFileName) {
      throw new Error('File name mismatch');
    }
    Logger.log('✓ File verified in Google Drive');

    // Store for later tests
    PropertiesService.getScriptProperties().setProperty('TEST_ATTACHMENT_ID', uploadResult.fileId);
    PropertiesService.getScriptProperties().setProperty('TEST_DRIVE_FILE_ID', uploadResult.driveFileId);

    results.passed++;
    Logger.log('✅ TEST 2 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 2 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 3: Metadata Storage
 */
function testMetadataStorage(results) {
  results.total++;
  Logger.log('TEST 3: Metadata Storage');
  Logger.log('------------------------');

  try {
    const attachmentId = PropertiesService.getScriptProperties().getProperty('TEST_ATTACHMENT_ID');
    if (!attachmentId) {
      throw new Error('No test attachment ID found');
    }

    // Retrieve metadata
    const metadata = getAttachmentMetadata(attachmentId);
    if (!metadata) {
      throw new Error('Metadata not found');
    }
    Logger.log('✓ Metadata retrieved successfully');

    // Verify metadata fields
    const requiredFields = [
      'attachmentId', 'entityId', 'periodId', 'fileName',
      'originalFileName', 'fileSize', 'mimeType', 'driveFileId',
      'fileUrl', 'uploadedBy', 'uploadDate', 'status'
    ];

    for (const field of requiredFields) {
      if (!(field in metadata)) {
        throw new Error('Missing metadata field: ' + field);
      }
    }
    Logger.log('✓ All required metadata fields present');

    // Verify metadata values
    if (metadata.entityId !== 'TEST_001') {
      throw new Error('Entity ID mismatch');
    }
    if (metadata.periodId !== '2024_Q1') {
      throw new Error('Period ID mismatch');
    }
    if (metadata.status !== 'active') {
      throw new Error('Status should be active');
    }
    Logger.log('✓ Metadata values verified');

    results.passed++;
    Logger.log('✅ TEST 3 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 3 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 4: File Retrieval
 */
function testFileRetrieval(results) {
  results.total++;
  Logger.log('TEST 4: File Retrieval');
  Logger.log('----------------------');

  try {
    // Get all attachments for entity
    const attachmentsResult = getAttachments({
      entityId: 'TEST_001',
      periodId: '2024_Q1'
    });

    if (!attachmentsResult.success) {
      throw new Error('Failed to retrieve attachments: ' + attachmentsResult.error);
    }
    Logger.log('✓ Attachments retrieved successfully');

    if (!attachmentsResult.attachments || attachmentsResult.attachments.length === 0) {
      throw new Error('No attachments found');
    }
    Logger.log('✓ Found ' + attachmentsResult.attachments.length + ' attachment(s)');

    // Verify attachment data
    const attachment = attachmentsResult.attachments[0];
    if (!attachment.id || !attachment.name || !attachment.size) {
      throw new Error('Incomplete attachment data');
    }
    Logger.log('✓ Attachment data structure verified');

    // Test filtering by note
    const noteFilterResult = getAttachments({
      entityId: 'TEST_001',
      periodId: '2024_Q1',
      noteId: 'NOTE_1'
    });

    if (!noteFilterResult.success || noteFilterResult.attachments.length === 0) {
      throw new Error('Note filtering failed');
    }
    Logger.log('✓ Note filtering works correctly');

    results.passed++;
    Logger.log('✅ TEST 4 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 4 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 5: Download URL
 */
function testDownloadUrl(results) {
  results.total++;
  Logger.log('TEST 5: Download URL');
  Logger.log('--------------------');

  try {
    const attachmentId = PropertiesService.getScriptProperties().getProperty('TEST_ATTACHMENT_ID');
    if (!attachmentId) {
      throw new Error('No test attachment ID found');
    }

    // Get download URL
    const urlResult = getAttachmentDownloadUrl({ fileId: attachmentId });

    if (!urlResult.success) {
      throw new Error('Failed to get download URL: ' + urlResult.error);
    }
    Logger.log('✓ Download URL retrieved successfully');

    if (!urlResult.url || !urlResult.url.startsWith('http')) {
      throw new Error('Invalid download URL');
    }
    Logger.log('✓ URL format validated');

    if (!urlResult.fileName) {
      throw new Error('File name not returned');
    }
    Logger.log('✓ File name included: ' + urlResult.fileName);

    results.passed++;
    Logger.log('✅ TEST 5 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 5 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 6: File Deletion
 */
function testFileDeletion(results) {
  results.total++;
  Logger.log('TEST 6: File Deletion');
  Logger.log('---------------------');

  try {
    const attachmentId = PropertiesService.getScriptProperties().getProperty('TEST_ATTACHMENT_ID');
    if (!attachmentId) {
      throw new Error('No test attachment ID found');
    }

    // Delete attachment
    const deleteResult = deleteAttachment({ fileId: attachmentId });

    if (!deleteResult.success) {
      throw new Error('Failed to delete attachment: ' + deleteResult.error);
    }
    Logger.log('✓ Attachment deleted successfully');

    // Verify soft delete (metadata should be marked as deleted)
    const metadata = getAttachmentMetadata(attachmentId);
    if (metadata !== null) {
      throw new Error('Soft delete failed - metadata still active');
    }
    Logger.log('✓ Soft delete verified (metadata marked as deleted)');

    // Verify it doesn't appear in listings
    const listResult = getAttachments({
      entityId: 'TEST_001',
      periodId: '2024_Q1'
    });

    const found = listResult.attachments.some(att => att.id === attachmentId);
    if (found) {
      throw new Error('Deleted attachment still appears in listings');
    }
    Logger.log('✓ Deleted attachment excluded from listings');

    results.passed++;
    Logger.log('✅ TEST 6 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 6 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Test 7: Statistics
 */
function testStatistics(results) {
  results.total++;
  Logger.log('TEST 7: Statistics');
  Logger.log('------------------');

  try {
    const statsResult = getAttachmentStatistics();

    if (!statsResult.success) {
      throw new Error('Failed to get statistics: ' + statsResult.error);
    }
    Logger.log('✓ Statistics retrieved successfully');

    const stats = statsResult.statistics;
    const requiredStats = [
      'totalAttachments', 'activeAttachments',
      'deletedAttachments', 'totalSize', 'totalSizeMB'
    ];

    for (const stat of requiredStats) {
      if (!(stat in stats)) {
        throw new Error('Missing statistic: ' + stat);
      }
    }
    Logger.log('✓ All statistics present');

    Logger.log('  Statistics:');
    Logger.log('  - Total Attachments: ' + stats.totalAttachments);
    Logger.log('  - Active Attachments: ' + stats.activeAttachments);
    Logger.log('  - Deleted Attachments: ' + stats.deletedAttachments);
    Logger.log('  - Total Size: ' + stats.totalSizeMB + ' MB');

    results.passed++;
    Logger.log('✅ TEST 7 PASSED\n');

  } catch (error) {
    results.failed++;
    Logger.log('❌ TEST 7 FAILED: ' + error.toString() + '\n');
  }
}

/**
 * Cleanup test data
 */
function cleanupAttachmentTests() {
  Logger.log('Cleaning up test data...');

  try {
    // Get test IDs
    const driveFileId = PropertiesService.getScriptProperties().getProperty('TEST_DRIVE_FILE_ID');

    // Delete test file from Drive
    if (driveFileId) {
      try {
        const file = DriveApp.getFileById(driveFileId);
        file.setTrashed(true);
        Logger.log('✓ Test file deleted from Drive');
      } catch (e) {
        Logger.log('⚠ Could not delete test file: ' + e.toString());
      }
    }

    // Clear properties
    PropertiesService.getScriptProperties().deleteProperty('TEST_ATTACHMENT_ID');
    PropertiesService.getScriptProperties().deleteProperty('TEST_DRIVE_FILE_ID');
    Logger.log('✓ Test properties cleared');

    Logger.log('Cleanup complete!\n');

  } catch (error) {
    Logger.log('❌ Cleanup error: ' + error.toString());
  }
}

/**
 * Quick test for manual verification
 */
function quickAttachmentTest() {
  Logger.log('Running quick attachment test...\n');

  // Test upload
  const testContent = 'Quick test file content';
  const base64Data = Utilities.base64Encode(testContent);

  const uploadResult = uploadAttachment({
    entityId: 'QUICK_TEST',
    periodId: '2024_Q1',
    noteId: 'NOTE_TEST',
    fileName: 'quick-test.txt',
    fileData: base64Data,
    mimeType: 'text/plain'
  });

  Logger.log('Upload result:');
  Logger.log(JSON.stringify(uploadResult, null, 2));

  if (uploadResult.success) {
    // Test retrieval
    const listResult = getAttachments({
      entityId: 'QUICK_TEST',
      periodId: '2024_Q1'
    });

    Logger.log('\nList result:');
    Logger.log(JSON.stringify(listResult, null, 2));

    // Test download URL
    const urlResult = getAttachmentDownloadUrl({ fileId: uploadResult.fileId });
    Logger.log('\nDownload URL result:');
    Logger.log(JSON.stringify(urlResult, null, 2));
  }

  Logger.log('\nQuick test complete!');
}
