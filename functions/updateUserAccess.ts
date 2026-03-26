import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const token = authHeader.split(' ')[1];
    base44.auth.setToken(token);
    const actor = await base44.auth.me();
    if (!actor || actor.role !== 'admin') return new Response('Forbidden', { status: 403 });

    const { op, id, payload } = await req.json();
    if (!op) return new Response(JSON.stringify({ error: 'op is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    let result = null;
    if (op === 'create') {
      result = await base44.entities.UserAppAccess.create(payload);
      await base44.entities.AuditLog.create({
        action: 'access.create',
        actor_id: actor.id,
        actor_email: actor.email,
        target_type: 'UserAppAccess',
        target_id: result.id,
        details: payload
      });
    } else if (op === 'update') {
      if (!id) return new Response(JSON.stringify({ error: 'id required for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      result = await base44.entities.UserAppAccess.update(id, payload);
      await base44.entities.AuditLog.create({
        action: 'access.update',
        actor_id: actor.id,
        actor_email: actor.email,
        target_type: 'UserAppAccess',
        target_id: id,
        details: payload
      });
    } else if (op === 'delete') {
      if (!id) return new Response(JSON.stringify({ error: 'id required for delete' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      await base44.entities.UserAppAccess.delete(id);
      await base44.entities.AuditLog.create({
        action: 'access.delete',
        actor_id: actor.id,
        actor_email: actor.email,
        target_type: 'UserAppAccess',
        target_id: id
      });
      result = { deleted: true };
    } else {
      return new Response(JSON.stringify({ error: 'invalid op' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ok', result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update access', details: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});