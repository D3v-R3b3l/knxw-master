import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const ingestResponse = await base44.functions.invoke('captureEvent', {
      apiKey: body?.apiKey || body?.api_key || null,
      app_id: body?.app_id || null,
      user_id: userId,
      event_type: eventType,
      event_payload: body?.event_payload || {},
      session_id: body?.session_id || null,
      device_info: body?.device_info || {},
      timestamp: body?.timestamp || new Date().toISOString()
    });

    const ingestData = ingestResponse?.data || {};

    return json({
      success: true,
      data: {
        event_id: ingestData.event_id || null,
        client_app_id: ingestData.client_app_id || body?.app_id || null,
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