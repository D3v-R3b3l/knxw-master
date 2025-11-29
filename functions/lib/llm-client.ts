/**
 * Production-grade LLM client with circuit breaker, retries, and timeout handling
 * Provides robust wrapper around Base44's InvokeLLM integration
 */

/**
 * Circuit breaker state management
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringWindow = options.monitoringWindow || 300000; // 5 minutes
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailure = null;
  }

  canExecute() {
    this.cleanOldFailures();
    
    if (this.state === 'CLOSED') {
      return true;
    }
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    if (this.state === 'HALF_OPEN') {
      return true;
    }
    
    return false;
  }

  recordSuccess() {
    this.failures = [];
    this.state = 'CLOSED';
    this.lastFailure = null;
  }

  recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailure = now;
    
    this.cleanOldFailures();
    
    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  cleanOldFailures() {
    const cutoff = Date.now() - this.monitoringWindow;
    this.failures = this.failures.filter(failure => failure > cutoff);
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures.length,
      lastFailure: this.lastFailure,
      canExecute: this.canExecute()
    };
  }
}

/**
 * Global circuit breaker instance for LLM calls
 */
const llmCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringWindow: 300000
});

/**
 * Exponential backoff with jitter
 */
function calculateBackoffDelay(attempt, baseDelay = 1000, maxDelay = 30000, jitterFactor = 0.1) {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  const jitter = exponentialDelay * jitterFactor * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Sleep function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Robust LLM invocation with retries, circuit breaker, and timeout
 */
export async function invokeRobustLLM(options) {
  const {
    prompt,
    response_json_schema,
    timeout = 10000, // 10 second timeout
    maxRetries = 3,
    baseDelay = 1000,
    enableCircuitBreaker = true
  } = options;

  const startTime = Date.now();
  let lastError = null;

  // Circuit breaker check
  if (enableCircuitBreaker && !llmCircuitBreaker.canExecute()) {
    const status = llmCircuitBreaker.getStatus();
    throw new Error(`Circuit breaker is ${status.state}. Last failure: ${new Date(status.lastFailure).toISOString()}`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`LLM call timed out after ${timeout}ms`)), timeout);
      });

      // Create LLM call promise
      const llmPromise = invokeBaseLLM({ prompt, response_json_schema });

      // Race between LLM call and timeout
      const result = await Promise.race([llmPromise, timeoutPromise]);

      // Success - record in circuit breaker and return
      if (enableCircuitBreaker) {
        llmCircuitBreaker.recordSuccess();
      }

      console.log(JSON.stringify({
        event: 'llm_success',
        attempt,
        latency: Date.now() - startTime,
        prompt_length: prompt.length,
        circuit_breaker_state: enableCircuitBreaker ? llmCircuitBreaker.getStatus() : 'disabled'
      }));

      return result;

    } catch (error) {
      lastError = error;
      
      console.warn(JSON.stringify({
        event: 'llm_attempt_failed',
        attempt,
        error: error.message,
        latency: Date.now() - startTime,
        will_retry: attempt < maxRetries
      }));

      // Record failure in circuit breaker
      if (enableCircuitBreaker) {
        llmCircuitBreaker.recordFailure();
      }

      // If this is the last attempt, don't delay
      if (attempt === maxRetries) {
        break;
      }

      // Calculate backoff delay and wait
      const delay = calculateBackoffDelay(attempt, baseDelay);
      await sleep(delay);
    }
  }

  // All retries exhausted
  const totalLatency = Date.now() - startTime;
  
  console.error(JSON.stringify({
    event: 'llm_all_attempts_failed',
    total_attempts: maxRetries,
    total_latency: totalLatency,
    final_error: lastError.message,
    circuit_breaker_state: enableCircuitBreaker ? llmCircuitBreaker.getStatus() : 'disabled'
  }));

  throw new Error(`LLM invocation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * Base LLM invocation using Base44's InvokeLLM integration
 */
async function invokeBaseLLM({ prompt, response_json_schema }) {
  // Dynamic import to avoid circular dependencies
  const { InvokeLLM } = await import('@/integrations/Core');
  
  const result = await InvokeLLM({
    prompt,
    response_json_schema
  });

  return result;
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return llmCircuitBreaker.getStatus();
}

/**
 * Reset circuit breaker (admin function)
 */
export function resetCircuitBreaker() {
  llmCircuitBreaker.failures = [];
  llmCircuitBreaker.state = 'CLOSED';
  llmCircuitBreaker.lastFailure = null;
  
  console.log(JSON.stringify({
    event: 'circuit_breaker_reset',
    timestamp: new Date().toISOString()
  }));
}

/**
 * LLM health check function
 */
export async function performLLMHealthCheck() {
  const startTime = Date.now();
  
  try {
    const result = await invokeRobustLLM({
      prompt: 'Respond with exactly: {"status": "healthy", "timestamp": "' + new Date().toISOString() + '"}',
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string" },
          timestamp: { type: "string" }
        }
      },
      timeout: 5000,
      maxRetries: 1
    });

    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
      circuit_breaker: getCircuitBreakerStatus(),
      response: result
    };

  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      circuit_breaker: getCircuitBreakerStatus(),
      error: error.message
    };
  }
}