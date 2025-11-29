import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import RoleBasedOnboarding, { detectUserRole } from './RoleBasedOnboarding';
import logger from '../system/logger';

const ROLE_SIGNALS = {
  admin: ['OrgAdmin', 'AdminRoles', 'SystemHealth', 'ComplianceDashboard', 'EnterpriseSecurityDashboard'],
  marketer: ['MetaData', 'GoogleData', 'Engagements', 'AudienceBuilder', 'ABTestingStudio', 'MarketIntelligence'],
  developer: ['Developers', 'DeveloperKeys', 'DeveloperPlayground', 'DeveloperGameDev', 'Documentation', 'MyApps']
};

export default function AdaptiveOnboardingEngine({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [detectedRole, setDetectedRole] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [interactionScore, setInteractionScore] = useState({
    admin: 0,
    marketer: 0,
    developer: 0
  });
  const [pageVisits, setPageVisits] = useState([]);
  
  // Refs for debouncing saves
  const saveTimeoutRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const pendingVisitsRef = useRef([]);

  useEffect(() => {
    // Only try to load user if authenticated
    const checkAndLoadUser = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          loadUser();
        }
      } catch (error) {
        // User not authenticated, skip loading
      }
    };
    
    checkAndLoadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Initial role detection
      const initialRole = detectUserRole(currentUser);
      setDetectedRole(initialRole);

      // Load interaction history
      const history = currentUser.onboarding_state?.interaction_history || [];
      setPageVisits(history);
      
      // Calculate initial scores
      calculateRoleScores(history);

      // Show onboarding if not completed and not dismissed
      const onboardingKey = `${initialRole}_completed`;
      const dismissedKey = `${initialRole}_dismissed`;
      
      if (!currentUser.onboarding_state?.[onboardingKey] && !currentUser.onboarding_state?.[dismissedKey]) {
        setTimeout(() => setShowOnboarding(true), 3000);
      }
    } catch (error) {
      // User not authenticated or error loading - fail silently
      logger.info('Adaptive onboarding: User not authenticated or error loading');
    }
  };

  // Debounced save function - only save once every 30 seconds max
  const debouncedSave = useCallback((visits) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Store pending visits
    pendingVisitsRef.current = visits;

    // Check if we saved recently
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    // If we saved less than 30 seconds ago, schedule for later
    if (timeSinceLastSave < 30000) {
      const delayMs = 30000 - timeSinceLastSave;
      logger.info(`Debouncing interaction history save for ${Math.round(delayMs / 1000)}s`);
      
      saveTimeoutRef.current = setTimeout(() => {
        saveInteractionHistory(pendingVisitsRef.current);
      }, delayMs);
    } else {
      // Save immediately if enough time has passed
      saveInteractionHistory(visits);
    }
  }, []);

  // Track page visits and update role inference
  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    const timestamp = new Date().toISOString();
    
    const newVisit = { path: currentPath, timestamp };
    const updatedVisits = [...pageVisits, newVisit].slice(-20); // Keep last 20 visits
    
    setPageVisits(updatedVisits);
    calculateRoleScores(updatedVisits);

    // Use debounced save instead of saving immediately
    debouncedSave(updatedVisits);
  }, [location.pathname, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const calculateRoleScores = (visits) => {
    const scores = { admin: 0, marketer: 0, developer: 0 };
    
    visits.forEach(visit => {
      Object.entries(ROLE_SIGNALS).forEach(([role, pages]) => {
        if (pages.some(page => visit.path.includes(page))) {
          scores[role]++;
        }
      });
    });

    setInteractionScore(scores);
    
    // Update detected role if scores change significantly
    if (user) {
      const maxScore = Math.max(...Object.values(scores));
      const newRole = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
      
      if (newRole && newRole !== detectedRole && maxScore > 3) {
        setDetectedRole(newRole);
        updateUserRole(newRole);
      }
    }
  };

  const saveInteractionHistory = async (visits) => {
    if (!user) return;

    try {
      const now = Date.now();
      lastSaveTimeRef.current = now;
      
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          interaction_history: visits,
          last_interaction_save: new Date().toISOString()
        }
      });
      
      logger.info('Interaction history saved successfully');
    } catch (error) {
      if (error?.response?.status === 429) {
        logger.warn('Rate limited while saving interaction history - will retry later');
      } else {
        logger.error('Failed to save interaction history:', error);
      }
    }
  };

  const updateUserRole = async (newRole) => {
    if (!user) return;

    try {
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          detected_role: newRole,
          role_updated_at: new Date().toISOString()
        }
      });
      
      logger.info(`User role updated to: ${newRole}`);
    } catch (error) {
      logger.error('Failed to update user role:', error);
    }
  };

  return (
    <>
      {children}
      {showOnboarding && detectedRole && user && (
        <RoleBasedOnboarding
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userRole={detectedRole}
        />
      )}
    </>
  );
}

// Hook for other components to access adaptive context
export function useAdaptiveContext() {
  const location = useLocation();
  
  return {
    currentPage: location.pathname.split('/').pop() || 'Dashboard',
    fullPath: location.pathname
  };
}