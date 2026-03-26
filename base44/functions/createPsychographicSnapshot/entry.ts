import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get current psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found for this user' }, { status: 404 });
    }

    const currentProfile = profiles[0];

    // Detect cognitive biases
    const biasResponse = await base44.functions.invoke('detectCognitiveBiases', { user_id, time_window_days: 7 });
    const biasData = biasResponse.data || {};

    // Get previous snapshot to calculate change indicators
    const previousSnapshots = await base44.entities.PsychographicSnapshot.filter({ user_id }, '-snapshot_date', 1);
    
    let changeIndicators = {
      emotional_shift_magnitude: 0,
      motivation_drift: 0,
      behavior_volatility: 0
    };

    if (previousSnapshots.length > 0) {
      const prev = previousSnapshots[0];
      
      // Calculate emotional shift
      const prevMoodValue = getMoodValue(prev.emotional_state?.mood);
      const currMoodValue = getMoodValue(currentProfile.emotional_state?.mood);
      changeIndicators.emotional_shift_magnitude = Math.abs(currMoodValue - prevMoodValue);

      // Calculate motivation drift
      if (prev.motivation_stack && currentProfile.motivation_stack_v2) {
        let drift = 0;
        currentProfile.motivation_stack_v2.forEach(curr => {
          const prevMotiv = prev.motivation_stack.find(m => m.label === curr.label);
          if (prevMotiv) {
            drift += Math.abs(curr.weight - prevMotiv.weight);
          }
        });
        changeIndicators.motivation_drift = drift / currentProfile.motivation_stack_v2.length;
      }

      // Behavior volatility from cognitive bias changes
      changeIndicators.behavior_volatility = biasData.detected_biases?.length / 10 || 0;
    }

    // Create snapshot
    const snapshot = await base44.entities.PsychographicSnapshot.create({
      user_id,
      snapshot_date: new Date().toISOString(),
      motivation_stack: currentProfile.motivation_stack_v2 || [],
      emotional_state: currentProfile.emotional_state || {},
      risk_profile: currentProfile.risk_profile,
      cognitive_style: currentProfile.cognitive_style,
      personality_traits: currentProfile.personality_traits || {},
      cognitive_biases: biasData.detected_biases || [],
      custom_dimensions: {},
      change_indicators: changeIndicators
    });

    return Response.json({
      snapshot,
      message: 'Psychographic snapshot created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating psychographic snapshot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getMoodValue(mood) {
  const moodScale = {
    'negative': 0,
    'uncertain': 0.25,
    'anxious': 0.3,
    'neutral': 0.5,
    'confident': 0.7,
    'positive': 0.8,
    'excited': 1.0
  };
  return moodScale[mood] || 0.5;
}