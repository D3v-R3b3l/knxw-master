// Distributed tracing and observability utilities
import { createClient } from 'npm:@base44/sdk@0.7.1';

// Trace context structure
export class TraceContext {
  constructor(traceId = null, spanId = null, parentSpanId = null, operation = 'unknown') {
    this.traceId = traceId || this.generateTraceId();
    this.spanId = spanId || this.generateSpanId();
    this.parentSpanId = parentSpanId;
    this.operation = operation;
    this.startTime = Date.now();
    this.tags = {};
    this.logs = [];
    this.baggage = {};
  }

  generateTraceId() {
    return crypto.randomUUID().replace(/-/g, '');
  }

  generateSpanId() {
    return Math.random().toString(16).slice(2, 10);
  }

  addTag(key, value) {
    this.tags[key] = value;
    return this;
  }

  addLog(message, level = 'info', data = {}) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data
    });
    return this;
  }

  setBaggage(key, value) {
    this.baggage[key] = value;
    return this;
  }

  createChild(operation) {
    return new TraceContext(
      this.traceId,
      null, // Generate new span ID
      this.spanId,
      operation
    );
  }

  finish(error = null) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const span = {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      operation: this.operation,
      startTime: this.startTime,
      endTime: endTime,
      duration: duration,
      tags: this.tags,
      logs: this.logs,
      baggage: this.baggage,
      error: error ? {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      } : null,
      status: error ? 'error' : 'ok'
    };

    // Send to observability backend
    this.sendSpan(span);
    
    return span;
  }

  async sendSpan(span) {
    try {
      // Send to multiple observability backends
      await Promise.allSettled([
        this.sendToOpenTelemetry(span),
        this.sendToDatadog(span),
        this.logStructuredSpan(span)
      ]);
    } catch (error) {
      console.error('Failed to send trace span:', error);
    }
  }

  async sendToOpenTelemetry(span) {
    const otlpEndpoint = Deno.env.get('OTLP_ENDPOINT');
    if (!otlpEndpoint) return;

    try {
      await fetch(otlpEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('OTLP_TOKEN')}`
        },
        body: JSON.stringify({
          resourceSpans: [{
            resource: {
              attributes: [
                { key: 'service.name', value: { stringValue: 'knxw-functions' } },
                { key: 'service.version', value: { stringValue: '1.0.0' } }
              ]
            },
            instrumentationLibrarySpans: [{
              instrumentationLibrary: { name: 'knxw-tracer', version: '1.0.0' },
              spans: [this.convertToOTLPSpan(span)]
            }]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send to OpenTelemetry:', error);
    }
  }

  async sendToDatadog(span) {
    const ddEndpoint = Deno.env.get('DD_TRACE_AGENT_URL');
    if (!ddEndpoint) return;

    try {
      await fetch(`${ddEndpoint}/v0.4/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Datadog-Meta-Lang': 'javascript',
          'X-Datadog-Trace-Count': '1'
        },
        body: JSON.stringify([[this.convertToDatadogSpan(span)]])
      });
    } catch (error) {
      console.error('Failed to send to Datadog:', error);
    }
  }

  logStructuredSpan(span) {
    console.log(JSON.stringify({
      '@timestamp': new Date(span.endTime).toISOString(),
      level: span.error ? 'ERROR' : 'INFO',
      logger: 'knxw-tracer',
      trace: {
        id: span.traceId,
        span_id: span.spanId,
        parent_span_id: span.parentSpanId
      },
      operation: span.operation,
      duration_ms: span.duration,
      status: span.status,
      tags: span.tags,
      error: span.error,
      logs: span.logs
    }));
  }

  convertToOTLPSpan(span) {
    const traceIdBytes = this.hexToBytes(span.traceId.padStart(32, '0'));
    const spanIdBytes = this.hexToBytes(span.spanId.padStart(16, '0'));
    
    return {
      traceId: this.bytesToBase64(traceIdBytes),
      spanId: this.bytesToBase64(spanIdBytes),
      parentSpanId: span.parentSpanId ? this.bytesToBase64(this.hexToBytes(span.parentSpanId.padStart(16, '0'))) : undefined,
      name: span.operation,
      kind: 1,
      startTimeUnixNano: span.startTime * 1000000,
      endTimeUnixNano: span.endTime * 1000000,
      attributes: Object.entries(span.tags).map(([key, value]) => ({
        key,
        value: { stringValue: String(value) }
      })),
      status: {
        code: span.error ? 2 : 1
      }
    };
  }

  convertToDatadogSpan(span) {
    const traceIdInt = parseInt(span.traceId.slice(-16), 16);
    const spanIdInt = parseInt(span.spanId, 16);
    const parentIdInt = span.parentSpanId ? parseInt(span.parentSpanId, 16) : undefined;

    return {
      trace_id: traceIdInt,
      span_id: spanIdInt,
      parent_id: parentIdInt,
      name: span.operation,
      resource: span.operation,
      service: 'knxw-functions',
      type: 'web',
      start: span.startTime * 1000000,
      duration: span.duration * 1000000,
      error: span.error ? 1 : 0,
      meta: {
        ...span.tags,
        'error.msg': span.error?.message,
        'error.type': span.error?.type,
        'error.stack': span.error?.stack
      }
    };
  }

  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Middleware to automatically trace function calls
export function withTracing(functionHandler, operationName) {
  return async (req) => {
    const traceId = req.headers.get('x-trace-id');
    const spanId = req.headers.get('x-span-id');
    const parentSpanId = req.headers.get('x-parent-span-id');
    
    const trace = new TraceContext(traceId, spanId, parentSpanId, operationName);
    
    trace.addTag('http.method', req.method);
    trace.addTag('http.url', req.url);
    trace.addTag('function.name', operationName);
    trace.addTag('platform', 'deno-deploy');
    
    try {
      req.trace = trace;
      
      const result = await functionHandler(req);
      
      if (result instanceof Response) {
        trace.addTag('http.status_code', result.status);
        trace.addTag('response.ok', result.ok);
      }
      
      trace.addLog('Function completed successfully');
      trace.finish();
      
      if (result instanceof Response) {
        result.headers.set('x-trace-id', trace.traceId);
        result.headers.set('x-span-id', trace.spanId);
      }
      
      return result;
    } catch (error) {
      trace.addTag('error', true);
      trace.addLog('Function failed', 'error', {
        error: error.message,
        stack: error.stack
      });
      trace.finish(error);
      throw error;
    }
  };
}

// Performance monitoring utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(name) {
    this.metrics.set(name, { start: performance.now() });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
      return metric.duration;
    }
    return null;
  }

  recordMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    console.log(JSON.stringify({
      '@timestamp': new Date(timestamp).toISOString(),
      metric: name,
      value: value,
      tags: tags,
      type: 'metric'
    }));

    this.sendMetric(name, value, tags, timestamp);
  }

  async sendMetric(name, value, tags, timestamp) {
    const promises = [];

    if (Deno.env.get('DD_API_KEY')) {
      promises.push(this.sendToDatadog(name, value, tags, timestamp));
    }

    await Promise.allSettled(promises);
  }

  async sendToDatadog(name, value, tags, timestamp) {
    try {
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': Deno.env.get('DD_API_KEY')
        },
        body: JSON.stringify({
          series: [{
            metric: `knxw.${name}`,
            points: [[timestamp / 1000, value]],
            tags: Object.entries(tags).map(([k, v]) => `${k}:${v}`)
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send metric to Datadog:', error);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();