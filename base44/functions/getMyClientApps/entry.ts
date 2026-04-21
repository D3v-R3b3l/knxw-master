import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function verifyOrgMembership(base44, user, orgId) {
  if (!orgId) return null;
  const rows = await base44.asServiceRole.entities.OrgUser.filter(
    { org_id: orgId, user_id: user.id }, null, 1
  );
  return rows?.[0] || null;
}

/**
 * GET /getMyClientApps
 *
 * Returns ClientApps the authenticated user has explicit access to via UserAppAccess,
 * PLUS all apps in the org if the user holds super_admin (verified via OrgUser).
 *
 * Org membership alone does NOT grant ClientApp visibility.
 * user.current_org_id is never trusted — OrgUser is always queried directly.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  // Platform admins see everything.
  if (user.role === 'admin') {
    const allApps = await base44.asServiceRole.entities.ClientApp.filter(
      { is_demo: false }, '-created_date', 200
    );
    return json({ apps: allApps });
  }

  // Step 1: all active UserAppAccess records for this user.
  const myAccessRecords = await base44.asServiceRole.entities.UserAppAccess.filter(
    { user_email: user.email, status: 'active' }, '-created_date', 200
  );

  const directClientAppIds = [
    ...new Set(
      myAccessRecords
        .filter(r => r.client_app_id && r.role_name !== 'super_admin')
        .map(r => r.client_app_id)
    )
  ];

  // Step 2: orgs where user holds super_admin — verify each via OrgUser (never trust claim).
  const superAdminOrgIds = [
    ...new Set(
      myAccessRecords
        .filter(r => r.role_name === 'super_admin' && r.org_id)
        .map(r => r.org_id)
    )
  ];

  const verifiedSuperAdminOrgIds = [];
  for (const orgId of superAdminOrgIds) {
    const membership = await verifyOrgMembership(base44, user, orgId);
    if (membership) verifiedSuperAdminOrgIds.push(orgId);
  }

  // Step 3: fetch all non-demo apps once, then filter client-side.
  const allApps = await base44.asServiceRole.entities.ClientApp.filter(
    { is_demo: false }, '-created_date', 500
  );

  const seenIds = new Set();
  const apps = [];

  for (const app of allApps) {
    if (seenIds.has(app.id)) continue;
    const hasDirect = directClientAppIds.includes(app.id);
    const hasSuperAdmin = verifiedSuperAdminOrgIds.includes(app.org_id);
    if (!hasDirect && !hasSuperAdmin) continue;

    seenIds.add(app.id);
    const access = myAccessRecords.find(r => r.client_app_id === app.id);
    apps.push({
      ...app,
      _caller_role: access?.role_name || (hasSuperAdmin ? 'super_admin' : 'viewer')
    });
  }

  return json({ apps });
});