/**
 * knXw JavaScript SDK
 * 
 * Official JavaScript/TypeScript client for the knXw Psychographic Intelligence API.
 * Works in both browser and Node.js environments.
 * 
 * @example
 * ```javascript
 * import { KnxwClient } from '@/components/sdk/KnxwSDK';
 * 
 * const knxw = new KnxwClient({
 *   apiKey: 'knxw_your_api_key_here',
 *   baseUrl: 'https://your-app.base44.com/functions'
 * });
 * 
 * // Track an event
 * await knxw.events.track({
 *   user_id: 'user_123',
 *   event_type: 'page_view',
 *   event_payload: {
 *     url: window.location.href,
 *     referrer: document.referrer
 *   }
 * });
 * 
 * // Get user profile
 * const profile = await knxw.profiles.get('user_123');
 * console.log('User motivations:', profile.motivations);
 * ```
 */

class KnxwError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'KnxwError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

class KnxwClient {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get one from the knXw Developer Portal.');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://your-app.base44.com/functions';
    this.timeout = config.timeout || 30000; // 30 second default timeout
    this.retries = config.retries !== undefined ? config.retries : 3;
    this.debug = config.debug || false;

    // Initialize API modules
    this.events = new EventsAPI(this);
    this.profiles = new ProfilesAPI(this);
    this.insights = new InsightsAPI(this);
    this.recommendations = new RecommendationsAPI(this);
    this.usage = new UsageAPI(this);
    this.webhooks = new WebhooksAPI(this);
  }

  /**
   * Make an HTTP request to the knXw API
   * @private
   */
  async _request(method, path, data = null, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'knXw-JS-SDK/1.0.0',
      ...options.headers
    };

    const requestOptions = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    if (this.debug) {
      console.log(`[knXw SDK] ${method} ${url}`, data);
    }

    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          throw new KnxwError(
            responseData.error || `Request failed with status ${response.status}`,
            response.status,
            responseData
          );
        }

        if (this.debug) {
          console.log(`[knXw SDK] Response:`, responseData);
        }

        return responseData;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) or if it's the last attempt
        if (error.statusCode && error.statusCode < 500) {
          throw error;
        }

        if (attempt === this.retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

/**
 * Events API - Track user behavior
 */
class EventsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Track a behavioral event
   * 
   * @param {Object} event - Event data
   * @param {string} event.user_id - User identifier
   * @param {string} event.event_type - Type of event (page_view, click, etc.)
   * @param {Object} [event.event_payload] - Additional event data
   * @param {string} [event.session_id] - Browser session ID
   * @param {string} [event.timestamp] - Event timestamp (ISO 8601)
   * @returns {Promise<Object>} Event ingestion response
   * 
   * @example
   * await knxw.events.track({
   *   user_id: 'user_123',
   *   event_type: 'page_view',
   *   event_payload: {
   *     url: '/pricing',
   *     referrer: '/home'
   *   }
   * });
   */
  async track(event) {
    return this.client._request('POST', '/api/v1/events', event);
  }

  /**
   * Convenience method for tracking page views
   */
  async trackPageView(userId, url, options = {}) {
    return this.track({
      user_id: userId,
      event_type: 'page_view',
      event_payload: {
        url,
        referrer: options.referrer,
        duration: options.duration,
        ...options.payload
      },
      session_id: options.session_id,
      timestamp: options.timestamp
    });
  }

  /**
   * Convenience method for tracking clicks
   */
  async trackClick(userId, element, options = {}) {
    return this.track({
      user_id: userId,
      event_type: 'click',
      event_payload: {
        element,
        coordinates: options.coordinates,
        ...options.payload
      },
      session_id: options.session_id,
      timestamp: options.timestamp
    });
  }
}

/**
 * Profiles API - Access psychographic profiles
 */
class ProfilesAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get a user's psychographic profile
   * 
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} User profile with motivations, cognitive style, etc.
   * 
   * @example
   * const profile = await knxw.profiles.get('user_123');
   * console.log('Motivations:', profile.motivations);
   * console.log('Cognitive style:', profile.cognitive_style);
   */
  async get(userId) {
    const response = await this.client._request('GET', `/api/v1/profiles/${encodeURIComponent(userId)}`);
    return response.data;
  }
}

/**
 * Insights API - Query AI-powered insights
 */
class InsightsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Query insights for users
   * 
   * @param {Object} [options] - Query options
   * @param {string[]} [options.user_ids] - Filter by user IDs
   * @param {string} [options.insight_type] - Filter by insight type
   * @param {number} [options.min_confidence] - Minimum confidence threshold (0-1)
   * @param {number} [options.limit] - Max results to return
   * @returns {Promise<Array>} List of insights
   * 
   * @example
   * const insights = await knxw.insights.query({
   *   user_ids: ['user_123'],
   *   insight_type: 'engagement_optimization',
   *   min_confidence: 0.8
   * });
   */
  async query(options = {}) {
    const response = await this.client._request('POST', '/api/v1/insights/query', options);
    return response.data;
  }
}

/**
 * Recommendations API - Get personalized content recommendations
 */
class RecommendationsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get recommendations for a user
   * 
   * @param {string} userId - User identifier
   * @param {Object} [options] - Recommendation options
   * @param {string[]} [options.content_types] - Filter by content types
   * @param {number} [options.limit] - Number of recommendations
   * @param {boolean} [options.refresh] - Force regeneration
   * @returns {Promise<Array>} List of recommendations
   * 
   * @example
   * const recs = await knxw.recommendations.get('user_123', {
   *   content_types: ['feature_guide'],
   *   limit: 3
   * });
   */
  async get(userId, options = {}) {
    const response = await this.client._request('POST', '/api/v1/recommendations', {
      user_id: userId,
      ...options
    });
    return response.data;
  }
}

/**
 * Usage API - Monitor API usage
 */
class UsageAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get usage statistics
   * 
   * @param {Object} [options] - Query options
   * @param {number} [options.days] - Number of days to query (1-90)
   * @returns {Promise<Object>} Usage statistics
   * 
   * @example
   * const usage = await knxw.usage.get({ days: 7 });
   * console.log('Total requests:', usage.totals.requests);
   */
  async get(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.days) queryParams.append('days', options.days);
    
    const path = `/api/v1/usage${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.client._request('GET', path);
    return response.data;
  }
}

/**
 * Webhooks API - Manage webhook endpoints
 */
class WebhooksAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * List all webhook endpoints
   */
  async list() {
    const response = await this.client._request('GET', '/api/v1/webhooks/endpoints');
    return response.data;
  }

  /**
   * Create a new webhook endpoint
   * 
   * @param {Object} webhook - Webhook configuration
   * @param {string} webhook.name - Webhook name
   * @param {string} webhook.url - HTTPS URL to receive events
   * @param {string[]} webhook.events - Event types to subscribe to
   * @param {string} [webhook.secret] - Optional webhook secret
   * 
   * @example
   * const webhook = await knxw.webhooks.create({
   *   name: 'Production Webhook',
   *   url: 'https://example.com/webhooks/knxw',
   *   events: ['profile.updated', 'insight.created']
   * });
   */
  async create(webhook) {
    const response = await this.client._request('POST', '/api/v1/webhooks/endpoints', webhook);
    return response.data;
  }

  /**
   * Update a webhook endpoint
   */
  async update(webhookId, updates) {
    const response = await this.client._request('PUT', `/api/v1/webhooks/endpoints/${webhookId}`, updates);
    return response.data;
  }

  /**
   * Delete a webhook endpoint
   */
  async delete(webhookId) {
    return this.client._request('DELETE', `/api/v1/webhooks/endpoints/${webhookId}`);
  }
}

// Export for use in other modules
export { KnxwClient, KnxwError };

// For browser environments, attach to window
if (typeof window !== 'undefined') {
  window.KnxwClient = KnxwClient;
  window.KnxwError = KnxwError;
}