import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';

async function hmac(input, keyStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(keyStr), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URL');
    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');

    if (!clientId || !redirectUri || !encKey) {
      return Response.json({ error: 'Missing Google secrets. Please set GOOGLE_CLIENT_ID, GOOGLE_OAUTH_REDIRECT_URL, and OAUTH_ENCRYPTION_KEY in your project settings.' }, { status: 500 });
    }

    const payload = await req.json().catch(() => ({}));
    const returnTo = payload?.return_to || '/GoogleData';

    const statePayload = JSON.stringify({ uid: user.id, rt: returnTo, t: Date.now() });
    
    const sig = await hmac(statePayload, encKey);
    const state = btoa(statePayload).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') + '.' + sig;

    const scope = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/adwords'
    ].join(' ');

    const url = new URL(GOOGLE_AUTH_BASE);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent'); // This ensures a refresh token is always sent
    url.searchParams.set('state', state);

    return Response.json({ auth_url: url.toString() });
  } catch (error) {
    console.error('[googleAuthStart] Error:', error);
    return Response.json({ error: error.message || 'Internal server error during auth start.' }, { status: 500 });
  }
});