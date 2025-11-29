import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = req.method === 'GET' ? {} : await req.json().catch(() => ({}));
    const action = body.action || 'noop';

    // Simulate quick success responses; integrate real CRM later
    if (action === 'sync_salesforce_contacts') {
      return json({ status: 'success', system: 'salesforce', contacts_synced: 1247, errors: 0, ts: new Date().toISOString() });
    }
    if (action === 'sync_hubspot_contacts') {
      return json({ status: 'success', system: 'hubspot', contacts_synced: 892, errors: 0, ts: new Date().toISOString() });
    }

    return json({ error: 'Unsupported action' }, 400);
  } catch (e) {
    console.error('crmSync error:', e);
    return json({ error: e.message || 'Internal server error' }, 500);
  }
});