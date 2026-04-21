import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * detectSharedClientApps
 *
 * Pre-migration Stage 2 preflight query.
 * Identifies ClientApps that have UserAppAccess records belonging to users
 * other than the ClientApp's current owner_id. These are "shared team" apps
 * that cannot be safely auto-assigned to a single owner's Org without review.
 *
 * Admin-only. Safe to run multiple times — read-only, no mutations.
 *
 * Returns:
 *   shared_apps   — apps with cross-owner access (require manual Org assignment)
 *   clean_apps    — apps with only the owner in access records (safe to auto-migrate)
 *   no_access_apps — apps with no UserAppAccess records at all (owner-only, safe)
 *   orphan_apps   — apps with no owner_id set (require manual review)
 *   demo_apps     — is_demo=true, excluded from migration
 *   summary       — counts
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return json({ error: 'Admin access required' }, 403);
  }

  // Fetch all apps and all active access records.
  const [allApps, allUsers, allAccess] = await Promise.all([
    base44.asServiceRole.entities.ClientApp.filter({}, '-created_date', 500),
    base44.asServiceRole.entities.User.list('-created_date', 500),
    base44.asServiceRole.entities.UserAppAccess.filter({ status: 'active' }, null, 1000),
  ]);

  // Build a lookup: user.id → user.email (for comparing owner_id to access records).
  const userById = Object.fromEntries(allUsers.map(u => [u.id, u]));

  const demoApps = [];
  const orphanApps = [];
  const sharedApps = [];
  const cleanApps = [];
  const noAccessApps = [];

  for (const app of allApps) {
    if (app.is_demo) {
      demoApps.push({ id: app.id, name: app.name });
      continue;
    }

    if (!app.owner_id) {
      orphanApps.push({ id: app.id, name: app.name, status: app.status });
      continue;
    }

    const owner = userById[app.owner_id];
    const ownerEmail = owner?.email || null;
    const appAccess = allAccess.filter(a => a.client_app_id === app.id);

    if (appAccess.length === 0) {
      noAccessApps.push({
        id: app.id,
        name: app.name,
        owner_id: app.owner_id,
        owner_email: ownerEmail,
        migration_action: 'auto_migrate — create Org for owner, assign app'
      });
      continue;
    }

    // Check if any access record belongs to a user other than the owner.
    const crossOwnerAccess = appAccess.filter(a => a.user_email !== ownerEmail);

    if (crossOwnerAccess.length > 0) {
      sharedApps.push({
        id: app.id,
        name: app.name,
        owner_id: app.owner_id,
        owner_email: ownerEmail,
        cross_owner_accessors: crossOwnerAccess.map(a => ({
          user_email: a.user_email,
          role_name: a.role_name,
          status: a.status
        })),
        migration_action: 'FLAG — manual Org assignment required before backfill'
      });
    } else {
      cleanApps.push({
        id: app.id,
        name: app.name,
        owner_id: app.owner_id,
        owner_email: ownerEmail,
        migration_action: 'auto_migrate — create Org for owner, assign app'
      });
    }
  }

  return json({
    summary: {
      total_apps: allApps.length,
      demo_apps: demoApps.length,
      orphan_apps: orphanApps.length,
      shared_apps_requiring_review: sharedApps.length,
      clean_apps_safe_to_migrate: cleanApps.length,
      no_access_apps_safe_to_migrate: noAccessApps.length
    },
    shared_apps,
    orphan_apps: orphanApps,
    clean_apps,
    no_access_apps: noAccessApps,
    demo_apps: demoApps
  });
});