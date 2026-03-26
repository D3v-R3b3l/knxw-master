// Performance metrics collection and budget enforcement
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import perfConfig from '../../config/perf.json' assert { type: 'json' };

/**
 * Get performance budgets from configuration
 */
export function getPerfBudgets() {
  return perfConfig;
}

/**
 * Record route timing metrics to MetricsHour entity
 */
export async function recordRouteTiming(base44, route, durationMs, kind = 'api') {
  try {
    const { MetricsHour } = await import('@/entities/MetricsHour');
    
    const now = new Date();
    const hourTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    
    // Create or update metrics for this hour
    await MetricsHour.create({
      timestamp: hourTimestamp.toISOString(),
      org_id: 'system', // Will be set by RLS
      metric_name: `${kind}_latency_ms`,
      value: durationMs,
      dimensions: {
        route,
        kind,
        p95_budget: getPerfBudgets().backend.p95_ms[kind] || 500
      }
    });

    // Check if we're exceeding budgets
    const budget = getPerfBudgets().backend.p95_ms[kind];
    if (budget && durationMs > budget) {
      console.warn(`Performance budget exceeded: ${route} took ${durationMs}ms (budget: ${budget}ms)`);
      
      // Record budget violation
      await recordBudgetViolation(base44, route, durationMs, budget, kind);
    }
    
  } catch (error) {
    console.error('Failed to record route timing:', error);
  }
}

/**
 * Record performance budget violations
 */
async function recordBudgetViolation(base44, route, actualMs, budgetMs, kind) {
  try {
    const { SystemEvent } = await import('@/entities/SystemEvent');
    
    await SystemEvent.create({
      org_id: 'system',
      actor_type: 'system',
      actor_id: 'performance_monitor',
      event_type: 'error',
      severity: actualMs > budgetMs * 2 ? 'critical' : 'warning',
      payload: {
        type: 'performance_budget_violation',
        route,
        actual_ms: actualMs,
        budget_ms: budgetMs,
        kind,
        violation_ratio: actualMs / budgetMs
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to record budget violation:', error);
  }
}

/**
 * Middleware to automatically record request timings
 */
export function withPerformanceTracking(handler, routeName, kind = 'api') {
  return async (req) => {
    const startTime = performance.now();
    
    try {
      const base44 = createClientFromRequest(req);
      const response = await handler(req);
      
      const duration = performance.now() - startTime;
      
      // Record timing asynchronously
      setTimeout(() => {
        recordRouteTiming(base44, routeName, duration, kind);
      }, 0);
      
      return response;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Still record timing even on error
      try {
        const base44 = createClientFromRequest(req);
        setTimeout(() => {
          recordRouteTiming(base44, routeName, duration, kind);
        }, 0);
      } catch (metricsError) {
        console.error('Failed to record error timing:', metricsError);
      }
      
      throw error;
    }
  };
}

/**
 * Get current performance statistics
 */
export async function getPerformanceStats(base44, hours = 24) {
  try {
    const { MetricsHour } = await import('@/entities/MetricsHour');
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const metrics = await MetricsHour.filter(
      { 
        timestamp: { $gte: since.toISOString() },
        metric_name: { $regex: '_latency_ms$' }
      },
      '-timestamp',
      1000
    );
    
    // Calculate statistics by route and kind
    const stats = {};
    
    metrics.forEach(metric => {
      const route = metric.dimensions?.route || 'unknown';
      const kind = metric.dimensions?.kind || 'unknown';
      const key = `${kind}:${route}`;
      
      if (!stats[key]) {
        stats[key] = {
          route,
          kind,
          values: [],
          budget: metric.dimensions?.p95_budget
        };
      }
      
      stats[key].values.push(metric.value);
    });
    
    // Calculate percentiles
    Object.keys(stats).forEach(key => {
      const values = stats[key].values.sort((a, b) => a - b);
      const len = values.length;
      
      if (len > 0) {
        stats[key].p50 = values[Math.floor(len * 0.5)];
        stats[key].p95 = values[Math.floor(len * 0.95)];
        stats[key].p99 = values[Math.floor(len * 0.99)];
        stats[key].avg = values.reduce((sum, v) => sum + v, 0) / len;
        stats[key].count = len;
      }
      
      delete stats[key].values; // Remove raw values from response
    });
    
    return stats;
    
  } catch (error) {
    console.error('Failed to get performance stats:', error);
    return {};
  }
}