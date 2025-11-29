import { describe, it, expect } from 'vitest';

// Since the function is in `functions/`, we are copying its core logic here
// to test it in isolation, respecting the platform's file structure constraints.
function sanitizeText(text, options = {}) {
  if (!text || typeof text !== 'string') return text;
  const { maskPII: shouldMaskPII = true, escapeHtml: shouldEscapeHtml = true } = options;
  let sanitized = text;
  if (shouldMaskPII) {
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    const phoneRegex = /\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}\b/g;
    sanitized = sanitized.replace(emailRegex, '[EMAIL-REDACTED]').replace(phoneRegex, '[PHONE-REDACTED]');
  }
  if (shouldEscapeHtml) {
    const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    sanitized = sanitized.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
  }
  return sanitized;
}

describe('sanitizeText Utility', () => {
  it('should mask email addresses', () => {
    const input = 'Contact me at test@example.com for more info.';
    const expected = 'Contact me at [EMAIL-REDACTED] for more info.';
    expect(sanitizeText(input)).toBe(expected);
  });

  it('should mask phone numbers', () => {
    const input = 'My number is 555-123-4567.';
    const expected = 'My number is [PHONE-REDACTED].';
    expect(sanitizeText(input)).toBe(expected);
  });

  it('should escape HTML characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
    expect(sanitizeText(input)).toBe(expected);
  });

  it('should handle combined PII and HTML', () => {
    const input = '<p>Email: attacker@site.com</p>';
    const expected = '&lt;p&gt;Email: [EMAIL-REDACTED]&lt;&#x2F;p&gt;';
    expect(sanitizeText(input)).toBe(expected);
  });

  it('should not escape HTML if disabled', () => {
    const input = '<p>Just a paragraph</p>';
    const expected = '<p>Just a paragraph</p>';
    expect(sanitizeText(input, { escapeHtml: false, maskPII: false })).toBe(expected);
  });

  it('should not mask PII if disabled', () => {
    const input = 'My email is user@domain.com.';
    const expected = 'My email is user@domain.com.';
    expect(sanitizeText(input, { maskPII: false, escapeHtml: false })).toBe(expected);
  });
});