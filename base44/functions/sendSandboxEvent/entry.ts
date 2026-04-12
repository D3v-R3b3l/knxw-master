import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const clientAppId = String(body?.client_app_id || '').trim();
    const apiKeyValue = String(body?.api_key || '').trim();
    const eventType = String(body?.event_type || 'page_view').trim();
    const userId = String(body?.user_id || 'sandbox_user').trim();
    const simulateFailure = !!body?.simulate_failure;
    const endpoint = String(body?.endpoint || '/api/v1/events').trim();
    const payload = body?.payload || {};

    if (!clientAppId || !apiKeyValue) {
      return json({ error: 'client_app_id and api_key are required' }, 400);
    }

    const session = await base44.asServiceRole.entities.WebhookDebugSession.create({
      client_app_id: clientAppId,
      owner_user_id: user.id,
      name: `${eventType} sandbox test`,
      endpoint,
      event_type: eventType,
      status: 'queued',
      simulate_failure: simulateFailure,
      request_payload: payload,
      delivery_started_at: new Date().toISOString()
    });

    if (simulateFailure) {
      const failed = await base44.asServiceRole.entities.WebhookDebugSession.update(session.id, {
        status: 'failed',
        failure_reason: 'Simulated server-side failure',
        response_payload: { success: false, error: 'Simulated failure' },
        delivery_completed_at: new Date().toISOString()
      });

      return json({ session: failed, result: failed.response_payload }, 200);
    }

    const targetBody = {
      api_key: apiKeyValue,
      user_id: userId,
      event_type: eventType,
      event_payload: payload,
      session_id: `sandbox_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString()
    };

    const target = endpoint.replace('/api/v1/', 'api/v1/');
    const res = await base44.functions.invoke(target, targetBody);
    const delivered = await base44.asServiceRole.entities.WebhookDebugSession.update(session.id, {
      status: 'delivered',
      response_payload: res.data || {},
      delivery_completed_at: new Date().toISOString()
    });

    return json({ session: delivered, result: res.data || {} }, 200);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});