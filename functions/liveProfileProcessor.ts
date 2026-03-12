import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function compactEventsForEvidence(events) {
  return events.slice(0, 20).map((e) => ({
    id: e.id,
    type: e.event_type,
    ts: e.timestamp,
    url: e.event_payload?.url || null,
    dur: e.event_payload?.duration || null
  }));
}

function heuristicsLayer(events = []) {
  let pricing = 0, product = 0, checkout = 0, clicks = 0, hover = 0, scroll = 0, dwellSum = 0, n = 0;
  for (const e of events) {
    n++;
    const t = (e.event_type || '').toLowerCase();
    clicks += t === 'click' ? 1 : 0;
    hover += t === 'hover' ? 1 : 0;
    scroll += t === 'scroll' ? 1 : 0;
    checkout += (t === 'checkout_start' || t === 'checkout_complete') ? 1 : 0;
    const url = (e.event_payload?.url || '').toLowerCase();
    if (url.includes('pricing')) pricing++;
    if (url.includes('product')) product++;
    dwellSum += Number(e.event_payload?.duration || 0);
  }
  const dwellAvg = n ? dwellSum / n : 0;

  let risk = 'moderate'; let riskC = 0.5;
  if (checkout >= 1) { risk = 'aggressive'; riskC = 0.7; }
  else if (pricing >= 2 && checkout === 0) { risk = 'conservative'; riskC = 0.65; }

  let cog = 'analytical'; let cogC = 0.55;
  if (product > pricing + 1 && scroll > clicks) { cog = 'intuitive'; cogC = 0.6; }

  let mood = 'neutral'; let moodC = 0.5;
  if (checkout >= 1 && dwellAvg > 10) { mood = 'confident'; moodC = 0.65; }
  if (hover > clicks + 3 && checkout === 0) { mood = 'anxious'; moodC = 0.6; }

  const indicators = [
    { key: 'risk_profile', value: risk, confidence: riskC },
    { key: 'cognitive_style', value: cog, confidence: cogC },
    { key: 'emotional_state.mood', value: mood, confidence: moodC }
  ];

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + item.confidence, 0) / indicators.length,
    model: 'heuristics@v1'
  };
}

function mlLayer(events = []) {
  const features = {
    n_events: events.length,
    n_click: 0,
    n_scroll: 0,
    n_hover: 0,
    pricing_views: 0,
    product_views: 0,
    checkout_starts: 0,
    checkout_completes: 0,
    dwell_avg: 0
  };

  let dwellSum = 0;
  let dwellCount = 0;

  for (const event of events) {
    const type = (event.event_type || '').toLowerCase();
    const url = (event.event_payload?.url || '').toLowerCase();
    if (type === 'click') features.n_click += 1;
    if (type === 'scroll') features.n_scroll += 1;
    if (type === 'hover') features.n_hover += 1;
    if (type === 'checkout_start') features.checkout_starts += 1;
    if (type === 'checkout_complete') features.checkout_completes += 1;
    if (url.includes('pricing')) features.pricing_views += 1;
    if (url.includes('product')) features.product_views += 1;
    if (event.event_payload?.duration) {
      dwellSum += Number(event.event_payload.duration);
      dwellCount += 1;
    }
  }

  features.dwell_avg = dwellCount ? dwellSum / dwellCount : 0;

  let risk = 'moderate';
  let riskConf = 0.55;
  if (features.checkout_completes >= 1 || features.checkout_starts >= 2) {
    risk = 'aggressive';
    riskConf = Math.min(0.9, 0.6 + features.checkout_completes * 0.15);
  } else if (features.pricing_views >= 2 && features.checkout_starts === 0) {
    risk = 'conservative';
    riskConf = Math.min(0.85, 0.5 + features.pricing_views * 0.1);
  }

  let cog = 'analytical';
  let cogConf = 0.55;
  if (features.product_views > features.pricing_views + 1 && features.n_scroll > features.n_click) {
    cog = 'intuitive';
    cogConf = 0.6;
  } else if (features.pricing_views >= 1) {
    cog = 'analytical';
    cogConf = 0.65;
  }

  let mood = 'neutral';
  let moodConf = 0.5;
  const intent = features.pricing_views * 1.2 + features.product_views * 0.8 + features.checkout_starts * 2 + features.checkout_completes * 3;
  const friction = (features.n_hover * 0.2 + features.dwell_avg * 0.01) - features.checkout_completes * 1.5;
  if (intent >= 3 && friction < 0.2) {
    mood = 'confident';
    moodConf = 0.7;
  } else if (friction > 1.5 && features.checkout_completes === 0) {
    mood = 'anxious';
    moodConf = 0.65;
  }

  const indicators = [
    { key: 'risk_profile', value: risk, confidence: riskConf },
    { key: 'cognitive_style', value: cog, confidence: cogConf },
    { key: 'emotional_state.mood', value: mood, confidence: moodConf }
  ];

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + item.confidence, 0) / indicators.length,
    model: 'ml@v1-lite'
  };
}

function highValue(events = []) {
  let checkoutComplete = 0;
  let checkoutStart = 0;
  let pricingViews = 0;
  for (const e of events) {
    const t = (e.event_type || '').toLowerCase();
    checkoutStart += t === 'checkout_start' ? 1 : 0;
    checkoutComplete += t === 'checkout_complete' ? 1 : 0;
    const url = (e.event_payload?.url || '').toLowerCase();
    if (url.includes('pricing')) pricingViews++;
  }
  return checkoutComplete > 0 || checkoutStart >= 2 || pricingViews >= 3;
}

function selectIndicator(indicators = [], key) {
  return indicators.find((indicator) => indicator.key === key);
}

function fusedIndicator(key, heur, ml, llm) {
  const candidates = [
    selectIndicator(llm?.indicators, key),
    selectIndicator(ml?.indicators, key),
    selectIndicator(heur?.indicators, key)
  ].filter(Boolean);

  if (candidates.length === 0) {
    return { key, value: null, confidence: 0 };
  }

  return candidates.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
}

function fuseLayers(heur, ml, llm) {
  const indicators = [
    fusedIndicator('risk_profile', heur, ml, llm),
    fusedIndicator('cognitive_style', heur, ml, llm),
    fusedIndicator('emotional_state.mood', heur, ml, llm)
  ];

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + (item.confidence || 0), 0) / indicators.length,
    model: 'fusion@v1'
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    if (!req.headers.get('authorization')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const action = payload?.action || 'process_live_events';
    const user_id = payload?.user_id;
    if (action !== 'process_live_events' || !user_id) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const events = await svc.entities.CapturedEvent.filter({ user_id, is_demo: false }, '-timestamp', 50).catch(() => []);
    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ message: 'No events for user', processed: 0 });
    }

    const heur = heuristicsLayer(events);
    const ml = mlLayer(events);
    const heurRisk = selectIndicator(heur.indicators, 'risk_profile')?.value;
    const mlRisk = selectIndicator(ml.indicators, 'risk_profile')?.value;
    const disagree = heurRisk && mlRisk && heurRisk !== mlRisk;

    let llm = null;
    if (highValue(events) || disagree) {
      const compact = compactEventsForEvidence(events);
      const { data } = await svc.functions.invoke('llmInfer', { events: compact, app_id: null });
      if (data?.llm_inference) llm = data.llm_inference;
    }

    const fused = fuseLayers(heur, ml, llm);
    const eventWindow = compactEventsForEvidence(events);
    const evidence = llm?.reasoning || 'Heuristic + ML fusion';
    const existing = await svc.entities.HybridUserProfile.filter({ user_id }, null, 1).catch(() => []);

    if (existing?.[0]) {
      await svc.entities.HybridUserProfile.update(existing[0].id, {
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence,
        event_window: eventWindow,
        version: 1
      });
    } else {
      await svc.entities.HybridUserProfile.create({
        user_id,
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence,
        event_window: eventWindow,
        version: 1
      });
    }

    await svc.entities.HybridUserProfileUpdate.create({
      user_id,
      heuristic_inference: heur,
      ml_inference: ml,
      llm_inference: llm || {},
      fused_profile: fused,
      evidence,
      event_window: eventWindow,
      reason: disagree ? 'Disagreement between heuristics and ML' : (highValue(events) ? 'High value activity' : 'Routine update')
    });

    const moodValue = selectIndicator(fused.indicators, 'emotional_state.mood')?.value || 'neutral';
    const riskValue = selectIndicator(fused.indicators, 'risk_profile')?.value || 'moderate';
    const cogValue = selectIndicator(fused.indicators, 'cognitive_style')?.value || 'analytical';

    const legacy = await svc.entities.UserPsychographicProfile.filter({ user_id }, null, 1).catch(() => []);
    const legacyPatch = {
      emotional_state: { mood: moodValue, confidence_score: 0.6, energy_level: 'medium' },
      risk_profile: riskValue,
      cognitive_style: cogValue,
      motivation_labels: [],
      last_analyzed: new Date().toISOString(),
      staleness_score: 0.1,
      provenance: { fused_from: ['heuristics@v1', ml.model, llm?.model || ''] }
    };

    if (legacy?.[0]) {
      await svc.entities.UserPsychographicProfile.update(legacy[0].id, legacyPatch);
    } else {
      await svc.entities.UserPsychographicProfile.create({ user_id, ...legacyPatch });
    }

    for (const event of events.slice(0, 15)) {
      if (event?.id && event.processed === false) {
        await svc.entities.CapturedEvent.update(event.id, { processed: true });
      }
    }

    return Response.json({ ok: true, user_id, layers: { heur, ml, llm: llm || null }, fused });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});