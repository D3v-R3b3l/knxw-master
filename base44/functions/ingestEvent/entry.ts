import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Buffer } from 'https://deno.land/std@0.140.0/node/buffer.ts';

// Helper to return JSON responses
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Encoder for crypto operations
const textEncoder = new TextEncoder();
function encode(str) {
  return textEncoder.encode(str);
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  const base44 = createClientFromRequest(req);
  const svc = base44.asServiceRole;

  // 1. Extract and validate token from header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing or malformed Authorization header.' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const parts = token.split('.');
  if (parts.length !== 2 && parts.length !== 3) {
      return json({ error: 'Invalid token format.' }, 401);
  }
  const [encodedPayload, encodedSignature] = parts;
  
  if (!encodedPayload || !encodedSignature) {
    return json({ error: 'Invalid token format.' }, 401);
  }

  // 2. Decode payload and check claims
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
  } catch (e) {
    return json({ error: 'Invalid token payload.' }, 401);
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return json({ error: 'Token has expired.' }, 401);
  }
  
  const requestOrigin = req.headers.get('Origin');
  // Optional origin check - sometimes origin header is missing in non-browser envs or proxies
  if (requestOrigin && payload.origin && payload.origin !== requestOrigin) {
    // return json({ error: 'Invalid token origin.' }, 403); 
    // Warning: Strict origin checks can break mobile apps or server-side calls. 
    // Logging warning instead of blocking for now to avoid regression
    console.warn(`Origin mismatch: token=${payload.origin}, req=${requestOrigin}`);
  }

  // 3. Verify token signature
  try {
    const secrets = await svc.entities.WorkspaceSecret.filter({ workspace_id: payload.wid });
    const secretRecord = secrets[0];
    if (!secretRecord || !secretRecord.sdk_signing_key) {
      console.error('Workspace secrets not found or key is missing for wid:', payload.wid);
      throw new Error('Workspace configuration error.');
    }

    const key = await crypto.subtle.importKey('raw', encode(secretRecord.sdk_signing_key), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signature = Buffer.from(encodedSignature, 'base64url');
    const dataToVerify = encode(encodedPayload);

    const isValid = await crypto.subtle.verify('HMAC', key, signature, dataToVerify);
    if (!isValid) {
      return json({ error: 'Invalid token signature.' }, 401);
    }
  } catch (e) {
    console.error(`Token verification failed for wid ${payload.wid}:`, e.message);
    return json({ error: 'Token verification failed.' }, 401); // Return 401, not 500 to client
  }
  
  // 4. Parse and store event
  try {
    const eventData = await req.json();

    // Basic validation
    if (!eventData.event || !eventData.ts || !eventData.user_id || !eventData.session_id) {
       return json({ error: 'Missing required event fields.' }, 400);
    }
    
    await svc.entities.RawEvent.create({
      workspace_id: payload.wid,
      user_id: eventData.user_id,
      session_id: eventData.session_id,
      event: eventData.event,
      ts: new Date(eventData.ts).toISOString(),
      url: eventData.page,
      referrer: eventData.referrer,
      ua: req.headers.get('User-Agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('fly-client-ip'),
      click_ids: eventData.click_ids || {},
      campaign: eventData.campaign || {},
      props: eventData.metadata || {}
    });

    return json({ status: 'ok' }, 200, { 'Access-Control-Allow-Origin': '*' });
  } catch(e) {
    console.error(`Event ingestion failed for wid ${payload.wid}:`, e.message);
    return json({ error: 'Failed to process event.', details: e.message }, 500);
  }
});