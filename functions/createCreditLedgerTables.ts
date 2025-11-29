/**
 * Migration function to create credit ledger and usage event tables
 * Run this function once to initialize the database schema
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

    // SQL to create credit ledger and usage event tables
    const migrationSQL = `
    -- Credit ledger table for per-tenant credit tracking
    CREATE TABLE IF NOT EXISTS credit_ledger (
        tenant_id UUID PRIMARY KEY,
        monthly_allotment INTEGER NOT NULL DEFAULT 1000,
        credits_remaining INTEGER NOT NULL DEFAULT 1000,
        overage_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        overage_rate_cents_per_credit INTEGER NOT NULL DEFAULT 1,
        last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT credits_remaining_non_negative CHECK (credits_remaining >= 0),
        CONSTRAINT monthly_allotment_positive CHECK (monthly_allotment > 0),
        CONSTRAINT overage_rate_non_negative CHECK (overage_rate_cents_per_credit >= 0)
    );

    -- Usage event table for audit trail and billing reconciliation
    CREATE TABLE IF NOT EXISTS usage_event (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        idempotency_key TEXT NOT NULL,
        credits INTEGER NOT NULL,
        is_overage BOOLEAN NOT NULL DEFAULT FALSE,
        context JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT credits_positive CHECK (credits > 0),
        CONSTRAINT unique_idempotency_per_tenant UNIQUE (tenant_id, idempotency_key)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_updated_at ON credit_ledger(updated_at);
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_last_reset_date ON credit_ledger(last_reset_date);
    CREATE INDEX IF NOT EXISTS idx_usage_event_tenant_id_created_at ON usage_event(tenant_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_usage_event_created_at ON usage_event(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_usage_event_is_overage ON usage_event(is_overage) WHERE is_overage = TRUE;

    -- RLS policies
    ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
    ALTER TABLE usage_event ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS credit_ledger_tenant_isolation ON credit_ledger;
    DROP POLICY IF EXISTS usage_event_tenant_isolation ON usage_event;
    DROP POLICY IF EXISTS credit_ledger_admin_access ON credit_ledger;
    DROP POLICY IF EXISTS usage_event_admin_access ON usage_event;

    -- Policies for tenant isolation
    CREATE POLICY credit_ledger_tenant_isolation ON credit_ledger
        FOR ALL
        USING (
            tenant_id::text = (current_setting('request.jwt.claims', true)::json ->> 'sub')
            OR
            tenant_id::text IN (
                SELECT id::text FROM "ClientApp" WHERE owner_id::text = (current_setting('request.jwt.claims', true)::json ->> 'sub')
            )
        );

    CREATE POLICY usage_event_tenant_isolation ON usage_event
        FOR ALL  
        USING (
            tenant_id::text = (current_setting('request.jwt.claims', true)::json ->> 'sub')
            OR
            tenant_id::text IN (
                SELECT id::text FROM "ClientApp" WHERE owner_id::text = (current_setting('request.jwt.claims', true)::json ->> 'sub')
            )
        );

    -- Admin override policies
    CREATE POLICY credit_ledger_admin_access ON credit_ledger
        FOR ALL
        USING ((current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin');

    CREATE POLICY usage_event_admin_access ON usage_event  
        FOR ALL
        USING ((current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin');

    -- Function to auto-update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Trigger for credit_ledger
    DROP TRIGGER IF EXISTS update_credit_ledger_updated_at ON credit_ledger;
    CREATE TRIGGER update_credit_ledger_updated_at 
        BEFORE UPDATE ON credit_ledger 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the migration
    const { error } = await base44.asServiceRole.rpc('exec', { sql: migrationSQL });

    if (error) {
      console.error('Migration failed:', error);
      return Response.json({ 
        success: false, 
        error: 'Migration failed', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Credit ledger tables created successfully');
    return Response.json({ 
      success: true, 
      message: 'Credit ledger tables created successfully' 
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      success: false, 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
});