import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { identityResolution } from './identityResolution.js';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const payload = await req.json();

    const { data: resolutionData, error: resolutionError } = await identityResolution({
      action: 'resolve_or_create_customer',
      customer_external_ids: payload.customer_external_ids,
    }, base44);

    if (resolutionError) {
      return new Response(JSON.stringify({ error: 'Identity resolution failed', details: resolutionError }), { status: 422 });
    }
    const { customer_id } = resolutionData;

    let userProfile = (await base44.asServiceRole.entities.KnxwUserProfile.filter({ customer_id }, null, 1))[0];
    
    const updateData = {
      risk_profile: {
        ...(userProfile?.risk_profile || {}),
        churn_risk: payload.risk_score,
      },
      data_quality: {
        ...(userProfile?.data_quality || {}),
        last_churn_assessment: payload.event_time,
        churn_assessment_source: payload.metadata?.model_version || 'webhook'
      }
    };
    
    if (userProfile) {
      userProfile = await base44.asServiceRole.entities.KnxwUserProfile.update(userProfile.id, updateData);
    } else {
      userProfile = await base44.asServiceRole.entities.KnxwUserProfile.create({
        customer_id: customer_id,
        ...updateData
      });
    }

    const responsePayload = {
      success: true,
      customer_id: userProfile.customer_id,
      risk_updated: true,
      current_churn_risk: userProfile.risk_profile.churn_risk,
      processed_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(responsePayload), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
});