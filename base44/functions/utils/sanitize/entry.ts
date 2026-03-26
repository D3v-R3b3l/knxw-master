/**
 * Sanitization utilities for preventing XSS and other injection attacks
 * Server-side implementation compatible with Deno
 */

/**
 * Masks PII in text content
 */
export function maskPII(text) {
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
export function escapeHtml(text) {
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
export function sanitizeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  const {
    maskPII: shouldMaskPII = true,
    escapeHtml: shouldEscapeHtml = true,
    maxLength = null,
    allowedTags = [],
    removeUrls = false
  } = options;
  
  let sanitized = text;
  
  // Remove or escape HTML tags
  if (allowedTags.length === 0 && shouldEscapeHtml) {
    sanitized = escapeHtml(sanitized);
  } else if (allowedTags.length > 0) {
    sanitized = sanitizeHtmlTags(sanitized, allowedTags);
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
 * Sanitizes HTML while preserving allowed tags
 */
function sanitizeHtmlTags(html, allowedTags) {
  if (!html || typeof html !== 'string') {
    return html;
  }
  
  // Simple HTML tag sanitization (not a full parser)
  // For production, consider using a proper HTML sanitizer
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  
  return html.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Remove dangerous attributes
      return sanitizeAttributes(match);
    }
    return ''; // Remove disallowed tags
  });
}

/**
 * Removes dangerous attributes from HTML tags
 */
function sanitizeAttributes(tag) {
  // Remove on* event handlers and dangerous attributes
  const dangerousAttrs = /\s+(on\w+|href\s*=\s*["']javascript:|src\s*=\s*["']data:)[^>]*/gi;
  return tag.replace(dangerousAttrs, '');
}

/**
 * Sanitizes JSON object recursively
 */
export function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value, options);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes user input for LLM prompts
 */
export function sanitizeForLLM(input, options = {}) {
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

/**
 * Validates that a string is safe for use in SQL-like operations
 */
export function validateSqlSafe(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /('|(\\')|(;)|(\/\*)|(\*\/)|(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast|convert)\b))/gi,
    /-{2,}/,
    /xp_/gi,
    /sp_/gi
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Creates a safe filename from user input
 */
export function sanitizeFilename(filename, maxLength = 255) {
  if (!filename || typeof filename !== 'string') {
    return 'untitled';
  }
  
  // Remove path separators and dangerous characters
  let safe = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  
  // Remove leading/trailing dots and spaces
  safe = safe.replace(/^[\.\s]+|[\.\s]+$/g, '');
  
  // Limit length
  if (safe.length > maxLength) {
    const ext = safe.substring(safe.lastIndexOf('.'));
    const base = safe.substring(0, maxLength - ext.length);
    safe = base + ext;
  }
  
  return safe || 'untitled';
}

export { escapeHtml as escape };