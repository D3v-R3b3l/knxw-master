import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const FB_AUTH_BASE = 'https://www.facebook.com/v19.0/dialog/oauth';

async function hmac(input, keyStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keyStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appId = Deno.env.get('META_APP_ID');
    const redirectUri = Deno.env.get('META_OAUTH_REDIRECT_URL');
    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');

    if (!appId || !redirectUri || !encKey) {
      return Response.json({ error: 'Missing Meta secrets. Please set META_APP_ID, META_OAUTH_REDIRECT_URL and OAUTH_ENCRYPTION_KEY.' }, { status: 500 });
    }

    const { return_to } = await req.json().catch(() => ({}));
    const nonce = crypto.randomUUID();
    const statePayload = JSON.stringify({ n: nonce, uid: user.id, rt: return_to || '/MetaData?connected=1' });
    const sig = await hmac(statePayload, encKey);
    const state = btoa(statePayload).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') + '.' + sig;

    // Use only basic permissions that don't require app review
    const scope = [
      'public_profile', // Basic profile info - always allowed
      'pages_show_list'  // List pages user manages - basic permission
    ].join(',');

    const url = new URL(FB_AUTH_BASE);
    url.searchParams.set('client_id', appId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);

    return Response.json({ auth_url: url.toString() });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});