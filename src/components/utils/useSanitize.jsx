import { useMemo } from 'react';
import DOMPurify from 'dompurify';

/**
 * Hook to sanitize HTML content using DOMPurify
 * @param {string} dirty - The unsanitized HTML string
 * @param {object} config - Optional DOMPurify configuration
 * @returns {string} - Sanitized HTML string
 */
export function useSanitize(dirty, config = {}) {
  return useMemo(() => {
    if (typeof window === 'undefined') return dirty;
    
    const defaultConfig = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'pre', 'code'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      ALLOW_DATA_ATTR: false,
      ...config
    };
    
    return DOMPurify.sanitize(dirty, defaultConfig);
  }, [dirty, config]);
}

/**
 * Direct sanitize function (non-hook)
 */
export function sanitizeHtml(dirty, config = {}) {
  if (typeof window === 'undefined') return dirty;
  
  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'pre', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ...config
  };
  
  return DOMPurify.sanitize(dirty, defaultConfig);
}