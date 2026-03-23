// Phase 3 Validation Script
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
    
    // 1. RBAC Set Role Template
    await runCheck('RBAC Set Role Template', 'Checks if a new role template can be created', async () => {
        const res = await fetch(`${req.url.origin}/functions/rbacManager/setRoleTemplate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                template_name: `test_template_${Date.now()}`,
                permissions: [{ resource: 'dashboard', action: 'view' }]
            })
        });
        const data = await res.json();
        if (res.ok && data.success && data.action === 'created') {
            return { success: true, message: 'Successfully created a new role template.' };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    // 2. RBAC Set User Access
    await runCheck('RBAC Set User Access', 'Checks if user access can be granted', async () => {
        const res = await fetch(`${req.url.origin}/functions/rbacManager/setUserAccess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test@knxw.dev',
                app_id: 'default_app',
                role: 'viewer'
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            return { success: true, message: 'Successfully granted/updated user access.' };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    // 3. Secret Rotation Dry Run
    await runCheck('Secret Rotation Dry Run', 'Checks if secret rotation returns a dry-run plan by default', async () => {
        const res = await fetch(`${req.url.origin}/functions/secretRotationManager`, { method: 'POST', body: JSON.stringify({}) });
        const data = await res.json();
        if (res.ok && data.success && data.dry_run === true && data.plan) {
            return { success: true, message: 'Successfully generated a dry-run plan.' };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Dry run failed'}` };
    });

    // 4. Log Archival Trigger
    await runCheck('Log Archival Trigger', 'Checks if the log archival job can be triggered manually', async () => {
        const res = await fetch(`${req.url.origin}/functions/logArchiver`, { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success && typeof data.results.audit_logs_archived === 'number') {
            return { success: true, message: `Archived ${data.results.audit_logs_archived} audit logs and ${data.results.access_logs_archived} access logs.` };
        }
        return { success: false, message: `Failed with status ${res.status}: ${data.error || 'Unknown error'}` };
    });

    const duration_ms = Math.round(performance.now() - startTime);

    return Response.json({
        success: failed === 0,
        type: 'phase3',
        duration_ms,
        summary: { passed, failed },
        checks
    });
});