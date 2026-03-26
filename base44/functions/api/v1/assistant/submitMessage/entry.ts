import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Reuse the same rate limiting logic
const messageRateLimitMap = new Map();
const MESSAGE_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 20; // per session

function checkMessageRateLimit(sessionId) {
  const now = Date.now();
  const windowStart = now - MESSAGE_RATE_LIMIT_WINDOW_MS;
  
  if (!messageRateLimitMap.has(sessionId)) {
    messageRateLimitMap.set(sessionId, []);
  }
  
  const timestamps = messageRateLimitMap.get(sessionId);
  const validTimestamps = timestamps.filter(ts => ts > windowStart);
  
  if (validTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }
  
  validTimestamps.push(now);
  messageRateLimitMap.set(sessionId, validTimestamps);
  return true;
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const base44 = createClientFromRequest(req);
    const data = await req.json();
    const { session_id, message } = data;

    if (!session_id || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: session_id, message'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Rate limiting per session
    if (!checkMessageRateLimit(session_id)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Maximum 20 messages per minute per session.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60'
        }
      });
    }

    // Verify session exists and is active
    const sessions = await base44.asServiceRole.entities.AssistantSession.filter({
      session_id,
      status: 'active'
    }, null, 1);

    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found or inactive'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Process the message (invoke processTurn function)
    const result = await base44.asServiceRole.functions.invoke('api/v1/assistant/processTurn', {
      session_id,
      user_message: message
    });

    return new Response(JSON.stringify({
      success: true,
      response: result.data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('submitMessage error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});