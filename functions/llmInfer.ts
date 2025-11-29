import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const memoryCache = new Map(); // key -> { ts, result }
const CACHE_TTL_MS = 10 * 60 * 1000;

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { events = [], app_id = null } = body || {};

    // Compact last 20 events
    const compact = events.slice(0, 20).map((e) => ({
      t: e.timestamp || e.ts,
      type: e.event_type || e.event,
      url: e.event_payload?.url || e.url || null,
      value: e.event_payload?.value || null,
      dur: e.event_payload?.duration || null
    }));

    const key = await sha256Hex(stableStringify(compact));
    const now = Date.now();
    const cached = memoryCache.get(key);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return Response.json({ llm_inference: cached.result });
    }

    const jsonSchema = {
      type: "object",
      properties: {
        indicators: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              value: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["key", "value", "confidence"]
          }
        },
        reasoning: { type: "string" }
      },
      required: ["indicators"]
    };

    const prompt = [
      "You are a precise psychographic analyst. Infer a few high-signal indicators from recent user behavior.",
      "Return concise JSON with indicators [{key,value,confidence}] and a short reasoning string.",
      "Keys to consider: risk_profile, cognitive_style, emotional_state.mood, and any clearly supported motivation.",
      "Confidence must be 0..1 reflecting strength of evidence.",
      "",
      "Events:",
      stableStringify(compact)
    ].join("\n");

    // Use integrations: Core.InvokeLLM with response schema
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: jsonSchema
    });

    const data = res || {};
    const indicators = Array.isArray(data.indicators) ? data.indicators : [];
    const confidence =
      indicators.length > 0
        ? Math.max(0.5, Math.min(0.95, indicators.reduce((s, i) => s + (i.confidence || 0.5), 0) / indicators.length))
        : 0.6;

    const llm = {
      indicators,
      confidence,
      reasoning: typeof data.reasoning === "string" ? data.reasoning : "LLM inferred indicators from recent behavior.",
      model: "llm@v1"
    };

    memoryCache.set(key, { ts: now, result: llm });

    return Response.json({ llm_inference: llm });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});