import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

/**
 * Frontend error reporter.
 * GlobalErrorBoundary POSTs here when it catches an unhandled error.
 * We persist to SystemEvent so Ops can query and alert on client-side failures.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    let actorId = 'anonymous';
    try {
      const user = await base44.auth.me();
      if (user?.email) actorId = user.email;
    } catch {
      // Unauthenticated error — keep as anonymous.
    }

    await base44.asServiceRole.entities.SystemEvent.create({
      org_id: 'frontend',
      workspace_id: null,
      actor_type: 'user',
      actor_id: actorId,
      event_type: 'error',
      severity: 'error',
      payload: {
        message: body?.error?.message || 'Unknown frontend error',
        stack: String(body?.error?.stack || '').slice(0, 4000),
        component_stack: String(body?.error?.componentStack || '').slice(0, 4000),
        error_id: body?.errorId || null,
        url: body?.url || null,
        user_agent: body?.userAgent || null
      },
      trace_id: body?.errorId || crypto.randomUUID(),
      timestamp: body?.timestamp || new Date().toISOString(),
      is_demo: false
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('logError failed:', error);
    // Never fail the caller — frontend error reporter must be best-effort.
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});