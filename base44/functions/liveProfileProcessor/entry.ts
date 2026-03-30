import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function compactEventsForEvidence(events) {
  return events.slice(0, 20).map((event) => ({
    id: event.id,
    type: event.event_type,
    ts: event.timestamp,
    url: event.event_payload?.url || null,
    element: event.event_payload?.element || null,
    app_id: event.client_app_id || event.event_payload?.client_app_id || null,
    dur: event.event_payload?.duration || null
  }));
}

function summarizeEvents(events = []) {
  return events.reduce((summary, event) => {
    const type = String(event.event_type || '').toLowerCase();
    const url = String(event.event_payload?.url || '').toLowerCase();
    const element = String(event.event_payload?.element || '').toLowerCase();

    summary.count += 1;
    summary.clicks += type === 'click' ? 1 : 0;
    summary.scrolls += type === 'scroll' ? 1 : 0;
    summary.hovers += type === 'hover' ? 1 : 0;
    summary.exits += type === 'exit_intent' || type === 'page_exit' ? 1 : 0;
    summary.formSubmits += type === 'form_submit' ? 1 : 0;
    summary.pricingViews += url.includes('pricing') ? 1 : 0;
    summary.docsViews += url.includes('docs') || url.includes('guide') ? 1 : 0;
    summary.featureViews += url.includes('feature') ? 1 : 0;
    summary.settingsClicks += element.includes('settings') || element.includes('config') ? 1 : 0;
    summary.checkoutSignals += ['checkout_start', 'checkout_complete', 'purchase'].includes(type) ? 1 : 0;
    summary.durationTotal += Number(event.event_payload?.duration || 0);
    summary.durationCount += event.event_payload?.duration ? 1 : 0;
    return summary;
  }, {
    count: 0,
    clicks: 0,
    scrolls: 0,
    hovers: 0,
    exits: 0,
    formSubmits: 0,
    pricingViews: 0,
    docsViews: 0,
    featureViews: 0,
    settingsClicks: 0,
    checkoutSignals: 0,
    durationTotal: 0,
    durationCount: 0
  });
}

function pickMotivation(summary) {
  if (summary.checkoutSignals > 0 || summary.pricingViews >= 2) return 'achievement';
  if (summary.docsViews >= 2 || summary.featureViews >= 2) return 'learning';
  if (summary.settingsClicks > 0) return 'autonomy';
  if (summary.formSubmits > 0) return 'growth';
  return 'security';
}

function pickEnergy(summary) {
  const avgDuration = summary.durationCount ? summary.durationTotal / summary.durationCount : 0;
  if (summary.clicks + summary.scrolls >= 8 || avgDuration >= 120) return 'high';
  if (summary.exits > 0 && avgDuration < 20) return 'low';
  return 'medium';
}

function heuristicsLayer(events = []) {
  const summary = summarizeEvents(events);
  const energyLevel = pickEnergy(summary);
  const primaryMotivation = pickMotivation(summary);

  let risk = 'moderate';
  let riskConfidence = 0.6;
  if (summary.checkoutSignals > 0) {
    risk = 'aggressive';
    riskConfidence = 0.78;
  } else if (summary.pricingViews >= 2 && summary.checkoutSignals === 0) {
    risk = 'conservative';
    riskConfidence = 0.7;
  }

  let cognitiveStyle = 'analytical';
  let cognitiveConfidence = 0.62;
  if (summary.docsViews > summary.pricingViews + summary.featureViews) {
    cognitiveStyle = 'systematic';
    cognitiveConfidence = 0.68;
  } else if (summary.featureViews > summary.pricingViews && summary.scrolls > summary.clicks) {
    cognitiveStyle = 'intuitive';
    cognitiveConfidence = 0.64;
  }

  let mood = 'neutral';
  let moodConfidence = 0.55;
  if (summary.exits > 0 && summary.checkoutSignals === 0) {
    mood = 'anxious';
    moodConfidence = 0.67;
  } else if (summary.checkoutSignals > 0 || summary.formSubmits > 0) {
    mood = 'confident';
    moodConfidence = 0.7;
  }

  const indicators = [
    { key: 'risk_profile', value: risk, confidence: riskConfidence },
    { key: 'cognitive_style', value: cognitiveStyle, confidence: cognitiveConfidence },
    { key: 'emotional_state.mood', value: mood, confidence: moodConfidence },
    { key: 'energy_level', value: energyLevel, confidence: 0.65 },
    { key: 'primary_motivation', value: primaryMotivation, confidence: 0.66 }
  ];

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + item.confidence, 0) / indicators.length,
    model: 'heuristics@v2'
  };
}

function mlLayer(events = []) {
  const summary = summarizeEvents(events);
  const avgDuration = summary.durationCount ? summary.durationTotal / summary.durationCount : 0;

  let risk = 'moderate';
  let riskConfidence = 0.58;
  if (summary.checkoutSignals >= 1 || summary.formSubmits >= 1) {
    risk = 'aggressive';
    riskConfidence = 0.74;
  } else if (summary.pricingViews >= 2 && summary.checkoutSignals === 0) {
    risk = 'conservative';
    riskConfidence = 0.69;
  }

  let cognitiveStyle = 'analytical';
  let cognitiveConfidence = 0.58;
  if (summary.docsViews >= 2) {
    cognitiveStyle = 'systematic';
    cognitiveConfidence = 0.71;
  } else if (summary.featureViews >= 2 && summary.scrolls > summary.clicks) {
    cognitiveStyle = 'creative';
    cognitiveConfidence = 0.63;
  }

  let mood = 'neutral';
  let moodConfidence = 0.54;
  if (summary.exits >= 1 && avgDuration < 30) {
    mood = 'uncertain';
    moodConfidence = 0.68;
  } else if (summary.checkoutSignals >= 1 || avgDuration >= 90) {
    mood = 'confident';
    moodConfidence = 0.72;
  }

  const energyLevel = avgDuration >= 120 ? 'high' : avgDuration <= 20 ? 'low' : 'medium';
  const primaryMotivation = summary.settingsClicks > 0 ? 'autonomy' : summary.docsViews >= 2 ? 'learning' : pickMotivation(summary);

  const indicators = [
    { key: 'risk_profile', value: risk, confidence: riskConfidence },
    { key: 'cognitive_style', value: cognitiveStyle, confidence: cognitiveConfidence },
    { key: 'emotional_state.mood', value: mood, confidence: moodConfidence },
    { key: 'energy_level', value: energyLevel, confidence: 0.64 },
    { key: 'primary_motivation', value: primaryMotivation, confidence: 0.69 }
  ];

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + item.confidence, 0) / indicators.length,
    model: 'ml@v2-lite'
  };
}

function highValue(events = []) {
  return events.some((event) => ['checkout_start', 'checkout_complete', 'purchase', 'form_submit'].includes(String(event.event_type || '').toLowerCase()));
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

function buildFusedProfile(heur, ml, llm) {
  const indicators = [
    fusedIndicator('risk_profile', heur, ml, llm),
    fusedIndicator('cognitive_style', heur, ml, llm),
    fusedIndicator('emotional_state.mood', heur, ml, llm),
    fusedIndicator('energy_level', heur, ml, llm),
    fusedIndicator('primary_motivation', heur, ml, llm)
  ];

  const mood = selectIndicator(indicators, 'emotional_state.mood');
  const risk = selectIndicator(indicators, 'risk_profile');
  const cognitiveStyle = selectIndicator(indicators, 'cognitive_style');
  const energy = selectIndicator(indicators, 'energy_level');
  const motivation = selectIndicator(indicators, 'primary_motivation');

  return {
    indicators,
    confidence: indicators.reduce((sum, item) => sum + (item.confidence || 0), 0) / indicators.length,
    model: 'fusion@v2',
    risk_profile: risk?.value || 'moderate',
    cognitive_style: cognitiveStyle?.value || 'analytical',
    emotional_state: {
      mood: mood?.value || 'neutral',
      confidence_score: mood?.confidence || 0.6,
      energy_level: energy?.value || 'medium'
    },
    primary_motivation: motivation?.value || 'growth',
    motivation_stack_v2: motivation?.value ? [{ label: motivation.value, weight: motivation.confidence || 0.65 }] : [],
    motivation_labels: motivation?.value ? [motivation.value] : []
  };
}

function buildInsightPayload(userId, fusedProfile, eventWindow) {
  const mood = fusedProfile.emotional_state?.mood || 'neutral';
  const risk = fusedProfile.risk_profile || 'moderate';
  const cognitiveStyle = fusedProfile.cognitive_style || 'analytical';
  const motivation = fusedProfile.primary_motivation || 'growth';

  return [
    {
      user_id: userId,
      insight_type: 'behavioral_pattern',
      title: `Live session shows a ${cognitiveStyle} evaluation pattern`,
      description: `Recent live events indicate ${cognitiveStyle} behavior with ${risk} risk tolerance and ${mood} sentiment.`,
      confidence_score: fusedProfile.confidence || 0.65,
      actionable_recommendations: [
        cognitiveStyle === 'analytical' ? 'Prioritize evidence, comparisons, and benchmarks.' : 'Prioritize simpler directional guidance.',
        risk === 'conservative' ? 'Reduce friction with reassurance and trust signals.' : 'Present a stronger conversion CTA.'
      ],
      priority: mood === 'anxious' || mood === 'uncertain' ? 'high' : 'medium',
      supporting_events: eventWindow.map((event) => event.id).filter(Boolean),
      is_demo: false
    },
    {
      user_id: userId,
      insight_type: 'engagement_optimization',
      title: `Primary live motivation detected: ${motivation}`,
      description: `The strongest current motivation inferred from live behavior is ${motivation}.`,
      confidence_score: selectIndicator(fusedProfile.indicators, 'primary_motivation')?.confidence || fusedProfile.confidence || 0.6,
      actionable_recommendations: [
        `Align messaging with ${motivation}.`,
        'Keep the next interaction tightly matched to current live intent.'
      ],
      priority: 'medium',
      supporting_events: eventWindow.map((event) => event.id).filter(Boolean),
      is_demo: false
    }
  ];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const payload = await req.json().catch(() => ({}));
    const action = payload?.action || 'process_live_events';
    const user_id = payload?.user_id;
    const app_id = payload?.app_id || null;

    if (action !== 'process_live_events' || !user_id) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const eventFilter = app_id
      ? { user_id, client_app_id: app_id, is_demo: false }
      : { user_id, is_demo: false };
    const events = await svc.entities.CapturedEvent.filter(eventFilter, '-timestamp', 50).catch(() => []);

    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ message: 'No events for user', processed: 0 });
    }

    const resolvedAppId = app_id || events[0]?.client_app_id || events[0]?.event_payload?.client_app_id || null;
    const heur = heuristicsLayer(events);
    const ml = mlLayer(events);
    const heurRisk = selectIndicator(heur.indicators, 'risk_profile')?.value;
    const mlRisk = selectIndicator(ml.indicators, 'risk_profile')?.value;
    const disagree = heurRisk && mlRisk && heurRisk !== mlRisk;

    let llm = null;
    if (highValue(events) || disagree) {
      const compact = compactEventsForEvidence(events);
      const llmResponse = await svc.functions.invoke('llmInfer', { events: compact, app_id: resolvedAppId }).catch(() => null);
      if (llmResponse?.data?.llm_inference) llm = llmResponse.data.llm_inference;
    }

    const fused = buildFusedProfile(heur, ml, llm);
    const eventWindow = compactEventsForEvidence(events);
    const evidence = llm?.reasoning || 'Live profile fused from heuristics and lightweight ML.';
    const existing = await svc.entities.HybridUserProfile.filter(resolvedAppId ? { user_id, client_app_id: resolvedAppId } : { user_id }, null, 1).catch(() => []);

    if (existing?.[0]) {
      await svc.entities.HybridUserProfile.update(existing[0].id, {
        app_id: resolvedAppId,
        client_app_id: resolvedAppId,
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence,
        event_window: eventWindow,
        version: 2
      });
    } else {
      await svc.entities.HybridUserProfile.create({
        app_id: resolvedAppId,
        client_app_id: resolvedAppId,
        user_id,
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence,
        event_window: eventWindow,
        version: 2
      });
    }

    await svc.entities.HybridUserProfileUpdate.create({
      app_id: resolvedAppId,
      client_app_id: resolvedAppId,
      user_id,
      heuristic_inference: heur,
      ml_inference: ml,
      llm_inference: llm || {},
      fused_profile: fused,
      evidence,
      event_window: eventWindow,
      reason: disagree ? 'Disagreement between heuristics and ML' : (highValue(events) ? 'High value activity' : 'Routine update')
    });

    const legacy = await svc.entities.UserPsychographicProfile.filter({ user_id }, null, 1).catch(() => []);
    const legacyPatch = {
      emotional_state: fused.emotional_state,
      risk_profile: fused.risk_profile,
      cognitive_style: fused.cognitive_style,
      motivation_labels: fused.motivation_labels || [],
      motivation_stack_v2: fused.motivation_stack_v2 || [],
      motivation_confidence_score: selectIndicator(fused.indicators, 'primary_motivation')?.confidence || fused.confidence || 0.6,
      emotional_state_confidence_score: selectIndicator(fused.indicators, 'emotional_state.mood')?.confidence || fused.confidence || 0.6,
      risk_profile_confidence_score: selectIndicator(fused.indicators, 'risk_profile')?.confidence || fused.confidence || 0.6,
      cognitive_style_confidence_score: selectIndicator(fused.indicators, 'cognitive_style')?.confidence || fused.confidence || 0.6,
      last_analyzed: new Date().toISOString(),
      staleness_score: 0,
      provenance: { fused_from: ['heuristics@v2', ml.model, llm?.model || ''] }
    };

    if (legacy?.[0]) {
      await svc.entities.UserPsychographicProfile.update(legacy[0].id, legacyPatch);
    } else {
      await svc.entities.UserPsychographicProfile.create({ user_id, ...legacyPatch });
    }

    const sourceApp = resolvedAppId
      ? await svc.entities.ClientApp.get(resolvedAppId).catch(() => null)
      : null;
    const insightPayloads = buildInsightPayload(user_id, fused, eventWindow).map((insightPayload) => ({
      ...insightPayload,
      client_app_id: resolvedAppId,
      source_app_name: sourceApp?.name || null,
      source_event_count: eventWindow.length
    }));
    const recentInsightFilter = resolvedAppId
      ? { user_id, client_app_id: resolvedAppId }
      : { user_id };
    const recentInsights = await svc.entities.PsychographicInsight.filter(recentInsightFilter, '-created_date', 10).catch(() => []);
    for (const insightPayload of insightPayloads) {
      const existingInsight = recentInsights.find((insight) => insight.insight_type === insightPayload.insight_type);
      if (existingInsight) {
        await svc.entities.PsychographicInsight.update(existingInsight.id, insightPayload);
      } else {
        await svc.entities.PsychographicInsight.create(insightPayload);
      }
    }

    for (const event of events.slice(0, 15)) {
      if (event?.id && event.processed === false) {
        await svc.entities.CapturedEvent.update(event.id, { processed: true });
      }
    }

    return Response.json({ ok: true, user_id, app_id: resolvedAppId, layers: { heur, ml, llm: llm || null }, fused });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});