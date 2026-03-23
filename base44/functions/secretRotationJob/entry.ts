import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { randomBytes } from 'node:crypto';

const generateNewSecret = () => randomBytes(32).toString('hex');

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = req.headers.get('x-trace-id');
    const { dryRun = true } = await req.json();

    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
             return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const workspaces = await base44.entities.Workspace.list();
        const results = [];

        for (const workspace of workspaces) {
            const secretRecord = await base44.entities.WorkspaceSecret.findOne({ workspace_id: workspace.id });
            if (!secretRecord) {
                results.push({ workspace_id: workspace.id, status: 'skipped', reason: 'No secret record found.' });
                continue;
            }

            const newSdkSigningKey = generateNewSecret();
            
            if (dryRun) {
                results.push({
                    workspace_id: workspace.id,
                    status: 'dry-run',
                    plan: {
                        action: 'rotate',
                        secret: 'sdk_signing_key',
                        old_value_preview: secretRecord.sdk_signing_key.substring(0, 8) + '...',
                        new_value_preview: newSdkSigningKey.substring(0, 8) + '...',
                    }
                });
            } else {
                 await base44.entities.WorkspaceSecret.update(secretRecord.id, { sdk_signing_key: newSdkSigningKey });
                 
                 const updatedSecretRecord = await base44.entities.WorkspaceSecret.get(secretRecord.id);

                 await base44.entities.AuditLog.create({
                    org_id: user.current_org_id,
                    user_id: user.email,
                    action: 'update',
                    table_name: 'WorkspaceSecret',
                    record_id: secretRecord.id,
                    before: { sdk_signing_key: 'REDACTED' },
                    after: { sdk_signing_key: 'REDACTED' },
                    request_id: traceId,
                    notes: 'Secret rotation executed.'
                 });
                 
                 await base44.entities.SystemEvent.create({
                     org_id: user.current_org_id,
                     event_type: 'admin_action',
                     actor_id: user.email,
                     actor_type: 'user',
                     payload: { action: 'secret_rotation', workspace_id: workspace.id, success: true },
                     trace_id: traceId
                 });

                 results.push({ workspace_id: workspace.id, status: 'rotated' });
            }
        }
        
        return new Response(JSON.stringify({ success: true, dryRun, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});