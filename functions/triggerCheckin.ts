import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Require authenticated user (user-scoped)
  const isAuthed = await base44.auth.isAuthenticated();
  if (!isAuthed) return json({ error: 'Unauthorized' }, 401);

  const user = await base44.auth.me();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  // Parse payload
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  const { user_id, context } = payload || {};
  if (!user_id || !context) {
    return json({ error: 'user_id and context are required' }, 400);
  }

  // Fetch psychographic profile (best-effort)
  let profile = null;
  try {
    const results = await base44.entities.UserPsychographicProfile.filter({ user_id }, null, 1);
    profile = (results && results[0]) || null;
  } catch {
    // Continue with null profile
  }

  // Heuristic check-in generator (no external integrations)
  const trait = (k) => {
    const v = profile?.[k];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const cog = (profile?.cognitive_style || profile?.thinking_style || '').toString().toLowerCase();
  const risk = (profile?.risk_profile || profile?.risk_tolerance || '').toString().toLowerCase();

  const openness = trait('openness') ?? trait('O') ?? null;
  const conscientiousness = trait('conscientiousness') ?? trait('C') ?? null;
  const extraversion = trait('extraversion') ?? trait('E') ?? null;
  const agreeableness = trait('agreeableness') ?? trait('A') ?? null;
  const neuroticism = trait('neuroticism') ?? trait('N') ?? null;

  const questions = [];

  // Q1: general sentiment framed by cognitive style
  if (cog.includes('analytical') || cog.includes('systematic')) {
    questions.push('Is anything unclear or missing detail you’d like to see here?');
  } else if (cog.includes('intuitive') || cog.includes('creative')) {
    questions.push('Does this view feel intuitive, or would a simpler walkthrough help?');
  } else {
    questions.push('How are you feeling about this page so far?');
  }

  // Q2: actionability tuned by risk tolerance
  if (risk.includes('conservative') || risk.includes('low')) {
    questions.push('Would a short guided tour help you decide the next step confidently?');
  } else if (risk.includes('aggressive') || risk.includes('high')) {
    questions.push('Want quick suggestions to move faster toward your goal?');
  } else {
    questions.push('Would you like suggestions on what to do next?');
  }

  // Q3: personality-tailored nudge (Big Five fallback)
  if (openness !== null && openness >= 60) {
    questions.push('Interested in exploring an advanced view with richer insights?');
  } else if (conscientiousness !== null && conscientiousness >= 60) {
    questions.push('Should we add a checklist to ensure nothing gets missed here?');
  } else if (extraversion !== null && extraversion >= 60) {
    questions.push('Would a collaborative summary be useful to share with your team?');
  } else if (agreeableness !== null && agreeableness >= 60) {
    questions.push('Would recommendations focused on team alignment be helpful?');
  } else if (neuroticism !== null && neuroticism >= 60) {
    questions.push('Prefer a calmer, simpler layout here to reduce any friction?');
  } else {
    questions.push('Want the system to adapt this view based on your preferences?');
  }

  const checkIn = {
    title: 'Quick check-in',
    questions
  };

  // Log event (best-effort)
  try {
    await base44.entities.CapturedEvent.create({
      user_id,
      session_id: `sess_${Math.random().toString(36).slice(2, 10)}`,
      event_type: 'engagement_checkin_issued',
      event_payload: { context, title: checkIn.title },
      timestamp: new Date().toISOString(),
      processed: true
    });
  } catch {
    // ignore
  }

  return json(checkIn, 200);
});