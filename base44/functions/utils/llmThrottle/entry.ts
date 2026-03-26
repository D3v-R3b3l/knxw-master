/**
 * Rate limiting utility for LLM calls using token bucket algorithm
 * Prevents excessive API usage and manages costs
 */

// In-memory store for rate limiting (in production, use Redis or database)
const tokenBuckets = new Map();
const bucketCleanupInterval = 60000; // Clean up old buckets every minute

// Configuration
const DEFAULT_CONFIG = {
  maxTokens: 60,           // Maximum tokens in bucket
  refillRate: 1,           // Tokens added per minute
  windowMs: 60000,         // 1 minute window
  costPerRequest: 1        // Default cost per LLM request
};

// Function-specific configurations
const FUNCTION_CONFIGS = {
  'captureEvent': {
    maxTokens: 30,
    refillRate: 0.5,       // Slower refill for event processing
    costPerRequest: 1
  },
  'processImportedData': {
    // Relax slightly to reduce 429s on medium batches
    maxTokens: 30,          // was 20
    refillRate: 0.5,        // was 0.3
    costPerRequest: 2      // Higher cost for batch operations
  },
  'evaluateEngagementRules': {
    // Allow more concurrent evaluations for lively UIs
    maxTokens: 60,          // was 40
    refillRate: 1.0,        // was 0.7
    costPerRequest: 1
  },
  'batchAnalytics': {
    // Heavy job: allow a few more tokens and faster refill
    maxTokens: 30,          // was 10
    refillRate: 0.8,        // was 0.2
    costPerRequest: 5
  }
};

class TokenBucket {
  constructor(config) {
    this.maxTokens = config.maxTokens;
    this.refillRate = config.refillRate;
    this.tokens = config.maxTokens;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 60000) * this.refillRate; // refillRate per minute
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  canConsume(tokens) {
    this.refill();
    return this.tokens >= tokens;
  }

  consume(tokens) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  getTokens() {
    this.refill();
    return this.tokens;
  }

  getTimeUntilTokens(tokensNeeded) {
    this.refill();
    if (this.tokens >= tokensNeeded) {
      return 0;
    }
    
    const tokensShortage = tokensNeeded - this.tokens;
    const timeNeeded = (tokensShortage / this.refillRate) * 60000; // Convert to ms
    return Math.ceil(timeNeeded / 1000); // Return seconds
  }
}

/**
 * Check if a user can make an LLM request
 */
export function rateLimitLLM(userId, functionName, customCost = null) {
  const config = FUNCTION_CONFIGS[functionName] || DEFAULT_CONFIG;
  const cost = customCost || config.costPerRequest;
  const bucketKey = `${userId}:${functionName}`;
  
  // Get or create bucket
  let bucket = tokenBuckets.get(bucketKey);
  if (!bucket) {
    bucket = new TokenBucket(config);
    tokenBuckets.set(bucketKey, bucket);
  }
  
  // Check if request can be made
  const canProceed = bucket.canConsume(cost);
  
  if (canProceed) {
    bucket.consume(cost);
    
    return {
      allowed: true,
      remainingTokens: bucket.getTokens(),
      resetTime: null
    };
  } else {
    const retryAfter = bucket.getTimeUntilTokens(cost);
    
    return {
      allowed: false,
      remainingTokens: bucket.getTokens(),
      retryAfter,
      resetTime: new Date(Date.now() + (retryAfter * 1000))
    };
  }
}

/**
 * Consume tokens after a successful LLM call (for tracking actual usage)
 */
export function consumeLLMTokens(userId, functionName, actualCost) {
  const config = FUNCTION_CONFIGS[functionName] || DEFAULT_CONFIG;
  const bucketKey = `${userId}:${functionName}`;
  
  const bucket = tokenBuckets.get(bucketKey);
  if (bucket && actualCost > config.costPerRequest) {
    // Consume additional tokens if actual cost was higher
    const additionalCost = actualCost - config.costPerRequest;
    bucket.consume(additionalCost);
  }
}

/**
 * Get current rate limit status for a user/function
 */
export function getRateLimitStatus(userId, functionName) {
  const config = FUNCTION_CONFIGS[functionName] || DEFAULT_CONFIG;
  const bucketKey = `${userId}:${functionName}`;
  
  const bucket = tokenBuckets.get(bucketKey);
  if (!bucket) {
    return {
      remainingTokens: config.maxTokens,
      maxTokens: config.maxTokens,
      refillRate: config.refillRate,
      resetTime: null
    };
  }
  
  return {
    remainingTokens: bucket.getTokens(),
    maxTokens: config.maxTokens,
    refillRate: config.refillRate,
    resetTime: new Date(bucket.lastRefill + 60000) // Next refill time
  };
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(userId, functionName = null) {
  if (functionName) {
    const bucketKey = `${userId}:${functionName}`;
    tokenBuckets.delete(bucketKey);
  } else {
    // Reset all buckets for the user
    for (const key of tokenBuckets.keys()) {
      if (key.startsWith(`${userId}:`)) {
        tokenBuckets.delete(key);
      }
    }
  }
}

/**
 * Clean up old unused buckets
 */
function cleanupBuckets() {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour
  
  for (const [key, bucket] of tokenBuckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      tokenBuckets.delete(key);
    }
  }
}

/**
 * Middleware wrapper for functions that use LLM
 */
export function withLLMRateLimit(functionName) {
  return (handler) => {
    return async (req, context) => {
      const { base44, requestId } = context;
      
      try {
        const user = await base44.auth.me();
        if (!user) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const rateLimitCheck = rateLimitLLM(user.id, functionName);
        
        if (!rateLimitCheck.allowed) {
          return new Response(JSON.stringify({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_ERROR',
            retryAfter: rateLimitCheck.retryAfter,
            resetTime: rateLimitCheck.resetTime
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitCheck.retryAfter.toString(),
              'X-RateLimit-Remaining': rateLimitCheck.remainingTokens.toString()
            }
          });
        }
        
        // Add rate limit info to context
        context.rateLimit = rateLimitCheck;
        context.userId = user.id;
        
        return await handler(req, context);
      } catch (error) {
        throw error;
      }
    };
  };
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupBuckets, bucketCleanupInterval);
}

export { FUNCTION_CONFIGS, DEFAULT_CONFIG };