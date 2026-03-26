import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all apps using service role (bypasses RLS)
    const allApps = await base44.asServiceRole.entities.ClientApp.list('-created_date', 100);
    
    // Get apps using normal query (with RLS)
    let userApps = [];
    try {
      if (user.role === 'admin') {
        userApps = await base44.entities.ClientApp.list('-created_date', 100);
      } else {
        userApps = await base44.entities.ClientApp.filter({ owner_id: user.id }, '-created_date');
      }
    } catch (err) {
      return Response.json({
        error: 'Query failed',
        details: err.message,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }, { status: 500 });
    }

    // Find apps that belong to current user
    const myApps = allApps.filter(app => app.owner_id === user.id);
    
    return Response.json({
      debug: {
        current_user: {
          id: user.id,
          email: user.email,
          role: user.role,
          id_type: typeof user.id
        },
        total_apps_in_db: allApps.length,
        apps_owned_by_me: myApps.length,
        apps_visible_via_query: userApps.length,
        sample_app_owner_ids: allApps.slice(0, 3).map(app => ({
          id: app.id,
          name: app.name,
          owner_id: app.owner_id,
          owner_id_type: typeof app.owner_id,
          matches_current_user: app.owner_id === user.id
        }))
      },
      my_apps_data: myApps.map(app => ({
        id: app.id,
        name: app.name,
        owner_id: app.owner_id,
        created_date: app.created_date
      })),
      visible_apps_data: userApps.map(app => ({
        id: app.id,
        name: app.name,
        owner_id: app.owner_id
      }))
    });
  } catch (err) {
    return Response.json({ 
      error: 'Debug function failed', 
      details: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
});