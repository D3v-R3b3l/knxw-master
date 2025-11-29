// Enterprise Performance Optimization Library

export class PerformanceManager {
  constructor(base44) {
    this.base44 = base44;
    this.cache = new Map();
    this.metrics = new Map();
  }

  /**
   * Intelligent caching with TTL and memory management
   */
  async getCached(key, fetchFunction, options = {}) {
    const {
      ttl = 300000,
      maxSize = 1000,
      tags = [],
      refreshThreshold = 0.8
    } = options;

    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      if (now - cached.timestamp > ttl * refreshThreshold) {
        this.refreshCacheBackground(key, fetchFunction, options);
      }
      return cached.data;
    }

    const startTime = performance.now();
    try {
      const data = await fetchFunction();
      const endTime = performance.now();
      
      this.cache.set(key, {
        data,
        timestamp: now,
        tags,
        fetchTime: endTime - startTime
      });

      this.evictExpiredEntries();
      if (this.cache.size > maxSize) {
        this.evictLRUEntries(maxSize);
      }

      this.recordCacheMetric(key, 'miss', endTime - startTime);
      
      return data;
    } catch (error) {
      if (cached && now - cached.timestamp < ttl * 2) {
        this.recordCacheMetric(key, 'stale', 0);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Batch operations for improved database efficiency
   */
  async batchOperation(operations, options = {}) {
    const {
      batchSize = 100,
      concurrency = 5,
      retryOnFailure = true
    } = options;

    const results = [];
    const batches = this.chunkArray(operations, batchSize);

    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      
      const batchPromises = concurrentBatches.map(async (batch, index) => {
        const startTime = performance.now();
        try {
          const batchResults = await Promise.all(batch.map(op => this.executeOperation(op)));
          const endTime = performance.now();
          
          this.recordMetric('batch_operation', {
            batchIndex: i + index,
            size: batch.length,
            duration: endTime - startTime,
            status: 'success'
          });
          
          return batchResults;
        } catch (error) {
          if (retryOnFailure) {
            console.warn(`Batch ${i + index} failed, retrying...`, error);
            const retryResults = await this.retryBatch(batch);
            return retryResults;
          }
          throw error;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.flatMap(result => 
        result.status === 'fulfilled' ? result.value : []
      ));
    }

    return results;
  }

  /**
   * Database query optimization
   */
  async optimizedQuery(entityName, filters, options = {}) {
    const {
      indexes = [],
      projection = null,
      sort = null,
      limit = null,
      useCache = true,
      cacheTTL = 300000
    } = options;

    const cacheKey = this.generateQueryCacheKey(entityName, filters, options);
    
    if (useCache) {
      return await this.getCached(cacheKey, async () => {
        return await this.executeOptimizedQuery(entityName, filters, options);
      }, { ttl: cacheTTL });
    }

    return await this.executeOptimizedQuery(entityName, filters, options);
  }

  /**
   * Performance monitoring and alerting
   */
  recordMetric(name, data) {
    const timestamp = new Date().toISOString();
    const metric = {
      name,
      timestamp,
      ...data
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    if (this.metrics.get(name).length > 1000) {
      this.metrics.get(name).shift();
    }

    this.persistMetricAsync(metric);
    this.checkPerformanceThresholds(name, data);
  }

  // Private helper methods
  async refreshCacheBackground(key, fetchFunction, options) {
    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        tags: options.tags || [],
        fetchTime: 0
      });
      this.recordCacheMetric(key, 'background_refresh', 0);
    } catch (error) {
      console.warn(`Background cache refresh failed for key: ${key}`, error);
    }
  }

  evictExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > 600000) {
        this.cache.delete(key);
      }
    }
  }

  evictLRUEntries(maxSize) {
    if (this.cache.size <= maxSize) return;

    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = entries.length - maxSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  recordCacheMetric(key, type, duration) {
    this.recordMetric('cache_performance', {
      key,
      type,
      duration,
      cacheSize: this.cache.size
    });
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async executeOperation(operation) {
    if (typeof operation === 'function') {
      return await operation();
    }
    
    if (operation.type === 'create') {
      return await this.base44.entities[operation.entity].create(operation.data);
    } else if (operation.type === 'update') {
      return await this.base44.entities[operation.entity].update(operation.id, operation.data);
    }
    
    throw new Error(`Unknown operation type: ${operation.type}`);
  }

  async retryBatch(batch) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      
      try {
        return await Promise.all(batch.map(op => this.executeOperation(op)));
      } catch (error) {
        if (attempt === 3) throw error;
        console.warn(`Retry attempt ${attempt} failed`, error);
      }
    }
  }

  generateQueryCacheKey(entityName, filters, options) {
    const keyData = { entityName, filters, options };
    return `query:${btoa(JSON.stringify(keyData))}`;
  }

  async executeOptimizedQuery(entityName, filters, options) {
    const entity = this.base44.entities[entityName];
    if (!entity) {
      throw new Error(`Entity ${entityName} not found`);
    }

    const { sort, limit } = options;
    
    if (sort && limit) {
      return await entity.filter(filters, sort, limit);
    } else if (limit) {
      return await entity.list(null, limit);
    } else {
      return await entity.filter(filters);
    }
  }

  async persistMetricAsync(metric) {
    try {
      setTimeout(async () => {
        await this.base44.entities.MetricsHour?.create?.({
          timestamp: metric.timestamp,
          org_id: 'system',
          metric_name: metric.name,
          value: metric.duration || 1,
          dimensions: metric
        });
      }, 0);
    } catch (error) {
      console.error('Failed to persist metric:', error);
    }
  }

  checkPerformanceThresholds(name, data) {
    const thresholds = {
      'api_response_time': 5000,
      'database_query_time': 2000,
      'cache_miss_rate': 0.2
    };

    const threshold = thresholds[name];
    if (threshold && data.duration > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${data.duration}ms > ${threshold}ms`);
      this.triggerPerformanceAlert(name, data, threshold);
    }
  }

  async triggerPerformanceAlert(metricName, data, threshold) {
    try {
      await this.base44.entities.Alert?.create?.({
        org_id: 'system',
        rule_name: `performance_${metricName}`,
        severity: 'warning',
        title: `Performance threshold exceeded: ${metricName}`,
        message: `Metric ${metricName} exceeded threshold: ${data.duration}ms > ${threshold}ms`,
        metric_value: data.duration,
        threshold: threshold
      });
    } catch (error) {
      console.error('Failed to create performance alert:', error);
    }
  }

  getPerformanceStats() {
    const stats = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const durations = metrics.map(m => m.duration).filter(d => d != null);
      
      if (durations.length > 0) {
        stats[name] = {
          count: metrics.length,
          avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          p95Duration: this.percentile(durations, 0.95)
        };
      }
    }
    
    return stats;
  }

  percentile(arr, p) {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}

export function createPerformanceManager(base44) {
  return new PerformanceManager(base44);
}