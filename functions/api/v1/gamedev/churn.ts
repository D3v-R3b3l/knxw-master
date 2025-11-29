import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const ChurnQuerySchema = z.object({
  player_id: z.string().min(1).max(256)
});

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET' } 
      });
    }

    const url = new URL(req.url);
    const playerId = url.searchParams.get('player_id');

    if (!playerId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameter: player_id',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    ChurnQuerySchema.parse({ player_id: playerId });

    // Get player events to analyze recency
    const recentEvents = await base44.asServiceRole.entities.CapturedEvent.filter({
      user_id: playerId
    }, '-timestamp', 50);

    // Get player profile
    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ 
      user_id: playerId 
    }, '-updated_date', 1);
    const profile = profiles[0];

    let churnResponse;

    // Calculate recency risk
    const now = Date.now();
    const lastEventTime = recentEvents[0] ? new Date(recentEvents[0].timestamp).getTime() : 0;
    const daysSinceLastEvent = lastEventTime > 0 ? (now - lastEventTime) / (1000 * 60 * 60 * 24) : 999;

    let recencyRisk = 0;
    if (daysSinceLastEvent > 14) recencyRisk = 0.9;
    else if (daysSinceLastEvent > 7) recencyRisk = 0.6;
    else if (daysSinceLastEvent > 3) recencyRisk = 0.3;
    else recencyRisk = 0.1;

    // Calculate engagement trend risk
    const last7Days = recentEvents.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      return (now - eventTime) < (7 * 24 * 60 * 60 * 1000);
    }).length;

    const engagementRisk = last7Days < 5 ? 0.7 : last7Days < 10 ? 0.4 : 0.1;

    // Psychographic risk factors
    let psychoRisk = 0.5;
    const drivers = [];
    const actions = [];

    if (profile && profile.fused_profile) {
      const fusedProfile = profile.fused_profile;
      const motivations = fusedProfile.motivations || [];
      
      // Check for frustration indicators
      const hasFrustration = motivations.some(m => 
        m.label === 'frustration' || m.label === 'dissatisfaction'
      );
      
      if (hasFrustration) {
        psychoRisk += 0.2;
        drivers.push('Frustration detected in motivation profile');
        actions.push('Offer easier difficulty option or tutorial refresh');
      }

      // Check risk profile
      if (fusedProfile.risk_profile === 'conservative' && last7Days < 10) {
        psychoRisk += 0.15;
        drivers.push('Conservative player with declining engagement');
        actions.push('Reduce challenge intensity; offer safe progression paths');
      }

      // Check cognitive style mismatch
      if (fusedProfile.cognitive_style === 'systematic' && engagementRisk > 0.5) {
        drivers.push('Systematic thinker may need clearer goals');
        actions.push('Highlight structured progression and achievement paths');
      }
    }

    // Combine factors
    const compositeScore = (recencyRisk * 0.4 + engagementRisk * 0.3 + psychoRisk * 0.3);
    
    let riskLevel;
    if (compositeScore > 0.7) riskLevel = 'high';
    else if (compositeScore > 0.4) riskLevel = 'medium';
    else riskLevel = 'low';

    if (daysSinceLastEvent > 7) {
      drivers.push(`${Math.round(daysSinceLastEvent)} days since last session`);
      actions.push('Send re-engagement push notification with exclusive reward');
    }

    if (engagementRisk > 0.5) {
      drivers.push(`Low engagement: ${last7Days} events in last 7 days`);
      actions.push('Offer time-limited event or daily login bonus');
    }

    churnResponse = {
      risk_level: riskLevel,
      score: parseFloat(compositeScore.toFixed(2)),
      drivers: drivers.length > 0 ? drivers : ['No significant risk factors detected'],
      actions: actions.length > 0 ? actions : ['Continue normal engagement strategy'],
      metrics: {
        days_since_last_event: Math.round(daysSinceLastEvent),
        events_last_7_days: last7Days,
        recency_risk: parseFloat(recencyRisk.toFixed(2)),
        engagement_risk: parseFloat(engagementRisk.toFixed(2)),
        psychographic_risk: parseFloat(psychoRisk.toFixed(2))
      }
    };

    // Log usage
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      api_key_id: apiKey?.id,
      endpoint: '/api/v1/gamedev/churn',
      method: 'GET',
      status_code: 200,
      latency_ms: Math.round(performance.now() - startTime),
      bytes_in: 0,
      bytes_out: new TextEncoder().encode(JSON.stringify(churnResponse)).length,
      game_context: { player_id: playerId },
      timestamp: new Date().toISOString(),
      request_id: requestId,
      is_rate_limited: false
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: churnResponse,
      meta: { 
        requestId, 
        tenantId, 
        latencyMs: Math.round(performance.now() - startTime) 
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] GameDev churn endpoint error:`, error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message,
      meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});