// Demo message handler - works for anonymous users
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    const { session_id, content, history = [], current_profile = null, feedback = null } = data;

    if (!session_id || !content) {
      return new Response(JSON.stringify({ success: false, error: 'Missing session_id or content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const base44 = createClientFromRequest(req);
    const client = base44.asServiceRole || base44;

    const historyText = history
      .map(m => {
        let text = (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.content;
        if (m.adaptive_ui_elements && m.adaptive_ui_elements.length > 0) {
          text += '\n[Rendered UI Types: ' + m.adaptive_ui_elements.map(e => e.type).join(', ') + ']';
        }
        return text;
      })
      .concat([`User: ${content}`])
      .join('\n');

    const profileContext = current_profile
      ? '\n\nCURRENT INFERRED PROFILE (carry all fields forward, update with new evidence):\n' + JSON.stringify(current_profile, null, 2)
      : '';

    const feedbackContext = feedback
      ? `\n\nUSER FEEDBACK ON LAST RESPONSE:\n- Profile accuracy: ${feedback.profile_rating}/5\n- UI relevance: ${feedback.ui_rating}/5\n- Comment: "${feedback.comment || 'none'}"\nADJUST your next inference to address this feedback directly.`
      : '';

    const prompt = `You are knXw's psychographic AI conducting a live product demo. Your dual job:
1. Have a genuinely helpful, specific conversation responding to the user's actual question.
2. Continuously infer and maintain a complete psychographic profile from their language, concerns, and framing.

CONVERSATION:
${historyText}
${profileContext}
${feedbackContext}

═══════════════════════════════════════════════
PSYCHOGRAPHIC INFERENCE RULES (MANDATORY):
═══════════════════════════════════════════════

A. ALWAYS return ALL of the following profile fields in every response. Never omit or null any field:
   - motivation_stack: 3-5 labeled motivations with weights 0.0-1.0 (must sum ~1.0). Infer from HOW they speak, not just what industry they're in. Labels: achievement, security, innovation, autonomy, mastery, social, efficiency, status, impact, curiosity.
   - emotional_state: { mood, confidence (0.0-1.0) }. Mood options: positive, neutral, negative, excited, anxious, confident, uncertain, frustrated.
   - cognitive_style: { style, confidence (0.0-1.0) }. Style options: analytical, intuitive, systematic, creative, pragmatic, strategic.
   - risk_profile: { profile, confidence (0.0-1.0) }. Profile options: conservative, moderate, aggressive.
   - personality_traits: ALL FIVE of openness, conscientiousness, extraversion, agreeableness, neuroticism — each 0.0-1.0.
   - overall_confidence: weighted average of individual confidences.
   - reasoning: 3-5 items mapping trait → specific evidence from their exact words.
   - user_preferences: industry_context (only if explicitly stated or strongly implied), colors_preferred, colors_disliked, ui_style_preferences.

B. CONFIDENCE CALIBRATION:
   - First message: overall_confidence 0.25-0.45. Individual traits 0.2-0.5.
   - Second message: 0.45-0.65. Traits 0.4-0.65.
   - Third+ messages: 0.65-0.90 if enough signal.
   - NEVER default to 0.5 across the board — differentiate traits based on actual evidence.
   - If a trait has strong signal (e.g., they used risk-averse language), that specific confidence should be 0.70+.

C. INDUSTRY CONTEXT RULE:
   - DO NOT assume SaaS/B2B unless they explicitly say it.
   - If industry is unclear, set industry_context to null and ASK a natural clarifying question in your response.
   - Only set industry_context when there is explicit or very strong implicit evidence.

D. PROFILE CONTINUITY:
   - If CURRENT INFERRED PROFILE exists, carry ALL previous values forward as a baseline.
   - Only update a field if new evidence supports a change. Never regress to defaults.
   - Personality traits especially should evolve slowly and persistently.

═══════════════════════════════════════════════
ADAPTIVE UI GENERATION RULES (MANDATORY):
═══════════════════════════════════════════════

Generate EXACTLY 3-4 adaptive_ui_elements per response. Rules:

1. MULTI-DIMENSIONAL ADAPTATION: Each element must respond to at least 2 psychographic dimensions simultaneously (e.g., risk_profile + cognitive_style, or motivation + emotional_state).

2. ELEMENT TYPE VARIETY: Use a DIFFERENT mix every single response — never repeat the same sequence twice. Available types:
   - hero: Full hero section with headline, subtext, CTA buttons, and social proof
   - pricing: Pricing card with features list and CTA — adapts value proposition to motivation/risk
   - toast: Dismissable notification nudge adapting urgency and copy to emotional state
   - modal: Full modal with stats, decision buttons, adapting framing to risk/cognitive style
   - dashboard_widget: Metric widget with mini chart adapting label/focus to motivation
   - ecommerce_item: Product card with image area, price, and add-to-cart action
   - game_hud: Game progress HUD adapting challenge copy to personality + motivation
   - card: Feature highlight card adapting headline + description
   DO NOT use 'button' or 'container' as standalone types — they are boring alone.
   REQUIRED: First element MUST be one of: hero, pricing, or modal. Vary this per response.

3. EXPLICIT VARIANT POPULATIONS: For EVERY element, populate ALL of these variant fields with DISTINCT, meaningfully different text:
   - motivationVariants: achievement, security, innovation, autonomy, mastery, social
   - riskVariants: conservative, moderate, aggressive
   - cognitiveStyleVariants: analytical, intuitive, pragmatic, strategic

4. INDUSTRY FIDELITY: industryContext must match what the user actually said. If unknown, use a plausible neutral context like "General" or ask them.

5. COLOR & STYLE: accentColor must be a valid hex. NEVER use colors in user_preferences.colors_disliked. Derive visual style from cognitive_style: analytical→minimal, creative→bold, systematic→standard, intuitive→animated.

6. URGENCY: Derive urgencyLevel from emotional_state.mood: anxious/frustrated→high, excited→medium, confident→low, uncertain→medium.

INDUSTRY VARIANT EXAMPLES (use as reference, not defaults):
- E-commerce → achievement: "Join Top 10% of Buyers", security: "Risk-Free 30-Day Returns", innovation: "Shop New Arrivals First"
- Finance → conservative: "FDIC-Insured, Guaranteed Growth", moderate: "Balanced Portfolio Strategy", aggressive: "Maximize Market Exposure"
- Healthcare → achievement: "Hit Your Health Milestones", security: "Clinically Validated Protocol", innovation: "Cutting-Edge Treatment Options"
- Real Estate → conservative: "Stable Long-Term Investment", moderate: "Balanced Market Entry", aggressive: "High-Growth Opportunity Zone"
- Gaming → mastery: "Unlock Elite Tier", social: "Invite Your Squad", exploration: "Discover Hidden Zones"
- Legal/Professional → analytical: "Review Full Case Precedent", systematic: "Structured Compliance Framework", strategic: "Optimize Regulatory Positioning"

═══════════════════════════════════════════════
RESPONSE TONE:
═══════════════════════════════════════════════
- Answer the user's actual question specifically and helpfully. Don't be vague.
- When industry is unknown, weave in a natural clarifying question ("Are you building for consumers, businesses, or something else?").
- When user is skeptical, show don't tell — generate elements that directly reflect their stated words.
- Keep the assistant_response concise (3-5 sentences max). The UI elements do the demonstrating.`;

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
                type: { type: 'string', enum: ['button', 'card', 'container', 'toast', 'modal', 'dashboard_widget', 'ecommerce_item', 'game_hud'] },
                baseText: { type: 'string' },
                baseHeadline: { type: 'string' },
                baseDescription: { type: 'string' },
                accentColor: { type: 'string' },
                metrics: {
                  type: 'object',
                  properties: { label: { type: 'string' }, value: { type: 'string' }, trend: { type: 'string' } }
                },
                productDetails: {
                  type: 'object',
                  properties: { price: { type: 'string' }, urgencyTag: { type: 'string' } }
                },
                motivationVariants: {
                  type: 'object',
                  properties: {
                    achievement: { type: 'string' }, security: { type: 'string' },
                    innovation: { type: 'string' }, autonomy: { type: 'string' },
                    mastery: { type: 'string' }, social: { type: 'string' }
                  }
                },
                riskVariants: {
                  type: 'object',
                  properties: { conservative: { type: 'string' }, moderate: { type: 'string' }, aggressive: { type: 'string' } }
                },
                cognitiveStyleVariants: {
                  type: 'object',
                  properties: { analytical: { type: 'string' }, intuitive: { type: 'string' }, pragmatic: { type: 'string' }, strategic: { type: 'string' } }
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
                urgencyLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                visualStyle: { type: 'string', enum: ['minimal', 'standard', 'bold', 'animated'] },
                colorScheme: { type: 'string', enum: ['primary', 'success', 'warning', 'info', 'danger'] }
              }
            }
          },
          motivation_stack: {
            type: 'array',
            items: { type: 'object', properties: { label: { type: 'string' }, weight: { type: 'number' } } }
          },
          emotional_state: {
            type: 'object',
            properties: { mood: { type: 'string' }, confidence: { type: 'number' } }
          },
          cognitive_style: {
            type: 'object',
            properties: { style: { type: 'string' }, confidence: { type: 'number' } }
          },
          risk_profile: {
            type: 'object',
            properties: { profile: { type: 'string' }, confidence: { type: 'number' } }
          },
          personality_traits: {
            type: 'object',
            properties: {
              openness: { type: 'number' }, conscientiousness: { type: 'number' },
              extraversion: { type: 'number' }, agreeableness: { type: 'number' },
              neuroticism: { type: 'number' }
            }
          },
          reasoning: {
            type: 'array',
            items: { type: 'object', properties: { trait: { type: 'string' }, inference: { type: 'string' } } }
          },
          user_preferences: {
            type: 'object',
            properties: {
              colors_disliked: { type: 'array', items: { type: 'string' } },
              colors_preferred: { type: 'array', items: { type: 'string' } },
              ui_style_preferences: { type: 'array', items: { type: 'string' } },
              industry_context: { type: 'string' }
            }
          },
          overall_confidence: { type: 'number' }
        },
        required: ['assistant_response', 'adaptive_ui_elements', 'motivation_stack', 'emotional_state', 'cognitive_style', 'risk_profile', 'personality_traits', 'reasoning', 'overall_confidence']
      }
    });

    // Merge with previous profile to ensure continuity — never regress fields to empty
    const prevProfile = current_profile || {};
    const updatedProfile = {
      motivation_stack: llmResponse.motivation_stack?.length > 0 ? llmResponse.motivation_stack : (prevProfile.motivation_stack || []),
      emotional_state: (llmResponse.emotional_state?.mood) ? llmResponse.emotional_state : (prevProfile.emotional_state || {}),
      cognitive_style: (llmResponse.cognitive_style?.style) ? llmResponse.cognitive_style : (prevProfile.cognitive_style || {}),
      risk_profile: (llmResponse.risk_profile?.profile) ? llmResponse.risk_profile : (prevProfile.risk_profile || {}),
      personality_traits: (llmResponse.personality_traits && Object.keys(llmResponse.personality_traits).length > 0) ? llmResponse.personality_traits : (prevProfile.personality_traits || {}),
      reasoning: llmResponse.reasoning?.length > 0 ? llmResponse.reasoning : (prevProfile.reasoning || []),
      user_preferences: {
        ...(prevProfile.user_preferences || {}),
        ...(llmResponse.user_preferences || {}),
        // Preserve industry_context from previous if new one is null/empty
        industry_context: llmResponse.user_preferences?.industry_context || prevProfile.user_preferences?.industry_context || null,
        // Merge color arrays, don't overwrite with empty
        colors_disliked: llmResponse.user_preferences?.colors_disliked?.length > 0
          ? llmResponse.user_preferences.colors_disliked
          : (prevProfile.user_preferences?.colors_disliked || []),
        colors_preferred: llmResponse.user_preferences?.colors_preferred?.length > 0
          ? llmResponse.user_preferences.colors_preferred
          : (prevProfile.user_preferences?.colors_preferred || []),
        ui_style_preferences: llmResponse.user_preferences?.ui_style_preferences?.length > 0
          ? llmResponse.user_preferences.ui_style_preferences
          : (prevProfile.user_preferences?.ui_style_preferences || []),
      },
      overall_confidence: llmResponse.overall_confidence || prevProfile.overall_confidence || 0.3,
      turn_count: (prevProfile.turn_count || 0) + 1
    };

    return new Response(JSON.stringify({
      success: true,
      assistant_message: llmResponse.assistant_response,
      adaptive_ui_elements: llmResponse.adaptive_ui_elements || [],
      current_profile: updatedProfile
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