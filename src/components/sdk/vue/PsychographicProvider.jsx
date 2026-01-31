/**
 * knXw Adaptive UI SDK - Vue.js Provider
 * Provides psychographic context to Vue applications
 * 
 * Installation:
 * npm install @knxw/sdk
 * 
 * Usage:
 * import { createPsychographicProvider } from '@knxw/sdk/vue';
 * app.use(createPsychographicProvider({ apiKey: 'your-api-key' }));
 */

import { reactive, provide, inject } from 'vue';

const PSYCHOGRAPHIC_KEY = Symbol('psychographic');

// Mock data for development/demo
const MOCK_PROFILE = {
  user_id: 'demo_user',
  motivation_stack_v2: [
    { label: 'achievement', weight: 0.8 },
    { label: 'mastery', weight: 0.6 }
  ],
  motivation_labels: ['achievement', 'mastery'],
  risk_profile: 'moderate',
  cognitive_style: 'analytical',
  emotional_state: {
    mood: 'positive',
    confidence_score: 0.75,
    energy_level: 'high'
  },
  personality_traits: {
    openness: 0.7,
    conscientiousness: 0.8,
    extraversion: 0.5,
    agreeableness: 0.6,
    neuroticism: 0.3
  }
};

export function createPsychographicProvider(options = {}) {
  return {
    install(app) {
      const state = reactive({
        profile: null,
        loading: true,
        error: null
      });

      // Fetch profile data
      const fetchProfile = async () => {
        try {
          state.loading = true;
          
          if (options.useMockData || !options.apiKey) {
            // Use mock data
            await new Promise(resolve => setTimeout(resolve, 500));
            state.profile = MOCK_PROFILE;
          } else {
            // Fetch from API
            const response = await fetch(
              `${options.apiUrl || 'https://api.knxw.com'}/v1/profiles/${options.userId}`,
              {
                headers: {
                  'Authorization': `Bearer ${options.apiKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch psychographic profile');
            }
            
            state.profile = await response.json();
          }
        } catch (error) {
          console.error('Psychographic profile fetch error:', error);
          state.error = error.message;
          // Fallback to mock data on error
          state.profile = MOCK_PROFILE;
        } finally {
          state.loading = false;
        }
      };

      fetchProfile();

      // Helper methods
      const helpers = {
        hasMotivation: (motivation) => {
          return state.profile?.motivation_labels?.includes(motivation) || false;
        },
        
        getRiskProfile: () => {
          return state.profile?.risk_profile || 'moderate';
        },
        
        getCognitiveStyle: () => {
          return state.profile?.cognitive_style || 'analytical';
        },
        
        getMood: () => {
          return state.profile?.emotional_state?.mood || 'neutral';
        },
        
        getTopMotivation: () => {
          const stack = state.profile?.motivation_stack_v2 || [];
          return stack.length > 0 ? stack[0].label : null;
        },
        
        matchesProfile: (criteria) => {
          if (!state.profile) return false;
          
          if (criteria.motivations) {
            const hasMatch = criteria.motivations.some(m => 
              state.profile.motivation_labels?.includes(m)
            );
            if (!hasMatch) return false;
          }
          
          if (criteria.riskProfile && state.profile.risk_profile !== criteria.riskProfile) {
            return false;
          }
          
          if (criteria.cognitiveStyle && state.profile.cognitive_style !== criteria.cognitiveStyle) {
            return false;
          }
          
          return true;
        },
        
        refresh: fetchProfile
      };

      // Provide context
      app.provide(PSYCHOGRAPHIC_KEY, {
        ...state,
        ...helpers
      });
    }
  };
}

export function usePsychographic() {
  const context = inject(PSYCHOGRAPHIC_KEY);
  
  if (!context) {
    throw new Error(
      'usePsychographic must be used within a component that has PsychographicProvider installed'
    );
  }
  
  return context;
}