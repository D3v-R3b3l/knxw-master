/**
 * recordABTestConversion
 *
 * Records a conversion event for a user in an A/B test and updates
 * variant-level metrics (conversions, conversion_rate, avg_engagement_score).
 *
 * POST body: { user_id, ab_test_id, metric_name, value? }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
    }

    const { user_id, ab_test_id, metric_name = 'conversion', value = 1 } = await req.json();
    if (!user_id || !ab_test_id) {
      return Response.json({ success: false, error: 'user_id and ab_test_id are required' }, { status: 400 });
    }

    // Find participant record
    const participants = await base44.asServiceRole.entities.ABTestParticipant.filter(
      { ab_test_id, user_id }, '-assigned_at', 1
    );
    if (!participants.length) {
      return Response.json({ success: false, error: 'Participant not found in this test' }, { status: 404 });
    }

    const participant = participants[0];
    const now = new Date().toISOString();

    const conversionEvents = participant.conversion_events || [];
    const updatedEvents = [...conversionEvents, { metric_name, event_type: metric_name, value, timestamp: now }];
    const isPrimaryConversion = metric_name === 'conversion';
    const shouldIncrementConversion = isPrimaryConversion ? !participant.converted : false;

    await base44.asServiceRole.entities.ABTestParticipant.update(participant.id, {
      converted: participant.converted || isPrimaryConversion,
      last_interaction_at: now,
      conversion_events: updatedEvents,
    });

    const variants = await base44.asServiceRole.entities.ABTestVariant.filter({ id: participant.variant_id });
    const variant = variants[0];
    if (variant) {
      const m = variant.metrics || {};
      const impressions = Math.max(m.impressions || 0, 1);
      const conversions = (m.conversions || 0) + (shouldIncrementConversion ? 1 : 0);
      const conversionRate = impressions > 0 ? conversions / impressions : 0;
      const totalEvents = updatedEvents.length;
      const totalValue = updatedEvents.reduce((sum, event) => sum + Number(event.value || 0), 0);
      const avgEngagementScore = totalEvents > 0 ? totalValue / totalEvents : 0;

      await base44.asServiceRole.entities.ABTestVariant.update(variant.id, {
        metrics: {
          ...m,
          impressions,
          conversions,
          conversion_rate: parseFloat(conversionRate.toFixed(4)),
          avg_engagement_score: parseFloat(avgEngagementScore.toFixed(4)),
        },
      });
    }

    return Response.json({
      success: true,
      data: {
        participant_id: participant.id,
        variant_id: participant.variant_id,
        metric_name,
        value,
        converted: true,
      },
      meta: { requestId },
    });

  } catch (error) {
    console.error(`[${requestId}] recordABTestConversion error:`, error);
    return Response.json({ success: false, error: error.message, meta: { requestId } }, { status: 500 });
  }
});