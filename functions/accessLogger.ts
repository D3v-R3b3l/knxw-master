import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      orgId, 
      workspaceId, 
      userId, 
      action, 
      resource, 
      success, 
      authMethod, 
      responseCode,
      extra 
    } = await req.json();

    const accessLogEntry = {
      timestamp: new Date().toISOString(),
      org_id: orgId,
      workspace_id: workspaceId,
      user_id: userId,
      action,
      resource,
      success,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      auth_method: authMethod || 'session',
      request_id: crypto.randomUUID(),
      response_code: responseCode || 200,
      extra: extra || {}
    };

    // Use service role to write access log (bypasses RLS)
    await base44.asServiceRole.entities.AccessLog.create(accessLogEntry);

    return Response.json({ success: true, requestId: accessLogEntry.request_id });
  } catch (error) {
    console.error('Access logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});