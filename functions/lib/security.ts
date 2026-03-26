/**
 * Enterprise-grade security utilities for knXw Developer Platform
 * Implements defense-in-depth strategy with multiple security layers
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Input sanitization to prevent injection attacks
 */
export function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') return input;
  
  const {
    allowHtml = false,
    maxLength = 10000,
    stripNull = true,
    normalizeWhitespace = true
  } = options;

  let sanitized = input;

  // Remove null bytes (common in injection attacks)
  if (stripNull) {
    sanitized = sanitized.replace(/\0/g, '');
  }

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Normalize whitespace
  if (normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  // HTML escaping if HTML not allowed
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  return sanitized;
}

/**
 * Validate and sanitize object recursively
 */
export function sanitizeObject(obj, maxDepth = 10, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    throw new Error('Maximum object depth exceeded');
  }

  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeInput(key, { maxLength: 256 });
      sanitized[sanitizedKey] = sanitizeObject(value, maxDepth, currentDepth + 1);
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  return obj;
}

/**
 * Rate limiting with sliding window (Redis-like implementation using memory)
 */
const rateLimitStore = new Map();

export function checkRateLimit(key, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // Remove expired requests
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

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitStore() {
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
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    return timingSafeEqual(bufA, bufB);
  } catch (error) {
    return false;
  }
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureToken(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash API key with salt (for storage)
 */
export async function hashApiKey(apiKey, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify webhook signature with constant-time comparison
 */
export function verifyWebhookSignature(payload, signature, secret) {
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = 'sha256=' + hmac.digest('hex');
    
    return secureCompare(signature, expectedSignature);
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Validate timestamp to prevent replay attacks
 */
export function validateTimestamp(timestamp, maxAgeSeconds = 300) {
  try {
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const age = Math.abs(now - requestTime) / 1000;
    
    return age <= maxAgeSeconds;
  } catch (error) {
    return false;
  }
}

/**
 * Detect potential SQL injection patterns
 */
export function detectSqlInjection(input) {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(;.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
    /(UNION.*SELECT)/i,
    /(CONCAT\()/i,
    /(LOAD_FILE\()/i,
    /(INTO.*OUTFILE)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect potential XSS patterns
 */
export function detectXss(input) {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize user input comprehensively
 */
export function validateInput(input, type = 'string', options = {}) {
  // Check for injection attempts
  if (typeof input === 'string') {
    if (detectSqlInjection(input)) {
      throw new Error('Potential SQL injection detected');
    }
    if (detectXss(input)) {
      throw new Error('Potential XSS attack detected');
    }
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        throw new Error('Invalid email format');
      }
      return sanitizeInput(input, { maxLength: 320 });
      
    case 'url':
      try {
        const url = new URL(input);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid URL protocol');
        }
        return url.toString();
      } catch (error) {
        throw new Error('Invalid URL format');
      }
      
    case 'user_id':
      if (!/^[a-zA-Z0-9_-]{1,256}$/.test(input)) {
        throw new Error('Invalid user ID format');
      }
      return input;
      
    case 'api_key':
      if (!/^knxw_[a-zA-Z0-9]{32,}$/.test(input)) {
        throw new Error('Invalid API key format');
      }
      return input;
      
    case 'number':
      const num = Number(input);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid number');
      }
      if (options.min !== undefined && num < options.min) {
        throw new Error(`Number must be at least ${options.min}`);
      }
      if (options.max !== undefined && num > options.max) {
        throw new Error(`Number must be at most ${options.max}`);
      }
      return num;
      
    case 'json':
      try {
        const parsed = JSON.parse(input);
        return sanitizeObject(parsed);
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
      
    default:
      return sanitizeInput(input, options);
  }
}

/**
 * Generate Content Security Policy headers
 */
export function getCSPHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

/**
 * Audit log security-relevant events
 */
export async function auditLog(base44, event) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      timestamp: new Date().toISOString(),
      org_id: event.org_id || 'system',
      user_id: event.user_id || 'system',
      action: event.action,
      table_name: event.table_name || 'api',
      record_id: event.record_id || '',
      before: event.before || {},
      after: event.after || {},
      request_id: event.request_id || '',
      ip_address: event.ip_address || ''
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
}

/**
 * Detect potential DDoS patterns
 */
export function detectDDoS(requests, threshold = 1000, windowSeconds = 60) {
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  const recentRequests = requests.filter(r => r.timestamp > windowStart);
  
  if (recentRequests.length > threshold) {
    // Check for distributed pattern
    const uniqueIps = new Set(recentRequests.map(r => r.ip));
    const requestsPerIp = recentRequests.length / uniqueIps.size;
    
    return {
      isDDoS: true,
      requestCount: recentRequests.length,
      uniqueIps: uniqueIps.size,
      requestsPerIp,
      severity: requestsPerIp > 100 ? 'high' : 'medium'
    };
  }
  
  return { isDDoS: false };
}

/**
 * IP-based rate limiting with progressive penalties
 */
const ipPenalties = new Map();

export function checkIpRateLimit(ip, baseLimitPerMinute = 100) {
  const penalty = ipPenalties.get(ip) || 1;
  const adjustedLimit = Math.floor(baseLimitPerMinute / penalty);
  
  const result = checkRateLimit(`ip:${ip}`, adjustedLimit, 60000);
  
  if (!result.allowed) {
    // Increase penalty for repeated violations
    ipPenalties.set(ip, Math.min(penalty * 2, 16));
  } else if (result.remaining > adjustedLimit * 0.5) {
    // Reduce penalty if behaving well
    if (penalty > 1) {
      ipPenalties.set(ip, Math.max(penalty / 2, 1));
    }
  }
  
  return { ...result, penalty, adjustedLimit };
}

/**
 * Cleanup IP penalties periodically
 */
export function cleanupIpPenalties() {
  // Reset all penalties after 1 hour
  ipPenalties.clear();
}

// Schedule periodic cleanups
setInterval(() => {
  cleanupRateLimitStore();
  cleanupIpPenalties();
}, 300000); // Every 5 minutes