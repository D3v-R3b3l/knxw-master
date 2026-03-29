import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userApps = await base44.asServiceRole.entities.ClientApp.filter(
      { owner_id: user.id },
      '-created_date',
      100,
    );

    return Response.json({ apps: userApps });
  } catch (err) {
    console.error('getMyClientApps error:', err);
    return Response.json({ 
      error: 'Failed to fetch applications', 
      details: err.message 
    }, { status: 500 });
  }
});