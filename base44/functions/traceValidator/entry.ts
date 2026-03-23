// Phase 1 Validation Script
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const checks = [];
    const startTime = performance.now();
    let passed = 0;
    let failed = 0;

    // 1. Health Probe and x-trace-id presence
    try {
        const healthResponse = await fetch(`${req.url.origin}/functions/healthCheck`);
        const duration = performance.now() - startTime;
        const traceId = healthResponse.headers.get('x-trace-id');
        if (traceId) {
            checks.push({ name: 'Health Check Trace ID', status: 'passed', description: `Received trace ID: ${traceId}`, duration_ms: Math.round(duration) });
            passed++;
        } else {
            checks.push({ name: 'Health Check Trace ID', status: 'failed', description: 'x-trace-id header was not found in response' });
            failed++;
        }
    } catch (e) {
        checks.push({ name: 'Health Check Trace ID', status: 'failed', description: `Error fetching health check: ${e.message}` });
        failed++;
    }
    
    const duration_ms = Math.round(performance.now() - startTime);

    return Response.json({
        success: failed === 0,
        type: 'trace',
        duration_ms,
        summary: { passed, failed },
        checks
    });
});