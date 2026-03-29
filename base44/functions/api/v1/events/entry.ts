import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const VALID_EVENT_TYPES = new Set([
  'page_view',
  'click',
  'form_submit',
  'form_focus',
  'scroll',
  'hover',
  'exit_intent',
  'time_on_page',
  'page_exit',
  'purchase',
  'signup',
  'feature_usage',
  'product_view',
  'pricing_view',
  'add_to_cart',
  'checkout_start',
  'checkout_complete'
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  const startTime = performance.now();
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed. Use POST.' }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.user_id || '').trim();
    const eventType = String(body?.event_type || '').trim();

    if (!userId || !eventType) {
      return json({ success: false, error: 'user_id and event_type are required' }, 400);
    }

    if (!VALID_EVENT_TYPES.has(eventType)) {
      return json({ success: false, error: `Unsupported event_type: ${eventType}` }, 400);
    }

    const apiKey = body?.apiKey || body?.api_key || null;
    if (!apiKey) {
      return json({ success: false, error: 'apiKey is required' }, 400);
    }

    const clientApps = await base44.asServiceRole.entities.ClientApp.filter({ api_key: apiKey, status: 'active' }, null, 1);
    const clientApp = clientApps?.[0] || null;
    if (!clientApp) {
      // Write auth failure SystemEvent so aggregateMetricsHourly can count auth_failures.
      base44.asServiceRole.entities.SystemEvent.create({
        org_id: 'unknown',
        workspace_id: null,
        actor_type: 'api',
        actor_id: String(apiKey).slice(0, 12) + '...',
        event_type: 'auth',
        severity: 'error',
        payload: { endpoint: '/api/v1/events', reason: 'invalid_api_key', total_ms: Math.round(performance.now() - startTime) },
        trace_id: requestId,
        timestamp: new Date().toISOString(),
        is_demo: false
      }).catch(err => console.warn(`[${requestId}] Auth failure SystemEvent write failed:`, err.message));
      return json({ success: false, error: 'Invalid or inactive API key' }, 403);
    }

    const savedEvent = await base44.asServiceRole.entities.CapturedEvent.create({
      client_app_id: clientApp.id,
      user_id: userId,
      session_id: body?.session_id || crypto.randomUUID(),
      event_type: eventType,
      event_payload: {
        ...(body?.event_payload || {}),
        client_app_id: clientApp.id
      },
      device_info: body?.device_info || {},
      timestamp: body?.timestamp || new Date().toISOString(),
      processed: false,
      is_demo: false
    });

    base44.functions.invoke('liveProfileProcessor', {
      action: 'process_live_events',
      user_id: userId,
      app_id: clientApp.id
    }).catch((error) => console.warn(`Profile refresh failed for user ${userId}:`, error.message));

    // Write SystemEvent for aggregateMetricsHourly pipeline.
    // org_id and workspace_id are not available in this context — use client_app_id as org_id proxy.
    base44.asServiceRole.entities.SystemEvent.create({
      org_id: clientApp.id,
      workspace_id: null,
      actor_type: 'api',
      actor_id: apiKey,
      event_type: 'document_create',
      severity: 'info',
      payload: {
        endpoint: '/api/v1/events',
        event_type: eventType,
        total_ms: Math.round(performance.now() - startTime)
      },
      trace_id: requestId,
      timestamp: new Date().toISOString(),
      is_demo: false
    }).catch((err) => console.warn(`[${requestId}] SystemEvent write failed:`, err.message));

    return json({
      success: true,
      data: {
        event_id: savedEvent.id,
        client_app_id: clientApp.id,
        status: 'accepted',
        message: 'Event ingested successfully. Profile analysis queued.'
      },
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime)
      }
    }, 202);
  } catch (error) {
    console.error(`[${requestId}] Events endpoint error:`, error);
    return json({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime)
      }
    }, 500);
  }
});