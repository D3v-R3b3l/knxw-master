/**
 * Resilience patterns: Circuit Breakers, Bulkheads, Retries with Exponential Backoff
 */

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
      }
    }
  }

  onFailure() {
    this.failures++;
    this.successes = 0;
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: this.nextAttempt
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }
}

// Global circuit breakers for different services
const circuitBreakers = new Map();

export function getCircuitBreaker(name, options) {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(options));
  }
  return circuitBreakers.get(name);
}

/**
 * Retry with exponential backoff and jitter
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    jitterMs = 1000,
    retryableErrors = []
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = retryableErrors.length === 0 || 
        retryableErrors.some(pattern => 
          error.message?.includes(pattern) || error.code === pattern
        );
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = Math.random() * jitterMs;
      const delay = exponentialDelay + jitter;
      
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms for error:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Bulkhead pattern - limit concurrent executions
 */
class Bulkhead {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.current = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.current >= this.maxConcurrent) {
      // Wait in queue
      await new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }

    this.current++;
    
    try {
      const result = await fn();
      this.releaseSlot();
      return result;
    } catch (error) {
      this.releaseSlot();
      throw error;
    }
  }

  releaseSlot() {
    this.current--;
    
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next.resolve();
    }
  }

  getStats() {
    return {
      current: this.current,
      maxConcurrent: this.maxConcurrent,
      queued: this.queue.length
    };
  }
}

const bulkheads = new Map();

export function getBulkhead(name, maxConcurrent = 10) {
  if (!bulkheads.has(name)) {
    bulkheads.set(name, new Bulkhead(maxConcurrent));
  }
  return bulkheads.get(name);
}

/**
 * Timeout wrapper
 */
export async function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Graceful degradation - fallback to cached or default value
 */
export async function withFallback(fn, fallbackFn) {
  try {
    return await fn();
  } catch (error) {
    console.warn('Primary function failed, using fallback:', error.message);
    return await fallbackFn();
  }
}

/**
 * Cache with TTL
 */
class TtlCache {
  constructor(defaultTtlMs = 300000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size() {
    this.cleanup();
    return this.cache.size;
  }
}

export const globalCache = new TtlCache();

// Cleanup expired cache entries every 5 minutes
setInterval(() => globalCache.cleanup(), 300000);

/**
 * Memoize function with TTL
 */
export function memoize(fn, ttlMs = 300000) {
  const cache = new TtlCache(ttlMs);
  
  return async function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Throttle function calls
 */
export function throttle(fn, delayMs) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delayMs) {
      lastCall = now;
      return fn(...args);
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        resolve(fn(...args));
      }, delayMs - timeSinceLastCall);
    });
  };
}

/**
 * Debounce function calls
 */
export function debounce(fn, delayMs) {
  let timeoutId = null;
  
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delayMs);
    });
  };
}