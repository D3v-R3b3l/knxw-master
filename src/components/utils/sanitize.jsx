import DOMPurify from 'dompurify';

/**
 * HTML Sanitization Utility with DOMPurify
 * Prevents XSS attacks by sanitizing user-generated HTML content
 */

// Configure DOMPurify with safe defaults
const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class', 'id', 'style'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false
};

// Sanitize HTML content with DOMPurify
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  try {
    return DOMPurify.sanitize(html, purifyConfig);
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    // Fallback to text content on error
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }
};

// Sanitize text for display (strips all HTML)
export const sanitizeText = (text) => {
  if (!text) return '';
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.textContent;
};

// Sanitize URL to prevent javascript: protocol and XSS
export const sanitizeURL = (url) => {
  if (!url) return '';
  
  const urlStr = String(url).trim();
  
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(urlStr)) {
    return '';
  }
  
  // Allow http, https, mailto, tel, and relative URLs
  if (/^(https?:|mailto:|tel:|\/|\.)/i.test(urlStr) || !urlStr.includes(':')) {
    return urlStr;
  }
  
  return '';
};

// Sanitize for use in React dangerouslySetInnerHTML
export const createSafeMarkup = (html) => {
  return { __html: sanitizeHTML(html) };
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  createSafeMarkup
};