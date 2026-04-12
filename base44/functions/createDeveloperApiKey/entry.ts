import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function randomHex(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const clientAppId = String(body?.client_app_id || '').trim();
    const scopes = Array.isArray(body?.scopes) ? body.scopes : [];
    const rateLimitRpm = Number(body?.rate_limit_rpm || 120);
    const rateLimitBurst = Number(body?.rate_limit_burst || 240);

    if (!name || !clientAppId) {
      return json({ error: 'name and client_app_id are required' }, 400);
    }

    const apps = await base44.asServiceRole.entities.ClientApp.filter({ id: clientAppId }, null, 1);
    const app = apps?.[0] || null;
    if (!app || app.owner_id !== user.id) {
      return json({ error: 'Client app not found' }, 404);
    }

    const fullKey = `knx_live_${randomHex(24)}`;
    const keyHash = await sha256(fullKey);
    const keyPrefix = fullKey.slice(0, 16);

    const created = await base44.asServiceRole.entities.ApiKey.create({
      tenant_id: clientAppId,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes,
      rate_limit_rpm: rateLimitRpm,
      rate_limit_burst: rateLimitBurst,
      status: 'active'
    });

    return json({ apiKey: created, full_key: fullKey }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});