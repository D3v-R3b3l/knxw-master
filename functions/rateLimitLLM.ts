/**
 * Rate limiting utility for LLM calls using token bucket algorithm
 */

// In-memory store for rate limiting
const tokenBuckets = new Map();

// Configuration
const DEFAULT_CONFIG = {
  maxTokens: 60,           // Maximum tokens in bucket
  refillRate: 1,           // Tokens added per minute
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
    maxTokens: 20,
    refillRate: 0.3,       // Even slower for batch processing
    costPerRequest: 2      // Higher cost for batch operations
  },
  'evaluateEngagementRules': {
    maxTokens: 40,
    refillRate: 0.7,
    costPerRequest: 1
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
 * Check if a user can make an LLM request - synchronous operation
 */
function rateLimitLLM(userId, functionName, customCost = null) {
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

export { rateLimitLLM };

Deno.serve((req) => {
  return new Response(JSON.stringify({ 
    error: 'This is a utility function, not an endpoint' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
});