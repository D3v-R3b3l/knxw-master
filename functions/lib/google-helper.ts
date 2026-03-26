import { createClient } from 'npm:@base44/sdk@0.7.1';

// Helper to decrypt a value using the app's encryption key
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
        console.error("Decryption failed:", e.message);
        throw new Error("Decryption failed. Check OAUTH_ENCRYPTION_KEY and token format.");
    }
}

// Helper to encrypt a value
async function aesGcmEncrypt(plainText, keyStr) {
    const enc = new TextEncoder();
    const keyData = enc.encode(keyStr).slice(0, 32);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plainText));
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...result)).replace(/\+/g, '-').replace(/_/g, '_').replace(/=+$/, '');
}

/**
 * Gets a valid Google access token for the given user, refreshing it if necessary.
 * This is the centralized function to be used by all Google API-calling functions.
 */
export async function getValidAccessToken(base44, userId) {
    const userAccounts = await base44.entities.GoogleAccount.filter({ user_id: userId });
    if (!userAccounts || userAccounts.length === 0) {
        throw new Error('No Google account connected for this user.');
    }
    const account = userAccounts[0];

    const encKey = Deno.env.get('OAUTH_ENCRYPTION_KEY');
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!encKey || !clientId || !clientSecret) {
        throw new Error('Server is missing required Google OAuth environment variables.');
    }
    
    const expiresAt = new Date(account.token_expires_at).getTime();
    
    // Refresh if the token is expired or will expire in the next 60 seconds
    if (Date.now() + 60000 >= expiresAt) {
        if (!account.refresh_token_encrypted) {
            throw new Error('Refresh token is missing. Please ask the user to reconnect their Google account.');
        }
        
        console.log(`[Google Helper] Token for user ${userId} expired. Refreshing...`);
        const refreshToken = await aesGcmDecrypt(account.refresh_token_encrypted, encKey);

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Google Helper] Token refresh failed:', errorText);
            throw new Error(`Failed to refresh Google token: ${errorText}`);
        }

        const newTokens = await response.json();
        const newExpiresAt = new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString();
        
        const newAccessTokenEncrypted = await aesGcmEncrypt(newTokens.access_token, encKey);
        
        await base44.entities.GoogleAccount.update(account.id, {
            access_token_encrypted: newAccessTokenEncrypted,
            token_expires_at: newExpiresAt,
        });
        
        console.log(`[Google Helper] Token for user ${userId} refreshed successfully.`);
        return newTokens.access_token;
    }

    // If token is still valid, decrypt and return it
    return await aesGcmDecrypt(account.access_token_encrypted, encKey);
}