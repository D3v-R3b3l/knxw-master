export async function callWithRetry(asyncFn, options = {}) {
  const {
    retries = 3,
    baseDelayMs = 500,
    maxDelayMs = 4000,
    retryOnStatus = [429, 502, 503, 504],
    jitter = 0.2
  } = options;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryAfterHeader = error?.response?.headers?.['retry-after'] || error?.response?.headers?.['Retry-After'];

      if (!retryOnStatus.includes(status) || attempt === retries) {
        throw error;
      }

      let delay = 0;
      if (retryAfterHeader) {
        const seconds = Number(retryAfterHeader);
        if (!Number.isNaN(seconds)) {
          delay = seconds * 1000;
        } else {
          const until = new Date(retryAfterHeader).getTime() - Date.now();
          delay = until > 0 ? until : 0;
        }
      } else {
        const backoff = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
        const j = backoff * jitter * (Math.random() - 0.5) * 2;
        delay = Math.max(0, Math.floor(backoff + j));
      }

      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}