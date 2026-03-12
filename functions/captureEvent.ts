import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 300;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

function checkRateLimit(key) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = rateLimitMap.get(key) || [];
  const valid = timestamps.filter((ts) => ts > windowStart);

  if (valid.length >= MAX_EVENTS_PER_WINDOW) {
    return false;
  }

  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}

function normalizeOrigin(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.origin.toLowerCase().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function isAuthorizedOrigin(req, clientApp) {
  const allowed = Array.isArray(clientApp.authorized_domains) ? clientApp.authorized_domains : [];
  if (allowed.length === 0) return true;

  const origin = normalizeOrigin(req.headers.get('origin')) || normalizeOrigin(req.headers.get('referer'));
  if (!origin) return true;

  return allowed.some((domain) => normalizeOrigin(domain) === origin);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return json({ error: 'Missing API key. Include X-API-Key header or Authorization: Bearer header.' }, 401);
    }

    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const clientApps = await svc.entities.ClientApp.filter({ api_key: apiKey, status: 'active' }, null, 1);
    const clientApp = clientApps?.[0] || null;

    if (!clientApp) {
      return json({ error: 'Invalid API key' }, 401);
    }

    if (!isAuthorizedOrigin(req, clientApp)) {
      return json({ error: 'Origin not authorized for this client app' }, 403);
    }

    if (!checkRateLimit(clientApp.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 300 events per minute.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          ...corsHeaders()
        }
      });
    }

    const data = await req.json();
    if (!data?.user_id || !data?.event_type) {
      return json({ error: 'Missing required fields: user_id, event_type' }, 400);
    }

    const eventRecord = {
      user_id: String(data.user_id),
      session_id: data.session_id || crypto.randomUUID(),
      event_type: String(data.event_type),
      event_payload: {
        ...(data.event_payload || {}),
        client_app_id: clientApp.id
      },
      device_info: data.device_info || {},
      timestamp: data.timestamp || new Date().toISOString(),
      processed: false,
      is_demo: false
    };

    const savedEvent = await svc.entities.CapturedEvent.create(eventRecord);

    svc.functions.invoke('liveProfileProcessor', {
      action: 'process_live_events',
      user_id: String(data.user_id)
    }).catch((error) => {
      console.warn('captureEvent: liveProfileProcessor failed after save:', error.message);
    });

    return json({
      success: true,
      event_id: savedEvent.id,
      client_app_id: clientApp.id
    });
  } catch (error) {
    console.error('captureEvent error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});