import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function qs(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });
  return q.toString();
}

async function fbGet(path, params, token) {
  const url = new URL(`https://graph.facebook.com/v19.0/${path}`);
  url.search = qs({ ...params, access_token: token });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API ${res.status}: ${text}`);
  }
  return res.json();
}

async function decryptToken(encB64, keyStr) {
  const raw = Uint8Array.from(atob(encB64), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ct = raw.slice(12);
  const keyData = new TextEncoder().encode(keyStr).slice(0, 32);
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
  return new TextDecoder().decode(plainBuf);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pageId = body.page_id;
    if (!pageId) return Response.json({ error: 'Missing page_id' }, { status: 400 });

    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');
    if (!encKey) return Response.json({ error: 'Missing OAUTH_ENCRYPTION_KEY' }, { status: 500 });

    const accounts = await base44.entities.MetaAccount.filter({ user_id: user.id }, null, 1);
    if (!accounts?.length) return Response.json({ error: 'No connected Meta account' }, { status: 400 });
    
    const token = await decryptToken(accounts[0].access_token_encrypted, encKey);

    // NOTE: With limited permissions, we can only get basic page info
    // To read posts/comments, the app would need to be reviewed by Facebook for additional permissions
    try {
      const page = await fbGet(`${pageId}`, { 
        fields: 'name,category,followers_count' 
      }, token);

      const nowIso = new Date().toISOString();

      // Upsert MetaPage with basic info
      const existing = await base44.entities.MetaPage.filter({ fb_page_id: pageId }, null, 1);
      if (existing?.length) {
        await base44.entities.MetaPage.update(existing[0].id, {
          name: page.name || existing[0].name,
          category: page.category || existing[0].category,
          followers_count: Number(page.followers_count || existing[0].followers_count || 0),
          last_synced: nowIso
        });
      } else {
        await base44.entities.MetaPage.create({
          fb_page_id: pageId,
          name: page.name || 'Facebook Page',
          category: page.category || '',
          followers_count: Number(page.followers_count || 0),
          last_synced: nowIso
        });
      }

      return Response.json({
        status: 'partial_success',
        message: 'Basic page info saved. Posts/comments require additional Facebook permissions.',
        page: { id: pageId, name: page.name },
        saved_posts: 0,
        saved_comments: 0,
        note: 'To access posts and comments, submit your Facebook app for review and request pages_read_engagement permission.'
      });

    } catch (error) {
      console.error('Meta API error:', error);
      return Response.json({ 
        error: `Failed to fetch page data: ${error.message}`,
        note: 'You may need additional Facebook permissions or the page may not be accessible.'
      }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});