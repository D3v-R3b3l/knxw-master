/**
 * Production-grade credit ledger and billing system for LLM operations
 * Handles credit consumption, overage tracking, and monthly resets
 */

/**
 * Consume credits for an LLM operation
 * Handles monthly resets, overage logic, and idempotency
 */
export async function consumeCredits(request, base44Client) {
  const startTime = Date.now();
  
  // Input validation
  const validation = validateRequest(request);
  if (!validation.valid) {
    return {
      success: false,
      creditsConsumed: 0,
      creditsRemaining: 0,
      isOverage: false,
      error: validation.error,
      errorCode: 'INVALID_REQUEST'
    };
  }

  try {
    const { tenantId, estimatedCredits, idempotencyKey, context } = request;

    // Check for idempotency
    const existingEvents = await base44Client.asServiceRole.entities.UsageEvent.filter({ 
      idempotency_key: idempotencyKey 
    }, null, 1);

    if (existingEvents && existingEvents.length > 0) {
      // Already processed
      return {
        success: true,
        creditsConsumed: existingEvents[0].credits_consumed,
        creditsRemaining: 0, // We don't fetch current balance on idempotent replay to save ops
        isOverage: false,
        error: null,
        errorCode: null
      };
    }

    // Fetch ledger
    const ledgers = await base44Client.asServiceRole.entities.CreditLedger.filter({ tenant_id: tenantId }, null, 1);
    let ledger = ledgers[0];

    if (!ledger) {
        // Auto-initialize if missing? Or fail. Let's fail for safety, or auto-init if we want smooth UX.
        // For production grade, failing is safer unless we have a clear policy.
        return {
            success: false,
            error: 'Credit ledger not found for tenant',
            errorCode: 'LEDGER_NOT_FOUND'
        };
    }

    // Check if monthly reset is needed
    const lastReset = new Date(ledger.last_reset_date);
    const now = new Date();
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        // Reset logic
        ledger.credits_remaining = ledger.monthly_allotment;
        ledger.last_reset_date = now.toISOString().split('T')[0];
        // We need to persist this reset first or combine it with consumption
    }

    // Check balance
    let creditsConsumed = estimatedCredits;
    let isOverage = false;

    if (ledger.credits_remaining < creditsConsumed) {
        if (ledger.overage_enabled) {
            isOverage = true;
            // Allow consumption, go into negative or just track overage?
            // Usually we let them go to 0 and then track negative or separate overage counter.
            // Simple model: consume from remaining. If negative, it's overage.
        } else {
            return {
                success: false,
                creditsConsumed: 0,
                creditsRemaining: ledger.credits_remaining,
                isOverage: false,
                error: 'Insufficient credits',
                errorCode: 'INSUFFICIENT_CREDITS'
            };
        }
    }

    // Update ledger
    ledger.credits_remaining -= creditsConsumed;
    
    await base44Client.asServiceRole.entities.CreditLedger.update(ledger.id, {
        credits_remaining: ledger.credits_remaining,
        last_reset_date: ledger.last_reset_date
    });

    // Record usage event
    await base44Client.asServiceRole.entities.UsageEvent.create({
        tenant_id: tenantId,
        credits_consumed: creditsConsumed,
        operation_type: context.operation || 'llm_inference',
        context: context,
        idempotency_key: idempotencyKey
    });

    console.log('Credits consumed successfully:', JSON.stringify({
      tenantId,
      creditsConsumed,
      creditsRemaining: ledger.credits_remaining,
      isOverage,
      duration: Date.now() - startTime
    }));

    return {
      success: true,
      creditsConsumed,
      creditsRemaining: ledger.credits_remaining,
      isOverage,
      error: null,
      errorCode: null
    };

  } catch (error) {
    console.error('Unexpected error in credit consumption:', JSON.stringify({
      tenantId: request.tenantId,
      error: error.message,
      duration: Date.now() - startTime
    }));

    return {
      success: false,
      creditsConsumed: 0,
      creditsRemaining: 0,
      isOverage: false,
      error: 'Internal server error',
      errorCode: 'SYSTEM_ERROR'
    };
  }
}

/**
 * Initialize credit ledger for a new tenant
 */
export async function initializeCreditLedger(tenantId, monthlyAllotment, overageEnabled, base44Client) {
  const existing = await base44Client.asServiceRole.entities.CreditLedger.filter({ tenant_id: tenantId });
  if (existing.length > 0) return existing[0];

  return await base44Client.asServiceRole.entities.CreditLedger.create({
      tenant_id: tenantId,
      monthly_allotment: monthlyAllotment,
      credits_remaining: monthlyAllotment,
      overage_enabled: overageEnabled,
      overage_rate_cents_per_credit: 1,
      last_reset_date: new Date().toISOString().split('T')[0]
  });
}

/**
 * Get current credit balance for a tenant
 */
export async function getCreditBalance(tenantId, base44Client) {
  const ledgers = await base44Client.asServiceRole.entities.CreditLedger.filter({ tenant_id: tenantId });
  if (ledgers.length === 0) {
    throw new Error(`Credit ledger not found for tenant: ${tenantId}`);
  }
  return ledgers[0];
}

/**
 * Get usage events for a tenant
 */
export async function getUsageEvents(tenantId, limit = 100, base44Client) {
  return await base44Client.asServiceRole.entities.UsageEvent.filter(
      { tenant_id: tenantId },
      '-created_date',
      limit
  );
}

/**
 * Validate credit consumption request
 */
function validateRequest(request) {
  if (!request.tenantId || typeof request.tenantId !== 'string') {
    return { valid: false, error: 'Invalid or missing tenantId' };
  }

  if (!request.estimatedCredits || 
      typeof request.estimatedCredits !== 'number' || 
      request.estimatedCredits <= 0 || 
      request.estimatedCredits > 10000) { // Increased limit
    return { valid: false, error: 'Invalid estimatedCredits' };
  }

  if (!request.idempotencyKey || typeof request.idempotencyKey !== 'string' || request.idempotencyKey.length < 10) {
    return { valid: false, error: 'Invalid idempotencyKey: must be at least 10 characters' };
  }

  if (!request.context || typeof request.context !== 'object') {
    return { valid: false, error: 'Invalid context: must be an object' };
  }

  return { valid: true };
}