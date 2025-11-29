import { makeWindowFeatures, makeSeqEmbedding } from "../utils/features.js";

// Lightweight, deploy-safe ML predictor (heuristics + calibrated weights).
// Produces indicators with non-zero confidence. Model id: ml@v1-lite.
export async function predict(events = []) {
  const feats = makeWindowFeatures(events);
  const emb = makeSeqEmbedding(events); // reserved for future upgrades

  // Simple calibrated scores
  const activity = feats.n_events + feats.n_click * 0.5 + feats.n_scroll * 0.25;
  const intent = feats.pricing_views * 1.2 + feats.product_views * 0.8 + feats.checkout_starts * 2 + feats.checkout_completes * 3;
  const friction = (feats.n_hover * 0.2 + feats.dwell_avg * 0.01) - feats.checkout_completes * 1.5;

  // Risk profile: conservative if many pricing views, few checkouts; aggressive if checkouts high
  let risk = "moderate";
  let riskConf = 0.55;
  if (feats.checkout_completes >= 1 || feats.checkout_starts >= 2) {
    risk = "aggressive"; riskConf = Math.min(0.9, 0.6 + feats.checkout_completes * 0.15);
  } else if (feats.pricing_views >= 2 && feats.checkout_starts === 0) {
    risk = "conservative"; riskConf = Math.min(0.85, 0.5 + feats.pricing_views * 0.1);
  }

  // Cognitive style: analytical if pricing/docs heavy, intuitive if product/scroll heavy
  let cog = "analytical";
  let cogConf = 0.55;
  if (feats.product_views > feats.pricing_views + 1 && feats.n_scroll > feats.n_click) {
    cog = "intuitive"; cogConf = 0.6;
  } else if (feats.pricing_views >= 1) {
    cog = "analytical"; cogConf = 0.65;
  }

  // Mood inference: anxious if friction high, confident if intent high and friction low
  let mood = "neutral";
  let moodConf = 0.5;
  if (intent >= 3 && friction < 0.2) {
    mood = "confident"; moodConf = 0.7;
  } else if (friction > 1.5 && feats.checkout_completes === 0) {
    mood = "anxious"; moodConf = 0.65;
  }

  const indicators = [
    { key: "risk_profile", value: risk, confidence: riskConf },
    { key: "cognitive_style", value: cog, confidence: cogConf },
    { key: "emotional_state.mood", value: mood, confidence: moodConf },
  ];

  const avgConf = indicators.reduce((s, i) => s + (i.confidence || 0.5), 0) / indicators.length;

  return {
    indicators,
    confidence: avgConf,
    model: "ml@v1-lite",
    summary: "ML-lite: calibrated behavioral model (deploy-safe)."
  };
}