import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Function to handle RBAC checks
const hasPermission = (user, permission) => {
    // This is a simplified check. A real implementation would check against RoleTemplate.
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
        
        let originalRecord = null;
        let updatedRecord;

        if (payload.id) {
            // Update
            originalRecord = await base44.entities.RoleTemplate.get(payload.id);
            if (!originalRecord) {
                 return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }
            updatedRecord = await base44.entities.RoleTemplate.update(payload.id, payload);
        } else {
            // Create
            updatedRecord = await base44.entities.RoleTemplate.create(payload);
        }

        // Audit Log
        await base44.entities.AuditLog.create({
            org_id: user.current_org_id,
            user_id: user.email,
            action: payload.id ? 'update' : 'create',
            table_name: 'RoleTemplate',
            record_id: updatedRecord.id,
            before: originalRecord || {},
            after: updatedRecord,
            request_id: traceId
        });

        return new Response(JSON.stringify(updatedRecord), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});