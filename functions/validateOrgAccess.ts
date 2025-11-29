import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId, workspaceId, requiredRole } = await req.json();

    // Check if user has access to the org
    const orgUsers = await base44.entities.OrgUser.filter({ 
      org_id: orgId, 
      user_email: user.email,
      status: 'active'
    });

    if (orgUsers.length === 0) {
      return Response.json({ error: 'No access to organization' }, { status: 403 });
    }

    const orgUser = orgUsers[0];
    const userRole = orgUser.role;

    // Define role hierarchy
    const roleHierarchy = {
      'viewer': 1,
      'member': 2,
      'admin': 3,
      'owner': 4
    };

    const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole || 'viewer'];

    if (!hasRequiredRole) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // If workspace is specified, verify access
    if (workspaceId) {
      const workspaces = await base44.entities.TenantWorkspace.filter({
        id: workspaceId,
        org_id: orgId
      });

      if (workspaces.length === 0) {
        return Response.json({ error: 'Workspace not found or no access' }, { status: 404 });
      }
    }

    return Response.json({ 
      success: true, 
      userRole,
      permissions: orgUser.permissions,
      orgId,
      workspaceId 
    });
  } catch (error) {
    console.error('Access validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});