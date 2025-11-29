import React, { createContext, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import logger from '../system/logger';

const SecurityContext = createContext(null);

// Enhanced patterns with reduced false positives
const SECURITY_PATTERNS = {
  xss: [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ],
  sqli: [
    /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b.*\bwhere\b)/gi,
    /(\bdrop\b.*\btable\b|\bdelete\b.*\bfrom\b)/gi,
    /(\binsert\b.*\binto\b.*\bvalues\b)/gi,
    /--\s*$/gm,
    /;.*\bdrop\b/gi
  ],
  csrf: [
    /\bauthenticity_token\b/gi
  ],
  pathTraversal: [
    /\.\.[\/\\]/g,
    /%2e%2e[\/\\]/gi
  ]
};

// Rate limiting for event submissions
const RATE_LIMIT = {
  maxEvents: 10,
  windowMs: 60000 // 1 minute
};

export function SecurityProvider({ children }) {
  const eventCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());

  const detectThreat = (data, type = 'unknown') => {
    if (!data || typeof data !== 'string') return null;

    // Reset rate limit counter if window expired
    if (Date.now() - lastResetRef.current > RATE_LIMIT.windowMs) {
      eventCountRef.current = 0;
      lastResetRef.current = Date.now();
    }

    // Check rate limit
    if (eventCountRef.current >= RATE_LIMIT.maxEvents) {
      logger.warn('Security event rate limit exceeded, dropping event');
      return null;
    }

    for (const [threatType, patterns] of Object.entries(SECURITY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(data)) {
          // Additional validation to reduce false positives
          if (threatType === 'xss' && data.length < 50 && !data.includes('script')) {
            continue; // Likely a false positive for short strings
          }
          
          if (threatType === 'sqli' && !data.includes('select') && !data.includes('drop')) {
            continue; // Likely not SQL injection
          }

          eventCountRef.current++;
          return {
            type: threatType,
            pattern: pattern.source,
            data: data.substring(0, 100), // Limit logged data
            timestamp: new Date().toISOString(),
            context: type
          };
        }
      }
    }

    return null;
  };

  const logSecurityEvent = async (threat) => {
    if (!threat) return;

    try {
      logger.warn('Security threat detected:', threat);
      
      // Log to backend (non-blocking)
      base44.functions.invoke('logSecurityEvent', {
        threat_type: threat.type,
        pattern: threat.pattern,
        context: threat.context,
        timestamp: threat.timestamp
      }).catch(err => {
        logger.error('Failed to log security event:', err);
      });
    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  };

  useEffect(() => {
    // Monitor form submissions
    const handleFormSubmit = (e) => {
      const formData = new FormData(e.target);
      for (const [key, value] of formData.entries()) {
        const threat = detectThreat(String(value), `form_${key}`);
        if (threat) {
          logSecurityEvent(threat);
        }
      }
    };

    // Monitor input changes (debounced)
    let inputTimeout;
    const handleInput = (e) => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        if (e.target.value) {
          const threat = detectThreat(e.target.value, `input_${e.target.name || 'unknown'}`);
          if (threat) {
            logSecurityEvent(threat);
          }
        }
      }, 500);
    };

    // Monitor URL changes
    const handleUrlChange = () => {
      const url = window.location.href;
      const threat = detectThreat(url, 'url');
      if (threat) {
        logSecurityEvent(threat);
      }
    };

    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('input', handleInput);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('input', handleInput);
      window.removeEventListener('popstate', handleUrlChange);
      clearTimeout(inputTimeout);
    };
  }, []);

  return (
    <SecurityContext.Provider value={{ detectThreat, logSecurityEvent }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
}