import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const requestedId = payload?.id || payload?.app_id || null;
    const requestedName = payload?.name || payload?.slug || null;

    let app = null;
    if (requestedId) {
      app = await base44.entities.ClientApp.get(requestedId).catch(() => null);
    }

    if (!app && requestedName) {
      const matches = await base44.entities.ClientApp.filter({ name: requestedName }, null, 1).catch(() => []);
      app = matches?.[0] || null;
    }

    if (!app) {
      const apps = await base44.entities.ClientApp.list('-created_date', 1).catch(() => []);
      app = apps?.[0] || null;
    }

    if (!app && user.role === 'admin') {
      const res = await base44.functions.invoke('createDefaultClientApp', {}).catch(() => null);
      app = res?.data?.app || res?.data || null;
    }

    if (!app) {
      return Response.json({ error: 'No ClientApp found for this user. Please create one first.' }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const scriptUrl = `${origin}/functions/serveAnalyticsScript?id=${app.id}`;
    const snippet = `<script src="${scriptUrl}" defer></script>\n<script>\n  window.addEventListener('load', function () {\n    window.knxw.init({\n      userId: 'user_123',\n      autoTrack: true,\n      engagements: { pollInterval: 15000 }\n    });\n  });\n<\/script>`;

    return Response.json({ app, script_url: scriptUrl, snippet });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});