import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

async function aesDecrypt(cipherB64, keyStr) {
  const raw = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyStr).slice(0, 32),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(pt);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');
    const records = await base44.entities.MetaAccount.filter({ user_id: user.id }, null, 1);
    if (!records || records.length === 0) {
      return Response.json({ pages: [] });
    }

    const token = await aesDecrypt(records[0].access_token_encrypted, encKey || '');
    const resp = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name&access_token=${encodeURIComponent(token)}`);
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      return Response.json({ error: 'Failed to fetch pages', details: t }, { status: 500 });
    }
    const json = await resp.json();
    const pages = Array.isArray(json?.data) ? json.data.map(p => ({ id: p.id, name: p.name })) : [];
    return Response.json({ pages });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});