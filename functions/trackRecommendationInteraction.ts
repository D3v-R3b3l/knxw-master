import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendation_id, interaction_type, data = {} } = await req.json();

    if (!recommendation_id || !interaction_type) {
      return Response.json({ 
        error: 'recommendation_id and interaction_type are required' 
      }, { status: 400 });
    }

    // Get the existing recommendation with all its fields
    let recommendation;
    try {
      recommendation = await base44.entities.ContentRecommendation.get(recommendation_id);
    } catch (error) {
      console.error('Failed to fetch recommendation:', error);
      return Response.json({ 
        error: 'Failed to fetch recommendation',
        details: error.message 
      }, { status: 500 });
    }
    
    if (!recommendation) {
      return Response.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Validate required fields exist
    const requiredFields = ['user_id', 'content_type', 'content_id', 'content_title'];
    const missingFields = requiredFields.filter(field => !recommendation[field]);
    
    if (missingFields.length > 0) {
      console.error('Recommendation missing required fields:', missingFields, recommendation);
      return Response.json({ 
        error: 'Recommendation record is invalid',
        missing_fields: missingFields
      }, { status: 400 });
    }

    // Ensure confidence_score is a valid number
    const confidenceScore = typeof recommendation.confidence_score === 'number' 
      ? recommendation.confidence_score 
      : 0.5;

    // Ensure psychographic_match is an object
    const psychographicMatch = recommendation.psychographic_match && typeof recommendation.psychographic_match === 'object'
      ? recommendation.psychographic_match
      : {};

    // Update interaction data
    const updatedInteractionData = {
      ...(recommendation.interaction_data || {}),
      [interaction_type]: true,
      last_interaction: new Date().toISOString(),
      ...data
    };

    // Build the complete update payload with all required fields
    const updatePayload = {
      user_id: recommendation.user_id,
      content_type: recommendation.content_type,
      content_id: recommendation.content_id,
      content_title: recommendation.content_title,
      psychographic_match: psychographicMatch,
      confidence_score: confidenceScore,
      content_url: recommendation.content_url || '',
      generated_at: recommendation.generated_at || new Date().toISOString(),
      is_demo: recommendation.is_demo || false,
      interaction_data: updatedInteractionData
    };

    // Attempt update with error handling
    try {
      await base44.entities.ContentRecommendation.update(recommendation_id, updatePayload);
    } catch (error) {
      console.error('Failed to update recommendation:', error);
      return Response.json({ 
        error: 'Failed to update recommendation',
        details: error.message 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      interaction_recorded: interaction_type
    });

  } catch (error) {
    console.error('Error tracking recommendation interaction:', error);
    return Response.json({ 
      error: 'Failed to track interaction',
      details: error.message 
    }, { status: 500 });
  }
});