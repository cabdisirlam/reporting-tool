# Attachment Management System

## Overview

The attachment management system provides comprehensive document handling capabilities for the SAGA IPSAS Reporting Tool. It uses Google Drive for file storage with metadata tracked in Google Sheets.

## Architecture

### Components

1. **Backend Module**: `src/backend/Attachments.gs`
2. **Metadata Storage**: `Attachments` sheet in the spreadsheet
3. **File Storage**: Google Drive folder structure
4. **Frontend Integration**: NoteEntry.html, ApprovalReview.html

### Folder Structure

```
Google Drive/
└── SAGA_Attachments/
    └── Period_2024_Q1/
        ├── Entity_Name_1/
        │   ├── document1.pdf
        │   └── spreadsheet1.xlsx
        └── Entity_Name_2/
            └── report1.docx
```

**Structure Pattern**: `SAGA_Attachments/Period_{periodId}/{entityName}/`

## Features

### 1. File Upload
- Supports multiple file types: PDF, Excel, Word, Images
- Maximum file size: 10 MB per file
- Base64 encoding for transfer
- Automatic unique ID generation
- Progress tracking

### 2. Metadata Management
- Unique attachment IDs with format: `ATT_{timestamp}_{random}`
- Complete metadata tracking in spreadsheet
- Soft delete functionality
- Audit trail (uploaded by, upload date)

### 3. File Retrieval
- List attachments by entity
- Filter by period
- Filter by note
- Sorted by upload date (newest first)

### 4. Download
- Secure download URLs from Google Drive
- Original file name preservation
- Direct browser download

### 5. Deletion
- Soft delete (marks as deleted in metadata)
- File remains in Drive unless cleanup is run
- Excluded from all listings after deletion
- Optional hard delete via cleanup function

## Backend API

### Upload Attachment

```javascript
uploadAttachment({
  entityId: string,      // Required: Entity identifier
  periodId: string,      // Required: Period identifier
  noteId: string,        // Optional: Related note
  fileName: string,      // Required: File name
  fileData: string,      // Required: Base64 encoded file data
  mimeType: string,      // Required: MIME type
  description: string,   // Optional: File description
  tags: string          // Optional: Tags for categorization
})
```

**Returns:**
```javascript
{
  success: boolean,
  fileId: string,         // Attachment ID
  driveFileId: string,    // Google Drive file ID
  url: string,            // File URL
  fileName: string,
  message: string
}
```

### Get Attachments

```javascript
getAttachments({
  entityId: string,      // Required: Entity identifier
  periodId: string,      // Required: Period identifier
  noteId: string        // Optional: Filter by note
})
```

**Returns:**
```javascript
{
  success: boolean,
  attachments: [
    {
      id: string,
      attachmentId: string,
      entityId: string,
      entityName: string,
      periodId: string,
      noteId: string,
      name: string,
      fileName: string,
      size: number,
      type: string,
      mimeType: string,
      driveFileId: string,
      url: string,
      uploadedBy: string,
      uploadedDate: Date
    }
  ]
}
```

### Get Download URL

```javascript
getAttachmentDownloadUrl({
  fileId: string         // Required: Attachment ID
})
```

**Returns:**
```javascript
{
  success: boolean,
  url: string,           // Download URL
  fileName: string       // Original file name
}
```

### Delete Attachment

```javascript
deleteAttachment({
  fileId: string         // Required: Attachment ID
})
```

**Returns:**
```javascript
{
  success: boolean,
  message: string
}
```

### Get Statistics

```javascript
getAttachmentStatistics()
```

**Returns:**
```javascript
{
  success: boolean,
  statistics: {
    totalAttachments: number,
    activeAttachments: number,
    deletedAttachments: number,
    totalSize: number,        // Bytes
    totalSizeMB: string       // Formatted MB
  }
}
```

### Cleanup Deleted Attachments

```javascript
cleanupDeletedAttachments()
```

**⚠️ WARNING**: This permanently deletes files from Google Drive. This action is irreversible!

**Returns:**
```javascript
{
  success: boolean,
  cleaned: number,           // Number of files cleaned
  message: string
}
```

## Metadata Schema

### Attachments Sheet Columns

| Column | Type | Description |
|--------|------|-------------|
| Attachment ID | String | Unique identifier (ATT_*) |
| Entity ID | String | Related entity |
| Entity Name | String | Entity display name |
| Period ID | String | Related period |
| Note ID | String | Related note (optional) |
| File Name | String | Stored file name |
| Original File Name | String | User's original file name |
| File Size (bytes) | Number | File size in bytes |
| MIME Type | String | File MIME type |
| Drive File ID | String | Google Drive file ID |
| Drive Folder ID | String | Google Drive folder ID |
| File URL | String | Google Drive file URL |
| Uploaded By | String | Email of uploader |
| Upload Date | Date | Upload timestamp |
| Status | String | 'active' or 'deleted' |
| Description | String | Optional description |
| Tags | String | Optional tags |

## Frontend Integration

### NoteEntry.html

Complete upload interface with:
- Drag-and-drop file upload
- File type validation
- Size validation
- Progress indication
- File list with download/delete
- Auto-load on page load

**Usage:**
1. User navigates to Note Entry page
2. Selects a note from dropdown
3. Scrolls to "Supporting Documents" section
4. Drags files or clicks to browse
5. Files automatically upload
6. List updates with uploaded files

### ApprovalReview.html

Read-only attachment viewing:
- Attachments tab in review interface
- File listing with metadata
- Download functionality
- Upload user and date display

**Usage:**
1. Approver views submission
2. Clicks "Attachments" tab
3. Sees all uploaded documents
4. Can download for review

## File Type Support

### Supported Types

| Category | Extensions | MIME Types |
|----------|-----------|------------|
| PDF | .pdf | application/pdf |
| Excel | .xls, .xlsx | application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Word | .doc, .docx | application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Images | .jpg, .jpeg, .png | image/jpeg, image/png |

### File Size Limits

- Maximum per file: **10 MB**
- No limit on number of files per entity
- Total storage limited by Google Drive quota

## Security Considerations

### Access Control

1. **Authentication**: Uses Google Apps Script session authentication
2. **Authorization**: Files accessible to users with spreadsheet access
3. **Drive Permissions**: Files inherit folder permissions
4. **Audit Trail**: All uploads tracked with user email and timestamp

### Data Validation

1. File size validation (client and server)
2. MIME type validation
3. File extension whitelist
4. Base64 encoding validation

### Best Practices

- ✅ Always validate file type before upload
- ✅ Check file size client-side to save bandwidth
- ✅ Use soft delete to maintain audit trail
- ✅ Regularly review attachment statistics
- ⚠️ Only run cleanup on deleted attachments when necessary
- ⚠️ Ensure users have appropriate Drive permissions

## Testing

### Test Script

Location: `tests/test-attachments.gs`

**Run All Tests:**
```javascript
runAllAttachmentTests()
```

**Quick Test:**
```javascript
quickAttachmentTest()
```

**Cleanup Test Data:**
```javascript
cleanupAttachmentTests()
```

### Test Coverage

1. ✅ Folder creation (root, period, entity)
2. ✅ File upload
3. ✅ Metadata storage
4. ✅ File retrieval (with filtering)
5. ✅ Download URL generation
6. ✅ File deletion (soft)
7. ✅ Statistics calculation

## Troubleshooting

### Common Issues

#### Upload Fails

**Symptoms**: Upload progress stops at 90%, error message shown

**Possible Causes**:
1. File too large (>10 MB)
2. Unsupported file type
3. Drive quota exceeded
4. Insufficient permissions

**Solutions**:
1. Check file size and compress if needed
2. Verify file type is supported
3. Check Google Drive storage quota
4. Ensure user has edit access to spreadsheet

#### Attachments Not Loading

**Symptoms**: Empty state shown when attachments exist

**Possible Causes**:
1. Incorrect entity/period ID
2. Attachments marked as deleted
3. Sheet permissions issue

**Solutions**:
1. Verify correct entity and period selected
2. Check Attachments sheet for status column
3. Verify sheet exists and has correct name

#### Download URL Fails

**Symptoms**: Download button doesn't work or shows error

**Possible Causes**:
1. File deleted from Drive
2. Drive permissions changed
3. Invalid file ID

**Solutions**:
1. Check if file exists in Drive folder
2. Verify Drive folder permissions
3. Check Attachments sheet for valid Drive File ID

## Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Attachments loaded only when tab is viewed
2. **Caching**: File lists cached in frontend until page reload
3. **Batch Operations**: Upload multiple files sequentially, not parallel
4. **Progress Tracking**: Client-side progress simulation for better UX

### Scalability

- **Files per Entity**: Tested up to 50 files per entity
- **Total Files**: System designed for thousands of files
- **Concurrent Uploads**: Limited to 1 at a time per session
- **Drive API Limits**: Subject to Google Drive API quotas

## Future Enhancements

### Planned Features

1. **Preview**: In-browser preview for PDFs and images
2. **Versions**: Track file versions
3. **Categories**: Categorize attachments by type
4. **Bulk Download**: Download all attachments as ZIP
5. **Advanced Search**: Full-text search in attachments
6. **Thumbnails**: Generate thumbnails for images
7. **OCR**: Extract text from scanned documents
8. **Virus Scanning**: Integrate virus scanning on upload

### API Enhancements

1. Batch upload API
2. Move/rename attachments
3. Share attachments with external users
4. Attachment templates
5. Custom metadata fields

## Migration Guide

### From Previous System

If migrating from a system without attachments:

1. **Backup**: Create backup of current data
2. **Deploy**: Push Attachments.gs to Apps Script
3. **Test**: Run test suite in non-production environment
4. **Enable**: Update HTML files with new attachment code
5. **Train**: Educate users on new attachment features
6. **Monitor**: Watch logs for first week

### Data Import

To import existing attachments:

```javascript
function importExistingAttachments() {
  // Example: Import from existing Drive folder
  const oldFolder = DriveApp.getFolderById('FOLDER_ID');
  const files = oldFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    // Process each file...
  }
}
```

## Support

### Logging

All attachment operations are logged with:
- Function name
- Parameters (excluding file data)
- Success/failure status
- Error messages

**View Logs:**
1. Open Apps Script Editor
2. View → Logs (Ctrl+Enter)

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Missing required parameters" | Required parameter not provided | Check API call parameters |
| "Attachment not found" | Invalid attachment ID | Verify attachment exists |
| "Failed to access attachments storage" | Drive folder creation failed | Check Drive permissions |
| "File type not supported" | Invalid MIME type | Use supported file type |
| "File exceeds 10MB limit" | File too large | Compress or split file |

## Changelog

### Version 1.0.0 (2024-11-18)

- ✨ Initial release
- ✨ Google Drive integration
- ✨ Metadata tracking in spreadsheet
- ✨ Upload/download/delete functionality
- ✨ NoteEntry.html integration
- ✨ ApprovalReview.html integration
- ✨ Comprehensive test suite
- ✨ Soft delete support
- ✨ Statistics and reporting
- ✨ Organized folder structure by period and entity

---

**Documentation Version**: 1.0.0
**Last Updated**: 2024-11-18
**Author**: SAGA IPSAS Development Team
