import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper to normalize domain
function normalizeDomain(domain) {
  if (!domain) return null;
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/\/+$/, '');
  
  if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
    normalized = normalized.replace(/:\d+$/, '');
    return 'http://localhost';
  }
  
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a default app
    const existingApps = await base44.asServiceRole.entities.ClientApp.filter(
      { owner_id: user.id, status: 'active' },
      '-created_date',
      10
    );

    if (existingApps && existingApps.length > 0) {
      return Response.json({ 
        app: existingApps[0],
        message: 'Default app already exists'
      });
    }

    // Get the request origin for authorized_domains
    const origin = req.headers.get('origin') || req.headers.get('referer');
    let authorizedDomains = ['http://localhost'];
    
    if (origin) {
      const normalized = normalizeDomain(origin);
      if (normalized && normalized !== 'http://localhost') {
        authorizedDomains.push(normalized);
      }
    }
    authorizedDomains = [...new Set(authorizedDomains)];

    // Create default client app using crypto.randomUUID for simpler unique keys
    const newApp = await base44.asServiceRole.entities.ClientApp.create({
      name: `${user.full_name || user.email}'s App`,
      api_key: 'knxw_' + crypto.randomUUID().replace(/-/g, ''),
      secret_key: 'knxw_sk_' + crypto.randomUUID().replace(/-/g, ''),
      client_event_signing_secret: 'knxw_sign_' + crypto.randomUUID().replace(/-/g, ''),
      authorized_domains: authorizedDomains,
      owner_id: user.id,
      status: 'active'
    });

    return Response.json({ 
      app: newApp,
      message: 'Default app created successfully'
    });
  } catch (error) {
    console.error('Error creating default client app:', error);
    return Response.json({ 
      error: error.message || 'Failed to create default client app' 
    }, { status: 500 });
  }
});