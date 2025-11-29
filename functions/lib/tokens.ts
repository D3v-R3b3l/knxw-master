/**
 * Token and credit estimation for LLM operations
 * Provides consistent credit calculation across the platform
 */

/**
 * LLM operation types with associated credit costs
 */
const CREDIT_POLICIES = {
  PSYCHOGRAPHIC_ANALYSIS: {
    credits: 2,
    reasoning: "Complex psychographic analysis with personality, emotional state, and motivation inference",
  },
  CONTENT_GENERATION: {
    credits: 1,
    reasoning: "Standard content generation task",
  },
  SENTIMENT_ANALYSIS: {
    credits: 1,
    reasoning: "Basic sentiment analysis operation",
  },
  DOCUMENT_PROCESSING: {
    credits: 3,
    reasoning: "Document analysis with embeddings and summarization",
  },
  ENGAGEMENT_OPTIMIZATION: {
    credits: 2, 
    reasoning: "AI-driven engagement rule evaluation and personalization",
  },
};

/**
 * Estimate credits required for an LLM operation
 * @param {string} operationType - The type of LLM operation being performed
 * @param {number} [inputSizeHint] - Optional hint about input size (characters/tokens)
 * @returns {object} CreditEstimation object with credits and reasoning
 */
export function estimateCredits(operationType, inputSizeHint) {
  if (!operationType || typeof operationType !== 'string') {
    throw new Error('Invalid operation type provided for credit estimation');
  }

  const policy = CREDIT_POLICIES[operationType];
  if (!policy) {
    throw new Error(`Unknown LLM operation type: ${operationType}`);
  }

  let credits = policy.credits;
  let reasoning = policy.reasoning;

  // Apply size-based multiplier for large inputs
  if (inputSizeHint && inputSizeHint > 0) {
    const sizeMultiplier = calculateSizeMultiplier(inputSizeHint);
    credits = Math.ceil(credits * sizeMultiplier);
    
    if (sizeMultiplier > 1) {
      reasoning += ` (${sizeMultiplier}x multiplier for large input)`;
    }
  }

  // Ensure credits are always positive and bounded
  credits = Math.max(1, Math.min(credits, 100)); // Min 1, max 100 credits per operation

  return {
    credits,
    reasoning,
    inputTokensEstimate: inputSizeHint ? Math.ceil(inputSizeHint / 4) : undefined, // Rough token estimation
  };
}

/**
 * Calculate size multiplier based on input length
 * Large inputs require proportionally more processing power
 */
function calculateSizeMultiplier(inputLength) {
  if (inputLength <= 1000) return 1.0;      // Small input, base cost
  if (inputLength <= 5000) return 1.5;      // Medium input, 1.5x cost  
  if (inputLength <= 10000) return 2.0;     // Large input, 2x cost
  return 3.0;                               // Very large input, 3x cost
}

/**
 * Validate credit estimation parameters
 */
export function validateCreditEstimation(estimation) {
  return (
    typeof estimation.credits === 'number' &&
    estimation.credits > 0 &&
    estimation.credits <= 100 &&
    typeof estimation.reasoning === 'string' &&
    estimation.reasoning.length > 0
  );
}

/**
 * Get all available operation types for administrative purposes
 */
export function getAvailableOperationTypes() {
  return Object.keys(CREDIT_POLICIES);
}