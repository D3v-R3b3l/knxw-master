import { createClient } from 'npm:@base44/sdk@0.7.1';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

async function hmac(input, keyStr) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(keyStr), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
    return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

function createDebugResponse(title, message, details, isSuccess = false) {
    const titleColor = isSuccess ? '#10b981' : '#ef4444';
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #111; color: #e5e5e5; padding: 2em; line-height: 1.6; }
                .container { max-width: 800px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #262626; border-radius: 8px; padding: 2em; }
                h1 { color: ${titleColor}; }
                pre { background-color: #0a0a0a; padding: 1em; border-radius: 5px; white-space: pre-wrap; word-break: break-all; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; font-size: 14px; }
                p { color: #a3a3a3; }
                .error-box { border: 2px solid #ef4444; padding: 1em; background-color: rgba(239, 68, 68, 0.1); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${title}</h1>
                <p>${message}</p>
                <h2>Debug Information:</h2>
                <pre>${details.join('\n')}</pre>
            </div>
        </body>
        </html>
    `;
    return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: isSuccess ? 200 : 500 });
}

Deno.serve(async (req) => {
    const base44 = createClient(Deno.env.get('BASE44_APP_ID')).asServiceRole;
    const debugInfo = [];

    try {
        debugInfo.push('Callback starting...');
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (url.searchParams.get('error')) {
            debugInfo.push(`Google returned an error: ${url.searchParams.get('error')}`);
            return createDebugResponse('Authentication Failed', 'Google returned an error.', debugInfo);
        }

        if (!code || !state) {
            debugInfo.push('Missing "code" or "state" from Google.');
            return createDebugResponse('Authentication Failed', 'Required parameters were missing from the Google response.', debugInfo);
        }
        debugInfo.push('Received code and state.');

        const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const googleRedirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URL');

        if (!encKey || !clientId || !clientSecret || !googleRedirectUri) {
            debugInfo.push('FATAL: One or more required Google OAuth secrets are not set on the server.');
            return createDebugResponse('Server Configuration Error', 'A server-side configuration issue occurred.', debugInfo);
        }
        debugInfo.push('Server environment variables are present.');

        const [statePayloadB64, sig] = state.split('.');
        const decodedStatePayload = atob(statePayloadB64.replace(/-/g, '+').replace(/_/g, '/'));
        
        // FIX: Corrected typo from decodedStatePaylo to decodedStatePayload
        if (await hmac(decodedStatePayload, encKey) !== sig) {
            debugInfo.push('FATAL: Invalid state signature. Potential CSRF attack.');
            return createDebugResponse('Security Check Failed', 'The state parameter was invalid. Please try again.', debugInfo);
        }
        const { uid } = JSON.parse(decodedStatePayload);
        debugInfo.push(`State validated for user ID: ${uid}`);

        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: googleRedirectUri }),
        });
        const tokens = await tokenResponse.json();
        if (!tokenResponse.ok) {
            debugInfo.push(`FATAL: Failed to exchange code for tokens: ${JSON.stringify(tokens, null, 2)}`);
            return createDebugResponse('Authentication Failed', 'Could not get authentication tokens from Google.', debugInfo);
        }
        if (!tokens.refresh_token) {
            debugInfo.push(`FATAL: Did not receive a refresh_token. This happens if the user has previously authorized the app. User needs to re-consent.`);
            return createDebugResponse('Action Required', 'A refresh_token was not provided by Google. Please go to your Google Account settings, remove access for this app, and then try connecting again.', debugInfo);
        }
        debugInfo.push('Successfully exchanged code for tokens (including refresh_token).');

        const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
        const userInfo = await userInfoResponse.json();
        if (!userInfoResponse.ok) {
            debugInfo.push(`FATAL: Failed to fetch user info: ${JSON.stringify(userInfo, null, 2)}`);
            return createDebugResponse('Authentication Failed', 'Could not fetch user profile from Google.', debugInfo);
        }
        debugInfo.push(`Fetched Google user info for: ${userInfo.email}`);

        const accountData = {
            user_id: uid,
            google_user_id: userInfo.id,
            google_email: userInfo.email,
            scopes: tokens.scope ? tokens.scope.split(' ') : [],
            access_token_encrypted: await aesGcmEncrypt(tokens.access_token, encKey),
            refresh_token_encrypted: await aesGcmEncrypt(tokens.refresh_token, encKey),
            token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        };

        try {
            debugInfo.push('Attempting to find existing GoogleAccount...');
            const existing = await base44.entities.GoogleAccount.filter({ user_id: uid });
            debugInfo.push(`Filter result: ${JSON.stringify(existing)}`);

            if (existing && existing.length > 0) {
                debugInfo.push(`Found existing record. ID: ${existing[0].id}. Attempting update...`);
                await base44.entities.GoogleAccount.update(existing[0].id, accountData);
                debugInfo.push('Update successful.');
            } else {
                debugInfo.push('No existing record found. Attempting create...');
                await base44.entities.GoogleAccount.create(accountData);
                debugInfo.push('Create successful.');
            }
        } catch (dbError) {
            debugInfo.push('\n--- DATABASE OPERATION FAILED ---');
            debugInfo.push(`Error Message: ${dbError.message}`);
            debugInfo.push(`Error Details: ${JSON.stringify(dbError, null, 2)}`);
            debugInfo.push('---------------------------------\n');
            return createDebugResponse('Database Error', 'Could not save Google credentials to the database.', debugInfo);
        }
        
        debugInfo.push('SUCCESS: Google credentials saved to the database.');
        return createDebugResponse('Authentication Successful!', 'You can now close this window. The main application will refresh automatically.', debugInfo, true);

    } catch (error) {
        console.error('[googleAuthCallback] CRITICAL ERROR:', error);
        debugInfo.push(`--- CRITICAL SERVER ERROR ---`);
        debugInfo.push(`Error: ${error.message}`);
        debugInfo.push(`Stack: ${error.stack}`);
        debugInfo.push(`-----------------------------`);
        return createDebugResponse('An Unexpected Error Occurred', 'A critical server error was encountered. Please contact support.', debugInfo);
    }
});