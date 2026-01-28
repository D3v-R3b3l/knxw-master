import { base44 } from '@/api/base44Client';

export const markOnboardingStep = async (stepId) => {
  try {
    const user = await base44.auth.me();
    const currentState = user.onboarding_state || {};
    
    await base44.auth.updateMe({
      onboarding_state: {
        ...currentState,
        [stepId]: true,
        [`${stepId}_at`]: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to mark onboarding step:', error);
  }
};

export const checkOnboardingComplete = async () => {
  try {
    const user = await base44.auth.me();
    const state = user.onboarding_state || {};
    
    const requiredSteps = [
      'create_app',
      'view_dashboard',
      'view_profiles',
      'view_events'
    ];
    
    return requiredSteps.every(step => state[step]);
  } catch (error) {
    return false;
  }
};