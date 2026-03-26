import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function hasLayer(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) return obj.length > 0;
  return Object.keys(obj).length > 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload = {};
    try { payload = await req.json(); } catch { /* no body */ }
    const windowHours = Math.min(Math.max(Number(payload.window_hours || 24), 1), 168);
    const sinceMs = Date.now() - windowHours * 60 * 60 * 1000;

    const updates = await base44.entities.HybridUserProfileUpdate.list('-created_date', 1000);
    const recent = (updates || []).filter(u => {
      const t = new Date(u.created_date || u.updated_date || 0).getTime();
      return Number.isFinite(t) && t >= sinceMs;
    });

    const total = recent.length;
    let heur = 0, ml = 0, llm = 0, twoLayers = 0;

    for (const u of recent) {
      const h = hasLayer(u.heuristic_inference);
      const m = hasLayer(u.ml_inference);
      const l = hasLayer(u.llm_inference);
      if (h) heur++;
      if (m) ml++;
      if (l) llm++;
      if ((h && m) || (h && l) || (m && l)) twoLayers++;
    }

    const pct = (x) => total ? Math.round((x / total) * 100) : 0;

    return Response.json({
      window_hours: windowHours,
      total_updates: total,
      coverage: {
        heuristic_pct: pct(heur),
        ml_pct: pct(ml),
        llm_pct: pct(llm),
        two_layer_pct: pct(twoLayers)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});