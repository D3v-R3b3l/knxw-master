export const LLM_POLICY = {
  triggers: {
    highValue: {
      pricingViewsMin: 3,
      pricingWindowMinutes: 30,
      checkoutStartNoCompleteMinutes: 10,
      dwellSecondsMin: 120
    },
    disagreement: {
      keys: ["risk_profile", "cognitive_style", "emotional_state.mood"],
      confidenceGapMin: 0.25
    },
    lowConfidence: {
      minConfidence: 0.55
    }
  },
  cache: {
    ttlSeconds: 6 * 60 * 60 // 6h
  },
  budgets: {
    maxPerSession: 1,
    maxPerUserPerDay: 3,
    maxConcurrentPerApp: 5,
    targetP95Seconds: 2.0,
    targetCostUSD: 0.015
  },
  fusionWeights: {
    heuristic: 1.0,
    ml: 1.0,
    llm: 1.1
  }
};

function minutesAgo(tsIso) {
  try {
    const t = new Date(tsIso).getTime();
    return (Date.now() - t) / 60000;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function shouldInvokeLLM({ events = [], heuristic = {}, ml = {} }) {
  const { triggers } = LLM_POLICY;
  const last20 = Array.isArray(events) ? events.slice(-20) : [];

  let pricingViews = 0;
  let dwellOnKey = 0;
  let hasCheckoutStart = false;
  let hasCheckoutComplete = false;
  let minutesSinceCheckoutStart = Number.POSITIVE_INFINITY;

  for (const e of last20) {
    const type = String(e.event_type || e.event || "").toLowerCase();
    const url = String(e.event_payload?.url || e.url || "").toLowerCase();
    const dur = Number(e.event_payload?.duration || 0) || 0;

    if (url.includes("pricing")) pricingViews += 1;
    if (url.includes("pricing") || url.includes("product")) dwellOnKey += dur;

    if (type === "checkout_start") {
      hasCheckoutStart = true;
      minutesSinceCheckoutStart = Math.min(minutesSinceCheckoutStart, minutesAgo(e.timestamp || e.ts));
    }
    if (type === "checkout_complete") hasCheckoutComplete = true;
  }

  const highValue =
    (pricingViews >= triggers.highValue.pricingViewsMin && !hasCheckoutComplete) ||
    (hasCheckoutStart && !hasCheckoutComplete &&
      minutesSinceCheckoutStart >= triggers.highValue.checkoutStartNoCompleteMinutes) ||
    (dwellOnKey >= triggers.highValue.dwellSecondsMin);

  const disagree = triggers.disagreement.keys.some((k) => {
    const hv = heuristic && heuristic[k] ? heuristic[k].value : undefined;
    const mv = ml && ml[k] ? ml[k].value : undefined;
    const hc = Number(heuristic && heuristic[k] ? heuristic[k].confidence : 0);
    const mc = Number(ml && ml[k] ? ml[k].confidence : 0);
    return (hv && mv && hv !== mv) || Math.abs(hc - mc) >= triggers.disagreement.confidenceGapMin;
  });

  const lowConf = triggers.disagreement.keys.some((k) => {
    const hc = Number(heuristic && heuristic[k] ? heuristic[k].confidence : 0);
    const mc = Number(ml && ml[k] ? ml[k].confidence : 0);
    return hc < triggers.lowConfidence.minConfidence && mc < triggers.lowConfidence.minConfidence;
  });

  return { shouldInvoke: highValue || disagree || lowConf, reasons: { highValue, disagree, lowConf } };
}