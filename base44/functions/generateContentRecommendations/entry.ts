import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, refresh = false } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Check if recommendations already exist and refresh is false
    if (!refresh) {
      try {
        const existingRecs = await base44.entities.ContentRecommendation.filter(
          { user_id }, 
          '-generated_at', 
          10
        );
        
        if (existingRecs.length > 0) {
          return Response.json({
            success: true,
            recommendations: existingRecs,
            from_cache: true
          });
        }
      } catch (e) {
        console.log('No existing recommendations found, generating new ones');
      }
    }

    // Get user's psychographic profile
    let profile = null;
    try {
      const profiles = await base44.entities.UserPsychographicProfile.filter(
        { user_id },
        '-last_analyzed',
        1
      );
      profile = profiles[0];
    } catch (e) {
      console.log('No psychographic profile found for user:', user_id);
    }

    let recommendations = [];

    if (profile) {
      // Generate AI-powered recommendations based on psychographic profile
      try {
        const motivations = profile.motivation_stack_v2?.map(m => m.label).join(', ') || 'learning, achievement';
        const emotionalState = profile.emotional_state?.mood || 'neutral';
        const confidenceScore = profile.emotional_state?.confidence_score || 0.8;

        const recommendationPrompt = `Based on the following user psychographic profile, recommend exactly 5 pieces of content that would be most valuable to them.

User Profile:
- Risk Profile: ${profile.risk_profile || 'moderate'}
- Cognitive Style: ${profile.cognitive_style || 'analytical'}  
- Primary Motivations: ${motivations}
- Emotional State: ${emotionalState} (confidence: ${confidenceScore})
- Personality Traits: Openness ${profile.personality_traits?.openness || 0.5}, Conscientiousness ${profile.personality_traits?.conscientiousness || 0.5}

Available content types: documentation, help_article, feature_guide, tutorial, blog_post
Available pages: /Documentation, /Profiles, /Events, /Insights, /Engagements, /BatchAnalytics, /Integrations

Return a JSON object with a "recommendations" array containing exactly 5 objects, each with:
- content_type (from available types)
- content_title (relevant title)
- content_url (from available pages) 
- motivation_alignment (array of motivations addressed)
- cognitive_style_match (matching style)
- match_reasoning (brief explanation)
- confidence_score (0-1)`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: recommendationPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    content_type: { type: "string" },
                    content_title: { type: "string" },
                    content_url: { type: "string" },
                    motivation_alignment: { 
                      type: "array", 
                      items: { type: "string" } 
                    },
                    cognitive_style_match: { type: "string" },
                    match_reasoning: { type: "string" },
                    confidence_score: { type: "number" }
                  },
                  required: ["content_type", "content_title", "content_url", "confidence_score"]
                },
                minItems: 5,
                maxItems: 5
              }
            },
            required: ["recommendations"]
          }
        });

        if (aiResponse?.recommendations && Array.isArray(aiResponse.recommendations)) {
          recommendations = aiResponse.recommendations.map(rec => ({
            user_id,
            content_type: rec.content_type,
            content_id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content_title: rec.content_title,
            content_url: rec.content_url,
            psychographic_match: {
              motivation_alignment: rec.motivation_alignment || [],
              cognitive_style_match: rec.cognitive_style_match || profile.cognitive_style || 'analytical',
              emotional_state_consideration: `Optimized for ${emotionalState} emotional state`,
              match_reasoning: rec.match_reasoning || 'AI-generated recommendation based on psychographic profile'
            },
            confidence_score: Math.min(Math.max(Number(rec.confidence_score) || 0.8, 0), 1),
            generated_at: new Date().toISOString()
          }));
        }
      } catch (aiError) {
        console.error('AI recommendation generation failed:', aiError);
        // Fall back to basic recommendations
      }
    }

    // Fallback to basic recommendations if AI failed or no profile
    if (recommendations.length === 0) {
      recommendations = [
        {
          user_id,
          content_type: 'documentation',
          content_id: 'getting-started',
          content_title: 'Getting Started with knXw',
          content_url: '/Documentation',
          psychographic_match: {
            motivation_alignment: ['learning', 'achievement'],
            cognitive_style_match: 'systematic',
            emotional_state_consideration: 'Designed for clarity and step-by-step guidance',
            match_reasoning: 'Essential starting point for understanding the platform'
          },
          confidence_score: 0.95,
          generated_at: new Date().toISOString()
        },
        {
          user_id,
          content_type: 'help_article',
          content_id: 'profiles',
          content_title: 'Understanding User Profiles',
          content_url: '/Profiles',
          psychographic_match: {
            motivation_alignment: ['understanding', 'insight'],
            cognitive_style_match: 'analytical',
            emotional_state_consideration: 'Deep dive into how profiles work',
            match_reasoning: 'Learn how knXw creates psychological profiles from behavior'
          },
          confidence_score: 0.9,
          generated_at: new Date().toISOString()
        },
        {
          user_id,
          content_type: 'feature_guide',
          content_id: 'events',
          content_title: 'Event Tracking Guide',
          content_url: '/Events',
          psychographic_match: {
            motivation_alignment: ['control', 'understanding'],
            cognitive_style_match: 'systematic',
            emotional_state_consideration: 'Practical understanding of data flow',
            match_reasoning: 'Understand how behavioral data flows through the system'
          },
          confidence_score: 0.85,
          generated_at: new Date().toISOString()
        }
      ];
    }

    // Store recommendations
    const stored = [];
    for (const rec of recommendations) {
      try {
        const created = await base44.entities.ContentRecommendation.create(rec);
        stored.push(created);
      } catch (e) {
        console.error('Failed to create recommendation:', e);
        // Continue with other recommendations
      }
    }

    return Response.json({
      success: true,
      recommendations: stored,
      generated_count: stored.length,
      profile_available: !!profile,
      ai_generated: recommendations.length > 3
    });

  } catch (error) {
    console.error('Error in generateContentRecommendations:', error);
    return Response.json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    }, { status: 500 });
  }
});