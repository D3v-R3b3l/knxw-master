import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Mobile-optimized event ingestion endpoint
 * Handles events from iOS, Android, React Native, and Flutter SDKs
 * 
 * Expected payload:
 * {
 *   events: [
 *     {
 *       messageId: string,
 *       type: 'identify' | 'group' | 'track' | 'screen',
 *       timestamp: ISO8601 string,
 *       userId?: string,
 *       groupId?: string,
 *       event?: string,
 *       properties?: object,
 *       context: {
 *         os: { name, version },
 *         device: { model, type },
 *         app: { name, version, build, bundleId/packageName },
 *         screen: { width, height, density },
 *         network: { carrier, wifi },
 *         locale: string,
 *         timezone: string,
 *         library: { name, version }
 *       }
 *     }
 *   ]
 * }
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // Parse and validate payload
    const body = await req.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return Response.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    if (events.length > 100) {
      return Response.json(
        { error: 'Batch size too large (max 100 events)' },
        { status: 400 }
      );
    }

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Look up client app by API key
    const clientApps = await base44.asServiceRole.entities.ClientApp.filter({ api_key: apiKey });
    
    if (!clientApps || clientApps.length === 0) {
      return Response.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const clientApp = clientApps[0];

    // Process each event
    const processedEvents = [];
    
    for (const event of events) {
      try {
        // Validate required fields
        if (!event.messageId || !event.type || !event.timestamp) {
          continue; // Skip invalid events
        }

        // Extract mobile-specific context
        const platform = detectPlatform(event.context);
        const deviceInfo = extractDeviceInfo(event.context);

        // Create captured event
        const capturedEvent = {
          user_id: event.userId || 'anonymous',
          session_id: event.context?.sessionId || event.messageId,
          event_type: mapEventType(event.type, event.event),
          event_payload: {
            ...event.properties,
            _mobile: true,
            _platform: platform,
            _event_name: event.event,
            _group_id: event.groupId
          },
          device_info: deviceInfo,
          timestamp: new Date(event.timestamp).toISOString(),
          processed: false,
          is_demo: false,
          client_app_id: clientApp.id,
          _mobile_context: event.context // Store full context for analysis
        };

        await base44.asServiceRole.entities.CapturedEvent.create(capturedEvent);
        processedEvents.push(event.messageId);

        // If identify event, update or create user profile
        if (event.type === 'identify' && event.userId) {
          await handleIdentifyEvent(base44, event, clientApp.id);
        }

      } catch (eventError) {
        console.error('Error processing event:', eventError);
        // Continue processing other events
      }
    }

    return Response.json({
      success: true,
      processed: processedEvents.length,
      total: events.length
    });

  } catch (error) {
    console.error('Mobile ingest error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});

function detectPlatform(context) {
  if (!context || !context.library) {
    return 'unknown';
  }

  const libName = context.library.name?.toLowerCase() || '';
  
  if (libName.includes('ios') || libName.includes('swift')) {
    return 'ios';
  } else if (libName.includes('android') || libName.includes('kotlin')) {
    return 'android';
  } else if (libName.includes('react-native') || libName.includes('rn')) {
    const os = context.os?.name?.toLowerCase() || '';
    return os.includes('ios') ? 'react-native-ios' : 'react-native-android';
  } else if (libName.includes('flutter')) {
    const os = context.os?.name?.toLowerCase() || '';
    return os.includes('ios') ? 'flutter-ios' : 'flutter-android';
  }
  
  return 'mobile';
}

function extractDeviceInfo(context) {
  if (!context) return {};

  return {
    os: context.os?.name || 'Unknown',
    os_version: context.os?.version || 'Unknown',
    device_model: context.device?.model || 'Unknown',
    device_type: context.device?.type || 'phone',
    device_manufacturer: context.device?.manufacturer || context.device?.brand || 'Unknown',
    app_name: context.app?.name || 'Unknown',
    app_version: context.app?.version || 'Unknown',
    app_build: context.app?.build || 'Unknown',
    app_bundle_id: context.app?.bundleId || context.app?.packageName || 'Unknown',
    screen_width: context.screen?.width || 0,
    screen_height: context.screen?.height || 0,
    screen_density: context.screen?.density || 1.0,
    network_carrier: context.network?.carrier || 'Unknown',
    network_wifi: context.network?.wifi || false,
    locale: context.locale || 'en_US',
    timezone: context.timezone || 'UTC',
    sdk_name: context.library?.name || 'Unknown',
    sdk_version: context.library?.version || 'Unknown'
  };
}

function mapEventType(type, eventName) {
  switch (type) {
    case 'identify':
      return 'user_identified';
    case 'group':
      return 'user_grouped';
    case 'screen':
      return 'screen_view';
    case 'track':
      return eventName || 'custom_event';
    default:
      return 'unknown';
  }
}

async function handleIdentifyEvent(base44, event, clientAppId) {
  try {
    const userId = event.userId;
    const traits = event.properties || {};

    // Check if profile exists
    const existingProfiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({
      user_id: userId
    });

    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile with new traits
      const profile = existingProfiles[0];
      await base44.asServiceRole.entities.UserPsychographicProfile.update(profile.id, {
        ...profile,
        _mobile_traits: traits,
        _mobile_last_seen: new Date().toISOString(),
        _mobile_device: event.context?.device,
        _mobile_app: event.context?.app
      });
    } else {
      // Create new profile placeholder (will be enriched by AI later)
      await base44.asServiceRole.entities.UserPsychographicProfile.create({
        user_id: userId,
        schema_version: '2.0',
        model_version: 'mobile-v1',
        motivation_stack_v2: {},
        emotional_state: {},
        personality_traits: {},
        engagement_patterns: {},
        confidence_scores: {},
        valid_from: new Date().toISOString(),
        _mobile_traits: traits,
        _mobile_first_seen: new Date().toISOString(),
        _mobile_device: event.context?.device,
        _mobile_app: event.context?.app,
        is_demo: false
      });
    }
  } catch (error) {
    console.error('Error handling identify event:', error);
  }
}