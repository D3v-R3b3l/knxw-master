import React, { createContext, useContext } from 'react';
import useVisitorProfiling from './useVisitorProfiling';

const LandingPsychographicContext = createContext(null);

export function LandingPsychographicProvider({ children }) {
  const { profile, confidence } = useVisitorProfiling();
  return (
    <LandingPsychographicContext.Provider value={{ profile, confidence }}>
      {children}
    </LandingPsychographicContext.Provider>
  );
}

export function useLandingProfile() {
  return useContext(LandingPsychographicContext);
}

/**
 * Picks the best matching variant given the live visitor profile.
 * Falls back gracefully to baseText if profile is not yet inferred.
 */
export function adaptText(profile, { baseText, motivationVariants = {}, riskVariants = {}, moodVariants = {} }) {
  if (!profile) return baseText;

  // Motivation match (first wins)
  for (const label of (profile.motivation_labels || [])) {
    if (motivationVariants[label]) return motivationVariants[label];
  }
  // Risk match
  if (riskVariants[profile.risk_profile]) return riskVariants[profile.risk_profile];
  // Mood match
  if (moodVariants[profile.emotional_state?.mood]) return moodVariants[profile.emotional_state?.mood];

  return baseText;
}