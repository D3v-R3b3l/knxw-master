/**
 * Feature flag management for knXw platform
 * Provides centralized control over feature rollouts with instant rollback capability
 */

const DEFAULT_FLAGS = {
  LLM_RATE_LIMIT_ENABLED: false, // Start disabled for safe rollout
  ADVANCED_PSYCHOGRAPHIC_ANALYSIS: true,
  REAL_TIME_STREAMING: true,
  ENTERPRISE_COMPLIANCE_MODE: true,
  USE_MOTIVATION_V2: false, // NEW: Start with legacy format
};

/**
 * Check if a feature flag is enabled
 * @param {string} flagName - The name of the feature flag to check
 * @returns {boolean} indicating if the flag is enabled
 */
export function flagEnabled(flagName) {
  try {
    // First check environment variables (allows instant override)
    const envValue = Deno.env.get(`FEATURE_FLAG_${flagName}`);
    if (envValue !== undefined) {
      return envValue.toLowerCase() === 'true';
    }

    // Fallback to default configuration
    return DEFAULT_FLAGS[flagName] ?? false;
  } catch (error) {
    // Log error but fail safe (disabled)
    console.error(`Feature flag check failed for ${flagName}:`, error);
    return false;
  }
}

/**
 * Get all current feature flag states
 * Useful for debugging and administrative interfaces
 */
export function getAllFlags() {
  const flags = {};
  
  for (const flagName of Object.keys(DEFAULT_FLAGS)) {
    flags[flagName] = flagEnabled(flagName);
  }
  
  return flags;
}

/**
 * Type-safe flag names for use in application code
 */
export const FeatureFlagNames = {
  LLM_RATE_LIMIT: 'LLM_RATE_LIMIT_ENABLED',
  ADVANCED_PSYCHOGRAPHIC: 'ADVANCED_PSYCHOGRAPHIC_ANALYSIS', 
  REAL_TIME_STREAMING: 'REAL_TIME_STREAMING',
  ENTERPRISE_COMPLIANCE: 'ENTERPRISE_COMPLIANCE_MODE',
  USE_MOTIVATION_V2: 'USE_MOTIVATION_V2', // NEW: Feature flag for motivation v2
};