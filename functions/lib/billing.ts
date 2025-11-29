/**
 * Production-grade credit ledger and billing system for LLM operations
 * Handles atomic credit consumption, overage tracking, and monthly resets
 */

/**
 * Consume credits for an LLM operation with atomic guarantees
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
    // Call the stored procedure for atomic credit consumption
    const { data: result, error } = await base44Client.asServiceRole
      .rpc('consume_credits_atomic', {
        p_tenant_id: request.tenantId,
        p_estimated_credits: request.estimatedCredits,
        p_idempotency_key: request.idempotencyKey,
        p_context: request.context
      });

    if (error) {
      console.error('Credit consumption failed:', JSON.stringify({
        tenantId: request.tenantId,
        error: error.message,
        duration: Date.now() - startTime
      }));
      
      return {
        success: false,
        creditsConsumed: 0,
        creditsRemaining: 0,
        isOverage: false,
        error: 'Database operation failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }

    // Log successful operation
    console.log('Credits consumed successfully:', JSON.stringify({
      tenantId: request.tenantId,
      creditsConsumed: result.credits_consumed,
      creditsRemaining: result.credits_remaining,
      isOverage: result.is_overage,
      duration: Date.now() - startTime
    }));

    return {
      success: result.success,
      creditsConsumed: result.credits_consumed,
      creditsRemaining: result.credits_remaining,
      isOverage: result.is_overage,
      error: result.error,
      errorCode: result.error_code
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
  const { data, error } = await base44Client.asServiceRole
    .from('credit_ledger')
    .upsert({
      tenant_id: tenantId,
      monthly_allotment: monthlyAllotment,
      credits_remaining: monthlyAllotment,
      overage_enabled: overageEnabled,
      overage_rate_cents_per_credit: 1, // $0.01 per credit default
      last_reset_date: new Date().toISOString().split('T')[0]
    }, {
      onConflict: 'tenant_id'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to initialize credit ledger: ${error.message}`);
  }

  return data;
}

/**
 * Get current credit balance for a tenant
 */
export async function getCreditBalance(tenantId, base44Client) {
  const { data, error } = await base44Client.asServiceRole
    .from('credit_ledger')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw new Error(`Failed to fetch credit balance: ${error.message}`);
  }

  return data;
}

/**
 * Get usage events for a tenant with pagination
 */
export async function getUsageEvents(tenantId, limit = 100, offset = 0, base44Client) {
  const { data, error } = await base44Client.asServiceRole
    .from('usage_event')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch usage events: ${error.message}`);
  }

  return data || [];
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
      request.estimatedCredits > 100) {
    return { valid: false, error: 'Invalid estimatedCredits: must be 1-100' };
  }

  if (!request.idempotencyKey || typeof request.idempotencyKey !== 'string' || request.idempotencyKey.length < 10) {
    return { valid: false, error: 'Invalid idempotencyKey: must be at least 10 characters' };
  }

  if (!request.context || typeof request.context !== 'object') {
    return { valid: false, error: 'Invalid context: must be an object' };
  }

  return { valid: true };
}