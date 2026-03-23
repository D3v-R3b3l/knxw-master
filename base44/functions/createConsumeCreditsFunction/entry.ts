/**
 * Migration function to create the atomic credit consumption stored procedure
 * Run this after creating the credit ledger tables
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    // Check authentication - only allow admin users to run migrations
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    // SQL to create the stored procedure
    const functionSQL = `
    CREATE OR REPLACE FUNCTION consume_credits_atomic(
        p_tenant_id UUID,
        p_estimated_credits INTEGER,
        p_idempotency_key TEXT,
        p_context JSONB
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        v_ledger credit_ledger%ROWTYPE;
        v_current_month DATE;
        v_is_overage BOOLEAN := FALSE;
        v_credits_consumed INTEGER := 0;
        v_existing_event usage_event%ROWTYPE;
    BEGIN
        -- Input validation
        IF p_estimated_credits <= 0 OR p_estimated_credits > 100 THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'error', 'Invalid credit amount: must be 1-100',
                'error_code', 'INVALID_REQUEST',
                'credits_consumed', 0,
                'credits_remaining', 0,
                'is_overage', FALSE
            );
        END IF;

        -- Check for existing usage event with same idempotency key
        SELECT * INTO v_existing_event 
        FROM usage_event 
        WHERE tenant_id = p_tenant_id AND idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            -- Return existing operation result
            SELECT * INTO v_ledger FROM credit_ledger WHERE tenant_id = p_tenant_id;
            
            RETURN jsonb_build_object(
                'success', TRUE,
                'credits_consumed', v_existing_event.credits,
                'credits_remaining', COALESCE(v_ledger.credits_remaining, 0),
                'is_overage', v_existing_event.is_overage,
                'error', NULL,
                'error_code', NULL
            );
        END IF;

        -- Get current month for reset check
        v_current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;

        -- Lock and fetch credit ledger with FOR UPDATE to prevent race conditions
        SELECT * INTO v_ledger 
        FROM credit_ledger 
        WHERE tenant_id = p_tenant_id 
        FOR UPDATE;

        -- Initialize ledger if it doesn't exist (new tenant)
        IF NOT FOUND THEN
            INSERT INTO credit_ledger (
                tenant_id, 
                monthly_allotment, 
                credits_remaining, 
                overage_enabled,
                last_reset_date
            ) VALUES (
                p_tenant_id, 
                1000,  -- Default monthly allotment
                1000,  -- Start with full credits
                FALSE, -- Overage disabled by default
                v_current_month
            )
            RETURNING * INTO v_ledger;
        END IF;

        -- Monthly reset on read if needed
        IF v_ledger.last_reset_date < v_current_month THEN
            UPDATE credit_ledger 
            SET 
                credits_remaining = monthly_allotment,
                last_reset_date = v_current_month
            WHERE tenant_id = p_tenant_id
            RETURNING * INTO v_ledger;
        END IF;

        -- Check if sufficient credits are available
        IF v_ledger.credits_remaining >= p_estimated_credits THEN
            -- Sufficient credits: normal consumption
            v_credits_consumed := p_estimated_credits;
            v_is_overage := FALSE;
            
            UPDATE credit_ledger 
            SET credits_remaining = credits_remaining - p_estimated_credits
            WHERE tenant_id = p_tenant_id
            RETURNING * INTO v_ledger;
            
        ELSE
            -- Insufficient credits: check overage policy
            IF v_ledger.overage_enabled THEN
                -- Overage enabled: allow operation and mark as overage
                v_credits_consumed := p_estimated_credits;
                v_is_overage := TRUE;
                -- Don't decrement remaining credits for overage
            ELSE
                -- Overage disabled: reject operation
                RETURN jsonb_build_object(
                    'success', FALSE,
                    'error', 'Insufficient credits and overage disabled',
                    'error_code', 'INSUFFICIENT_CREDITS',
                    'credits_consumed', 0,
                    'credits_remaining', v_ledger.credits_remaining,
                    'is_overage', FALSE
                );
            END IF;
        END IF;

        -- Record usage event for audit and billing
        INSERT INTO usage_event (
            tenant_id,
            idempotency_key,
            credits,
            is_overage,
            context
        ) VALUES (
            p_tenant_id,
            p_idempotency_key,
            v_credits_consumed,
            v_is_overage,
            p_context
        );

        -- Return success response
        RETURN jsonb_build_object(
            'success', TRUE,
            'credits_consumed', v_credits_consumed,
            'credits_remaining', v_ledger.credits_remaining,
            'is_overage', v_is_overage,
            'error', NULL,
            'error_code', NULL
        );

    EXCEPTION
        WHEN OTHERS THEN
            -- Log error and return failure
            RAISE LOG 'Credit consumption failed: %', SQLERRM;
            RETURN jsonb_build_object(
                'success', FALSE,
                'error', 'Database operation failed',
                'error_code', 'SYSTEM_ERROR',
                'credits_consumed', 0,
                'credits_remaining', 0,
                'is_overage', FALSE
            );
    END;
    $$;
    `;

    // Execute the function creation
    const { error } = await base44.asServiceRole.rpc('exec', { sql: functionSQL });

    if (error) {
      console.error('Function creation failed:', error);
      return Response.json({ 
        success: false, 
        error: 'Function creation failed', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Credit consumption function created successfully');
    return Response.json({ 
      success: true, 
      message: 'Credit consumption function created successfully' 
    });

  } catch (error) {
    console.error('Function creation error:', error);
    return Response.json({ 
      success: false, 
      error: 'Function creation failed', 
      details: error.message 
    }, { status: 500 });
  }
});