/**
 * Text processing and sanitization utilities
 * Centralized to eliminate duplication across the codebase
 */

/**
 * Sanitize text by removing/escaping potentially harmful characters
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncateText(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Convert string to title case
 * @param {string} str - Input string
 * @returns {string} Title cased string
 */
export function toTitleCase(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Strip HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
}