
import { toast } from "sonner";
import logger from "./logger";

// Centralized error classification and handling
export class AppError extends Error {
  constructor(message, type = 'generic', details = null, shouldNotify = true) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.shouldNotify = shouldNotify;
    this.timestamp = new Date().toISOString();
  }
}

// Error type constants
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  GENERIC: 'generic'
};

// Parse different error sources into standardized format
export function parseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  // Axios/HTTP errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      return new AppError('Authentication required', ERROR_TYPES.AUTHENTICATION, { status, data });
    } else if (status === 403) {
      return new AppError('Access denied', ERROR_TYPES.AUTHORIZATION, { status, data });
    } else if (status === 404) {
      return new AppError('Resource not found', ERROR_TYPES.NOT_FOUND, { status, data });
    } else if (status === 429) {
      return new AppError('Rate limit exceeded. Please try again later.', ERROR_TYPES.RATE_LIMIT, { status, data });
    } else if (status >= 500) {
      return new AppError('Server error occurred', ERROR_TYPES.SERVER, { status, data });
    } else if (status >= 400) {
      const message = data?.message || data?.error || `Request failed (${status})`;
      return new AppError(message, ERROR_TYPES.VALIDATION, { status, data });
    }
  }

  // Network errors
  if (error.request) {
    return new AppError('Network error - check your connection', ERROR_TYPES.NETWORK, { request: true });
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new AppError('Request timed out', ERROR_TYPES.TIMEOUT, { timeout: true });
  }

  // Generic fallback
  return new AppError(error.message || 'An unexpected error occurred', ERROR_TYPES.GENERIC, { originalError: error });
}

// Main error handler with UI feedback
export function handleApiError(error, context = null, customMessage = null) {
  const parsedError = parseError(error);
  
  // Production-safe logging
  logger.error(`${context || 'API Error'}:`, {
    message: parsedError.message,
    type: parsedError.type,
    timestamp: parsedError.timestamp
  });

  // Don't show notifications for certain error types in specific contexts
  if (!parsedError.shouldNotify) {
    return parsedError;
  }

  // Determine notification style based on error type
  const notificationConfig = getNotificationConfig(parsedError.type);
  const displayMessage = customMessage || parsedError.message;

  // Show appropriate notification
  if (notificationConfig.type === 'error') {
    toast.error(notificationConfig.title, {
      description: displayMessage,
      duration: notificationConfig.duration,
      action: notificationConfig.action
    });
  } else if (notificationConfig.type === 'warning') {
    toast.warning(notificationConfig.title, {
      description: displayMessage,
      duration: notificationConfig.duration
    });
  } else {
    toast.info(notificationConfig.title, {
      description: displayMessage,
      duration: notificationConfig.duration
    });
  }

  return parsedError;
}

// Configuration for different error types
function getNotificationConfig(errorType) {
  const configs = {
    [ERROR_TYPES.NETWORK]: {
      type: 'error',
      title: 'Connection Error',
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    },
    [ERROR_TYPES.AUTHENTICATION]: {
      type: 'error',
      title: 'Authentication Required',
      duration: 7000,
      action: {
        label: 'Sign In',
        onClick: () => window.location.href = '/login'
      }
    },
    [ERROR_TYPES.AUTHORIZATION]: {
      type: 'warning',
      title: 'Access Denied',
      duration: 5000
    },
    [ERROR_TYPES.VALIDATION]: {
      type: 'warning',
      title: 'Validation Error',
      duration: 4000
    },
    [ERROR_TYPES.NOT_FOUND]: {
      type: 'info',
      title: 'Not Found',
      duration: 4000
    },
    [ERROR_TYPES.RATE_LIMIT]: {
      type: 'warning',
      title: 'Rate Limited',
      duration: 6000
    },
    [ERROR_TYPES.SERVER]: {
      type: 'error',
      title: 'Server Error',
      duration: 5000
    },
    [ERROR_TYPES.TIMEOUT]: {
      type: 'warning',
      title: 'Request Timeout',
      duration: 4000
    },
    [ERROR_TYPES.GENERIC]: {
      type: 'error',
      title: 'Error',
      duration: 4000
    }
  };

  return configs[errorType] || configs[ERROR_TYPES.GENERIC];
}

// Retry utility with exponential backoff
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = (error) => {
      const parsed = parseError(error);
      return [ERROR_TYPES.NETWORK, ERROR_TYPES.TIMEOUT, ERROR_TYPES.SERVER].includes(parsed.type);
    }
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = Math.random() * 0.1 * delay;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

// Hook for error handling in components
export function useErrorHandler() {
  return {
    handleError: handleApiError,
    parseError,
    AppError,
    ERROR_TYPES,
    withRetry
  };
}
