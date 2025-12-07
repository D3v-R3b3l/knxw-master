import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSanitize, sanitizeHtml } from '@/components/utils/useSanitize';

describe('useSanitize', () => {
  it('should sanitize dangerous HTML', () => {
    const { result } = renderHook(() => 
      useSanitize('<script>alert("XSS")</script><p>Safe content</p>')
    );
    
    expect(result.current).not.toContain('<script>');
    expect(result.current).toContain('Safe content');
  });

  it('should preserve allowed tags', () => {
    const { result } = renderHook(() => 
      useSanitize('<p>Hello <strong>World</strong></p>')
    );
    
    expect(result.current).toContain('<strong>');
    expect(result.current).toContain('Hello');
  });
});

describe('sanitizeHtml', () => {
  it('should sanitize HTML synchronously', () => {
    const result = sanitizeHtml('<img src=x onerror="alert(1)"><p>Test</p>');
    
    expect(result).not.toContain('onerror');
    expect(result).toContain('Test');
  });
});