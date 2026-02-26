import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Psychographic SDK Context
 * Provides real-time user psychographic data to child components
 */
const PsychographicContext = createContext(null);

/**
 * PsychographicProvider - Wraps your app to provide psychographic intelligence
 * @param {string} userId - The user ID to track
 * @param {boolean} mockMode - Use mock data for demo/testing
 * @param {object} mockProfile - Custom mock profile data
 */
export function PsychographicProvider({ children, userId, mockMode = false, mockProfile = null }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mockMode) {
      // Use mock data for demos
      setProfile(mockProfile || {
        motivation_labels: ['achievement', 'autonomy'],
        risk_profile: 'moderate',
        cognitive_style: 'analytical',
        emotional_state: { mood: 'confident', confidence_score: 0.85 },
        personality_traits: {
          openness: 0.75,
          conscientiousness: 0.82,
          extraversion: 0.45
        }
      });
      setLoading(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch real psychographic profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id: userId });
        if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, mockMode, mockProfile]);

  // Derive motivation_labels from motivation_stack if needed
  const motivationLabels = profile?.motivation_labels || 
    (profile?.motivation_stack?.map(m => m.label) ?? []);

  const value = {
    profile,
    loading,
    error,
    
    // Helper methods
    hasMotivation: (motivation) => motivationLabels.includes(motivation),
    getRiskProfile: () => profile?.risk_profile,
    getCognitiveStyle: () => profile?.cognitive_style?.style || profile?.cognitive_style,
    getMood: () => profile?.emotional_state?.mood,
    getPersonalityTrait: (trait) => profile?.personality_traits?.[trait]
  };

  return (
    <PsychographicContext.Provider value={value}>
      {children}
    </PsychographicContext.Provider>
  );
}

/**
 * usePsychographic Hook - Access psychographic data in any component
 */
export function usePsychographic() {
  const context = useContext(PsychographicContext);
  if (!context) {
    throw new Error('usePsychographic must be used within a PsychographicProvider');
  }
  return context;
}

/**
 * AdaptiveButton - Button that adapts text/style based on user psychology
 */
export function AdaptiveButton({ 
  baseText, 
  motivationVariants = {}, 
  riskVariants = {},
  className = '',
  ...props 
}) {
  const { profile, loading, hasMotivation, getRiskProfile } = usePsychographic();

  if (loading) {
    return <button className={className} disabled {...props}>{baseText}</button>;
  }

  // Adapt based on motivations
  let adaptedText = baseText;
  if (profile && motivationVariants) {
    for (const [motivation, text] of Object.entries(motivationVariants)) {
      if (hasMotivation(motivation)) {
        adaptedText = text;
        break;
      }
    }
  }

  // Adapt based on risk profile
  if (profile && riskVariants) {
    const risk = getRiskProfile();
    if (riskVariants[risk]) {
      adaptedText = riskVariants[risk];
    }
  }

  return <button className={className} {...props}>{adaptedText}</button>;
}

/**
 * AdaptiveText - Text that changes based on user psychology
 */
export function AdaptiveText({ 
  baseText, 
  motivationVariants = {},
  moodVariants = {},
  className = '',
  as: Component = 'span'
}) {
  const { profile, loading, hasMotivation, getMood } = usePsychographic();

  if (loading) {
    return <Component className={className}>{baseText}</Component>;
  }

  let adaptedText = baseText;

  // Adapt based on motivations
  if (profile && motivationVariants) {
    for (const [motivation, text] of Object.entries(motivationVariants)) {
      if (hasMotivation(motivation)) {
        adaptedText = text;
        break;
      }
    }
  }

  // Adapt based on mood
  if (profile && moodVariants) {
    const mood = getMood();
    if (moodVariants[mood]) {
      adaptedText = moodVariants[mood];
    }
  }

  return <Component className={className}>{adaptedText}</Component>;
}

/**
 * AdaptiveContainer - Container that shows/hides based on psychographic criteria
 */
export function AdaptiveContainer({ 
  children, 
  showFor = {},
  hideFor = {},
  fallback = null 
}) {
  const { profile, loading, hasMotivation, getRiskProfile, getCognitiveStyle } = usePsychographic();

  if (loading) return fallback;

  // Check show conditions
  if (showFor.motivations) {
    const hasAny = showFor.motivations.some(m => hasMotivation(m));
    if (!hasAny) return fallback;
  }

  if (showFor.riskProfile) {
    if (getRiskProfile() !== showFor.riskProfile) return fallback;
  }

  if (showFor.cognitiveStyle) {
    if (getCognitiveStyle() !== showFor.cognitiveStyle) return fallback;
  }

  // Check hide conditions
  if (hideFor.motivations) {
    const hasAny = hideFor.motivations.some(m => hasMotivation(m));
    if (hasAny) return fallback;
  }

  if (hideFor.riskProfile) {
    if (getRiskProfile() === hideFor.riskProfile) return fallback;
  }

  return <>{children}</>;
}

/**
 * withPsychographic HOC - Wrap any component to receive psychographic props
 */
export function withPsychographic(Component) {
  return function PsychographicComponent(props) {
    const psychographic = usePsychographic();
    return <Component {...props} psychographic={psychographic} />;
  };
}

// Export all components
export default {
  PsychographicProvider,
  usePsychographic,
  AdaptiveButton,
  AdaptiveText,
  AdaptiveContainer,
  withPsychographic
};