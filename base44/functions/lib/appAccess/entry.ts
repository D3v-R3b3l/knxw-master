/**
 * appAccess.js — shared backend access control helpers for the new tenancy model.
 *
 * All sensitive data-plane operations must call these helpers.
 * user.current_org_id is NEVER trusted — every check hits the OrgUser table directly.
 */

/**
 * Verify the user holds an active OrgUser membership for the given org.
 * Returns the OrgUser record on success, null if not a member.
 */
export async function verifyOrgMembership(base44, user, orgId) {
  if (!orgId) return null;
  const rows = await base44.asServiceRole.entities.OrgUser.filter(
    { org_id: orgId, user_id: user.id },
    null,
    1
  );
  return rows?.[0] || null;
}

/**
 * Verify the user has an active UserAppAccess record for the given ClientApp.
 * Returns the access record on success, null otherwise.
 * Platform admins (user.role === 'admin') bypass this check and return a synthetic record.
 */
export async function verifyClientAppAccess(base44, user, clientAppId) {
  if (user.role === 'admin') {
    return { role_name: 'admin', status: 'active', client_app_id: clientAppId };
  }
  const rows = await base44.asServiceRole.entities.UserAppAccess.filter(
    { client_app_id: clientAppId, user_email: user.email, status: 'active' },
    null,
    1
  );
  return rows?.[0] || null;
}

/**
 * Verify the user has an org-level super_admin grant for the given org.
 * super_admin grants ClientApp visibility across the entire Org (list only, not data-plane).
 * Returns true if the user holds the super_admin role for this org.
 */
export async function verifyOrgSuperAdmin(base44, user, orgId) {
  if (user.role === 'admin') return true;
  const rows = await base44.asServiceRole.entities.UserAppAccess.filter(
    { org_id: orgId, user_email: user.email, role_name: 'super_admin', status: 'active' },
    null,
    1
  );
  return rows.length > 0;
}

/**
 * Verify the user can see (list) a ClientApp — either via direct UserAppAccess
 * or via an org-level super_admin grant.
 * Does NOT grant data-plane access — use verifyClientAppAccess for that.
 */
export async function verifyClientAppVisibility(base44, user, clientAppId, orgId) {
  if (user.role === 'admin') return true;
  const directAccess = await verifyClientAppAccess(base44, user, clientAppId);
  if (directAccess) return true;
  if (orgId) return verifyOrgSuperAdmin(base44, user, orgId);
  return false;
}

/**
 * Ensure a ClientApp has at least one active owner.
 * Throws if the invariant would be violated (e.g. on owner removal).
 */
export async function assertClientAppHasOwner(base44, clientAppId) {
  const owners = await base44.asServiceRole.entities.UserAppAccess.filter(
    { client_app_id: clientAppId, role_name: 'owner', status: 'active' },
    null,
    1
  );
  if (owners.length === 0) {
    throw new Error(`ClientApp ${clientAppId} must have at least one active owner.`);
  }
}

/** Standard JSON response helper. */
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}