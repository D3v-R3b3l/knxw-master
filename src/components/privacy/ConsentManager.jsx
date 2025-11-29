import React, { createContext, useContext, useState, useEffect } from 'react';

const ConsentContext = createContext({
  hasConsent: () => false,
  getConsent: () => ({}),
  updateConsent: () => {},
  isConsentRequired: () => true
});

export const useConsent = () => useContext(ConsentContext);

const CONSENT_STORAGE_KEY = 'knxw_consent_preferences';
const CONSENT_TIMESTAMP_KEY = 'knxw_consent_timestamp';

export const ConsentProvider = ({ children }) => {
  const [consentState, setConsentState] = useState({
    necessary: false,
    analytics: false,
    personalization: false,
    marketing: false
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadConsentState();
    
    // MEMORY LEAK FIX: Proper cleanup for event listeners
    const handleStorageChange = (e) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        loadConsentState();
      }
    };
    
    const handleConsentChange = (event) => {
      setConsentState(event.detail);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cookieConsentChanged', handleConsentChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  const loadConsentState = () => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      
      if (saved && timestamp) {
        const consentAge = Date.now() - parseInt(timestamp);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (consentAge < thirtyDays) {
          const savedPreferences = JSON.parse(saved);
          setConsentState(savedPreferences);
        }
      }
    } catch (error) {
      console.error('Error loading consent state:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const hasConsent = (category) => {
    if (category === 'necessary') return true;
    return consentState[category] || false;
  };

  const getConsent = () => consentState;

  const updateConsent = (newConsent) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
      setConsentState(newConsent);
      
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: newConsent
      }));
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const isConsentRequired = () => {
    try {
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      if (!timestamp) return true;
      
      const consentAge = Date.now() - parseInt(timestamp);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      return consentAge >= thirtyDays;
    } catch {
      return true;
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ConsentContext.Provider value={{
      hasConsent,
      getConsent,
      updateConsent,
      isConsentRequired
    }}>
      {children}
    </ConsentContext.Provider>
  );
};