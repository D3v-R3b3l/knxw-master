// Phase 2 Validation Script
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const checks = [];
    const startTime = performance.now();
    let passed = 0;
    let failed = 0;

    const runCheck = async (name, description, checkFn) => {
        const checkStart = performance.now();
        try {
            const result = await checkFn();
            const duration = Math.round(performance.now() - checkStart);
            if (result.success) {
                checks.push({ name, status: 'passed', description: result.message || 'Check passed successfully', duration_ms: duration });
                passed++;
            } else {
                checks.push({ name, status: 'failed', description: result.message, duration_ms: duration });
                failed++;
            }
        } catch (e) {
            checks.push({ name, status: 'failed', description: `Exception: ${e.message}` });
            failed++;
        }
    };
    
    // 1. LLM Eval Endpoint
    await runCheck('LLM Eval Endpoint', 'Checks if /llmEvaluator returns a valid run_id and metrics', async () => {
        const res = await fetch(`${req.url.origin}/functions/llmEvaluator`, { method: 'POST', body: JSON.stringify({}) });
        const data = await res.json();
        if (res.ok && data.success && data.run_id && data.metrics) {
            return { success: true, message: `Evaluation run ${data.run_id} completed.` };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    // 2. Audience Preview Endpoint
    await runCheck('Audience Preview Endpoint', 'Checks if /audiencePreview responds correctly with latency measurement', async () => {
        const res = await fetch(`${req.url.origin}/functions/audiencePreview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filter_conditions: { psychographic_conditions: [{ field: 'risk_profile', operator: 'equals', value: 'moderate' }] } })
        });
        const data = await res.json();
        if (res.ok && data.success && typeof data.estimated_size === 'number' && typeof data.latency_ms === 'number') {
             if (data.latency_ms > 500) { // Check against a reasonable threshold
                return { success: false, message: `Latency too high: ${data.latency_ms}ms` };
            }
            return { success: true, message: `Estimated size: ${data.estimated_size}, Latency: ${data.latency_ms}ms` };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    // 3. Config Get Endpoint
    await runCheck('Config Get Endpoint', 'Checks if /configManager (GET) retrieves configuration', async () => {
        const res = await fetch(`${req.url.origin}/functions/configManager?tenant_id=default`);
        const data = await res.json();
        if (res.ok && data.success && data.config && data.config.tenant_id === 'default') {
            return { success: true, message: 'Successfully retrieved default config.' };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    // 4. Config Set Endpoint
    await runCheck('Config Set Endpoint', 'Checks if /configManager (POST) updates configuration', async () => {
        const newBudgetValue = Math.floor(Math.random() * 1000000);
        const res = await fetch(`${req.url.origin}/functions/configManager`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant_id: 'default', llm_budget_tokens: newBudgetValue })
        });
        const data = await res.json();
        if (res.ok && data.success && data.config.llm_budget_tokens === newBudgetValue) {
            return { success: true, message: 'Successfully updated config value.' };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    const duration_ms = Math.round(performance.now() - startTime);

    return Response.json({
        success: failed === 0,
        type: 'phase2',
        duration_ms,
        summary: { passed, failed },
        checks
    });
});