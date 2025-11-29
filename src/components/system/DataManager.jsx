import { handleApiError, handleApiSuccess } from './errorHandler';

// Advanced caching system with real-time invalidation
class DataManager {
  constructor() {
    this.cache = new Map();
    this.subscriptions = new Map();
    this.refreshTimers = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.baseRetryDelay = 1000;
  }

  // Generate cache key from entity and params
  generateCacheKey(entity, method = 'list', params = {}) {
    return `${entity}_${method}_${JSON.stringify(params)}`;
  }

  // Set cache with TTL
  setCache(key, data, ttl = 30000) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
      isStale: false
    };
    this.cache.set(key, entry);
    
    // Set expiry timer
    if (this.refreshTimers.has(key)) {
      clearTimeout(this.refreshTimers.get(key));
    }
    
    this.refreshTimers.set(key, setTimeout(() => {
      if (this.cache.has(key)) {
        this.cache.get(key).isStale = true;
        this.notifySubscribers(key, { stale: true });
      }
    }, ttl));
  }

  // Get from cache
  getCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 2) {
      // Data is too old, remove it
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  // Subscribe to data changes
  subscribe(key, callback) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(key);
        }
      }
    };
  }

  // Notify subscribers of data changes
  notifySubscribers(key, data) {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in data subscription callback:', error);
        }
      });
    }
  }

  // Exponential backoff retry
  async withRetry(key, operation, context = '') {
    const retryCount = this.retryAttempts.get(key) || 0;
    
    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(key);
      return result;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = this.baseRetryDelay * Math.pow(2, retryCount);
        this.retryAttempts.set(key, retryCount + 1);
        
        console.warn(`Retrying ${context} (attempt ${retryCount + 1}/${this.maxRetries}) in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(key, operation, context);
      } else {
        // Max retries exceeded
        this.retryAttempts.delete(key);
        handleApiError(error, `Failed to ${context} after ${this.maxRetries} attempts`);
        throw error;
      }
    }
  }

  // Intelligent data fetching with caching and real-time updates
  async fetchData(entity, method = 'list', params = {}, options = {}) {
    const key = this.generateCacheKey(entity, method, params);
    const {
      ttl = 30000,
      forceRefresh = false,
      showSuccessToast = false,
      backgroundRefresh = true
    } = options;

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCache(key);
      if (cached && !cached.isStale) {
        return cached.data;
      }
      
      // If stale but exists, return stale data and refresh in background
      if (cached && cached.isStale && backgroundRefresh) {
        this.refreshDataInBackground(entity, method, params, key, ttl, showSuccessToast);
        return cached.data;
      }
    }

    // Fetch fresh data
    return this.withRetry(key, async () => {
      let data;
      
      if (method === 'list') {
        const { orderBy = '-created_date', limit = 100 } = params;
        data = await entity.list(orderBy, limit);
      } else if (method === 'filter') {
        const { filter = {}, orderBy = null, limit = 100 } = params;
        data = await entity.filter(filter, orderBy, limit);
      } else if (method === 'get') {
        const { id } = params;
        data = await entity.get(id);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      // Cache the result
      this.setCache(key, data, ttl);
      
      // Notify subscribers
      this.notifySubscribers(key, data);
      
      if (showSuccessToast) {
        handleApiSuccess('Data refreshed successfully');
      }
      
      return data;
    }, `fetch ${entity.name || 'data'}`);
  }

  // Background refresh without blocking UI
  async refreshDataInBackground(entity, method, params, key, ttl, showSuccessToast) {
    try {
      const data = await this.withRetry(key, async () => {
        if (method === 'list') {
          const { orderBy = '-created_date', limit = 100 } = params;
          return await entity.list(orderBy, limit);
        } else if (method === 'filter') {
          const { filter = {}, orderBy = null, limit = 100 } = params;
          return await entity.filter(filter, orderBy, limit);
        }
      }, `background refresh ${entity.name || 'data'}`);

      this.setCache(key, data, ttl);
      this.notifySubscribers(key, data);
      
      if (showSuccessToast) {
        handleApiSuccess('Data refreshed in background');
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
      // Don't show error toast for background refreshes
    }
  }

  // Force refresh data
  async refreshData(entity, method = 'list', params = {}, showToast = true) {
    return this.fetchData(entity, method, params, { 
      forceRefresh: true, 
      showSuccessToast: showToast 
    });
  }

  // Clear cache
  clearCache(pattern = null) {
    if (pattern) {
      // Clear specific pattern
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          if (this.refreshTimers.has(key)) {
            clearTimeout(this.refreshTimers.get(key));
            this.refreshTimers.delete(key);
          }
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
      this.refreshTimers.forEach(timer => clearTimeout(timer));
      this.refreshTimers.clear();
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      totalEntries: this.cache.size,
      staleEntries: Array.from(this.cache.values()).filter(entry => entry.isStale).length,
      activeSubscriptions: this.subscriptions.size,
      retryingOperations: this.retryAttempts.size
    };
  }
}

// Global instance
export const dataManager = new DataManager();

// React hook for using the data manager
export function useDataManager() {
  return dataManager;
}