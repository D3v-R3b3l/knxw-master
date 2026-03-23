import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Predefined personas with psychographic state vectors
const PERSONAS = {
  'high_risk_analytical': {
    label: 'High-Risk Analytical',
    risk_profile: 'aggressive',
    cognitive_style: 'analytical',
    emotional_state: { mood: 'confident', confidence_score: 0.85, energy_level: 'high' },
    personality_traits: { openness: 0.7, conscientiousness: 0.9, extraversion: 0.4, agreeableness: 0.5, neuroticism: 0.3 },
    motivation_stack: [{ label: 'mastery', weight: 0.7 }, { label: 'achievement', weight: 0.6 }, { label: 'autonomy', weight: 0.5 }],
    event_sequence: [
      { event_type: 'page_view', payload: { url: '/dashboard', duration: 120 }, delay_ms: 0 },
      { event_type: 'click', payload: { element: 'advanced-settings-btn' }, delay_ms: 800 },
      { event_type: 'scroll', payload: { url: '/pricing', duration: 45 }, delay_ms: 1500 },
      { event_type: 'click', payload: { element: 'enterprise-plan-cta' }, delay_ms: 2200 },
      { event_type: 'form_focus', payload: { element: 'checkout-form', value: 'enterprise' }, delay_ms: 3000 },
      { event_type: 'time_on_page', payload: { url: '/pricing', duration: 240 }, delay_ms: 5000 },
    ]
  },
  'low_risk_intuitive': {
    label: 'Low-Risk Intuitive',
    risk_profile: 'conservative',
    cognitive_style: 'intuitive',
    emotional_state: { mood: 'anxious', confidence_score: 0.45, energy_level: 'low' },
    personality_traits: { openness: 0.6, conscientiousness: 0.5, extraversion: 0.7, agreeableness: 0.8, neuroticism: 0.7 },
    motivation_stack: [{ label: 'security', weight: 0.8 }, { label: 'belonging', weight: 0.6 }, { label: 'comfort', weight: 0.5 }],
    event_sequence: [
      { event_type: 'page_view', payload: { url: '/home', duration: 30 }, delay_ms: 0 },
      { event_type: 'scroll', payload: { url: '/home', duration: 20 }, delay_ms: 500 },
      { event_type: 'hover', payload: { element: 'pricing-link' }, delay_ms: 1200 },
      { event_type: 'page_view', payload: { url: '/features', duration: 60 }, delay_ms: 2000 },
      { event_type: 'exit_intent', payload: { url: '/features' }, delay_ms: 3500 },
    ]
  },
  'moderate_systematic': {
    label: 'Moderate Systematic',
    risk_profile: 'moderate',
    cognitive_style: 'systematic',
    emotional_state: { mood: 'neutral', confidence_score: 0.65, energy_level: 'medium' },
    personality_traits: { openness: 0.5, conscientiousness: 0.8, extraversion: 0.5, agreeableness: 0.6, neuroticism: 0.4 },
    motivation_stack: [{ label: 'efficiency', weight: 0.7 }, { label: 'reliability', weight: 0.6 }, { label: 'value', weight: 0.5 }],
    event_sequence: [
      { event_type: 'page_view', payload: { url: '/features', duration: 90 }, delay_ms: 0 },
      { event_type: 'click', payload: { element: 'feature-comparison-tab' }, delay_ms: 1000 },
      { event_type: 'scroll', payload: { url: '/features', duration: 120 }, delay_ms: 2000 },
      { event_type: 'page_view', payload: { url: '/pricing', duration: 180 }, delay_ms: 3000 },
      { event_type: 'click', payload: { element: 'faq-accordion-item-1' }, delay_ms: 4500 },
      { event_type: 'form_focus', payload: { element: 'contact-form', value: '' }, delay_ms: 6000 },
      { event_type: 'form_submit', payload: { element: 'contact-form', value: 'demo-request' }, delay_ms: 7000 },
    ]
  },
  'excited_creative': {
    label: 'Excited Creative',
    risk_profile: 'moderate',
    cognitive_style: 'creative',
    emotional_state: { mood: 'excited', confidence_score: 0.75, energy_level: 'high' },
    personality_traits: { openness: 0.95, conscientiousness: 0.4, extraversion: 0.85, agreeableness: 0.7, neuroticism: 0.35 },
    motivation_stack: [{ label: 'novelty', weight: 0.9 }, { label: 'self_expression', weight: 0.7 }, { label: 'connection', weight: 0.6 }],
    event_sequence: [
      { event_type: 'page_view', payload: { url: '/blog', duration: 45 }, delay_ms: 0 },
      { event_type: 'click', payload: { element: 'blog-post-1' }, delay_ms: 600 },
      { event_type: 'scroll', payload: { url: '/blog/ai-personalization', duration: 90 }, delay_ms: 1400 },
      { event_type: 'click', payload: { element: 'social-share-twitter' }, delay_ms: 2500 },
      { event_type: 'page_view', payload: { url: '/demo', duration: 60 }, delay_ms: 3200 },
      { event_type: 'click', payload: { element: 'start-free-trial-cta' }, delay_ms: 4000 },
    ]
  },
  'uncertain_fatigued': {
    label: 'Uncertain & Fatigued',
    risk_profile: 'conservative',
    cognitive_style: 'intuitive',
    emotional_state: { mood: 'uncertain', confidence_score: 0.3, energy_level: 'low' },
    personality_traits: { openness: 0.4, conscientiousness: 0.45, extraversion: 0.35, agreeableness: 0.65, neuroticism: 0.8 },
    motivation_stack: [{ label: 'simplicity', weight: 0.9 }, { label: 'trust', weight: 0.8 }, { label: 'reassurance', weight: 0.7 }],
    event_sequence: [
      { event_type: 'page_view', payload: { url: '/home', duration: 15 }, delay_ms: 0 },
      { event_type: 'scroll', payload: { url: '/home', duration: 10 }, delay_ms: 300 },
      { event_type: 'page_view', payload: { url: '/pricing', duration: 20 }, delay_ms: 800 },
      { event_type: 'exit_intent', payload: { url: '/pricing' }, delay_ms: 1500 },
      { event_type: 'page_view', payload: { url: '/pricing', duration: 30 }, delay_ms: 2500 },
      { event_type: 'time_on_page', payload: { url: '/pricing', duration: 180 }, delay_ms: 3000 },
    ]
  }
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { persona_id, client_app_id } = await req.json();

  const persona = PERSONAS[persona_id];
  if (!persona) {
    return Response.json({ error: 'Unknown persona' }, { status: 400 });
  }

  const simUserId = `sim_${persona_id}_${Date.now()}`;
  const simSessionId = `sim_session_${Date.now()}`;
  const now = new Date();

  // 1. Build simulated CapturedEvent records (in-memory, not persisted)
  const simulatedEvents = persona.event_sequence.map((ev, i) => ({
    id: `sim_evt_${i}`,
    user_id: simUserId,
    session_id: simSessionId,
    event_type: ev.event_type,
    event_payload: ev.payload,
    timestamp: new Date(now.getTime() + ev.delay_ms).toISOString(),
    processed: false,
    is_demo: true,
    device_info: { user_agent: 'SimulationMode/1.0', screen_resolution: '1920x1080', viewport_size: '1280x800' }
  }));

  // 2. Build predicted psychographic profile from persona definition
  const predictedProfile = {
    user_id: simUserId,
    schema_version: 'v1.4.0',
    risk_profile: persona.risk_profile,
    cognitive_style: persona.cognitive_style,
    emotional_state: persona.emotional_state,
    personality_traits: persona.personality_traits,
    motivation_stack_v2: persona.motivation_stack,
    motivation_labels: persona.motivation_stack.map(m => m.label),
    motivation_confidence_score: 0.82,
    emotional_state_confidence_score: 0.76,
    risk_profile_confidence_score: 0.88,
    cognitive_style_confidence_score: 0.79,
    last_analyzed: now.toISOString(),
    is_demo: true,
    profile_reasoning: {
      personality_explanation: `Derived from ${persona.event_sequence.length} simulated behavioral signals.`,
      emotional_state_reasoning: `Inferred from interaction velocity, dwell times, and exit patterns.`,
      cognitive_style_rationale: `Navigation sequence and content interaction style indicate ${persona.cognitive_style} processing.`,
      motivation_basis: `Click patterns and scroll depth signal primary motivation: ${persona.motivation_stack[0]?.label}.`,
      key_recent_events: simulatedEvents.map(e => `${e.event_type} on ${e.event_payload?.url || e.event_payload?.element || 'unknown'}`)
    }
  };

  // 3. Generate predicted PsychographicInsights based on persona patterns
  const predictedInsights = generateInsights(persona, simulatedEvents, simUserId);

  // 4. Fetch real EngagementRules and evaluate which would trigger
  let engagementRules = [];
  try {
    if (client_app_id) {
      engagementRules = await base44.entities.EngagementRule.filter({ client_app_id, status: 'active' });
    } else {
      engagementRules = await base44.entities.EngagementRule.list('-created_date', 50);
      engagementRules = engagementRules.filter(r => r.status === 'active');
    }
  } catch (_) {
    engagementRules = [];
  }

  const triggeredRules = evaluateRules(engagementRules, predictedProfile, simulatedEvents);

  return Response.json({
    persona_id,
    persona_label: persona.label,
    sim_user_id: simUserId,
    sim_session_id: simSessionId,
    simulated_events: simulatedEvents,
    predicted_profile: predictedProfile,
    predicted_insights: predictedInsights,
    triggered_rules: triggeredRules,
    evaluated_rules_count: engagementRules.length,
    generated_at: now.toISOString(),
  });
});

function generateInsights(persona, events, userId) {
  const insights = [];
  const exitEvents = events.filter(e => e.event_type === 'exit_intent');
  const clickEvents = events.filter(e => e.event_type === 'click');
  const formEvents = events.filter(e => e.event_type === 'form_submit' || e.event_type === 'form_focus');

  // Exit intent insight
  if (exitEvents.length > 0) {
    insights.push({
      id: 'sim_insight_exit',
      user_id: userId,
      insight_type: 'emotional_trigger',
      title: 'Exit Intent Detected — Friction Point Identified',
      description: `Persona exhibited ${exitEvents.length} exit intent signal(s). Combined with ${persona.emotional_state.mood} mood and ${persona.risk_profile} risk profile, this indicates hesitation at a decision point.`,
      confidence_score: 0.78,
      priority: 'high',
      actionable_recommendations: [
        'Trigger a low-pressure reassurance message',
        'Display social proof or trust signals',
        persona.cognitive_style === 'analytical' ? 'Show a detailed comparison table' : 'Show a simple one-click CTA'
      ],
      is_demo: true,
    });
  }

  // Engagement pattern insight
  const avgDwell = events.filter(e => e.event_payload?.duration).reduce((s, e) => s + e.event_payload.duration, 0) / Math.max(events.filter(e => e.event_payload?.duration).length, 1);
  if (avgDwell > 60) {
    insights.push({
      id: 'sim_insight_dwell',
      user_id: userId,
      insight_type: 'behavioral_pattern',
      title: 'High Content Engagement — Research-Oriented Session',
      description: `Average dwell time of ${Math.round(avgDwell)}s per page indicates deep content consumption. ${persona.cognitive_style === 'systematic' ? 'Systematic' : 'Analytical'} users with this dwell pattern show 2.3× higher conversion likelihood.`,
      confidence_score: 0.72,
      priority: 'medium',
      actionable_recommendations: [
        'Surface detailed documentation or case studies',
        'Offer a personalized demo call',
      ],
      is_demo: true,
    });
  }

  // Motivation-based insight
  const topMotivation = persona.motivation_stack[0];
  if (topMotivation) {
    insights.push({
      id: 'sim_insight_motivation',
      user_id: userId,
      insight_type: 'motivation_shift',
      title: `Primary Motivation Identified: ${topMotivation.label}`,
      description: `Behavioral sequence strongly signals "${topMotivation.label}" as primary driver (weight: ${topMotivation.weight.toFixed(2)}). Messaging and CTAs should align with this motivation to maximize resonance.`,
      confidence_score: 0.82,
      priority: topMotivation.weight > 0.7 ? 'high' : 'medium',
      actionable_recommendations: [
        `Frame value propositions around "${topMotivation.label}"`,
        'Personalize onboarding flow to reinforce this motivation',
      ],
      is_demo: true,
    });
  }

  // Form conversion insight
  if (formEvents.length > 0) {
    const submitted = formEvents.filter(e => e.event_type === 'form_submit');
    insights.push({
      id: 'sim_insight_form',
      user_id: userId,
      insight_type: 'engagement_optimization',
      title: submitted.length > 0 ? 'Form Conversion — High Purchase Intent' : 'Form Engagement Without Submission — Conversion Risk',
      description: submitted.length > 0
        ? `Persona completed ${submitted.length} form submission(s), indicating strong purchase intent. Follow up quickly to capitalize on momentum.`
        : `Persona engaged with a form but did not submit. ${persona.emotional_state.mood === 'anxious' ? 'Anxiety signals suggest friction in the form flow.' : 'Consider simplifying the form.'}`,
      confidence_score: 0.85,
      priority: 'high',
      actionable_recommendations: [
        submitted.length > 0 ? 'Trigger immediate onboarding sequence' : 'Reduce form fields to essentials',
        'Send a follow-up email within 30 minutes',
      ],
      is_demo: true,
    });
  }

  return insights;
}

function evaluateRules(rules, profile, events) {
  const triggered = [];

  for (const rule of rules) {
    const conditions = rule.trigger_conditions || {};
    const psychConds = conditions.psychographic_conditions || [];
    const behavConds = conditions.behavioral_conditions || [];

    let psychMatch = psychConds.length === 0;
    if (psychConds.length > 0) {
      psychMatch = psychConds.every(cond => {
        const val = getNestedValue(profile, cond.field);
        return evaluateCondition(val, cond.operator, cond.value);
      });
    }

    let behavMatch = behavConds.length === 0;
    if (behavConds.length > 0) {
      behavMatch = behavConds.every(cond => {
        const matchingEvents = events.filter(e => e.event_type === cond.event_type);
        if (cond.frequency === 'never') return matchingEvents.length === 0;
        if (cond.frequency === 'once') return matchingEvents.length >= 1;
        if (cond.frequency === 'multiple') return matchingEvents.length > 1;
        return matchingEvents.length >= 1;
      });
    }

    if (psychMatch && behavMatch) {
      triggered.push({
        rule_id: rule.id,
        rule_name: rule.name,
        engagement_action: rule.engagement_action,
        match_reason: buildMatchReason(psychConds, behavConds, profile, events),
      });
    }
  }

  return triggered;
}

function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((cur, key) => cur?.[key], obj);
}

function evaluateCondition(val, operator, target) {
  if (val === undefined || val === null) return false;
  switch (operator) {
    case 'equals': return String(val) === String(target);
    case 'not_equals': return String(val) !== String(target);
    case 'greater_than': return Number(val) > Number(target);
    case 'less_than': return Number(val) < Number(target);
    case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
    case 'not_contains': return !String(val).toLowerCase().includes(String(target).toLowerCase());
    default: return false;
  }
}

function buildMatchReason(psychConds, behavConds, profile, events) {
  const reasons = [];
  psychConds.forEach(c => {
    const val = getNestedValue(profile, c.field);
    reasons.push(`${c.field} ${c.operator} "${c.value}" → actual: "${val}"`);
  });
  behavConds.forEach(c => {
    const count = events.filter(e => e.event_type === c.event_type).length;
    reasons.push(`event "${c.event_type}" frequency=${c.frequency} → found ${count} events`);
  });
  return reasons;
}