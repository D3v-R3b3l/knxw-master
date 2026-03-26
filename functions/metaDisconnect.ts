import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const records = await base44.entities.MetaAccount.filter({ user_id: user.id });
    for (const r of (records || [])) {
      await base44.entities.MetaAccount.delete(r.id);
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
});