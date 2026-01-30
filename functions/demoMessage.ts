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

    const prompt = `You are knXw's psychographic AI assistant conducting a live demo showcasing Adaptive UI capabilities.

CONVERSATION:
${historyText}
${profileContext}

TASK: 
1. Respond warmly and helpfully to the user
2. Analyze their psychographic profile from the conversation
3. Return all confidence values between 0.0 and 1.0
4. CRITICAL: Include 1-3 adaptive_ui_elements that demonstrate how UI adapts to their psychology

ADAPTIVE UI GUIDELINES:
1. Generate 2-4 diverse adaptive elements per response (mix buttons, cards, containers, toasts)
2. Make elements INDUSTRY-SPECIFIC based on user's conversation context
3. Show clear before/after adaptation (baseText vs variants)
4. Use real-world business scenarios

ELEMENT TYPES & USE CASES:
- button: CTAs that adapt text/urgency (e.g., "Try Free" → "Start Winning Now" for achievement)
- card: Product/feature cards with adaptive headlines and descriptions
- container: Conditional content blocks (show risk warnings for conservative, growth stats for aggressive)
- toast: Contextual nudges/tips that appear based on motivation
- modal: Adaptive onboarding flows or decision prompts

INDUSTRY EXAMPLES:
E-commerce: 
  - Achievement: "Unlock Premium Status", "Join Top 10% of Shoppers"
  - Security: "Risk-Free Returns", "Trusted by 1M+ Customers"
  - Innovation: "Be First to Access New Arrivals"

SaaS/B2B:
  - Analytical: "View Technical Specs", "Download Performance Report"
  - Pragmatic: "Quick 5-Min Setup", "Start Immediately"
  - Strategic: "Schedule Strategy Session", "See ROI Calculator"

Gaming:
  - Mastery: "Climb Leaderboard", "Unlock Achievement"
  - Social: "Invite Friends", "Join Team"
  - Exploration: "Discover Hidden Areas"

Finance:
  - Conservative: "FDIC Insured", "Guaranteed Returns"
  - Moderate: "Balanced Portfolio", "Diversified Approach"
  - Aggressive: "High Growth Potential", "Maximize Returns"

Make every element feel native to the user's stated industry/context.`;

    // Call LLM using the appropriate client
    const llmResponse = await client.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          assistant_response: { type: 'string' },
          adaptive_ui_elements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['button', 'card', 'container', 'toast', 'modal'] },
                baseText: { type: 'string' },
                baseHeadline: { type: 'string' },
                baseDescription: { type: 'string' },
                motivationVariants: { 
                  type: 'object',
                  properties: {
                    achievement: { type: 'string' },
                    security: { type: 'string' },
                    innovation: { type: 'string' },
                    autonomy: { type: 'string' },
                    mastery: { type: 'string' },
                    social: { type: 'string' }
                  }
                },
                riskVariants: {
                  type: 'object',
                  properties: {
                    conservative: { type: 'string' },
                    moderate: { type: 'string' },
                    aggressive: { type: 'string' }
                  }
                },
                cognitiveStyleVariants: {
                  type: 'object',
                  properties: {
                    analytical: { type: 'string' },
                    intuitive: { type: 'string' },
                    pragmatic: { type: 'string' },
                    strategic: { type: 'string' }
                  }
                },
                showFor: { 
                  type: 'object',
                  properties: {
                    motivations: { type: 'array', items: { type: 'string' } },
                    riskProfile: { type: 'string' },
                    cognitiveStyle: { type: 'string' }
                  }
                },
                hideFor: { 
                  type: 'object',
                  properties: {
                    motivations: { type: 'array', items: { type: 'string' } },
                    riskProfile: { type: 'string' }
                  }
                },
                industryContext: { type: 'string' },
                urgencyLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
                iconSuggestion: { type: 'string' },
                colorScheme: { type: 'string', enum: ['primary', 'success', 'warning', 'info'] }
              }
            }
          },
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
      adaptive_ui_elements: llmResponse.adaptive_ui_elements || [],
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