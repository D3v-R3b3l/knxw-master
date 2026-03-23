import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { identityResolution } from './identityResolution.js';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const payload = await req.json();

    const { event_id } = payload;
    if (!event_id) {
      return new Response(JSON.stringify({ error: 'event_id is required' }), { status: 400 });
    }
    const existingEvent = await base44.asServiceRole.entities.KnxwSignalEvent.filter({ event_id }, null, 1);
    if (existingEvent && existingEvent.length > 0) {
      return new Response(JSON.stringify({ success: true, status: 'already_exists', event: existingEvent[0] }), { status: 200 });
    }

    const { data: resolutionData, error: resolutionError } = await identityResolution({
      action: 'resolve_or_create_customer',
      customer_external_ids: payload.customer_external_ids,
      account_external_ids: payload.account_external_ids,
      email: payload.email
    }, base44);

    if (resolutionError) {
      return new Response(JSON.stringify({ error: 'Identity resolution failed', details: resolutionError }), { status: 422 });
    }

    const { customer_id } = resolutionData;

    const newSignal = await base44.asServiceRole.entities.KnxwSignalEvent.create({
      event_id,
      customer_id,
      signal_type: payload.signal_type,
      score: payload.score,
      confidence: payload.confidence,
      payload: payload.payload,
      event_time: payload.event_time,
      source_system: 'webhook',
      processing_metadata: {
        ingested_at: new Date().toISOString()
      }
    });

    const responsePayload = {
      success: true,
      event_id: newSignal.event_id,
      customer_id: newSignal.customer_id,
      identity_resolution: resolutionData,
      signal_processing: {
        signal_id: newSignal.id,
        status: 'ingested'
      },
      processed_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(responsePayload), { status: 201 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
});