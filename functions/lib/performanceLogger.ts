export class PerformanceLogger {
  constructor(functionName) {
    this.functionName = functionName;
    this.startTime = performance.now();
    this.metrics = {
      dbQueries: 0,
      apiCalls: 0,
      llmCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  recordDBQuery(duration, query) {
    this.metrics.dbQueries++;
    console.log(`[${this.functionName}] DB Query: ${duration}ms - ${query.substring(0, 100)}`);
  }

  recordAPICall(service, duration, status) {
    this.metrics.apiCalls++;
    console.log(`[${this.functionName}] API Call to ${service}: ${duration}ms (${status})`);
  }

  recordLLMCall(model, duration, tokens) {
    this.metrics.llmCalls++;
    console.log(`[${this.functionName}] LLM Call to ${model}: ${duration}ms (${tokens} tokens)`);
  }

  recordCacheHit(key) {
    this.metrics.cacheHits++;
    console.log(`[${this.functionName}] Cache HIT: ${key}`);
  }

  recordCacheMiss(key) {
    this.metrics.cacheMisses++;
    console.log(`[${this.functionName}] Cache MISS: ${key}`);
  }

  finish(additionalMetrics = {}) {
    const totalDuration = performance.now() - this.startTime;
    
    const finalMetrics = {
      function: this.functionName,
      duration: Math.round(totalDuration),
      timestamp: new Date().toISOString(),
      ...this.metrics,
      ...additionalMetrics
    };

    console.log(`[PERFORMANCE] ${this.functionName}:`, JSON.stringify(finalMetrics));
    
    // In production, you might want to send this to a monitoring service
    if (totalDuration > 5000) {
      console.warn(`[SLOW FUNCTION] ${this.functionName} took ${totalDuration}ms`);
    }

    return finalMetrics;
  }
}

export const withPerformanceLogging = (functionName, handler) => {
  return async (req) => {
    const logger = new PerformanceLogger(functionName);
    
    try {
      const result = await handler(req, logger);
      logger.finish({ success: true });
      return result;
    } catch (error) {
      logger.finish({ success: false, error: error.message });
      throw error;
    }
  };
};