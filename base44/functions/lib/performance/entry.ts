/**
 * Performance monitoring and optimization utilities
 */

/**
 * Performance metrics tracker
 */
class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }

  start(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  end(name) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return 0;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    return metric.duration;
  }

  get(name) {
    return this.metrics.get(name);
  }

  getAll() {
    const result = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = metric.duration || (performance.now() - metric.startTime);
    }
    return result;
  }

  clear() {
    this.metrics.clear();
  }
}

export function createPerformanceTracker() {
  return new PerformanceTracker();
}

/**
 * Measure function execution time
 */
export async function measureAsync(fn, name) {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms (failed)`);
    throw error;
  }
}

/**
 * Batch operations to reduce overhead
 */
export async function batchExecute(items, batchSize, executor) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(executor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Parallel execution with concurrency limit
 */
export async function parallelLimit(items, limit, executor) {
  const results = [];
  const executing = [];
  
  for (const item of items) {
    const promise = Promise.resolve().then(() => executor(item));
    results.push(promise);
    
    if (limit <= items.length) {
      const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

/**
 * Stream processing for large datasets
 */
export async function* streamProcess(items, processor) {
  for (const item of items) {
    yield await processor(item);
  }
}

/**
 * Compression utilities
 */
export async function compressResponse(data) {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  
  const encoder = new TextEncoder();
  const input = encoder.encode(data);
  
  // Use built-in compression if available
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([input]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const chunks = [];
    
    for await (const chunk of compressedStream) {
      chunks.push(chunk);
    }
    
    return new Blob(chunks);
  }
  
  return input;
}

/**
 * Response optimization
 */
export function optimizeResponse(data, options = {}) {
  const {
    compress = true,
    cacheControl = 'no-cache',
    etag = null
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': cacheControl
  };

  if (etag) {
    headers['ETag'] = etag;
  }

  if (compress && typeof data === 'string' && data.length > 1024) {
    headers['Content-Encoding'] = 'gzip';
  }

  return { headers, data };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
    const usage = Deno.memoryUsage();
    return {
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      formatted: {
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`
      }
    };
  }
  
  return { available: false };
}

/**
 * Request timing middleware helper
 */
export function createTimingHeader(metrics) {
  // Server-Timing header format
  const timings = Object.entries(metrics)
    .map(([name, duration]) => `${name};dur=${duration.toFixed(2)}`)
    .join(', ');
  
  return { 'Server-Timing': timings };
}

/**
 * Lazy initialization pattern
 */
export function lazy(initializer) {
  let instance = null;
  let promise = null;
  
  return async function() {
    if (instance) return instance;
    
    if (!promise) {
      promise = initializer().then(result => {
        instance = result;
        promise = null;
        return result;
      });
    }
    
    return promise;
  };
}

/**
 * Resource pooling
 */
class ResourcePool {
  constructor(factory, options = {}) {
    this.factory = factory;
    this.minSize = options.minSize || 2;
    this.maxSize = options.maxSize || 10;
    this.idleTimeout = options.idleTimeout || 300000;
    this.available = [];
    this.inUse = new Set();
  }

  async acquire() {
    // Try to get from available pool
    if (this.available.length > 0) {
      const resource = this.available.pop();
      this.inUse.add(resource);
      return resource;
    }

    // Create new if under max size
    if (this.inUse.size < this.maxSize) {
      const resource = await this.factory();
      this.inUse.add(resource);
      return resource;
    }

    // Wait for a resource to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.available.length > 0) {
          clearInterval(checkInterval);
          const resource = this.available.pop();
          this.inUse.add(resource);
          resolve(resource);
        }
      }, 100);
    });
  }

  release(resource) {
    this.inUse.delete(resource);
    this.available.push({
      resource,
      lastUsed: Date.now()
    });

    // Trim pool if over min size
    if (this.available.length > this.minSize) {
      const now = Date.now();
      this.available = this.available.filter(item => 
        now - item.lastUsed < this.idleTimeout
      );
    }
  }

  async execute(fn) {
    const resource = await this.acquire();
    try {
      return await fn(resource);
    } finally {
      this.release(resource);
    }
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

export function createPool(factory, options) {
  return new ResourcePool(factory, options);
}