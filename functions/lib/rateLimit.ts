/**
 * Production-grade rate limiting with adaptive throttling
 * Implements sliding window with burst control and IP reputation
 */

const rateLimitStore = new Map();
const ipReputationStore = new Map();
const apiKeyViolations = new Map();

// Cleanup interval
setInterval(() => {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.lastAccess > maxAge) {
      rateLimitStore.delete(key);
    }
  }
  
  for (const [ip, data] of ipReputationStore.entries()) {
    if (now - data.lastUpdate > maxAge * 24) { // 24 hours
      ipReputationStore.delete(ip);
    }
  }
}, 300000); // Cleanup every 5 minutes

export function checkRateLimit(identifier, limits = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    burstSize = 10,
    burstWindowMs = 1000
  } = limits;

  const now = Date.now();
  const windowStart = now - windowMs;
  const burstStart = now - burstWindowMs;

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, {
      requests: [],
      lastAccess: now
    });
  }

  const data = rateLimitStore.get(identifier);
  data.lastAccess = now;

  // Remove expired requests
  data.requests = data.requests.filter(timestamp => timestamp > windowStart);

  // Check burst limit
  const recentBurst = data.requests.filter(timestamp => timestamp > burstStart);
  if (recentBurst.length >= burstSize) {
    return {
      allowed: false,
      reason: 'burst_limit_exceeded',
      limit: maxRequests,
      remaining: 0,
      resetAt: burstStart + burstWindowMs,
      retryAfter: Math.ceil((burstStart + burstWindowMs - now) / 1000)
    };
  }

  // Check window limit
  if (data.requests.length >= maxRequests) {
    const oldestRequest = data.requests[0];
    const resetAt = oldestRequest + windowMs;
    
    // Record violation
    const violations = (apiKeyViolations.get(identifier) || 0) + 1;
    apiKeyViolations.set(identifier, violations);
    
    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      limit: maxRequests,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
      violations
    };
  }

  // Allow request
  data.requests.push(now);
  rateLimitStore.set(identifier, data);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - data.requests.length,
    resetAt: now + windowMs,
    retryAfter: 0
  };
}

export function checkIpReputation(ip, baseLimit = 200) {
  const now = Date.now();
  
  if (!ipReputationStore.has(ip)) {
    ipReputationStore.set(ip, {
      violations: 0,
      lastViolation: null,
      penalty: 1,
      lastUpdate: now
    });
  }

  const reputation = ipReputationStore.get(ip);
  reputation.lastUpdate = now;

  // Decay penalties over time
  if (reputation.lastViolation) {
    const hoursSinceViolation = (now - reputation.lastViolation) / 3600000;
    if (hoursSinceViolation > 24) {
      reputation.penalty = Math.max(1, reputation.penalty / 2);
      reputation.violations = Math.max(0, reputation.violations - 1);
    }
  }

  const adjustedLimit = Math.floor(baseLimit / reputation.penalty);
  const result = checkRateLimit(`ip:${ip}`, {
    maxRequests: adjustedLimit,
    windowMs: 60000
  });

  if (!result.allowed) {
    reputation.violations++;
    reputation.lastViolation = now;
    reputation.penalty = Math.min(16, reputation.penalty * 1.5);
    ipReputationStore.set(ip, reputation);
  }

  return {
    ...result,
    reputation: {
      score: Math.max(0, 100 - (reputation.violations * 10)),
      penalty: reputation.penalty,
      violations: reputation.violations
    }
  };
}

export function getViolationCount(identifier) {
  return apiKeyViolations.get(identifier) || 0;
}

export function resetViolations(identifier) {
  apiKeyViolations.delete(identifier);
  rateLimitStore.delete(identifier);
}

export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    ...(result.retryAfter > 0 && {
      'Retry-After': String(result.retryAfter)
    })
  };
}