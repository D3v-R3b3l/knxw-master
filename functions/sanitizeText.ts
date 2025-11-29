/**
 * Text sanitization utilities for server-side use
 */

/**
 * Masks PII in text content
 */
function maskPII(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Email pattern
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  
  // Phone patterns (various formats)
  const phoneRegex = /\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}\b/g;
  
  // Credit card pattern (basic)
  const ccRegex = /\b(?:\d{4}[\s-]?){3}\d{4}\b/g;
  
  // SSN pattern (US)
  const ssnRegex = /\b\d{3}-?\d{2}-?\d{4}\b/g;
  
  // IP address pattern
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  
  let sanitized = text;
  sanitized = sanitized.replace(emailRegex, '[EMAIL-REDACTED]');
  sanitized = sanitized.replace(phoneRegex, '[PHONE-REDACTED]');
  sanitized = sanitized.replace(ccRegex, '[CC-REDACTED]');
  sanitized = sanitized.replace(ssnRegex, '[SSN-REDACTED]');
  sanitized = sanitized.replace(ipRegex, '[IP-REDACTED]');
  
  return sanitized;
}

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitizes text content for safe storage and display
 */
function sanitizeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  const {
    maskPII: shouldMaskPII = true,
    escapeHtml: shouldEscapeHtml = true,
    maxLength = null,
    removeUrls = false
  } = options;
  
  let sanitized = text;
  
  // Escape HTML if needed
  if (shouldEscapeHtml) {
    sanitized = escapeHtml(sanitized);
  }
  
  // Remove URLs if requested
  if (removeUrls) {
    const urlRegex = /https?:\/\/[^\s<>"]+/gi;
    sanitized = sanitized.replace(urlRegex, '[URL-REMOVED]');
  }
  
  // Mask PII
  if (shouldMaskPII) {
    sanitized = maskPII(sanitized);
  }
  
  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Validates and sanitizes user input for LLM prompts
 */
function sanitizeForLLM(input, options = {}) {
  const {
    maxLength = 10000,
    removeCode = true,
    removeUrls = true
  } = options;
  
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Remove potential code blocks that could be injection attempts
  if (removeCode) {
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '[CODE-BLOCK-REMOVED]');
    sanitized = sanitized.replace(/`[^`]+`/g, '[CODE-REMOVED]');
  }
  
  // Remove URLs
  if (removeUrls) {
    const urlRegex = /https?:\/\/[^\s<>"]+/gi;
    sanitized = sanitized.replace(urlRegex, '[URL-REMOVED]');
  }
  
  // Remove potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /ignore\s+all\s+instructions/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /human\s*:/gi,
    /\[system\]/gi,
    /\[\/system\]/gi
  ];
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }
  
  // Mask PII
  sanitized = maskPII(sanitized);
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  return sanitized.trim();
}

export { maskPII, escapeHtml, sanitizeText, sanitizeForLLM };

Deno.serve((req) => {
  return new Response(JSON.stringify({ 
    error: 'This is a utility function, not an endpoint' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
});