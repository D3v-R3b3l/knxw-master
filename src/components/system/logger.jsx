
/**
 * Centralized Logging Utility
 * Provides conditional logging based on environment
 * In production, only errors are logged
 */

const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isProd = !isDev;

// Logger levels
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level based on environment
const currentLevel = isDev ? LogLevel.DEBUG : LogLevel.ERROR;

const logger = {
  debug: (...args) => {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  },
  
  info: (...args) => {
    if (currentLevel <= LogLevel.INFO) {
      console.info('[INFO]', new Date().toISOString(), ...args);
    }
  },
  
  warn: (...args) => {
    if (currentLevel <= LogLevel.WARN) {
      console.warn('[WARN]', new Date().toISOString(), ...args);
    }
  },
  
  error: (...args) => {
    // Always log errors
    console.error('[ERROR]', new Date().toISOString(), ...args);
    
    // In production, send to error monitoring service
    if (isProd && typeof window !== 'undefined' && window.Sentry) {
      const errorObj = args.find(arg => arg instanceof Error);
      if (errorObj) {
        window.Sentry.captureException(errorObj, {
          extra: {
            additionalData: args.filter(arg => !(arg instanceof Error))
          }
        });
      } else {
        window.Sentry.captureMessage(args.join(' '), 'error');
      }
    }
  },
  
  // Structured logging for better analysis
  logEvent: (eventName, data = {}) => {
    if (isDev) {
      console.log('[EVENT]', eventName, data);
    }
  }
};

export default logger;
