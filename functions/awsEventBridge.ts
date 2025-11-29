
/**
 * Production AWS EventBridge integration for real-time event streaming
 * Streams knXw psychographic events to AWS EventBridge for downstream processing
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { EventBridgeClient, PutEventsCommand } from 'npm:@aws-sdk/client-eventbridge@3.427.0';

const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
const EVENTBRIDGE_BUS_NAME = Deno.env.get('EVENTBRIDGE_BUS_NAME') || 'default';
const EVENT_SOURCE = 'knxw.psychographic-platform';

/**
 * Initialize EventBridge client with proper configuration
 */
function createEventBridgeClient() {
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

  return new EventBridgeClient(config);
}

/**
 * Send psychographic profile update event to EventBridge
 * @param {object} profile - User psychographic profile
 * @param {string} eventType - Type of profile event (created, updated, analyzed)
 * @param {object} metadata - Additional event metadata
 */
async function sendProfileEvent(profile, eventType, metadata = {}) {
  const eventBridge = createEventBridgeClient();
  
  const event = {
    Source: EVENT_SOURCE,
    DetailType: `Psychographic Profile ${eventType}`,
    Detail: JSON.stringify({
      user_id: profile.user_id,
      profile_data: {
        personality_traits: profile.personality_traits,
        emotional_state: profile.emotional_state,
        risk_profile: profile.risk_profile,
        cognitive_style: profile.cognitive_style,
        motivation_stack: profile.motivation_stack,
        engagement_patterns: profile.engagement_patterns,
        last_analyzed: profile.last_analyzed
      },
      event_metadata: {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        knxw_version: '1.0.0',
        ...metadata
      }
    }),
    EventBusName: EVENTBRIDGE_BUS_NAME,
    Time: new Date()
  };

  const command = new PutEventsCommand({
    Entries: [event]
  });

  try {
    const response = await eventBridge.send(command);
    
    if (response.FailedEntryCount > 0) {
      throw new Error(`EventBridge put failed: ${JSON.stringify(response.Entries)}`);
    }

    console.log(JSON.stringify({
      event: 'eventbridge_profile_sent',
      user_id: profile.user_id,
      event_type: eventType,
      event_id: response.Entries[0]?.EventId,
      success: true
    }));

    return {
      success: true,
      eventId: response.Entries[0]?.EventId,
      timestamp: event.Time
    };
    
  } catch (error) {
    console.error(JSON.stringify({
      event: 'eventbridge_profile_failed',
      user_id: profile.user_id,
      event_type: eventType,
      error: error.message,
      error_code: error.name
    }));
    
    throw error;
  }
}

/**
 * Send user behavioral event to EventBridge
 * @param {object} capturedEvent - User behavior event from knXw tracking
 * @param {object} userContext - Associated user psychographic context
 */
async function sendBehaviorEvent(capturedEvent, userContext = null) {
  const eventBridge = createEventBridgeClient();
  
  const event = {
    Source: EVENT_SOURCE,
    DetailType: 'User Behavior Event',
    Detail: JSON.stringify({
      user_id: capturedEvent.user_id,
      session_id: capturedEvent.session_id,
      behavior_data: {
        event_type: capturedEvent.event_type,
        event_payload: capturedEvent.event_payload,
        device_info: capturedEvent.device_info,
        timestamp: capturedEvent.timestamp
      },
      psychographic_context: userContext ? {
        risk_profile: userContext.risk_profile,
        cognitive_style: userContext.cognitive_style,
        emotional_state: userContext.emotional_state,
        primary_motivations: userContext.motivation_stack?.slice(0, 3) || []
      } : null,
      event_metadata: {
        timestamp: new Date().toISOString(),
        knxw_version: '1.0.0'
      }
    }),
    EventBusName: EVENTBRIDGE_BUS_NAME,
    Time: new Date(capturedEvent.timestamp)
  };

  const command = new PutEventsCommand({
    Entries: [event]
  });

  try {
    const response = await eventBridge.send(command);
    
    if (response.FailedEntryCount > 0) {
      throw new Error(`EventBridge put failed: ${JSON.stringify(response.Entries)}`);
    }

    console.log(JSON.stringify({
      event: 'eventbridge_behavior_sent',
      user_id: capturedEvent.user_id,
      event_type: capturedEvent.event_type,
      event_id: response.Entries[0]?.EventId,
      success: true
    }));

    return {
      success: true,
      eventId: response.Entries[0]?.EventId,
      timestamp: event.Time
    };
    
  } catch (error) {
    console.error(JSON.stringify({
      event: 'eventbridge_behavior_failed',
      user_id: capturedEvent.user_id,
      event_type: capturedEvent.event_type,
      error: error.message,
      error_code: error.name
    }));
    
    throw error;
  }
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
    const { action, data } = body;

    switch (action) {
      case 'send_profile_event': {
        const { profile, eventType, metadata } = data;
        
        if (!profile || !eventType) {
          return Response.json({ 
            error: 'Profile and eventType are required' 
          }, { status: 400 });
        }

        const profileResult = await sendProfileEvent(profile, eventType, metadata);
        
        return Response.json({
          success: true,
          message: 'Profile event sent to EventBridge',
          data: profileResult
        });
      }

      case 'send_behavior_event': {
        const { capturedEvent, userContext } = data;
        
        if (!capturedEvent) {
          return Response.json({ 
            error: 'CapturedEvent is required' 
          }, { status: 400 });
        }

        const behaviorResult = await sendBehaviorEvent(capturedEvent, userContext);
        
        return Response.json({
          success: true,
          message: 'Behavior event sent to EventBridge',
          data: behaviorResult
        });
      }

      case 'test_connection': {
        // Test EventBridge connectivity by sending a test event
        const testEvent = {
          Source: EVENT_SOURCE,
          DetailType: 'Connection Test',
          Detail: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            user_id: user.id
          }),
          EventBusName: EVENTBRIDGE_BUS_NAME,
          Time: new Date()
        };

        const eventBridge = createEventBridgeClient();
        const command = new PutEventsCommand({
          Entries: [testEvent]
        });

        const response = await eventBridge.send(command);
        
        if (response.FailedEntryCount > 0) {
          return Response.json({
            success: false,
            error: 'EventBridge connection test failed',
            details: response.Entries
          }, { status: 500 });
        }

        return Response.json({
          success: true,
          message: 'EventBridge connection test successful',
          data: {
            eventId: response.Entries[0]?.EventId,
            busName: EVENTBRIDGE_BUS_NAME,
            region: AWS_REGION
          }
        });
      }

      default:
        return Response.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('EventBridge function error:', error);
    
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    }, { status: 500 });
  }
});
