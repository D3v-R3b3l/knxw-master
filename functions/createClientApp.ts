import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function normalizeDomains(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(',').map(s => s.trim()).filter(Boolean);
  return arr.map(d => {
    // ensure protocol for RLS origin checks in captureEvent
    if (!/^https?:\/\//i.test(d)) {
      if (d.startsWith('localhost') || d.startsWith('127.0.0.1')) return `http://${d}`;
      return `https://${d}`;
    }
    return d;
  });
}

function randToken(len = 48) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function uniqueKey(base44, field) {
  // very low probability of collision; loop to ensure uniqueness
  for (let i = 0; i < 5; i++) {
    const candidate = field === 'api_key' ? `knxw_${randToken(24)}` : `sk_knxw_${randToken(32)}`;
    const existing = await base44.asServiceRole.entities.ClientApp.filter({ [field]: candidate }, null, 1);
    if (!existing || existing.length === 0) return candidate;
  }
  throw new Error(`Failed to generate unique ${field}`);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const authorized_domains = normalizeDomains(body?.authorized_domains);

    if (!name || name.length < 3) return jsonResponse({ error: 'Application name must be at least 3 characters' }, 400);
    if (!Array.isArray(authorized_domains)) return jsonResponse({ error: 'authorized_domains must be array or comma-separated string' }, 400);

    // Generate unique keys
    const api_key = await uniqueKey(base44, 'api_key');
    const secret_key = await uniqueKey(base44, 'secret_key');
    const client_event_signing_secret = randToken(32);

    const payload = {
      name,
      api_key,
      secret_key,
      client_event_signing_secret,
      authorized_domains,
      owner_id: user.id,
      status: 'active'
    };

    // Create with service role to ensure all fields are set
    const created = await base44.asServiceRole.entities.ClientApp.create(payload);

    // Audit log
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'app.create',
        actor_id: user.id,
        actor_email: user.email,
        target_type: 'ClientApp',
        target_id: created.id,
        details: { name, authorized_domains_count: authorized_domains.length }
      });
    } catch (_) { /* non-blocking */ }

    return jsonResponse({ app: created }, 201);
  } catch (err) {
    // Bubble precise error details for UI diagnosis
    return jsonResponse({ error: 'Failed to create application', details: err?.message || String(err) }, 500);
  }
});