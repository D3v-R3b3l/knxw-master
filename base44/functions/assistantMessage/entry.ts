
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, message } = await req.json();

    if (!session_id || !message) {
      return Response.json({ error: 'Missing session_id or message' }, { status: 400 });
    }

    const startTime = Date.now();

    // Get session
    const sessions = await base44.entities.AssistantSession.filter({ session_id });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];

    // Get conversation history
    const messages = await base44.entities.AssistantMessage.filter(
      { session_id },
      '-turn_index',
      50
    );

    const turn_index = session.total_turns + 1;

    // Store user message
    await base44.entities.AssistantMessage.create({
      session_id,
      turn_index,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Get latest inference snapshot
    const snapshots = await base44.entities.InferenceSnapshot.filter(
      { session_id },
      '-turn_index',
      1
    );
    const latestSnapshot = snapshots[0] || {};

    // Build conversation context for LLM
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    })).reverse();

    conversationHistory.push({ role: 'user', content: message });

    // Call LLM for psychographic inference
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: buildPsychographicInferencePrompt(conversationHistory, latestSnapshot),
      response_json_schema: {
        type: 'object',
        properties: {
          assistant_response: { type: 'string' },
          motivation_stack: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                weight: { type: 'number' },
                confidence: { type: 'number' }
              }
            }
          },
          emotional_state: {
            type: 'object',
            properties: {
              mood: { type: 'string' },
              confidence: { type: 'number' },
              energy_level: { type: 'string' }
            }
          },
          cognitive_style: {
            type: 'object',
            properties: {
              style: { type: 'string' },
              confidence: { type: 'number' }
            }
          },
          risk_profile: {
            type: 'object',
            properties: {
              profile: { type: 'string' },
              confidence: { type: 'number' }
            }
          },
          personality_traits: {
            type: 'object',
            properties: {
              openness: { type: 'number' },
              conscientiousness: { type: 'number' },
              extraversion: { type: 'number' },
              agreeableness: { type: 'number' },
              neuroticism: { type: 'number' }
            }
          },
          reasoning: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trait: { type: 'string' },
                inference: { type: 'string' },
                evidence: { type: 'string' }
              }
            }
          },
          uncertainty_map: {
            type: 'object',
            properties: {
              lowest_confidence_trait: { type: 'string' },
              lowest_confidence_score: { type: 'number' },
              suggested_question: { type: 'string' }
            }
          },
          targeted_question: { type: 'string' },
          recommended_actions: {
            type: 'array',
            items: { type: 'string' }
          },
          overall_confidence: { type: 'number' }
        }
      }
    });

    const inference = llmResponse;
    const processingTime = Date.now() - startTime;

    // Store assistant response
    const assistantMessage = await base44.entities.AssistantMessage.create({
      session_id,
      turn_index: turn_index + 1,
      role: 'assistant',
      content: inference.assistant_response,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    });

    // Store inference snapshot
    const snapshot = await base44.entities.InferenceSnapshot.create({
      session_id,
      turn_index: turn_index + 1,
      motivation_stack: inference.motivation_stack || [],
      emotional_state: inference.emotional_state || {},
      cognitive_style: inference.cognitive_style || {},
      risk_profile: inference.risk_profile || {},
      personality_traits: inference.personality_traits || {},
      reasoning: inference.reasoning || [],
      uncertainty_map: inference.uncertainty_map || {},
      targeted_question: inference.targeted_question || null,
      recommended_actions: inference.recommended_actions || [],
      overall_confidence: inference.overall_confidence || 0,
      timestamp: new Date().toISOString()
    });

    // Update session
    await base44.entities.AssistantSession.update(session.id, {
      total_turns: turn_index + 1,
      questions_asked: session.questions_asked + (inference.targeted_question ? 1 : 0),
      final_profile: {
        motivation_stack: inference.motivation_stack,
        emotional_state: inference.emotional_state,
        cognitive_style: inference.cognitive_style,
        risk_profile: inference.risk_profile,
        personality_traits: inference.personality_traits
      }
    });

    return Response.json({
      success: true,
      message: assistantMessage,
      snapshot,
      processing_time_ms: processingTime
    });

  } catch (error) {
    console.error('Error processing assistant message:', error);
    return Response.json({ 
      error: error.message || 'Failed to process message'
    }, { status: 500 });
  }
});

function buildPsychographicInferencePrompt(conversationHistory, latestSnapshot) {
  return `You are a knXw Psychographic Intelligence Assistant. Your role is to:
1. Engage naturally with the user in a friendly, expert manner.
2. Infer their psychographic profile from the conversation in real-time.
3. Ask targeted questions to reduce uncertainty in your understanding.
4. Provide clear reasoning for your inferences, which will be displayed in a sidebar.
5. Answer questions about the knXw platform using the context provided below.

PLATFORM CONTEXT:
- You are a live demonstration of the "knXw" platform's capabilities.
- knXw is a B2B psychographic analytics platform. Its purpose is to help businesses understand their users' psychology, motivations, and behavior to create deeply personalized experiences.
- Core Features: knXw ingests user behavior through an event stream (clicks, page views) and uses AI to build rich User Psychographic Profiles. These profiles include personality traits (like the Big Five), core motivations, cognitive styles, and risk tolerance.
- Your Purpose: Your specific function is to be a real-time demo. As you chat with a user, the platform is analyzing the conversation to build their psychographic profile, which they can see updating live in the "Live Profile Analysis" panel.
- Answering Questions: If asked about knXw, its features, or your purpose, use this context to provide a clear and concise answer. Do not invent features. Explain that you are demonstrating the platform's real-time profiling engine.

CURRENT PROFILE STATE (Your current understanding of the user):
${JSON.stringify(latestSnapshot, null, 2)}

CONVERSATION HISTORY (The ongoing chat):
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

INSTRUCTIONS:
- Analyze the latest user message for psychographic signals.
- Update confidence scores based on new evidence.
- If confidence in a major trait is low, consider asking a targeted clarifying question.
- Provide detailed reasoning for each inference, citing specific user phrases as evidence.
- Suggest concrete personalization actions based on the inferred profile.
- Always provide your conversational response to the user in the 'assistant_response' field.

Generate:
1. assistant_response: Your natural language response to the user.
2. motivation_stack: Top 3 motivations with weights (0-1) and confidence (0-1).
3. emotional_state: Current mood, confidence, and energy level.
4. cognitive_style: Inferred style (e.g., analytical, intuitive) and confidence.
5. risk_profile: Inferred profile (e.g., conservative, aggressive) and confidence.
6. personality_traits: Big Five scores (openness, conscientiousness, etc.) from 0 to 1.
7. reasoning: Array of {trait, inference, evidence} explaining your conclusions based on the user's latest message.
8. uncertainty_map: {lowest_confidence_trait, lowest_confidence_score, suggested_question} to identify gaps in your understanding.
9. targeted_question: A specific question to ask if confidence is low (or null if confidence is high).
10. recommended_actions: Array of personalization suggestions (e.g., "Adjust UI to be more data-dense," "Use scarcity-based messaging").
11. overall_confidence: A single score (0-1) representing your average confidence across all inferred traits.`;
}
