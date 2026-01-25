import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_app_id, lookback_days = 7 } = await req.json();

    // Fetch all profiles for the app
    const allProfiles = await base44.asServiceRole.entities.UserPsychographicProfile.list();

    if (!allProfiles || allProfiles.length === 0) {
      return Response.json({ anomalies: [] });
    }

    // Calculate statistical baselines
    const motivationCounts = {};
    const riskCounts = { conservative: 0, moderate: 0, aggressive: 0 };
    const cognitiveCounts = { analytical: 0, intuitive: 0, systematic: 0, creative: 0 };

    allProfiles.forEach(p => {
      if (p.motivation_labels) {
        p.motivation_labels.forEach(m => {
          motivationCounts[m] = (motivationCounts[m] || 0) + 1;
        });
      }
      if (p.risk_profile) {
        riskCounts[p.risk_profile] = (riskCounts[p.risk_profile] || 0) + 1;
      }
      if (p.cognitive_style) {
        cognitiveCounts[p.cognitive_style] = (cognitiveCounts[p.cognitive_style] || 0) + 1;
      }
    });

    // Detect anomalies
    const anomalies = [];

    allProfiles.forEach(profile => {
      const anomalySignals = [];

      // Check for unusual motivation stack
      if (profile.motivation_labels && profile.motivation_labels.length > 5) {
        anomalySignals.push({
          type: 'unusual_motivation_count',
          description: `User has ${profile.motivation_labels.length} motivations (typically 2-4)`,
          severity: 'medium'
        });
      }

      // Check for conflicting cognitive style and risk profile
      if (profile.cognitive_style === 'analytical' && profile.risk_profile === 'aggressive') {
        anomalySignals.push({
          type: 'conflicting_traits',
          description: 'Analytical cognitive style with aggressive risk profile is uncommon',
          severity: 'low'
        });
      }

      // Check for staleness with high confidence
      if (profile.staleness_score > 0.7 && profile.motivation_confidence_score > 0.8) {
        anomalySignals.push({
          type: 'stale_high_confidence',
          description: 'Profile is stale but confidence remains high',
          severity: 'high'
        });
      }

      // Check for rapid emotional swings (if historical data exists)
      if (profile.emotional_state?.mood === 'anxious' && profile.emotional_state?.confidence_score > 0.9) {
        anomalySignals.push({
          type: 'extreme_anxiety',
          description: 'Very high confidence in anxious emotional state',
          severity: 'medium'
        });
      }

      if (anomalySignals.length > 0) {
        anomalies.push({
          user_id: profile.user_id,
          profile_id: profile.id,
          anomaly_count: anomalySignals.length,
          signals: anomalySignals,
          detected_at: new Date().toISOString()
        });
      }
    });

    // Sort by severity and count
    anomalies.sort((a, b) => {
      const severityScore = (signals) => {
        return signals.reduce((sum, s) => {
          return sum + (s.severity === 'high' ? 3 : s.severity === 'medium' ? 2 : 1);
        }, 0);
      };
      return severityScore(b.signals) - severityScore(a.signals);
    });

    return Response.json({
      total_profiles: allProfiles.length,
      anomalies_detected: anomalies.length,
      anomalies: anomalies.slice(0, 50), // Top 50 anomalies
      baselines: {
        motivation_distribution: motivationCounts,
        risk_distribution: riskCounts,
        cognitive_distribution: cognitiveCounts
      }
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});