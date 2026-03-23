/**
 * Global middleware for all API endpoints
 * Implements: Auth, Rate Limiting, Logging, Security Headers, Error Handling
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const EXCLUDED_PATHS = ['/api/v1/health', '/api/v1/openapi'];

// Rate limiting store
const rateLimitStore = new Map();
const ipPenalties = new Map();

function checkRateLimit(key, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= limit) {
    const oldestRequest = validRequests[0];
    const resetTime = oldestRequest + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter
    };
  }
  
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  return {
    allowed: true,
    remaining: limit - validRequests.length,
    resetTime: now + windowMs,
    retryAfter: 0
  };
}

function checkIpRateLimit(ip, baseLimitPerMinute = 200) {
  const penalty = ipPenalties.get(ip) || 1;
  const adjustedLimit = Math.floor(baseLimitPerMinute / penalty);
  
  const result = checkRateLimit(`ip:${ip}`, adjustedLimit, 60000);
  
  if (!result.allowed) {
    ipPenalties.set(ip, Math.min(penalty * 2, 16));
  } else if (result.remaining > adjustedLimit * 0.5) {
    if (penalty > 1) {
      ipPenalties.set(ip, Math.max(penalty / 2, 1));
    }
  }
  
  return { ...result, penalty, adjustedLimit };
}

function getCSPHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

export async function middleware(req, next) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  const pathname = new URL(req.url).pathname;

  req.headers.set('X-Request-ID', requestId);

  try {
    // Skip auth for excluded paths
    if (EXCLUDED_PATHS.includes(pathname)) {
      const response = await next(req);
      return addSecurityHeaders(response, startTime, requestId);
    }

    // Extract IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                req.headers.get('x-real-ip') || 
                'unknown';

    // IP-based rate limiting
    const ipRateLimit = checkIpRateLimit(ip, 200);
    if (!ipRateLimit.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many requests from your IP address',
        meta: { requestId, retryAfter: ipRateLimit.retryAfter }
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': ipRateLimit.retryAfter.toString(),
          'X-Request-ID': requestId,
          ...getCSPHeaders()
        }
      });
    }

    // Extract and validate API key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized',
        details: 'Missing or invalid API key. Include header: Authorization: Bearer knxw_your_api_key',
        meta: { requestId }
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="knXw API"',
          'X-Request-ID': requestId,
          ...getCSPHeaders()
        }
      });
    }

    const apiKey = authHeader.substring(7);
    const keyPrefix = apiKey.substring(0, 12);

    // Validate API key
    const base44 = createClientFromRequest(req);
    const apiKeyRecords = await base44.asServiceRole.entities.ApiKey.filter({
      key_prefix: keyPrefix,
      status: 'active'
    }, null, 1);

    const apiKeyRecord = apiKeyRecords[0];

    if (!apiKeyRecord) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized',
        details: 'Invalid API key',
        meta: { requestId }
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...getCSPHeaders()
        }
      });
    }

    const tenantId = apiKeyRecord.tenant_id;

    // Per-key rate limiting
    const keyRateLimit = checkRateLimit(
      `api_key:${apiKeyRecord.id}`,
      apiKeyRecord.rate_limit_per_minute || 100,
      60000
    );

    if (!keyRateLimit.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        meta: { requestId, retryAfter: keyRateLimit.retryAfter }
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': keyRateLimit.retryAfter.toString(),
          'X-RateLimit-Limit': (apiKeyRecord.rate_limit_per_minute || 100).toString(),
          'X-RateLimit-Remaining': keyRateLimit.remaining.toString(),
          'X-Request-ID': requestId,
          ...getCSPHeaders()
        }
      });
    }

    // Attach auth context
    req.tenantId = tenantId;
    req.apiKey = apiKeyRecord;
    req.requestId = requestId;

    const response = await next(req);

    // Log usage event
    const latencyMs = performance.now() - startTime;
    
    try {
      await base44.asServiceRole.entities.UsageEvent.create({
        tenant_id: tenantId,
        api_key_id: apiKeyRecord.id,
        endpoint: pathname,
        method: req.method,
        status_code: response.status,
        latency_ms: Math.round(latencyMs),
        timestamp: new Date().toISOString(),
        request_id: requestId,
        is_rate_limited: false
      });
    } catch (error) {
      console.error('Failed to log usage event:', error);
    }

    return addSecurityHeaders(response, startTime, requestId);

  } catch (error) {
    const latencyMs = performance.now() - startTime;
    
    console.error('Request failed:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
      meta: { requestId, latencyMs: Math.round(latencyMs) }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...getCSPHeaders()
      }
    });
  }
}

function addSecurityHeaders(response, startTime, requestId) {
  const latencyMs = performance.now() - startTime;
  
  const headers = new Headers(response.headers);
  headers.set('X-Request-ID', requestId);
  headers.set('X-Response-Time', `${latencyMs.toFixed(2)}ms`);
  
  const securityHeaders = getCSPHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
  
  ipPenalties.clear();
}, 300000); // Every 5 minutes