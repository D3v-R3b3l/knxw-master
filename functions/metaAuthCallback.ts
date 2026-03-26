import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY');

async function encrypt(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = await crypto.subtle.importKey('raw', encoder.encode(ENCRYPTION_KEY), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...result));
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error(`OAuth error: ${error}`);
      return new Response(`OAuth error: ${error}`, { status: 400 });
    }

    if (!code || !state) {
      return new Response('Missing code or state', { status: 400 });
    }

    // Parse state
    let stateData;
    try {
      const stateParts = state.split('.');
      if (stateParts.length < 2) throw new Error('Invalid state format');
      
      const decodedState = atob(stateParts[0].replace(/-/g, '+').replace(/_/g, '/'));
      stateData = JSON.parse(decodedState);
    } catch (err) {
      console.error('Invalid state parameter:', err);
      return new Response('Invalid state parameter', { status: 400 });
    }

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${Deno.env.get('META_APP_ID')}&redirect_uri=${encodeURIComponent(Deno.env.get('META_OAUTH_REDIRECT_URL'))}&client_secret=${Deno.env.get('META_APP_SECRET')}&code=${code}`;
    
    const tokenResponse = await fetch(tokenUrl);
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Token exchange failed: ${errorText}`);
      return new Response(`Token exchange failed: ${errorText}`, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name`);
    if (!userResponse.ok) {
      return new Response('Failed to get user info', { status: 400 });
    }

    const fbUser = await userResponse.json();

    // Exchange for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${Deno.env.get('META_APP_ID')}&client_secret=${Deno.env.get('META_APP_SECRET')}&fb_exchange_token=${tokenData.access_token}`);

    let finalToken = tokenData.access_token;
    let tokenExpiresAt = null;
    let isLongLived = false;

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      finalToken = longLivedData.access_token;
      isLongLived = true;
      if (longLivedData.expires_in) {
        tokenExpiresAt = new Date(Date.now() + (longLivedData.expires_in * 1000)).toISOString();
      }
    }

    // Encrypt and store
    const encryptedToken = await encrypt(finalToken);

    // Store only the basic scopes we actually have
    const grantedScopes = ['public_profile', 'pages_show_list'];

    const accountData = {
      user_id: user.id,
      fb_user_id: fbUser.id,
      fb_user_name: fbUser.name,
      scopes: grantedScopes,
      access_token_encrypted: encryptedToken,
      token_expires_at: tokenExpiresAt,
      is_long_lived: isLongLived
    };

    // Check if account exists
    const existingAccounts = await base44.entities.MetaAccount.filter({
      user_id: user.id,
      fb_user_id: fbUser.id
    });

    if (existingAccounts.length > 0) {
      await base44.entities.MetaAccount.update(existingAccounts[0].id, accountData);
    } else {
      await base44.entities.MetaAccount.create(accountData);
    }

    console.log(`Meta account connected successfully for user ${user.id}`);

    // Redirect back to the MetaData page
    return new Response(null, {
      status: 302,
      headers: { Location: stateData.rt || '/MetaData?connected=1' }
    });

  } catch (error) {
    console.error('Meta auth callback error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});