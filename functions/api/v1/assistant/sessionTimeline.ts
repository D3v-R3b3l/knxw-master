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

    // Get all messages and snapshots for this session
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

    // Build timeline
    const timeline = [];
    for (const message of messages) {
      const snapshot = snapshots.find(s => s.turn_index === message.turn_index);
      timeline.push({
        turn_index: message.turn_index,
        message,
        snapshot: snapshot || null
      });
    }

    return Response.json({
      success: true,
      session_id,
      timeline
    });

  } catch (error) {
    console.error('Error fetching session timeline:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch timeline'
    }, { status: 500 });
  }
});