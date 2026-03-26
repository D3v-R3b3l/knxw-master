import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate Growth tier access or higher
    if (!['growth', 'pro', 'enterprise'].includes(user.current_plan_key)) {
      return Response.json({ 
        error: 'Feedback Analysis requires Growth tier or higher',
        upgrade_required: true 
      }, { status: 403 });
    }

    const { feedback_text, user_id, source, metadata = {} } = await req.json();

    if (!feedback_text || !user_id || !source) {
      return Response.json({ 
        error: 'feedback_text, user_id, and source are required' 
      }, { status: 400 });
    }

    // Get user's existing psychographic profile for context
    let userProfile = null;
    try {
      const profiles = await base44.entities.UserPsychographicProfile.filter({ 
        user_id: user_id 
      }, '-updated_date', 1);
      
      userProfile = profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.log('Could not retrieve user profile for context:', error);
    }

    // Perform comprehensive psychographic analysis of the feedback
    const analysisPrompt = `Analyze this user feedback through a psychographic lens:

Feedback Text: "${feedback_text}"
Source: ${source}
${metadata.rating ? `Rating: ${metadata.rating}/10` : ''}
${metadata.category ? `Category: ${metadata.category}` : ''}

${userProfile ? `
User's Known Profile Context:
- Motivations: ${userProfile.motivation_labels?.join(', ') || 'Unknown'}
- Cognitive Style: ${userProfile.cognitive_style || 'Unknown'}
- Risk Profile: ${userProfile.risk_profile || 'Unknown'}
- Personality Traits: ${JSON.stringify(userProfile.personality_traits || {})}
` : 'No existing profile context available.'}

Provide a comprehensive analysis covering:

1. **Emotional Analysis**: What emotions are evident in this feedback?
2. **Motivation Indicators**: What core motivations (achievement, security, social connection, creativity, autonomy) are driving this feedback?
3. **Cognitive Style**: How does the way they express feedback reveal their cognitive style (analytical, intuitive, systematic, creative)?
4. **Personality Indicators**: What Big 5 personality traits are evident?
5. **Risk Tolerance**: Do they show conservative, moderate, or aggressive risk tolerance?
6. **Psychological Needs**: What underlying psychological needs are being expressed?
7. **Communication Style**: How do they prefer to communicate based on this feedback?
8. **Sentiment Analysis**: Overall sentiment and key emotional phrases
9. **Actionable Insights**: Priority level, response style, solutions, and follow-up strategy

Be specific and actionable in your analysis.`;

    const psychographicAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          detected_emotions: {
            type: "array",
            items: { type: "string" }
          },
          motivation_indicators: {
            type: "array",
            items: { type: "string" }
          },
          cognitive_style_signals: {
            type: "string",
            enum: ["analytical", "intuitive", "systematic", "creative"]
          },
          personality_indicators: {
            type: "object",
            properties: {
              openness: { type: "number", minimum: 0, maximum: 1 },
              conscientiousness: { type: "number", minimum: 0, maximum: 1 },
              extraversion: { type: "number", minimum: 0, maximum: 1 },
              agreeableness: { type: "number", minimum: 0, maximum: 1 },
              neuroticism: { type: "number", minimum: 0, maximum: 1 }
            }
          },
          risk_tolerance_signals: {
            type: "string",
            enum: ["conservative", "moderate", "aggressive"]
          },
          psychological_needs: {
            type: "array",
            items: { type: "string" }
          },
          communication_style: {
            type: "string"
          },
          sentiment_analysis: {
            type: "object",
            properties: {
              overall_sentiment: {
                type: "string",
                enum: ["very_negative", "negative", "neutral", "positive", "very_positive"]
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              key_phrases: { type: "array", items: { type: "string" } }
            }
          },
          actionable_insights: {
            type: "object",
            properties: {
              priority_level: {
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              },
              recommended_response_style: { type: "string" },
              suggested_solutions: { type: "array", items: { type: "string" } },
              followup_strategy: { type: "string" },
              segment_implications: { type: "string" }
            }
          }
        }
      }
    });

    // Calculate analysis confidence based on text length and clarity
    let analysisConfidence = 0.7; // Base confidence
    if (feedback_text.length > 100) analysisConfidence += 0.1;
    if (feedback_text.length > 250) analysisConfidence += 0.1;
    if (userProfile) analysisConfidence += 0.1; // Boost if we have user context
    analysisConfidence = Math.min(analysisConfidence, 1.0);

    // Create the feedback analysis record
    const feedbackAnalysis = await base44.entities.FeedbackAnalysis.create({
      user_id: user_id,
      feedback_source: source,
      original_text: feedback_text,
      feedback_metadata: metadata,
      psychographic_analysis: {
        detected_emotions: psychographicAnalysis.detected_emotions || [],
        motivation_indicators: psychographicAnalysis.motivation_indicators || [],
        cognitive_style_signals: psychographicAnalysis.cognitive_style_signals || 'analytical',
        personality_indicators: psychographicAnalysis.personality_indicators || {},
        risk_tolerance_signals: psychographicAnalysis.risk_tolerance_signals || 'moderate',
        psychological_needs: psychographicAnalysis.psychological_needs || [],
        communication_style: psychographicAnalysis.communication_style || 'Direct communication'
      },
      sentiment_analysis: psychographicAnalysis.sentiment_analysis || {
        overall_sentiment: 'neutral',
        confidence: 0.5,
        key_phrases: []
      },
      actionable_insights: psychographicAnalysis.actionable_insights || {
        priority_level: 'medium',
        recommended_response_style: 'Professional and helpful',
        suggested_solutions: ['Follow up with user'],
        followup_strategy: 'Standard follow-up process',
        segment_implications: 'No specific implications identified'
      },
      analysis_confidence: analysisConfidence,
      analyzed_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      analysis: feedbackAnalysis,
      insights_summary: {
        priority: feedbackAnalysis.actionable_insights.priority_level,
        sentiment: feedbackAnalysis.sentiment_analysis.overall_sentiment,
        key_motivations: feedbackAnalysis.psychographic_analysis.motivation_indicators?.slice(0, 3),
        response_style: feedbackAnalysis.actionable_insights.recommended_response_style
      }
    });

  } catch (error) {
    console.error('Feedback analysis failed:', error);
    return Response.json({ 
      error: 'Failed to analyze feedback',
      details: error.message 
    }, { status: 500 });
  }
});