import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await req.json();

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.entities.AssistantSession.filter({ session_id });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];

    // Update session status
    await base44.entities.AssistantSession.update(session.id, {
      status: 'ended',
      ended_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      session_id,
      total_turns: session.total_turns,
      questions_asked: session.questions_asked,
      final_profile: session.final_profile
    });

  } catch (error) {
    console.error('Error ending assistant session:', error);
    return Response.json({ 
      error: error.message || 'Failed to end session'
    }, { status: 500 });
  }
});