import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, tableName, recordId, before, after, orgId, workspaceId, requestId } = await req.json();

    // Create audit log entry
    const auditEntry = {
      timestamp: new Date().toISOString(),
      org_id: orgId || user.current_org_id,
      workspace_id: workspaceId || user.current_workspace_id,
      user_id: user.email,
      action,
      table_name: tableName,
      record_id: recordId,
      before: before || {},
      after: after || {},
      request_id: requestId || crypto.randomUUID(),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };

    // Use service role to write audit log (bypasses RLS)
    await base44.asServiceRole.entities.AuditLog.create(auditEntry);

    return Response.json({ success: true, auditId: auditEntry.request_id });
  } catch (error) {
    console.error('Audit logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});