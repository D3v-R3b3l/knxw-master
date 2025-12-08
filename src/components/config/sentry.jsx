// Graceful error tracking - works without Sentry
export const initSentry = () => {
  // Sentry initialization will be handled in App.js if needed
  console.log('Error tracking initialized');
};

export const logError = (error, context = {}) => {
  console.error('Error:', error, context);
};

export const logMessage = (message, level = 'info', context = {}) => {
  console[level](message, context);
};