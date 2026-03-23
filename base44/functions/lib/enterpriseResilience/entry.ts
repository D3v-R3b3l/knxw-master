// Enterprise Resilience & Circuit Breaker Implementation

export class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = options.resetTimeout || 30000;
    this.monitoringPeriod = options.monitoringPeriod || 300000;
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailTime = null;
    this.nextAttempt = null;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      circuitOpenings: 0
    };
  }

  async execute(operation) {
    this.metrics.totalRequests++;

    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        console.log(`Circuit breaker ${this.name} entering HALF_OPEN state`);
      } else {
        throw new CircuitBreakerError('Circuit breaker is OPEN', this.getStatus());
      }
    }

    const startTime = Date.now();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), this.timeout);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      this.onSuccess();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message === 'Operation timeout') {
        this.metrics.timeouts++;
        this.onFailure(new Error(`Operation timed out after ${duration}ms`));
      } else {
        this.onFailure(error);
      }
      
      throw error;
    }
  }

  onSuccess() {
    this.metrics.successfulRequests++;
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`Circuit breaker ${this.name} reset to CLOSED state`);
    }
  }

  onFailure(error) {
    this.metrics.failedRequests++;
    this.failures++;
    this.lastFailTime = Date.now();

    console.warn(`Circuit breaker ${this.name} recorded failure:`, error.message);

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.metrics.circuitOpenings++;
      
      console.error(`Circuit breaker ${this.name} opened due to ${this.failures} failures`);
    }
  }

  shouldAttemptReset() {
    return Date.now() >= this.nextAttempt;
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      metrics: { ...this.metrics },
      nextAttempt: this.nextAttempt,
      failureRate: this.metrics.totalRequests > 0 
        ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100 
        : 0,
      isHealthy: this.state === 'CLOSED' && this.failures === 0
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailTime = null;
    this.nextAttempt = null;
    console.log(`Circuit breaker ${this.name} manually reset`);
  }
}

export class CircuitBreakerError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.status = status;
  }
}

export class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitterRange = options.jitterRange || 0.1;
  }

  async execute(operation, retryCondition = this.defaultRetryCondition) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !retryCondition(error, attempt)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        console.warn(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms:`, error.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  calculateDelay(attempt) {
    let delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
    delay = Math.min(delay, this.maxDelay);
    
    const jitter = delay * this.jitterRange * (Math.random() - 0.5);
    return Math.max(0, delay + jitter);
  }

  defaultRetryCondition(error, attempt) {
    return (
      error.name === 'TypeError' ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      (error.response && error.response.status >= 500)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class HealthChecker {
  constructor(base44) {
    this.base44 = base44;
    this.checks = new Map();
    this.lastResults = new Map();
  }

  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      name,
      function: checkFunction,
      timeout: options.timeout || 5000,
      interval: options.interval || 60000,
      critical: options.critical || false,
      tags: options.tags || []
    });
  }

  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    const startTime = Date.now();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
    });

    try {
      const result = await Promise.race([check.function(), timeoutPromise]);
      const duration = Date.now() - startTime;
      
      const healthResult = {
        name,
        status: 'healthy',
        duration,
        timestamp: new Date().toISOString(),
        details: result || 'OK',
        critical: check.critical
      };

      this.lastResults.set(name, healthResult);
      return healthResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const healthResult = {
        name,
        status: 'unhealthy',
        duration,
        timestamp: new Date().toISOString(),
        error: error.message,
        critical: check.critical
      };

      this.lastResults.set(name, healthResult);
      
      if (check.critical) {
        console.error(`Critical health check failed: ${name}`, error);
      }

      return healthResult;
    }
  }

  async runAllChecks() {
    const results = [];
    const promises = Array.from(this.checks.keys()).map(name => this.runCheck(name));
    
    const settledResults = await Promise.allSettled(promises);
    
    settledResults.forEach((result, index) => {
      const name = Array.from(this.checks.keys())[index];
      
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          name,
          status: 'error',
          error: result.reason.message,
          timestamp: new Date().toISOString(),
          critical: this.checks.get(name).critical
        });
      }
    });

    return results;
  }

  getOverallHealth() {
    const results = Array.from(this.lastResults.values());
    
    if (results.length === 0) {
      return { status: 'unknown', message: 'No health checks configured' };
    }

    const criticalFailures = results.filter(r => r.critical && r.status !== 'healthy');
    const totalFailures = results.filter(r => r.status !== 'healthy');
    
    if (criticalFailures.length > 0) {
      return {
        status: 'critical',
        message: `${criticalFailures.length} critical health checks failing`,
        failedChecks: criticalFailures.map(r => r.name)
      };
    }
    
    if (totalFailures.length > 0) {
      return {
        status: 'degraded',
        message: `${totalFailures.length} non-critical health checks failing`,
        failedChecks: totalFailures.map(r => r.name)
      };
    }
    
    return {
      status: 'healthy',
      message: 'All health checks passing'
    };
  }

  async persistHealthResults() {
    const results = await this.runAllChecks();
    
    for (const result of results) {
      try {
        await this.base44.entities.SystemEvent?.create?.({
          org_id: 'system',
          actor_type: 'system',
          actor_id: 'health_checker',
          event_type: result.status === 'healthy' ? 'info' : 'error',
          severity: result.critical && result.status !== 'healthy' ? 'critical' : 'info',
          payload: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to persist health check result:', error);
      }
    }
    
    return results;
  }
}

export function createCircuitBreaker(name, options) {
  return new CircuitBreaker({ name, ...options });
}

export function createRetryManager(options) {
  return new RetryManager(options);
}

export function createHealthChecker(base44) {
  return new HealthChecker(base44);
}