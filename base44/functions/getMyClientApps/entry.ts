import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Verify active OrgUser membership. Never trusts user.current_org_id —
 * always queries OrgUser directly.
 */
async function verifyOrgMembership(base44, userId, orgId) {
  if (!orgId) return null;
  const rows = await base44.asServiceRole.entities.OrgUser.filter(
    { org_id: orgId, user_id: userId }, null, 1
  );
  return rows?.[0] || null;
}

/**
 * GET /getMyClientApps
 *
 * Access rules:
 * - Platform admin (user.role === 'admin'): sees all non-demo apps.
 * - super_admin UserAppAccess on an org: sees all apps in that org,
 *   BUT only after OrgUser membership is verified for that org.
 * - Direct UserAppAccess on a ClientApp: sees that app,
 *   BUT only if the user also has a verified OrgUser record for the app's org.
 *   This prevents stale access records from surfacing apps after org removal.
 *
 * Note: if ClientApp.org_id is null (pre-backfill), direct access records
 * are honoured without an org check, since there is no org to verify against yet.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  // Platform admins bypass everything.
  if (user.role === 'admin') {
    const allApps = await base44.asServiceRole.entities.ClientApp.filter(
      { is_demo: false }, '-created_date', 200
    );
    return json({ apps: allApps });
  }

  // Step 1: fetch all active UserAppAccess records for this user.
  const myAccessRecords = await base44.asServiceRole.entities.UserAppAccess.filter(
    { user_email: user.email, status: 'active' }, '-created_date', 200
  );

  if (myAccessRecords.length === 0) {
    return json({ apps: [] });
  }

  // Step 2: collect all distinct org_ids referenced across access records.
  // Verify OrgUser membership for each once, cache results.
  const referencedOrgIds = [...new Set(
    myAccessRecords.map(r => r.org_id).filter(Boolean)
  )];

  const verifiedOrgIds = new Set();
  await Promise.all(referencedOrgIds.map(async (orgId) => {
    const membership = await verifyOrgMembership(base44, user.id, orgId);
    if (membership) verifiedOrgIds.add(orgId);
  }));

  // Step 3: determine which ClientApp IDs the user can access directly.
  // Require org membership if the access record references an org.
  const directClientAppIds = new Set(
    myAccessRecords
      .filter(r => r.client_app_id && r.role_name !== 'super_admin')
      .filter(r => !r.org_id || verifiedOrgIds.has(r.org_id)) // org check
      .map(r => r.client_app_id)
  );

  // Step 4: determine which orgs the user has verified super_admin access to.
  const superAdminOrgIds = new Set(
    myAccessRecords
      .filter(r => r.role_name === 'super_admin' && r.org_id && verifiedOrgIds.has(r.org_id))
      .map(r => r.org_id)
  );

  if (directClientAppIds.size === 0 && superAdminOrgIds.size === 0) {
    return json({ apps: [] });
  }

  // Step 5: fetch all non-demo apps once, filter client-side.
  const allApps = await base44.asServiceRole.entities.ClientApp.filter(
    { is_demo: false }, '-created_date', 500
  );

  const seenIds = new Set();
  const apps = [];

  for (const app of allApps) {
    if (seenIds.has(app.id)) continue;

    const hasDirect = directClientAppIds.has(app.id);
    // For super_admin: app must have org_id set and it must be a verified org.
    const hasSuperAdmin = app.org_id && superAdminOrgIds.has(app.org_id);

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