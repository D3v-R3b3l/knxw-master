import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

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
      // Filter out non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && error.message && error.message.includes('ResizeObserver')) {
          return null; // Don't send ResizeObserver errors
        }
      }
      return event;
    },
  });
};

export const logError = (error, context = {}) => {
  console.error('Error:', error, context);
  
  if (import.meta.env.MODE === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

export const logMessage = (message, level = 'info', context = {}) => {
  console[level](message, context);
  
  if (import.meta.env.MODE === 'production') {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
};