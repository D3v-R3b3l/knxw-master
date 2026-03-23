import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode = 'demo', initial_profile = {} } = await req.json();

    const session_id = `asst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new assistant session
    const session = await base44.entities.AssistantSession.create({
      session_id,
      user_email: user.email,
      mode,
      initial_profile,
      consent_analytics: true,
      consent_personalization: true,
      started_at: new Date().toISOString(),
      status: 'active',
      total_turns: 0,
      questions_asked: 0
    });

    // Create initial system message
    await base44.entities.AssistantMessage.create({
      session_id,
      turn_index: 0,
      role: 'system',
      content: 'Session initialized. The AI assistant will now help understand your psychographic profile.',
      timestamp: new Date().toISOString()
    });

    // Create initial inference snapshot (baseline)
    await base44.entities.InferenceSnapshot.create({
      session_id,
      turn_index: 0,
      motivation_stack: [],
      emotional_state: {},
      cognitive_style: {},
      risk_profile: {},
      personality_traits: {},
      reasoning: [],
      uncertainty_map: {
        lowest_confidence_trait: 'all',
        lowest_confidence_score: 0,
        suggested_question: 'Tell me about what brings you here today.'
      },
      recommended_actions: [],
      overall_confidence: 0,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      session_id,
      session
    });

  } catch (error) {
    console.error('Error starting assistant session:', error);
    return Response.json({ 
      error: error.message || 'Failed to start session'
    }, { status: 500 });
  }
});