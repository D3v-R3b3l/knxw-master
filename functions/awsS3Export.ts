import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from 'npm:@aws-sdk/client-s3@3.427.0';

const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

/**
 * Initialize S3 client with proper configuration
 */
function createS3Client() {
  const config = { region: AWS_REGION };

  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  
  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken: Deno.env.get('AWS_SESSION_TOKEN'),
    };
  }

  return new S3Client(config);
}

/**
 * Validate S3 bucket access
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @returns {Promise<{exists: boolean, accessible: boolean, error?: string}>}
 */
async function validateBucketAccess(s3Client, bucketName) {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return { exists: true, accessible: true };
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return { exists: false, accessible: false, error: 'Bucket does not exist' };
    }
    if (error.name === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
      return { exists: true, accessible: false, error: 'Access denied to bucket' };
    }
    return { exists: false, accessible: false, error: error.message };
  }
}

/**
 * Export psychographic profiles to S3 as JSON
 * @param {string} bucketName 
 * @param {string} keyPrefix 
 * @param {Array} profiles 
 * @param {object} metadata 
 * @returns {Promise<object>}
 */
async function exportProfilesToS3(bucketName, keyPrefix, profiles, metadata = {}) {
  const s3Client = createS3Client();
  const timestamp = new Date().toISOString();
  const fileName = `psychographic_profiles_${timestamp.replace(/[:.]/g, '-')}.json`;
  const s3Key = keyPrefix ? `${keyPrefix}/${fileName}` : fileName;

  // Validate bucket access
  const validation = await validateBucketAccess(s3Client, bucketName);
  if (!validation.accessible) {
    throw new Error(`S3 bucket validation failed: ${validation.error}`);
  }

  // Prepare export data
  const exportData = {
    export_metadata: {
      timestamp,
      total_profiles: profiles.length,
      knxw_version: '1.0.0',
      format: 'json',
      ...metadata
    },
    profiles: profiles.map(profile => ({
      user_id: profile.user_id,
      personality_traits: profile.personality_traits,
      emotional_state: profile.emotional_state,
      risk_profile: profile.risk_profile,
      cognitive_style: profile.cognitive_style,
      motivation_stack: profile.motivation_stack,
      engagement_patterns: profile.engagement_patterns,
      last_analyzed: profile.last_analyzed,
      profile_reasoning: profile.profile_reasoning
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // Upload to S3
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: jsonContent,
    ContentType: 'application/json',
    Metadata: {
      'knxw-export-type': 'psychographic-profiles',
      'knxw-timestamp': timestamp,
      'knxw-profile-count': profiles.length.toString(),
      'knxw-version': '1.0.0'
    }
  });

  const result = await s3Client.send(putCommand);

  console.log(JSON.stringify({
    event: 's3_export_completed',
    bucket: bucketName,
    key: s3Key,
    profile_count: profiles.length,
    file_size_bytes: jsonContent.length,
    etag: result.ETag
  }));

  return {
    success: true,
    bucket: bucketName,
    key: s3Key,
    url: `s3://${bucketName}/${s3Key}`,
    file_size: jsonContent.length,
    profile_count: profiles.length,
    etag: result.ETag,
    timestamp
  };
}

/**
 * Export captured events to S3 as JSONL (newline-delimited JSON)
 * @param {string} bucketName 
 * @param {string} keyPrefix 
 * @param {Array} events 
 * @param {object} metadata 
 * @returns {Promise<object>}
 */
async function exportEventsToS3(bucketName, keyPrefix, events, metadata = {}) {
  const s3Client = createS3Client();
  const timestamp = new Date().toISOString();
  const fileName = `captured_events_${timestamp.replace(/[:.]/g, '-')}.jsonl`;
  const s3Key = keyPrefix ? `${keyPrefix}/${fileName}` : fileName;

  // Validate bucket access
  const validation = await validateBucketAccess(s3Client, bucketName);
  if (!validation.accessible) {
    throw new Error(`S3 bucket validation failed: ${validation.error}`);
  }

  // Prepare JSONL content (one JSON object per line)
  const jsonlLines = events.map(event => JSON.stringify({
    user_id: event.user_id,
    session_id: event.session_id,
    event_type: event.event_type,
    event_payload: event.event_payload,
    device_info: event.device_info,
    timestamp: event.timestamp,
    processed: event.processed,
    created_date: event.created_date
  }));

  const jsonlContent = jsonlLines.join('\n');
  
  // Upload to S3
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: jsonlContent,
    ContentType: 'application/x-jsonlines',
    Metadata: {
      'knxw-export-type': 'captured-events',
      'knxw-timestamp': timestamp,
      'knxw-event-count': events.length.toString(),
      'knxw-version': '1.0.0'
    }
  });

  const result = await s3Client.send(putCommand);

  console.log(JSON.stringify({
    event: 's3_export_completed',
    bucket: bucketName,
    key: s3Key,
    event_count: events.length,
    file_size_bytes: jsonlContent.length,
    format: 'jsonl',
    etag: result.ETag
  }));

  return {
    success: true,
    bucket: bucketName,
    key: s3Key,
    url: `s3://${bucketName}/${s3Key}`,
    file_size: jsonlContent.length,
    event_count: events.length,
    format: 'jsonl',
    etag: result.ETag,
    timestamp
  };
}

/**
 * Export insights to S3 as JSON
 * @param {string} bucketName 
 * @param {string} keyPrefix 
 * @param {Array} insights 
 * @param {object} metadata 
 * @returns {Promise<object>}
 */
async function exportInsightsToS3(bucketName, keyPrefix, insights, metadata = {}) {
  const s3Client = createS3Client();
  const timestamp = new Date().toISOString();
  const fileName = `psychographic_insights_${timestamp.replace(/[:.]/g, '-')}.json`;
  const s3Key = keyPrefix ? `${keyPrefix}/${fileName}` : fileName;

  // Validate bucket access
  const validation = await validateBucketAccess(s3Client, bucketName);
  if (!validation.accessible) {
    throw new Error(`S3 bucket validation failed: ${validation.error}`);
  }

  // Prepare export data
  const exportData = {
    export_metadata: {
      timestamp,
      total_insights: insights.length,
      knxw_version: '1.0.0',
      format: 'json',
      ...metadata
    },
    insights: insights.map(insight => ({
      user_id: insight.user_id,
      insight_type: insight.insight_type,
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence_score,
      actionable_recommendations: insight.actionable_recommendations,
      supporting_events: insight.supporting_events,
      priority: insight.priority,
      insight_reasoning: insight.insight_reasoning,
      created_date: insight.created_date
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // Upload to S3
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: jsonContent,
    ContentType: 'application/json',
    Metadata: {
      'knxw-export-type': 'psychographic-insights',
      'knxw-timestamp': timestamp,
      'knxw-insight-count': insights.length.toString(),
      'knxw-version': '1.0.0'
    }
  });

  const result = await s3Client.send(putCommand);

  console.log(JSON.stringify({
    event: 's3_export_completed',
    bucket: bucketName,
    key: s3Key,
    insight_count: insights.length,
    file_size_bytes: jsonContent.length,
    etag: result.ETag
  }));

  return {
    success: true,
    bucket: bucketName,
    key: s3Key,
    url: `s3://${bucketName}/${s3Key}`,
    file_size: jsonContent.length,
    insight_count: insights.length,
    etag: result.ETag,
    timestamp
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const { action, bucket_name, key_prefix, export_type, filters, limit } = body;

    if (!bucket_name) {
      return Response.json({ 
        error: 'bucket_name is required' 
      }, { status: 400 });
    }

    // Validate AWS configuration
    if (!Deno.env.get('AWS_ACCESS_KEY_ID') || !Deno.env.get('AWS_SECRET_ACCESS_KEY')) {
      return Response.json({
        error: 'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
      }, { status: 500 });
    }

    switch (action) {
      case 'test_connection': {
        const s3Client = createS3Client();
        const validation = await validateBucketAccess(s3Client, bucket_name);
        
        return Response.json({
          success: validation.accessible,
          message: validation.accessible ? 'S3 bucket is accessible' : validation.error,
          data: {
            bucket_name,
            region: AWS_REGION,
            exists: validation.exists,
            accessible: validation.accessible
          }
        });
      }

      case 'export_profiles': {
        // Fetch psychographic profiles
        const profileFilter = filters || { is_demo: false };
        const profiles = await base44.entities.UserPsychographicProfile.filter(
          profileFilter, 
          '-last_analyzed', 
          limit || 1000
        );

        if (profiles.length === 0) {
          return Response.json({
            success: false,
            message: 'No profiles found matching the specified filters'
          }, { status: 400 });
        }

        const result = await exportProfilesToS3(bucket_name, key_prefix, profiles, {
          user_id: user.id,
          user_email: user.email,
          filters: profileFilter
        });

        return Response.json({
          success: true,
          message: `Successfully exported ${profiles.length} profiles to S3`,
          data: result
        });
      }

      case 'export_events': {
        // Fetch captured events
        const eventFilter = filters || { is_demo: false };
        const events = await base44.entities.CapturedEvent.filter(
          eventFilter, 
          '-timestamp', 
          limit || 10000
        );

        if (events.length === 0) {
          return Response.json({
            success: false,
            message: 'No events found matching the specified filters'
          }, { status: 400 });
        }

        const result = await exportEventsToS3(bucket_name, key_prefix, events, {
          user_id: user.id,
          user_email: user.email,
          filters: eventFilter
        });

        return Response.json({
          success: true,
          message: `Successfully exported ${events.length} events to S3`,
          data: result
        });
      }

      case 'export_insights': {
        // Fetch psychographic insights
        const insightFilter = filters || { is_demo: false };
        const insights = await base44.entities.PsychographicInsight.filter(
          insightFilter, 
          '-created_date', 
          limit || 1000
        );

        if (insights.length === 0) {
          return Response.json({
            success: false,
            message: 'No insights found matching the specified filters'
          }, { status: 400 });
        }

        const result = await exportInsightsToS3(bucket_name, key_prefix, insights, {
          user_id: user.id,
          user_email: user.email,
          filters: insightFilter
        });

        return Response.json({
          success: true,
          message: `Successfully exported ${insights.length} insights to S3`,
          data: result
        });
      }

      case 'export_all': {
        const results = [];
        
        // Export profiles
        try {
          const profileFilter = filters?.profiles || { is_demo: false };
          const profiles = await base44.entities.UserPsychographicProfile.filter(
            profileFilter, '-last_analyzed', limit || 1000
          );
          
          if (profiles.length > 0) {
            const profileResult = await exportProfilesToS3(bucket_name, key_prefix, profiles, {
              user_id: user.id,
              user_email: user.email,
              batch_export: true
            });
            results.push({ type: 'profiles', ...profileResult });
          }
        } catch (error) {
          console.error('Profile export failed:', error);
          results.push({ type: 'profiles', success: false, error: error.message });
        }

        // Export events
        try {
          const eventFilter = filters?.events || { is_demo: false };
          const events = await base44.entities.CapturedEvent.filter(
            eventFilter, '-timestamp', limit || 10000
          );
          
          if (events.length > 0) {
            const eventResult = await exportEventsToS3(bucket_name, key_prefix, events, {
              user_id: user.id,
              user_email: user.email,
              batch_export: true
            });
            results.push({ type: 'events', ...eventResult });
          }
        } catch (error) {
          console.error('Event export failed:', error);
          results.push({ type: 'events', success: false, error: error.message });
        }

        // Export insights
        try {
          const insightFilter = filters?.insights || { is_demo: false };
          const insights = await base44.entities.PsychographicInsight.filter(
            insightFilter, '-created_date', limit || 1000
          );
          
          if (insights.length > 0) {
            const insightResult = await exportInsightsToS3(bucket_name, key_prefix, insights, {
              user_id: user.id,
              user_email: user.email,
              batch_export: true
            });
            results.push({ type: 'insights', ...insightResult });
          }
        } catch (error) {
          console.error('Insight export failed:', error);
          results.push({ type: 'insights', success: false, error: error.message });
        }

        const successfulExports = results.filter(r => r.success);
        const failedExports = results.filter(r => !r.success);

        return Response.json({
          success: successfulExports.length > 0,
          message: `Batch export completed. ${successfulExports.length} successful, ${failedExports.length} failed.`,
          data: {
            results,
            successful_count: successfulExports.length,
            failed_count: failedExports.length
          }
        });
      }

      default:
        return Response.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('S3 export function error:', error);
    
    // Handle specific AWS errors
    if (error.name === 'NoSuchBucket') {
      return Response.json({ 
        error: 'The specified S3 bucket does not exist',
        details: error.message
      }, { status: 400 });
    }
    
    if (error.name === 'AccessDenied') {
      return Response.json({ 
        error: 'Access denied to S3 bucket. Check your AWS credentials and bucket permissions.',
        details: error.message
      }, { status: 403 });
    }
    
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    }, { status: 500 });
  }
});