import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, time_window_days = 30 } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get recent events for the user
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - time_window_days);

    const events = await base44.entities.CapturedEvent.filter({
      user_id,
      timestamp: { $gte: cutoffDate.toISOString() }
    }, '-timestamp', 500);

    // Analyze events for cognitive biases
    const biases = [];

    // Anchoring Bias: User repeatedly returns to the same page/feature
    const pageCounts = {};
    events.forEach(e => {
      if (e.event_type === 'page_view' && e.event_payload?.url) {
        pageCounts[e.event_payload.url] = (pageCounts[e.event_payload.url] || 0) + 1;
      }
    });
    const maxVisits = Math.max(...Object.values(pageCounts), 0);
    if (maxVisits > 10) {
      biases.push({
        bias_name: 'Anchoring Bias',
        strength: Math.min(maxVisits / 20, 1),
        confidence: 0.75,
        explanation: 'User shows repeated focus on specific features, suggesting anchoring to initial impressions.'
      });
    }

    // Confirmation Bias: User clicks similar elements repeatedly
    const elementClicks = {};
    events.forEach(e => {
      if (e.event_type === 'click' && e.event_payload?.element) {
        elementClicks[e.event_payload.element] = (elementClicks[e.event_payload.element] || 0) + 1;
      }
    });
    const clickVariety = Object.keys(elementClicks).length;
    if (clickVariety < 5 && events.length > 50) {
      biases.push({
        bias_name: 'Confirmation Bias',
        strength: 0.65,
        confidence: 0.70,
        explanation: 'Limited exploration of different features suggests preference for familiar interactions.'
      });
    }

    // Recency Bias: Heavy activity in recent period vs earlier
    const midpoint = new Date(cutoffDate.getTime() + (Date.now() - cutoffDate.getTime()) / 2);
    const recentEvents = events.filter(e => new Date(e.timestamp) > midpoint).length;
    const olderEvents = events.length - recentEvents;
    if (recentEvents > olderEvents * 2) {
      biases.push({
        bias_name: 'Recency Bias',
        strength: Math.min(recentEvents / olderEvents / 3, 1),
        confidence: 0.80,
        explanation: 'User shows significantly higher engagement with recent features/content.'
      });
    }

    // Loss Aversion: Exit intent or hesitation before conversion
    const exitIntents = events.filter(e => e.event_type === 'exit_intent').length;
    const formSubmits = events.filter(e => e.event_type === 'form_submit').length;
    if (exitIntents > 3 && formSubmits < 2) {
      biases.push({
        bias_name: 'Loss Aversion',
        strength: 0.72,
        confidence: 0.68,
        explanation: 'Multiple exit intents before conversion suggests hesitation and fear of commitment.'
      });
    }

    // Bandwagon Effect: Following popular paths/features
    // (Would need aggregate data to detect, simplified here)

    return Response.json({
      user_id,
      detected_biases: biases,
      analysis_window_days: time_window_days,
      total_events_analyzed: events.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error detecting cognitive biases:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});