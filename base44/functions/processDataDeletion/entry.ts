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

    const { data_request_id } = await req.json();
    if (!data_request_id) return new Response(JSON.stringify({ error: 'data_request_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const dr = await base44.entities.DataRequest.get(data_request_id);
    if (!dr) return new Response(JSON.stringify({ error: 'DataRequest not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    if (dr.status !== 'pending') return new Response(JSON.stringify({ error: 'Request not pending' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const userId = dr.subject_user_id || dr.subject_email;
    // Delete across entities (irreversible)
    const deleteByFilter = async (entity, filter) => {
      const items = await base44.entities[entity].filter(filter);
      for (const item of items) {
        await base44.entities[entity].delete(item.id);
      }
      return items.length;
    };

    const counts = {};
    counts.events = await deleteByFilter('CapturedEvent', { user_id: userId });
    counts.profiles = await deleteByFilter('UserPsychographicProfile', { user_id: userId });
    counts.insights = await deleteByFilter('PsychographicInsight', { user_id: userId });
    counts.engagements = await deleteByFilter('EngagementDelivery', { user_id: userId });

    await base44.entities.DataRequest.update(data_request_id, {
      status: 'completed',
      processed_by_email: actor.email,
      processed_at: new Date().toISOString(),
      notes: `Deleted records: ${JSON.stringify(counts)}`
    });

    await base44.entities.AuditLog.create({
      action: 'compliance.deletion_completed',
      actor_id: actor.id,
      actor_email: actor.email,
      target_type: 'user',
      target_id: userId,
      details: counts,
      ip: req.headers.get('x-forwarded-for') || '',
      user_agent: req.headers.get('user-agent') || ''
    });

    return new Response(JSON.stringify({ status: 'completed', counts }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to process deletion', details: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});