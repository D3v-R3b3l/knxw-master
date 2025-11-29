import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// --- Start Inlined Google Helper ---
async function aesGcmDecrypt(encryptedB64, keyStr) {
    try {
        const b64 = encryptedB64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = '='.repeat((4 - (b64.length % 4)) % 4);
        const raw = Uint8Array.from(atob(b64 + pad), c => c.charCodeAt(0));
        const iv = raw.slice(0, 12);
        const ct = raw.slice(12);
        const keyData = new TextEncoder().encode(keyStr).slice(0, 32);
        const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
        const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(plainBuf);
    } catch (e) {
        throw new Error("Decryption failed.");
    }
}

async function aesGcmEncrypt(plainText, keyStr) {
    const enc = new TextEncoder();
    const keyData = enc.encode(keyStr).slice(0, 32);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plainText));
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...result)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getValidAccessToken(base44, userId) {
    const userAccounts = await base44.entities.GoogleAccount.filter({ user_id: userId });
    if (!userAccounts || userAccounts.length === 0) throw new Error('No Google account connected for this user.');
    const account = userAccounts[0];

    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    if (!encKey || !clientId || !clientSecret) throw new Error('Server is missing required Google OAuth environment variables.');
    
    if (new Date(account.token_expires_at).getTime() < Date.now() + 60000) {
        if (!account.refresh_token_encrypted) throw new Error('Refresh token is missing. Please reconnect Google account.');
        const refreshToken = await aesGcmDecrypt(account.refresh_token_encrypted, encKey);
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
        });
        if (!response.ok) throw new Error(`Failed to refresh Google token: ${await response.text()}`);
        const newTokens = await response.json();
        await base44.entities.GoogleAccount.update(account.id, {
            access_token_encrypted: await aesGcmEncrypt(newTokens.access_token, encKey),
            token_expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
        });
        return newTokens.access_token;
    }
    return await aesGcmDecrypt(account.access_token_encrypted, encKey);
}
// --- End Inlined Google Helper ---

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    const user = await createClientFromRequest(req).auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessToken = await getValidAccessToken(base44, user.id);

    const resp = await fetch('https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      return Response.json({ error: `Google Admin API error: ${errorText}` }, { status: resp.status });
    }
    
    const json = await resp.json();
    const properties = (json.accountSummaries || []).flatMap(summary => 
        (summary.propertySummaries || []).map(ps => ({
            account: summary.name,
            property_name: ps.displayName,
            property_id: (ps.property || '').split('/').pop()
        }))
    );
    
    return Response.json({ properties });
  } catch (error) {
    console.error('[gaListProperties] Error:', error);
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});