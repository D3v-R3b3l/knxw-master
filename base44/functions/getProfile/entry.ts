import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  try {
    // Create client bound to the incoming request (auth handled by platform)
    const base44 = createClientFromRequest(req);

    if (!(await base44.auth.isAuthenticated())) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const appUser = await base44.auth.me();
    if (!appUser) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Accept user_id from JSON body or query param (backward compatible)
    let userId = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        userId = body?.user_id || body?.userId || null;
      } catch {
        // ignore malformed JSON, will fallback to query param
      }
    }

    if (!userId) {
      const url = new URL(req.url);
      userId = url.searchParams.get('user_id');
    }

    if (!userId) {
      return json({ error: 'user_id is required (in JSON body or as query parameter)' }, 400);
    }

    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id: userId }, null, 1);
    const profile = profiles?.[0];

    if (!profile) {
      return json({ error: `Profile not found for user_id: ${userId}` }, 404);
    }

    return json(profile, 200);
  } catch (error) {
    console.error('Error in getProfile:', error);
    return json({ error: 'Internal Server Error', details: error?.message || String(error) }, 500);
  }
});