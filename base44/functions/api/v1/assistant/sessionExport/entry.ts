import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const session_id = url.searchParams.get('session_id');

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.entities.AssistantSession.filter({ session_id });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];

    // Get all messages and snapshots
    const messages = await base44.entities.AssistantMessage.filter(
      { session_id },
      'turn_index',
      1000
    );

    const snapshots = await base44.entities.InferenceSnapshot.filter(
      { session_id },
      'turn_index',
      1000
    );

    const exportData = {
      session,
      messages,
      snapshots,
      exported_at: new Date().toISOString(),
      exported_by: user.email
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="knxw-assistant-${session_id}.json"`
      }
    });

  } catch (error) {
    console.error('Error exporting session:', error);
    return Response.json({ 
      error: error.message || 'Failed to export session'
    }, { status: 500 });
  }
});