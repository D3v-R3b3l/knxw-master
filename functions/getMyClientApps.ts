import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to fetch apps, then filter by ownership
    const allApps = await base44.asServiceRole.entities.ClientApp.list('-created_date', 100);
    
    // Filter to only show user's apps (or all if admin)
    const userApps = user.role === 'admin' 
      ? allApps 
      : allApps.filter(app => app.owner_id === user.id);

    return Response.json({ apps: userApps });
  } catch (err) {
    console.error('getMyClientApps error:', err);
    return Response.json({ 
      error: 'Failed to fetch applications', 
      details: err.message 
    }, { status: 500 });
  }
});