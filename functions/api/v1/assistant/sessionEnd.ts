import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const base44 = createClientFromRequest(req);
    const data = await req.json();
    const { session_id } = data;

    if (!session_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: session_id'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify session exists
    const sessions = await base44.asServiceRole.entities.AssistantSession.filter({
      session_id
    }, null, 1);

    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const session = sessions[0];

    // Update session to ended status
    await base44.asServiceRole.entities.AssistantSession.update(session.id, {
      status: 'ended',
      ended_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      session_id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('sessionEnd error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});