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
    const apiKeyId = String(body?.api_key_id || '').trim();
    if (!apiKeyId) return json({ error: 'api_key_id is required' }, 400);

    const existingList = await base44.asServiceRole.entities.ApiKey.filter({ id: apiKeyId }, null, 1);
    const existing = existingList?.[0] || null;
    if (!existing) {
      return json({ error: 'API key not found' }, 404);
    }

    await base44.asServiceRole.entities.ApiKey.update(apiKeyId, {
      status: 'revoked',
      revoked_at: new Date().toISOString()
    });

    const fullKey = `knx_live_${randomHex(24)}`;
    const keyHash = await sha256(fullKey);
    const keyPrefix = fullKey.slice(0, 16);

    const rotated = await base44.asServiceRole.entities.ApiKey.create({
      tenant_id: existing.tenant_id,
      name: `${existing.name} (rotated)`,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes: existing.scopes || [],
      rate_limit_rpm: existing.rate_limit_rpm || 120,
      rate_limit_burst: existing.rate_limit_burst || 240,
      status: 'active'
    });

    return json({ apiKey: rotated, full_key: fullKey }, 200);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});