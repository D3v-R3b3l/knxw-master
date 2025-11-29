import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'knxw_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'knxw_sk_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateSigningSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'knxw_sign_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Normalize domain to prevent duplicates
function normalizeDomain(domain) {
  if (!domain) return null;
  
  let normalized = domain.trim().toLowerCase();
  
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');
  
  // Handle localhost variations
  if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
    // Strip port numbers from localhost
    normalized = normalized.replace(/:\d+$/, '');
    
    // Normalize all localhost variants to http://localhost
    if (normalized.startsWith('http://localhost') || normalized.startsWith('localhost')) {
      return 'http://localhost';
    }
    if (normalized.startsWith('http://127.0.0.1') || normalized.startsWith('127.0.0.1')) {
      return 'http://localhost';
    }
    if (normalized.startsWith('https://localhost')) {
      return 'http://localhost';
    }
  }
  
  // Ensure https:// prefix for non-localhost domains
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

    // Check if user already has a default app (prevent duplicates)
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

    // Remove duplicates
    authorizedDomains = [...new Set(authorizedDomains)];

    // Create default client app
    const newApp = await base44.asServiceRole.entities.ClientApp.create({
      name: `${user.full_name || user.email}'s App`,
      api_key: generateApiKey(),
      secret_key: generateSecretKey(),
      client_event_signing_secret: generateSigningSecret(),
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