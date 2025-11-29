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

const ADS_API_URL = 'https://googleads.googleapis.com/v14';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    const user = await createClientFromRequest(req).auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { customer_id, start_date, end_date } = await req.json();
    if (!customer_id) return new Response(JSON.stringify({ error: 'customer_id is required' }), { status: 400 });

    const devToken = Deno.env.get('GOOGLE_ADS_DEV_TOKEN');
    if (!devToken) return new Response(JSON.stringify({ error: 'Google Ads Developer Token is not configured on the server.' }), { status: 500 });
    
    const accessToken = await getValidAccessToken(base44, user.id);
    const loginCustomerId = customer_id.replace(/-/g, '');

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date BETWEEN '${start_date}' AND '${end_date}'
      ORDER BY metrics.impressions DESC
      LIMIT 200
    `;

    const response = await fetch(`${ADS_API_URL}/customers/${loginCustomerId}/googleAds:searchStream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': devToken,
        'login-customer-id': loginCustomerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            const message = errorJson[0]?.errors[0]?.message || 'Unknown Google Ads API error';
            throw new Error(message);
        } catch {
            throw new Error(`Google Ads API error: ${errorText}`);
        }
    }

    const data = await response.json();
    const campaigns = (data[0]?.results || []).map(r => ({
      id: r.campaign.id,
      name: r.campaign.name,
      status: r.campaign.status,
      impressions: r.metrics.impressions || 0,
      clicks: r.metrics.clicks || 0,
      cost: (r.metrics.costMicros || 0) / 1000000,
      conversions: r.metrics.conversions || 0,
      ctr: r.metrics.ctr || 0,
      cpc: (r.metrics.averageCpc || 0) / 1000000,
    }));

    return new Response(JSON.stringify({ campaigns }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[googleAdsGetCampaigns] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});