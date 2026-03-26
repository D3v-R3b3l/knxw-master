import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const token = authHeader.split(' ')[1];
    base44.auth.setToken(token);
    const actor = await base44.auth.me();
    if (!actor) return new Response('Unauthorized', { status: 401 });

    const { action, target_type, target_id, details } = await req.json();
    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const user_agent = req.headers.get('user-agent') || '';

    const log = await base44.entities.AuditLog.create({
      action,
      actor_id: actor.id,
      actor_email: actor.email,
      target_type: target_type || null,
      target_id: target_id || null,
      details: details || {},
      ip,
      user_agent
    });

    return new Response(JSON.stringify({ status: 'ok', id: log.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to log audit', details: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});