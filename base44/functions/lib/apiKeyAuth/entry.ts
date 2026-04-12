import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sha256(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getBearerToken(req, body = {}) {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return body?.api_key || body?.apiKey || req.headers.get('X-API-Key') || req.headers.get('x-api-key') || null;
}

function previewPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  const entries = Object.entries(payload).slice(0, 8);
  return Object.fromEntries(entries.map(([key, value]) => [key, typeof value === 'object' ? '[object]' : value]));
}

function scopeForEndpoint(endpoint) {
  if (endpoint === '/api/v1/events') return 'events:write';
  if (endpoint === '/api/v1/profiles') return 'profiles:read';
  if (endpoint === '/api/v1/insights') return 'insights:read';
  if (endpoint === '/api/v1/recommendations') return 'recommendations:read';
  if (endpoint === '/api/v1/gamedev/events') return 'events:write';
  return null;
}

async function writeRequestLog(base44, log) {
  return base44.asServiceRole.entities.ApiKeyRequestLog.create(log);
}

export async function authenticateApiKey(req, endpoint, body = {}) {
  const base44 = createClientFromRequest(req);
  const token = getBearerToken(req, body);
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const startedAt = Date.now();

  if (!token) {
    return {
      ok: false,
      requestId,
      response: json({ success: false, error: 'API key required' }, 401)
    };
  }

  const tokenHash = await sha256(token);
  const matches = await base44.asServiceRole.entities.ApiKey.filter({ key_hash: tokenHash, status: 'active' }, '-created_date', 1);
  const apiKey = matches?.[0] || null;

  if (!apiKey) {
    return {
      ok: false,
      requestId,
      response: json({ success: false, error: 'Invalid or inactive API key' }, 403)
    };
  }

  const requiredScope = scopeForEndpoint(endpoint);
  if (requiredScope && !(apiKey.scopes || []).includes(requiredScope)) {
    await writeRequestLog(base44, {
      api_key_id: apiKey.id,
      client_app_id: apiKey.client_app_id,
      owner_user_id: apiKey.owner_user_id,
      endpoint,
      method: req.method,
      status_code: 403,
      latency_ms: Date.now() - startedAt,
      request_id: requestId,
      is_rate_limited: false,
      scope_matched: requiredScope,
      failure_reason: 'missing_scope',
      request_payload_preview: previewPayload(body),
      response_payload_preview: { error: 'Forbidden' },
      timestamp: new Date().toISOString()
    });

    return {
      ok: false,
      requestId,
      response: json({ success: false, error: `Missing required scope: ${requiredScope}` }, 403)
    };
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const recentLogs = await base44.asServiceRole.entities.ApiKeyRequestLog.filter({ api_key_id: apiKey.id }, '-timestamp', 500);
  const recentMinuteLogs = recentLogs.filter((log) => log.timestamp >= oneMinuteAgo);

  if (recentMinuteLogs.length >= (apiKey.rate_limit_rpm || 120)) {
    await writeRequestLog(base44, {
      api_key_id: apiKey.id,
      client_app_id: apiKey.client_app_id,
      owner_user_id: apiKey.owner_user_id,
      endpoint,
      method: req.method,
      status_code: 429,
      latency_ms: Date.now() - startedAt,
      request_id: requestId,
      is_rate_limited: true,
      scope_matched: requiredScope,
      failure_reason: 'rate_limit_exceeded',
      request_payload_preview: previewPayload(body),
      response_payload_preview: { error: 'Rate limit exceeded' },
      timestamp: new Date().toISOString()
    });

    return {
      ok: false,
      requestId,
      response: json({ success: false, error: 'Rate limit exceeded' }, 429)
    };
  }

  const apps = await base44.asServiceRole.entities.ClientApp.filter({ id: apiKey.client_app_id }, null, 1);
  const clientApp = apps?.[0] || null;

  return {
    ok: true,
    requestId,
    base44,
    apiKey,
    clientApp,
    requiredScope,
    writeSuccessLog: async ({ statusCode = 200, responsePreview = {}, requestPreview = body, startedAtMs = startedAt }) => {
      await writeRequestLog(base44, {
        api_key_id: apiKey.id,
        client_app_id: apiKey.client_app_id,
        owner_user_id: apiKey.owner_user_id,
        endpoint,
        method: req.method,
        status_code: statusCode,
        latency_ms: Date.now() - startedAtMs,
        request_id: requestId,
        is_rate_limited: false,
        scope_matched: requiredScope,
        request_payload_preview: previewPayload(requestPreview),
        response_payload_preview: previewPayload(responsePreview),
        timestamp: new Date().toISOString()
      });

      await base44.asServiceRole.entities.ApiKey.update(apiKey.id, {
        last_used_at: new Date().toISOString(),
        last_used_endpoint: endpoint
      });
    }
  };
}