/**
 * Observability: Logging, Metrics, Tracing
 */

/**
 * Structured logging
 */
class Logger {
  constructor(context = {}) {
    this.context = context;
    this.minLevel = this.parseLogLevel(Deno.env.get('LOG_LEVEL') || 'info');
  }

  parseLogLevel(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level.toLowerCase()] || 1;
  }

  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= this.minLevel;
  }

  formatMessage(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...this.context,
      ...data
    });
  }

  debug(message, data) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message, data) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message, data) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message, data) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  child(additionalContext) {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

export function createLogger(context) {
  return new Logger(context);
}

/**
 * Metrics collection
 */
class MetricsCollector {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  incrementCounter(name, value = 1, tags = {}) {
    const key = this.getKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  setGauge(name, value, tags = {}) {
    const key = this.getKey(name, tags);
    this.gauges.set(key, value);
  }

  recordHistogram(name, value, tags = {}) {
    const key = this.getKey(name, tags);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key).push(value);
  }

  getKey(name, tags) {
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return tagString ? `${name}{${tagString}}` : name;
  }

  getMetrics() {
    const metrics = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: {}
    };

    for (const [key, values] of this.histograms.entries()) {
      metrics.histograms[key] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.percentile(values, 0.5),
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99)
      };
    }

    return metrics;
  }

  percentile(values, p) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

export const globalMetrics = new MetricsCollector();

/**
 * Distributed tracing
 */
class Span {
  constructor(name, parentSpan = null) {
    this.name = name;
    this.spanId = crypto.randomUUID();
    this.traceId = parentSpan ? parentSpan.traceId : crypto.randomUUID();
    this.parentSpanId = parentSpan ? parentSpan.spanId : null;
    this.startTime = performance.now();
    this.endTime = null;
    this.tags = {};
    this.logs = [];
    this.status = 'ok';
  }

  setTag(key, value) {
    this.tags[key] = value;
  }

  log(message, data = {}) {
    this.logs.push({
      timestamp: performance.now(),
      message,
      ...data
    });
  }

  setStatus(status, error = null) {
    this.status = status;
    if (error) {
      this.setTag('error', true);
      this.setTag('error.message', error.message);
      this.setTag('error.stack', error.stack);
    }
  }

  finish() {
    this.endTime = performance.now();
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
      tags: this.tags,
      logs: this.logs,
      status: this.status
    };
  }
}

export function createSpan(name, parentSpan) {
  return new Span(name, parentSpan);
}

/**
 * Health check system
 */
class HealthChecker {
  constructor() {
    this.checks = new Map();
  }

  register(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      timeout: options.timeout || 5000,
      critical: options.critical !== false
    });
  }

  async check() {
    const results = {};
    let overallHealthy = true;

    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await Promise.race([
          check.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
          )
        ]);

        results[name] = {
          status: 'healthy',
          ...result
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };

        if (check.critical) {
          overallHealthy = false;
        }
      }
    }

    return {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}

export const globalHealthChecker = new HealthChecker();

/**
 * Error tracking and alerting
 */
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
  }

  trackError(error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    };

    this.errors.push(errorRecord);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log structured error
    console.error(JSON.stringify({
      level: 'ERROR',
      ...errorRecord
    }));

    return errorRecord;
  }

  getErrors(limit = 100) {
    return this.errors.slice(-limit);
  }

  getErrorStats() {
    const byType = {};
    const byEndpoint = {};

    for (const error of this.errors) {
      byType[error.name] = (byType[error.name] || 0) + 1;
      if (error.endpoint) {
        byEndpoint[error.endpoint] = (byEndpoint[error.endpoint] || 0) + 1;
      }
    }

    return {
      total: this.errors.length,
      byType,
      byEndpoint,
      recent: this.errors.slice(-10)
    };
  }

  clear() {
    this.errors = [];
  }
}

export const globalErrorTracker = new ErrorTracker();