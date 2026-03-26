/**
 * psychographicABAssign
 *
 * Deterministically assigns a user to a variant in a running A/B test,
 * respecting psychographic_targeting conditions defined on the ABTest entity.
 * Returns the assigned variant plus Adaptive UI configuration for that variant.
 *
 * POST body: { user_id, ab_test_id, client_app_id }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Deterministic hash: user_id + test_id → 0..1 float
function deterministicBucket(userId, testId) {
  const str = `${userId}:${testId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

// Evaluate a single psychographic condition against the fused profile
function evaluateCondition(condition, profile) {
  const { field, operator, value } = condition;
  if (!field || !operator || value === undefined) return true;

  // Navigate dot-notation fields
  const parts = field.split('.');
  let actual = profile;
  for (const part of parts) {
    if (actual == null) return false;
    actual = actual[part];
  }

  const numValue = parseFloat(value);

  switch (operator) {
    case 'equals':      return String(actual) === String(value);
    case 'not_equals':  return String(actual) !== String(value);
    case 'greater_than': return !isNaN(numValue) && parseFloat(actual) > numValue;
    case 'less_than':    return !isNaN(numValue) && parseFloat(actual) < numValue;
    case 'contains':     return String(actual).toLowerCase().includes(String(value).toLowerCase());
    case 'not_contains': return !String(actual).toLowerCase().includes(String(value).toLowerCase());
    default: return true;
  }
}

function meetsTargeting(test, fusedProfile) {
  const targeting = test.psychographic_targeting;
  if (!targeting || !targeting.psychographic_conditions?.length) return true;

  return targeting.psychographic_conditions.every(cond => evaluateCondition(cond, fusedProfile));
}

Deno.serve(async (req) => {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
    }

    const { user_id, ab_test_id, client_app_id } = await req.json();
    if (!user_id || !ab_test_id || !client_app_id) {
      return Response.json({ success: false, error: 'user_id, ab_test_id, and client_app_id are required' }, { status: 400 });
    }

    // Check for existing assignment first (idempotent)
    const existing = await base44.asServiceRole.entities.ABTestParticipant.filter(
      { ab_test_id, user_id }, '-assigned_at', 1
    );
    if (existing.length > 0) {
      const participant = existing[0];
      const variants = await base44.asServiceRole.entities.ABTestVariant.filter({ ab_test_id });
      const variant = variants.find(v => v.id === participant.variant_id);
      return Response.json({
        success: true,
        assignment: { variant_id: participant.variant_id, variant_name: variant?.name, already_assigned: true },
        adaptive_ui_config: variant?.adaptive_ui_config || null,
        meta: { requestId },
      });
    }

    // Fetch test
    const tests = await base44.asServiceRole.entities.ABTest.filter({ id: ab_test_id });
    const test = tests[0];
    if (!test) return Response.json({ success: false, error: 'Test not found' }, { status: 404 });
    if (test.status !== 'running') return Response.json({ success: false, error: `Test is not running (status: ${test.status})` }, { status: 409 });

    // Fetch user's psychographic profile for targeting evaluation
    const hybridProfiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ user_id }, '-updated_date', 1);
    const fusedProfile = hybridProfiles[0]?.fused_profile || {};

    // Check psychographic targeting conditions
    if (!meetsTargeting(test, fusedProfile)) {
      return Response.json({
        success: false,
        error: 'User does not meet psychographic targeting conditions for this test',
        eligible: false,
        meta: { requestId },
      });
    }

    // Check traffic allocation (hash-based, deterministic)
    const bucket = deterministicBucket(user_id, ab_test_id);
    if (bucket > (test.traffic_allocation || 1)) {
      return Response.json({
        success: false,
        error: 'User not selected for traffic allocation',
        eligible: false,
        meta: { requestId },
      });
    }

    // Fetch variants and assign via weighted random (deterministic)
    const variants = await base44.asServiceRole.entities.ABTestVariant.filter({ ab_test_id });
    if (!variants.length) {
      return Response.json({ success: false, error: 'No variants defined for this test' }, { status: 409 });
    }

    // Weighted assignment using bucket value
    let cumulative = 0;
    const totalWeight = variants.reduce((s, v) => s + (v.traffic_weight || 1 / variants.length), 0);
    let assignedVariant = variants[0];
    for (const v of variants) {
      cumulative += (v.traffic_weight || 1 / variants.length) / totalWeight;
      if (bucket <= cumulative) {
        assignedVariant = v;
        break;
      }
    }

    // Record participation
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.ABTestParticipant.create({
      ab_test_id,
      variant_id: assignedVariant.id,
      user_id,
      client_app_id,
      assigned_at: now,
      first_exposure_at: now,
      converted: false,
      conversion_events: [],
      metadata: {
        psychographic_segment: fusedProfile.cognitive_style || null,
        top_motivation: fusedProfile.primary_motivation || null,
        bucket_value: bucket,
      },
    });

    // Increment impressions on the variant
    const currentMetrics = assignedVariant.metrics || {};
    await base44.asServiceRole.entities.ABTestVariant.update(assignedVariant.id, {
      metrics: {
        ...currentMetrics,
        impressions: (currentMetrics.impressions || 0) + 1,
      },
    });

    return Response.json({
      success: true,
      assignment: {
        variant_id: assignedVariant.id,
        variant_name: assignedVariant.name,
        already_assigned: false,
      },
      adaptive_ui_config: assignedVariant.adaptive_ui_config || null,
      engagement_template_id: assignedVariant.engagement_template_id || null,
      meta: { requestId },
    });

  } catch (error) {
    console.error(`[${requestId}] psychographicABAssign error:`, error);
    return Response.json({ success: false, error: error.message, meta: { requestId } }, { status: 500 });
  }
});