import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const token = authHeader.split(' ')[1];
    base44.auth.setToken(token);
    const actor = await base44.auth.me();
    if (!actor) return new Response('Unauthorized', { status: 401 });

    const { subject_user_id, subject_email } = await req.json();
    if (!subject_user_id && !subject_email) {
      return new Response(JSON.stringify({ error: 'subject_user_id or subject_email is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch records across entities by user_id (primary), email mapping if available
    const userId = subject_user_id || subject_email;

    const [events, profiles, insights, engagements] = await Promise.all([
      base44.entities.CapturedEvent.filter({ user_id: userId }),
      base44.entities.UserPsychographicProfile.filter({ user_id: userId }),
      base44.entities.PsychographicInsight.filter({ user_id: userId }),
      base44.entities.EngagementDelivery.filter({ user_id: userId })
    ]);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      subject_user_id: userId,
      subject_email: subject_email || null,
      data: { events, profiles, insights, engagements }
    };

    // Log audit
    await base44.entities.AuditLog.create({
      action: 'compliance.export',
      actor_id: actor.id,
      actor_email: actor.email,
      target_type: 'user',
      target_id: userId,
      details: { counts: { events: events.length, profiles: profiles.length, insights: insights.length, engagements: engagements.length } },
      ip: req.headers.get('x-forwarded-for') || '',
      user_agent: req.headers.get('user-agent') || ''
    });

    return new Response(JSON.stringify(exportPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="knxw_export_${userId}.json"`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to export data', details: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});