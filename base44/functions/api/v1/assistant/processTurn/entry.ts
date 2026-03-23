import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { buildPsychographicInferencePrompt } from '../../../lib/prompts.js';

/**
 * SLOW background worker: Processes a message, calls LLM, and saves results.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id, turn_index, message } = await req.json();

    if (!session_id || !turn_index || !message) {
      return Response.json({ error: 'Missing session_id, turn_index, or message' }, { status: 400 });
    }

    const serviceRoleClient = base44.asServiceRole;
    const startTime = Date.now();

    // Get session and conversation history
    const sessions = await serviceRoleClient.entities.AssistantSession.filter({ session_id });
    const session = sessions[0];
    const messages = await serviceRoleClient.entities.AssistantMessage.filter(
      { session_id },
      '-turn_index',
      50
    );
    const snapshots = await serviceRoleClient.entities.InferenceSnapshot.filter(
      { session_id },
      '-turn_index',
      1
    );

    const conversationHistory = messages.map(m => ({ role: m.role, content: m.content })).reverse();

    // Call LLM for psychographic inference
    const llmResponse = await serviceRoleClient.integrations.Core.InvokeLLM({
      prompt: buildPsychographicInferencePrompt(conversationHistory, snapshots[0] || {}),
      response_json_schema: {
        type: 'object',
        properties: {
          assistant_response: { type: 'string', description: "A natural, conversational response to the user's message." },
          motivation_stack: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, weight: { type: 'number' }, confidence: { type: 'number' } } } },
          emotional_state: { type: 'object', properties: { mood: { type: 'string' }, confidence: { type: 'number' }, energy_level: { type: 'string' } } },
          cognitive_style: { type: 'object', properties: { style: { type: 'string' }, confidence: { type: 'number' } } },
          risk_profile: { type: 'object', properties: { profile: { type: 'string' }, confidence: { type: 'number' } } },
          personality_traits: { type: 'object', properties: { openness: { type: 'number' }, conscientiousness: { type: 'number' }, extraversion: { type: 'number' }, agreeableness: { type: 'number' }, neuroticism: { type: 'number' } } },
          reasoning: { type: 'array', items: { type: 'object', properties: { trait: { type: 'string' }, inference: { type: 'string' }, evidence: { type: 'string' } } } },
          overall_confidence: { type: 'number' }
        },
        required: ["assistant_response", "reasoning", "overall_confidence"]
      }
    });

    const inference = llmResponse;
    const processingTime = Date.now() - startTime;

    // Store assistant response
    await serviceRoleClient.entities.AssistantMessage.create({
      session_id,
      turn_index: turn_index + 1,
      role: 'assistant',
      content: inference.assistant_response,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    });

    // Store inference snapshot
    await serviceRoleClient.entities.InferenceSnapshot.create({
      session_id,
      turn_index: turn_index + 1,
      motivation_stack: inference.motivation_stack || [],
      emotional_state: inference.emotional_state || {},
      cognitive_style: inference.cognitive_style || {},
      risk_profile: inference.risk_profile || {},
      personality_traits: inference.personality_traits || {},
      reasoning: inference.reasoning || [],
      overall_confidence: inference.overall_confidence || 0,
      timestamp: new Date().toISOString()
    });

    // Update session
    await serviceRoleClient.entities.AssistantSession.update(session.id, {
      total_turns: turn_index + 1
    });

    return Response.json({ success: true, message: 'Turn processed successfully.' });

  } catch (error) {
    console.error('Error processing turn:', error);
    return Response.json({ error: 'Failed to process turn', details: error.message }, { status: 500 });
  }
});