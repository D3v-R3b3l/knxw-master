import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch (_e) {
      // no body provided is fine
    }

    const requestedId = (payload && (payload.id || payload.app_id)) || null;
    const requestedSlug = (payload && (payload.slug || payload.name)) || null;

    let app = null;

    // 1) Try by id
    if (requestedId) {
      try {
        app = await base44.entities.ClientApp.get(requestedId);
      } catch (_e) {
        // ignore, fall through
      }
    }

    // 2) Try by "slug" (we don't have slug in schema; use name as stand-in)
    if (!app && requestedSlug) {
      const byName = await base44.entities.ClientApp.filter({ name: requestedSlug });
      if (Array.isArray(byName) && byName.length > 0) {
        app = byName[0];
      }
    }

    // 3) Fallback to first available user's app
    if (!app) {
      const apps = await base44.entities.ClientApp.list();
      if (Array.isArray(apps) && apps.length > 0) {
        app = apps[0];
      }
    }

    // 4) If still none and user is admin, attempt to auto-create default app
    if (!app && user.role === 'admin') {
      try {
        const res = await base44.functions.invoke('createDefaultClientApp', {});
        const created = (res && res.data && (res.data.app || res.data)) || null;
        if (created && created.id) {
          app = created;
        } else {
          // Double-check by name in case function returned a message-only response
          const fallback = await base44.entities.ClientApp.filter({
            name: 'knXw Landing Page Self-Tracking'
          });
          if (Array.isArray(fallback) && fallback.length > 0) {
            app = fallback[0];
          }
        }
      } catch (_e) {
        // ignore and continue
      }
    }

    if (!app) {
      return Response.json(
        { error: 'No ClientApp found for this user. Please create one in Settings.' },
        { status: 404 }
      );
    }

    // Provide a simple snippet that exposes the selected app id
    const snippet = [
      '// knXw SDK bootstrap',
      '(function(){',
      '  window.knXw = window.knXw || {};',
      `  window.knXw.appId = '${app.id}';`,
      '  // Example: window.knXw.track && window.knXw.track("page_view");',
      '})();',
    ].join('\n');

    return Response.json({ app, snippet });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});