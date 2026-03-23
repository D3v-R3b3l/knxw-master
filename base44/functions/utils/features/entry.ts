export function makeWindowFeatures(events = []) {
  const now = Date.now();
  const feats = {
    n_events: 0,
    n_click: 0,
    n_page_view: 0,
    n_form_submit: 0,
    n_scroll: 0,
    n_hover: 0,
    dwell_sum: 0,
    dwell_avg: 0,
    last_minutes: 0,
    pricing_views: 0,
    product_views: 0,
    checkout_starts: 0,
    checkout_completes: 0,
  };

  if (!Array.isArray(events) || events.length === 0) return feats;

  feats.n_events = events.length;

  let firstTs = null;
  events.forEach((e) => {
    const t = new Date(e.timestamp || e.ts || now).getTime();
    if (!firstTs || t < firstTs) firstTs = t;

    const type = String(e.event_type || e.event || "").toLowerCase();
    feats[`n_${type}`] = (feats[`n_${type}`] || 0) + 1;

    const url = e.event_payload?.url || e.url || "";
    if (url.includes("pricing")) feats.pricing_views += 1;
    if (url.includes("product")) feats.product_views += 1;

    if (type === "checkout_start") feats.checkout_starts += 1;
    if (type === "checkout_complete") feats.checkout_completes += 1;

    const dur = Number(e.event_payload?.duration || 0);
    if (dur > 0) feats.dwell_sum += dur;
  });

  feats.dwell_avg = feats.n_events > 0 ? feats.dwell_sum / feats.n_events : 0;
  feats.last_minutes = firstTs ? Math.max(0, Math.round((now - firstTs) / 60000)) : 0;

  return feats;
}

// Simple, deploy-safe sequence "embedding": hashed counts across event types and coarse URL buckets.
export function makeSeqEmbedding(events = []) {
  const buckets = {
    type_click: 0,
    type_page_view: 0,
    type_form_submit: 0,
    type_scroll: 0,
    url_pricing: 0,
    url_product: 0,
    url_help: 0,
  };
  for (const e of events) {
    const type = String(e.event_type || "").toLowerCase();
    if (buckets[`type_${type}`] !== undefined) buckets[`type_${type}`] += 1;

    const url = (e.event_payload?.url || "").toLowerCase();
    if (url.includes("pricing")) buckets.url_pricing += 1;
    if (url.includes("product")) buckets.url_product += 1;
    if (url.includes("help") || url.includes("docs") || url.includes("faq")) buckets.url_help += 1;
  }
  // Export as array for any ML that expects a vector
  return [
    buckets.type_click,
    buckets.type_page_view,
    buckets.type_form_submit,
    buckets.type_scroll,
    buckets.url_pricing,
    buckets.url_product,
    buckets.url_help,
  ];
}