// Demo message handler - works for anonymous users
// Uses createClientFromRequest and asServiceRole for LLM access

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// In-memory conversation store for demo sessions
const conversationStore = new Map();

// function cleanupOldConversations() {
//   if (conversationStore.size > 500) {
//     const keysToDelete = Array.from(conversationStore.keys()).slice(0, conversationStore.size - 500);
//     keysToDelete.forEach(key => conversationStore.delete(key));
//   }
// }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    const data = await req.json();
    const { session_id, content } = data;

    if (!session_id || !content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing session_id or content'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Initialize SDK from request
    const base44 = createClientFromRequest(req);
    
    // Use service role if available (for anonymous users), otherwise fallback to base44 (authenticated user)
    const client = base44.asServiceRole || base44;

    // Get or create conversation in memory
    if (!conversationStore.has(session_id)) {
      conversationStore.set(session_id, {
        messages: [],
        profile: null
      });
    }

    const conversation = conversationStore.get(session_id);
    conversation.messages.push({ role: 'user', content });

    const historyText = conversation.messages
      .map(m => (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.content)
      .join('\n');

    let profileContext = '';
    if (conversation.profile) {
      profileContext = '\nCURRENT PROFILE: ' + JSON.stringify(conversation.profile);
    }

    const prompt = `You are knXw's psychographic AI assistant conducting a live demo.

CONVERSATION:
${historyText}
${profileContext}

TASK: 
1. Respond warmly and helpfully to the user
2. Analyze their psychographic profile from the conversation
3. Return all confidence values between 0.0 and 1.0

Keep responses concise and insightful.`;

    // Call LLM using the appropriate client
    const llmResponse = await client.integrations.Core.InvokeLLM({
      prompt,
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
                weight: { type: 'number' }
              } 
            } 
          },
          emotional_state: { 
            type: 'object', 
            properties: { 
              mood: { type: 'string' }, 
              confidence: { type: 'number' }
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
                inference: { type: 'string' }
              } 
            } 
          },
          overall_confidence: { type: 'number' }
        },
        required: ['assistant_response', 'overall_confidence']
      }
    });

    conversation.messages.push({ role: 'assistant', content: llmResponse.assistant_response });
    
    conversation.profile = {
      motivation_stack: llmResponse.motivation_stack || [],
      emotional_state: llmResponse.emotional_state || {},
      cognitive_style: llmResponse.cognitive_style || {},
      risk_profile: llmResponse.risk_profile || {},
      personality_traits: llmResponse.personality_traits || {},
      reasoning: llmResponse.reasoning || [],
      overall_confidence: llmResponse.overall_confidence || 0.5
    };

    // cleanupOldConversations(); // Disable cleanup for now

    return new Response(JSON.stringify({
      success: true,
      assistant_message: llmResponse.assistant_response,
      current_profile: conversation.profile
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Demo message error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      assistant_message: "I'm having trouble right now. Please try again."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});