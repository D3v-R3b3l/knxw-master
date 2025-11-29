import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    
    // Get all profiles with legacy motivation_stack
    const profiles = await base44.entities.UserPsychographicProfile.list('-created_date', 1000);
    
    let migrated = 0;
    let errors = 0;
    
    for (const profile of profiles) {
      try {
        // Skip if already migrated or no legacy data
        if (!profile.motivation_stack || profile.motivation_stack.length === 0) {
          continue;
        }
        
        // Convert legacy motivation_stack to motivation_stack_v2 format
        const motivationStackV2 = profile.motivation_stack.map(motivation => ({
          label: motivation,
          weight: 1.0 / profile.motivation_stack.length // Equal weighting as default
        }));
        
        // Update confidence score field names
        const updates = {
          schema_version: 'v1.4.0',
          motivation_stack_v2: motivationStackV2,
          motivation_confidence_score: profile.motivation_confidence || 0.8,
          emotional_state_confidence_score: profile.emotional_state_confidence || 0.8,
          risk_profile_confidence_score: profile.risk_profile_confidence || 0.8,
          cognitive_style_confidence_score: profile.cognitive_style_confidence || 0.8,
          personality_confidence_score: profile.personality_confidence || 0.8
        };
        
        // Update emotional_state.confidence to emotional_state.confidence_score
        if (profile.emotional_state?.confidence) {
          updates.emotional_state = {
            ...profile.emotional_state,
            confidence_score: profile.emotional_state.confidence
          };
          delete updates.emotional_state.confidence;
        }
        
        await base44.entities.UserPsychographicProfile.update(profile.id, updates);
        migrated++;
        
      } catch (error) {
        console.error(`Failed to migrate profile ${profile.id}:`, error);
        errors++;
      }
    }
    
    return Response.json({
      success: true,
      message: `Migration completed: ${migrated} profiles migrated, ${errors} errors`,
      migrated,
      errors,
      total_processed: profiles.length
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return Response.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
});