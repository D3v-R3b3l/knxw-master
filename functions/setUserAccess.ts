import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Function to handle RBAC checks
const hasPermission = (user, permission) => {
    return user && user.role === 'admin';
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = req.headers.get('x-trace-id');

    try {
        const user = await base44.auth.me();
        if (!user || !hasPermission(user, 'manage_rbac')) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const payload = await req.json();

        // Privilege escalation prevention
        if (payload.role_name === 'owner' && user.role !== 'owner') {
            return new Response(JSON.stringify({ error: 'Cannot assign owner role.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        let originalRecord = null;
        let updatedRecord;
        
        const existing = await base44.entities.UserAppAccess.filter({ client_app_id: payload.client_app_id, user_email: payload.user_email });

        if (existing && existing.length > 0) {
            // Update
            originalRecord = existing[0];
            updatedRecord = await base44.entities.UserAppAccess.update(originalRecord.id, payload);
        } else {
            // Create
            updatedRecord = await base44.entities.UserAppAccess.create(payload);
        }

        // Audit Log
        await base44.entities.AuditLog.create({
            org_id: user.current_org_id,
            user_id: user.email,
            action: originalRecord ? 'update' : 'create',
            table_name: 'UserAppAccess',
            record_id: updatedRecord.id,
            before: originalRecord || {},
            after: updatedRecord,
            request_id: traceId,
        });

        return new Response(JSON.stringify(updatedRecord), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});