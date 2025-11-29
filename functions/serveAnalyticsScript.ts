import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    // Try to auth; if not logged in, proceed with service role for public script
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      user = null;
    }

    // Accept payload or query params; both optional
    let payload = {};
    try { payload = await req.json(); } catch (_e) {}
    const url = new URL(req.url);
    const qp = url.searchParams;

    const requestedId = payload.id || payload.app_id || qp.get('id') || qp.get('app_id');
    const requestedSlug = payload.slug || payload.name || qp.get('slug') || qp.get('name');

    async function findAnyApp() {
      // user-scoped first if available, else service role
      try {
        const list = await base44.entities.ClientApp.list();
        if (Array.isArray(list) && list.length > 0) return list[0];
      } catch (_e) {}
      const list2 = await base44.asServiceRole.entities.ClientApp.list();
      if (Array.isArray(list2) && list2.length > 0) return list2[0];
      return null;
    }

    let app = null;

    // 1) by id
    if (requestedId) {
      try {
        app = await base44.entities.ClientApp.get(requestedId);
      } catch (_e) {
        try {
          app = await base44.asServiceRole.entities.ClientApp.get(requestedId);
        } catch (_e2) {}
      }
    }

    // 2) by name/slug
    if (!app && requestedSlug) {
      try {
        const byName = await base44.entities.ClientApp.filter({ name: requestedSlug });
        if (Array.isArray(byName) && byName.length > 0) app = byName[0];
      } catch (_e) {
        const byName2 = await base44.asServiceRole.entities.ClientApp.filter({ name: requestedSlug });
        if (Array.isArray(byName2) && byName2.length > 0) app = byName2[0];
      }
    }

    // 3) fallback to first app
    if (!app) {
      app = await findAnyApp();
    }

    // 4) if none and user is admin, try creating default
    if (!app && user && user.role === 'admin') {
      try {
        const res = await base44.functions.invoke('createDefaultClientApp', {});
        const created = (res && res.data && (res.data.app || res.data)) || null;
        if (created && created.id) {
          app = created;
        } else {
          // lookup by known default name
          try {
            const fallback = await base44.entities.ClientApp.filter({ name: 'knXw Landing Page Self-Tracking' });
            if (Array.isArray(fallback) && fallback.length > 0) app = fallback[0];
          } catch (_e) {
            const fallback2 = await base44.asServiceRole.entities.ClientApp.filter({ name: 'knXw Landing Page Self-Tracking' });
            if (Array.isArray(fallback2) && fallback2.length > 0) app = fallback2[0];
          }
        }
      } catch (_e) {
        // ignore
      }
    }

    // If still none, just return a harmless no-op snippet to avoid breaking the page
    if (!app) {
      const noop = [
        '// knXw analytics (no app configured)',
        '(function(){',
        '  window.knXw = window.knXw || {};',
        "  window.knXw.track = function(){ /* no-op */ };",
        '})();',
      ].join('\n');

      return new Response(noop, {
        status: 200,
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
      });
    }

    const js = [
      '// knXw analytics bootstrap',
      '(function(){',
      '  window.knXw = window.knXw || {};',
      `  window.knXw.appId = '${app.id}';`,
      '  window.knXw.track = window.knXw.track || function(event, payload){',
      '    try {',
      "      fetch('/functions/captureEvent', {",
      "        method: 'POST',",
      "        headers: { 'Content-Type': 'application/json' },",
      '        body: JSON.stringify({ event_type: event || "custom", event_payload: payload || {}, app_id: window.knXw.appId })',
      '      });',
      '    } catch(e) { /* swallow */ }',
      '  };',
      "  // Example auto page_view:",
      "  try { window.knXw.track('page_view', { url: location.href, referrer: document.referrer }); } catch(e){}",
      '})();'
    ].join('\n');

    return new Response(js, {
      status: 200,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
    });
  } catch (error) {
    const fallback = '// knXw analytics failed to initialize';
    return new Response(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
    });
  }
});