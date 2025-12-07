// Graceful Sentry initialization - works even if not configured
let Sentry = null;

try {
  Sentry = require("@sentry/react");
} catch (e) {
  console.warn('Sentry not available');
}

export const initSentry = () => {
  if (!Sentry) return;
  
  const dsn = import.meta?.env?.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.message && error.message.includes('ResizeObserver')) {
            return null;
          }
        }
        return event;
      },
    });
  } catch (error) {
    console.warn('Failed to initialize Sentry:', error);
  }
};

export const logError = (error, context = {}) => {
  console.error('Error:', error, context);
  
  if (Sentry && import.meta?.env?.MODE === 'production') {
    try {
      Sentry.captureException(error, { extra: context });
    } catch (e) {
      console.warn('Failed to log to Sentry:', e);
    }
  }
};

export const logMessage = (message, level = 'info', context = {}) => {
  console[level](message, context);
  
  if (Sentry && import.meta?.env?.MODE === 'production') {
    try {
      Sentry.captureMessage(message, { level, extra: context });
    } catch (e) {
      console.warn('Failed to log to Sentry:', e);
    }
  }
};