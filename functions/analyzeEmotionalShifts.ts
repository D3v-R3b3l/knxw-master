import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, time_window_days = 30 } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get psychographic snapshots to detect emotional shifts
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - time_window_days);

    const snapshots = await base44.entities.PsychographicSnapshot.filter({
      user_id,
      snapshot_date: { $gte: cutoffDate.toISOString() }
    }, '-snapshot_date', 100);

    if (snapshots.length < 2) {
      return Response.json({
        user_id,
        shifts: [],
        message: 'Not enough historical data to detect emotional shifts',
        min_snapshots_needed: 2
      });
    }

    const shifts = [];
    
    // Analyze sequential snapshots for changes
    for (let i = 1; i < snapshots.length; i++) {
      const current = snapshots[i];
      const previous = snapshots[i - 1];

      // Detect mood shifts
      if (current.emotional_state?.mood !== previous.emotional_state?.mood) {
        shifts.push({
          shift_type: 'mood_change',
          from: previous.emotional_state?.mood,
          to: current.emotional_state?.mood,
          timestamp: current.snapshot_date,
          magnitude: calculateMoodShiftMagnitude(previous.emotional_state?.mood, current.emotional_state?.mood),
          significance: 'high'
        });
      }

      // Detect confidence changes
      const confidenceDelta = (current.emotional_state?.confidence_score || 0) - (previous.emotional_state?.confidence_score || 0);
      if (Math.abs(confidenceDelta) > 0.2) {
        shifts.push({
          shift_type: 'confidence_change',
          from: previous.emotional_state?.confidence_score,
          to: current.emotional_state?.confidence_score,
          timestamp: current.snapshot_date,
          magnitude: Math.abs(confidenceDelta),
          significance: Math.abs(confidenceDelta) > 0.4 ? 'critical' : 'moderate'
        });
      }

      // Detect energy level changes
      if (current.emotional_state?.energy_level !== previous.emotional_state?.energy_level) {
        shifts.push({
          shift_type: 'energy_change',
          from: previous.emotional_state?.energy_level,
          to: current.emotional_state?.energy_level,
          timestamp: current.snapshot_date,
          magnitude: calculateEnergyShiftMagnitude(previous.emotional_state?.energy_level, current.emotional_state?.energy_level),
          significance: 'moderate'
        });
      }

      // Detect risk profile changes
      if (current.risk_profile !== previous.risk_profile) {
        shifts.push({
          shift_type: 'risk_profile_change',
          from: previous.risk_profile,
          to: current.risk_profile,
          timestamp: current.snapshot_date,
          magnitude: 0.8,
          significance: 'high'
        });
      }
    }

    // Calculate volatility score
    const volatility = shifts.length / snapshots.length;

    return Response.json({
      user_id,
      shifts,
      analysis_summary: {
        total_shifts_detected: shifts.length,
        snapshots_analyzed: snapshots.length,
        volatility_score: volatility,
        time_window_days,
        most_common_shift: getMostCommonShift(shifts)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing emotional shifts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateMoodShiftMagnitude(from, to) {
  const moodScale = {
    'negative': 0,
    'uncertain': 0.25,
    'anxious': 0.3,
    'neutral': 0.5,
    'confident': 0.7,
    'positive': 0.8,
    'excited': 1.0
  };
  return Math.abs((moodScale[to] || 0.5) - (moodScale[from] || 0.5));
}

function calculateEnergyShiftMagnitude(from, to) {
  const energyScale = { 'low': 0, 'medium': 0.5, 'high': 1.0 };
  return Math.abs((energyScale[to] || 0.5) - (energyScale[from] || 0.5));
}

function getMostCommonShift(shifts) {
  const shiftCounts = {};
  shifts.forEach(s => {
    shiftCounts[s.shift_type] = (shiftCounts[s.shift_type] || 0) + 1;
  });
  const entries = Object.entries(shiftCounts);
  if (entries.length === 0) return null;
  return entries.reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
}