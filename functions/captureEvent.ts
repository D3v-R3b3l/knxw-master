import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 100; // per IP/API key

function checkRateLimit(key) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const timestamps = rateLimitMap.get(key);
  const validTimestamps = timestamps.filter(ts => ts > windowStart);
  
  if (validTimestamps.length >= MAX_EVENTS_PER_WINDOW) {
    return false;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return true;
}

Deno.serve(async (req) => {
  try {
    console.log('captureEvent: Request received');
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
        }
      });
    }

    // Extract API key from header
    let apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    // Allow demo key for landing page
    if (apiKey === 'DEMO_LANDING_KEY') {
       // Mock a client app for the demo key to allow processing to continue
       // We'll skip the database lookup for this specific key
    } else if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing API key. Include X-API-Key header or Authorization: Bearer header' 
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const base44 = createClientFromRequest(req);
    
    // Validate API key exists and is active via ClientApp
    let clientApp;
    
    if (apiKey === 'DEMO_LANDING_KEY') {
        clientApp = { id: 'demo_landing_page', owner_id: 'system' };
    } else {
        const clientApps = await base44.asServiceRole.entities.ClientApp.filter({
          api_key: apiKey,
          status: 'active'
        }, null, 1);
        
        if (clientApps && clientApps.length > 0) {
            clientApp = clientApps[0];
        }
    }

    if (!clientApp) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Rate limiting by client app
    if (!checkRateLimit(clientApp.id)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Maximum 100 events per minute.' 
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60'
        }
      });
    }

    const data = await req.json();
    console.log('captureEvent: Data received:', data);

    // Validate required fields
    if (!data.user_id || !data.event_type) {
      console.log('captureEvent: Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: user_id, event_type' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create the event record
    const eventRecord = {
      user_id: data.user_id,
      event_type: data.event_type,
      event_payload: data.event_payload || {},
      device_info: data.device_info || {},
      session_id: data.session_id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      processed: false,
      is_demo: false
    };

    console.log('captureEvent: Creating event record:', eventRecord);

    // Save to database using service role to bypass RLS
    const savedEvent = await base44.asServiceRole.entities.CapturedEvent.create(eventRecord);
    
    console.log('captureEvent: Event saved successfully:', savedEvent.id);

    // Trigger live profile processing for this user (async, don't await)
    if (data.user_id) {
      base44.asServiceRole.functions.invoke('liveProfileProcessor', {
        action: 'process_live_events',
        user_id: data.user_id
      }).catch(err => {
        console.warn('captureEvent: Profile processing failed, but event was saved:', err.message);
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      event_id: savedEvent.id 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('captureEvent error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});