export function fuseLayers(heur, ml, llm) {
  // Layers are optional; normalize to an array of available layers
  const layers = [heur, ml, llm].filter(Boolean);
  if (layers.length === 0) {
    return { indicators: [], explanation: "No layers available", updated_at: new Date().toISOString() };
  }

  // votes map by 'key:value' => weight sum
  const votes = new Map(); // key: `${key}:${value}` => { weight, value }
  for (const L of layers) {
    const base = Number(L?.confidence ?? 0.5);
    const inds = Array.isArray(L?.indicators) ? L.indicators : [];
    for (const ind of inds) {
      const k = String(ind?.key || "");
      const v = ind?.value;
      if (!k) continue;
      const w = Number(ind?.confidence ?? base);
      const kv = `${k}:${String(v)}`;
      const cur = votes.get(kv) || { weight: 0, value: v };
      votes.set(kv, { weight: cur.weight + (isFinite(w) ? w : 0), value: v });
    }
  }

  // choose top value per key
  const byKey = new Map(); // key => { value, weight }
  for (const [kv, obj] of votes.entries()) {
    const [k] = kv.split(":");
    const cur = byKey.get(k);
    if (!cur || obj.weight > cur.weight) byKey.set(k, { value: obj.value, weight: obj.weight });
  }

  const indicators = Array.from(byKey.entries()).map(([k, v]) => ({
    key: k,
    value: v.value,
    confidence: Math.max(0.1, Math.min(1, v.weight / layers.length)) // normalize to [0,1]
  }));

  return {
    indicators,
    explanation: "Fusion by weighted voting across heuristic, ml, and llm layers.",
    updated_at: new Date().toISOString()
  };
}