// Enterprise Observability & Monitoring System

export class ObservabilityManager {
  constructor(base44) {
    this.base44 = base44;
    this.traces = new Map();
    this.spans = new Map();
    this.metrics = new Map();
    this.alerts = new Map();
  }

  /**
   * Distributed tracing implementation
   */
  startTrace(operationName, metadata = {}) {
    const traceId = crypto.randomUUID();
    const trace = {
      traceId,
      operationName,
      startTime: Date.now(),
      metadata,
      spans: [],
      status: 'active'
    };

    this.traces.set(traceId, trace);
    return traceId;
  }

  startSpan(traceId, spanName, metadata = {}) {
    const spanId = crypto.randomUUID();
    const span = {
      spanId,
      traceId,
      spanName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      metadata,
      tags: {},
      logs: [],
      status: 'active'
    };

    this.spans.set(spanId, span);
    
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(spanId);
    }

    return spanId;
  }

  finishSpan(spanId, status = 'success', error = null) {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    
    if (error) {
      span.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    this.logSpanEvent(spanId, 'span.finish', {
      duration: span.duration,
      status: status
    });
  }

  finishTrace(traceId, status = 'success') {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.status = status;

    const spans = trace.spans.map(spanId => this.spans.get(spanId)).filter(Boolean);
    trace.statistics = {
      totalSpans: spans.length,
      successfulSpans: spans.filter(s => s.status === 'success').length,
      failedSpans: spans.filter(s => s.status === 'error').length,
      averageSpanDuration: spans.length > 0 
        ? spans.reduce((sum, s) => sum + (s.duration || 0), 0) / spans.length 
        : 0
    };

    this.persistTrace(trace);
    
    return trace;
  }

  addSpanTag(spanId, key, value) {
    const span = this.spans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  logSpanEvent(spanId, eventName, data = {}) {
    const span = this.spans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        event: eventName,
        data: data
      });
    }
  }

  /**
   * Advanced metrics collection and aggregation
   */
  recordMetric(name, value, tags = {}, timestamp = null) {
    const metricTimestamp = timestamp || Date.now();
    const metricKey = this.generateMetricKey(name, tags);
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        name,
        tags,
        values: [],
        aggregations: {}
      });
    }

    const metric = this.metrics.get(metricKey);
    metric.values.push({
      value,
      timestamp: metricTimestamp
    });

    if (metric.values.length > 1000) {
      metric.values = metric.values.slice(-1000);
    }

    this.updateMetricAggregations(metric);
    this.checkMetricAlerts(name, value, tags);
    this.persistMetricAsync(name, value, tags, metricTimestamp);
  }

  recordCounter(name, increment = 1, tags = {}) {
    const existing = this.getLatestMetricValue(name, tags) || 0;
    this.recordMetric(name, existing + increment, tags);
  }

  recordGauge(name, value, tags = {}) {
    this.recordMetric(name, value, tags);
  }

  recordHistogram(name, value, tags = {}) {
    this.recordMetric(`${name}_value`, value, tags);
    this.recordCounter(`${name}_count`, 1, tags);
  }

  recordTimer(name, startTime, tags = {}) {
    const duration = Date.now() - startTime;
    this.recordHistogram(name, duration, tags);
    return duration;
  }

  /**
   * Intelligent alerting system
   */
  createAlert(name, condition, options = {}) {
    const alert = {
      name,
      condition,
      threshold: options.threshold,
      severity: options.severity || 'warning',
      cooldown: options.cooldown || 300000,
      channels: options.channels || ['console'],
      enabled: options.enabled !== false,
      lastTriggered: null,
      triggerCount: 0
    };

    this.alerts.set(name, alert);
    return alert;
  }

  checkMetricAlerts(metricName, value, tags) {
    for (const [alertName, alert] of this.alerts.entries()) {
      if (!alert.enabled) continue;
      
      if (alert.lastTriggered && 
          Date.now() - alert.lastTriggered < alert.cooldown) {
        continue;
      }

      if (this.evaluateAlertCondition(alert.condition, metricName, value, tags)) {
        this.triggerAlert(alertName, alert, metricName, value, tags);
      }
    }
  }

  evaluateAlertCondition(condition, metricName, value, tags) {
    try {
      if (typeof condition === 'function') {
        return condition(metricName, value, tags);
      }
      
      if (typeof condition === 'object') {
        return (
          condition.metric === metricName &&
          this.evaluateThreshold(value, condition.operator, condition.threshold)
        );
      }

      return false;
    } catch (error) {
      console.error('Error evaluating alert condition:', error);
      return false;
    }
  }

  evaluateThreshold(value, operator, threshold) {
    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  async triggerAlert(alertName, alert, metricName, value, tags) {
    alert.lastTriggered = Date.now();
    alert.triggerCount++;

    const alertEvent = {
      alertName,
      severity: alert.severity,
      metric: metricName,
      value,
      threshold: alert.threshold,
      tags,
      timestamp: new Date().toISOString(),
      triggerCount: alert.triggerCount
    };

    console.warn(`ALERT TRIGGERED: ${alertName}`, alertEvent);

    for (const channel of alert.channels) {
      await this.sendAlertNotification(channel, alertEvent);
    }

    try {
      await this.base44.entities.Alert?.create?.({
        org_id: 'system',
        rule_name: alertName,
        severity: alert.severity,
        title: `Alert: ${alertName}`,
        message: `Metric ${metricName} triggered alert with value ${value}`,
        metric_value: value,
        threshold: alert.threshold
      });
    } catch (error) {
      console.error('Failed to persist alert:', error);
    }
  }

  // Private helper methods
  generateMetricKey(name, tags) {
    const sortedTags = Object.keys(tags).sort().map(key => `${key}=${tags[key]}`).join(',');
    return `${name}|${sortedTags}`;
  }

  updateMetricAggregations(metric) {
    const values = metric.values.map(v => v.value);
    
    metric.aggregations = {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p50: this.percentile(values, 0.5),
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99)
    };
  }

  percentile(values, p) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  getLatestMetricValue(name, tags) {
    const metricKey = this.generateMetricKey(name, tags);
    const metric = this.metrics.get(metricKey);
    
    if (metric && metric.values.length > 0) {
      return metric.values[metric.values.length - 1].value;
    }
    
    return null;
  }

  async sendAlertNotification(channel, alertEvent) {
    try {
      switch (channel) {
        case 'console':
          console.error(`🚨 ALERT: ${alertEvent.alertName}`, alertEvent);
          break;
        case 'email':
          console.log('Email alert would be sent:', alertEvent);
          break;
        case 'slack':
          console.log('Slack alert would be sent:', alertEvent);
          break;
        default:
          console.log(`Unknown alert channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
    }
  }

  async persistTrace(trace) {
    try {
      await this.base44.entities.SystemEvent?.create?.({
        org_id: 'system',
        actor_type: 'system',
        actor_id: 'observability',
        event_type: 'trace_completed',
        severity: trace.status === 'success' ? 'info' : 'warning',
        payload: {
          traceId: trace.traceId,
          operationName: trace.operationName,
          duration: trace.duration,
          spanCount: trace.spans.length,
          status: trace.status,
          statistics: trace.statistics
        },
        timestamp: new Date().toISOString(),
        trace_id: trace.traceId
      });
    } catch (error) {
      console.error('Failed to persist trace:', error);
    }
  }

  async persistMetricAsync(name, value, tags, timestamp) {
    setTimeout(async () => {
      try {
        await this.base44.entities.MetricsHour?.create?.({
          timestamp: new Date(timestamp).toISOString(),
          org_id: 'system',
          metric_name: name,
          value: value,
          dimensions: tags
        });
      } catch (error) {
        console.error('Failed to persist metric:', error);
      }
    }, 0);
  }
}

export function createObservabilityManager(base44) {
  return new ObservabilityManager(base44);
}