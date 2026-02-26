
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { fuseLayers } from './utils/fusion.js';
import { predict as mlPredict } from './services/mlPredict.js';

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
  // Simple, transparent heuristics with confidences
  let pricing = 0, product = 0, checkout = 0, clicks = 0, hover = 0, scroll = 0, dwellSum = 0, n = 0;
  for (const e of events) {
    n++;
    const t = (e.event_type || "").toLowerCase();
    clicks += t === "click" ? 1 : 0;
    hover += t === "hover" ? 1 : 0;
    scroll += t === "scroll" ? 1 : 0;
    checkout += (t === "checkout_start" || t === "checkout_complete") ? 1 : 0;
    const url = (e.event_payload?.url || "").toLowerCase();
    if (url.includes("pricing")) pricing++;
    if (url.includes("product")) product++;
    dwellSum += Number(e.event_payload?.duration || 0);
  }
  const dwellAvg = n ? dwellSum / n : 0;

  let risk = "moderate"; let riskC = 0.5;
  if (checkout >= 1) { risk = "aggressive"; riskC = 0.7; }
  else if (pricing >= 2 && checkout === 0) { risk = "conservative"; riskC = 0.65; }

  let cog = "analytical"; let cogC = 0.55;
  if (product > pricing + 1 && scroll > clicks) { cog = "intuitive"; cogC = 0.6; }

  let mood = "neutral"; let moodC = 0.5;
  if (checkout >= 1 && dwellAvg > 10) { mood = "confident"; moodC = 0.65; }
  if (hover > clicks + 3 && checkout === 0) { mood = "anxious"; moodC = 0.6; }

  const indicators = [
    { key: "risk_profile", value: risk, confidence: riskC },
    { key: "cognitive_style", value: cog, confidence: cogC },
    { key: "emotional_state.mood", value: mood, confidence: moodC }
  ];
  const avgC = indicators.reduce((s, i) => s + (i.confidence || 0.5), 0) / indicators.length;

  return { indicators, confidence: avgC, model: "heuristics@v1" };
}

function highValue(events = []) {
  let checkoutComplete = 0;
  let checkoutStart = 0;
  let pricingViews = 0;
  for (const e of events) {
    const t = (e.event_type || "").toLowerCase();
    checkoutStart += t === "checkout_start" ? 1 : 0;
    checkoutComplete += t === "checkout_complete" ? 1 : 0;
    const url = (e.event_payload?.url || "").toLowerCase();
    if (url.includes("pricing")) pricingViews++;
  }
  return checkoutComplete > 0 || checkoutStart >= 2 || pricingViews >= 3;
}

function selectIndicator(indicators, key) {
  return indicators.find((i) => i.key === key);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const action = payload?.action || "process_live_events";
    const user_id = payload?.user_id;
    if (action !== "process_live_events" || !user_id) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Load recent events
    const events = await base44.entities.CapturedEvent.filter({ user_id, is_demo: false }, "-timestamp", 50).catch(() => []);
    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ message: "No events for user", processed: 0 });
    }

    // Build layers
    const heur = heuristicsLayer(events);
    const ml = await mlPredict(events);

    // Decide if LLM is necessary
    const heurRisk = selectIndicator(heur.indicators, "risk_profile")?.value;
    const mlRisk = selectIndicator(ml.indicators, "risk_profile")?.value;
    const disagree = heurRisk && mlRisk && heurRisk !== mlRisk;

    let llm = null;
    if (highValue(events) || disagree) {
      // call llm function
      const compact = compactEventsForEvidence(events);
      const { data } = await base44.functions.invoke("llmInfer", { events: compact, app_id: null });
      if (data?.llm_inference) llm = data.llm_inference;
    }

    const fused = fuseLayers(heur, ml, llm);

    // Upsert HybridUserProfile
    const existing = await base44.entities.HybridUserProfile.filter({ user_id }, null, 1).catch(() => []);
    if (existing && existing[0]) {
      await base44.entities.HybridUserProfile.update(existing[0].id, {
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence: (llm?.reasoning) || "Heuristic + ML fusion",
        event_window: compactEventsForEvidence(events),
        version: 1
      });
    } else {
      await base44.entities.HybridUserProfile.create({
        user_id,
        heuristic_inference: heur,
        ml_inference: ml,
        llm_inference: llm || {},
        fused_profile: fused,
        evidence: (llm?.reasoning) || "Heuristic + ML fusion",
        event_window: compactEventsForEvidence(events),
        version: 1
      });
    }

    // Insert update audit row
    await base44.entities.HybridUserProfileUpdate.create({
      user_id,
      heuristic_inference: heur,
      ml_inference: ml,
      llm_inference: llm || {},
      fused_profile: fused,
      evidence: (llm?.reasoning) || "Heuristic + ML fusion",
      event_window: compactEventsForEvidence(events),
      reason: disagree ? "Disagreement between heuristics and ML" : (highValue(events) ? "High value activity" : "Routine update")
    });

    // Also keep legacy profile fresh for dashboard components that rely on it
    const moodValue = fused.indicators.find((i) => i.key === "emotional_state.mood")?.value || "neutral";
    const riskValue = fused.indicators.find((i) => i.key === "risk_profile")?.value || "moderate";
    const cogValue = fused.indicators.find((i) => i.key === "cognitive_style")?.value || "analytical";

    const legacy = await base44.entities.UserPsychographicProfile.filter({ user_id }, null, 1).catch(() => []);
    const legacyPatch = {
      emotional_state: { mood: moodValue, confidence: 0.6, energy_level: "medium" },
      risk_profile: riskValue,
      cognitive_style: cogValue,
      motivation_labels: [],
      last_analyzed: new Date().toISOString(),
      staleness_score: 0.1,
      provenance: { fused_from: ["heuristics@v1", ml.model, llm?.model || ""] }
    };
    if (legacy && legacy[0]) {
      await base44.entities.UserPsychographicProfile.update(legacy[0].id, legacyPatch);
    } else {
      await base44.entities.UserPsychographicProfile.create({ user_id, ...legacyPatch });
    }

    // Mark the most recent ~15 events as processed to throttle re-processing
    const toProcess = events.slice(0, 15);
    for (const e of toProcess) {
      if (e?.id && e.processed === false) {
        await base44.entities.CapturedEvent.update(e.id, { processed: true });
      }
    }

    return Response.json({
      ok: true,
      user_id,
      layers: {
        heur,
        ml,
        llm: llm || null
      },
      fused
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});
