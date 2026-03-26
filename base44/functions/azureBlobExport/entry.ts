import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { 
  validateAzureCredentials, 
  validateBlobContainerAccess, 
  uploadToBlob,
  generateBlobSASToken 
} from './lib/azure-client.js';
import { exportProfiles, exportEvents } from './lib/export-formats.js';
import { flagEnabled } from './lib/flags.js';

/**
 * Production Azure Blob Storage export function
 * Exports user data to Azure Blob Storage with SAS token generation
 * Note: Currently uses simulation mode for demo purposes
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  const exportId = `azure_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(JSON.stringify({
    event: 'azure_blob_export_started',
    export_id: exportId,
    method: req.method,
    url: req.url
  }));
  
  try {
    // Feature flag check
    if (!flagEnabled('AZURE_BLOB_EXPORTS_ENABLED')) {
      return Response.json({
        success: false,
        error: 'Azure Blob exports are currently disabled',
        errorCode: 'FEATURE_DISABLED'
      }, { status: 503 });
    }
    
    // Authentication
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Admin-only restriction for now
    if (user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Azure exports require admin privileges' 
      }, { status: 403 });
    }
    
    // Parse request body
    const { 
      containerName, 
      dataType, 
      format = 'json',
      includeDemo = false,
      sasTokenExpireHours = 24 
    } = await req.json();
    
    // Validate inputs
    if (!containerName || typeof containerName !== 'string') {
      return Response.json({
        success: false,
        error: 'Container name is required',
        errorCode: 'MISSING_CONTAINER_NAME'
      }, { status: 400 });
    }
    
    if (!['profiles', 'events'].includes(dataType)) {
      return Response.json({
        success: false,
        error: 'Data type must be "profiles" or "events"',
        errorCode: 'INVALID_DATA_TYPE'
      }, { status: 400 });
    }
    
    if (!['json', 'csv'].includes(format)) {
      return Response.json({
        success: false,
        error: 'Format must be "json" or "csv"',
        errorCode: 'INVALID_FORMAT'
      }, { status: 400 });
    }
    
    // Validate Azure credentials
    const credentialsCheck = await validateAzureCredentials();
    if (!credentialsCheck.success) {
      console.error(JSON.stringify({
        event: 'azure_credentials_invalid',
        export_id: exportId,
        error: credentialsCheck.error
      }));
      
      return Response.json({
        success: false,
        error: 'Azure credentials validation failed',
        details: credentialsCheck.error,
        errorCode: credentialsCheck.errorCode
      }, { status: 500 });
    }
    
    // Validate container access
    const containerCheck = await validateBlobContainerAccess(containerName);
    if (!containerCheck.success) {
      console.error(JSON.stringify({
        event: 'azure_container_invalid',
        export_id: exportId,
        container: containerName,
        error: containerCheck.error
      }));
      
      return Response.json({
        success: false,
        error: 'Container validation failed',
        details: containerCheck.error,
        errorCode: containerCheck.errorCode
      }, { status: 400 });
    }
    
    // Fetch data based on type
    let data, exportResult;
    
    if (dataType === 'profiles') {
      const filter = includeDemo ? {} : { is_demo: false };
      data = await base44.asServiceRole.entities.UserPsychographicProfile.filter(filter, '-last_analyzed', 1000);
      exportResult = exportProfiles(data, format);
    } else if (dataType === 'events') {
      const filter = includeDemo ? {} : { is_demo: false };
      data = await base44.asServiceRole.entities.CapturedEvent.filter(filter, '-timestamp', 5000);
      exportResult = exportEvents(data, format);
    }
    
    if (!data || data.length === 0) {
      return Response.json({
        success: false,
        error: `No ${dataType} found to export`,
        errorCode: 'NO_DATA_FOUND'
      }, { status: 404 });
    }
    
    console.log(JSON.stringify({
      event: 'azure_data_prepared',
      export_id: exportId,
      data_type: dataType,
      record_count: data.length,
      format,
      file_size: exportResult.size || exportResult.data.length
    }));
    
    // Generate blob name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blobName = `knxw-exports/${dataType}/${timestamp}_${exportResult.filename}`;
    
    // Upload to Azure Blob
    const uploadResult = await uploadToBlob(
      containerName,
      blobName,
      exportResult.data,
      {
        contentType: exportResult.contentType,
        metadata: {
          export_id: exportId,
          data_type: dataType,
          format,
          record_count: data.length.toString(),
          exported_by: user.email,
          knxw_version: '1.0.0'
        },
        tags: {
          source: 'knxw_platform',
          type: 'data_export',
          data_type: dataType
        }
      }
    );
    
    if (!uploadResult.success) {
      console.error(JSON.stringify({
        event: 'azure_upload_failed',
        export_id: exportId,
        error: uploadResult.error,
        upload_id: uploadResult.uploadId
      }));
      
      return Response.json({
        success: false,
        error: 'Azure Blob upload failed',
        details: uploadResult.error,
        errorCode: uploadResult.errorCode,
        exportId,
        uploadId: uploadResult.uploadId
      }, { status: 500 });
    }
    
    // Generate SAS token for secure download
    const expiresAt = new Date(Date.now() + (sasTokenExpireHours * 60 * 60 * 1000));
    const sasResult = await generateBlobSASToken(
      containerName,
      blobName,
      {
        permissions: 'r', // Read-only
        expiresOn: expiresAt
      }
    );
    
    if (!sasResult.success) {
      console.warn(JSON.stringify({
        event: 'azure_sas_generation_failed',
        export_id: exportId,
        blob_url: uploadResult.blobUrl,
        error: sasResult.error
      }));
      
      // Export succeeded but SAS token failed - still return success
      return Response.json({
        success: true,
        exportId,
        blobUrl: uploadResult.blobUrl,
        metadata: uploadResult.metadata,
        uploadLatency: uploadResult.latency,
        totalLatency: Date.now() - startTime,
        warning: 'Export completed but SAS token generation failed. Use direct blob URL.',
        sasError: sasResult.error
      });
    }
    
    // Success response
    const response = {
      success: true,
      exportId,
      blobUrl: uploadResult.blobUrl,
      sasUrl: sasResult.sasUrl,
      expiresAt: sasResult.expiresAt,
      metadata: {
        ...uploadResult.metadata,
        etag: uploadResult.etag,
        lastModified: uploadResult.lastModified,
        sasPermissions: sasResult.permissions
      },
      uploadLatency: uploadResult.latency,
      totalLatency: Date.now() - startTime,
      mode: 'simulation' // Indicates this is simulated for demo
    };
    
    console.log(JSON.stringify({
      event: 'azure_blob_export_completed',
      export_id: exportId,
      blob_url: uploadResult.blobUrl,
      record_count: data.length,
      total_latency: response.totalLatency,
      sas_expires_at: sasResult.expiresAt.toISOString(),
      mode: 'simulation'
    }));
    
    return Response.json(response);
    
  } catch (error) {
    console.error(JSON.stringify({
      event: 'azure_blob_export_error',
      export_id: exportId,
      error: error.message,
      error_stack: error.stack,
      total_latency: Date.now() - startTime
    }));
    
    return Response.json({
      success: false,
      error: `Azure Blob export failed: ${error.message}`,
      errorCode: 'INTERNAL_ERROR',
      exportId
    }, { status: 500 });
  }
});