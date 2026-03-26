
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Automated behavioral integrity monitoring
 * Runs periodically to scan for policy violations and dark patterns
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !['admin', 'system'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { time_window_hours = 1, auto_create_alerts = true } = await req.json().catch(() => ({}));

    // Fetch active compliance rules
    const rules = await base44.entities.ComplianceRule.filter({ enabled: true }, '-created_date', 100);
    
    // Fetch recent events and profiles
    const cutoffTime = new Date(Date.now() - time_window_hours * 60 * 60 * 1000).toISOString();
    const recentEvents = await base44.entities.CapturedEvent.filter(
      { timestamp: { $gte: cutoffTime } },
      '-timestamp',
      1000
    );

    const detections = [];
    const darkPatternDetections = [];

    // Group events by user
    const eventsByUser = {};
    for (const event of recentEvents) {
      if (!eventsByUser[event.user_id]) {
        eventsByUser[event.user_id] = [];
      }
      eventsByUser[event.user_id].push(event);
    }

    // Analyze each user's behavior
    for (const [userId, events] of Object.entries(eventsByUser)) {
      // Fetch user's psychographic profile
      let profile;
      try {
        const profiles = await base44.entities.UserPsychographicProfile.filter(
          { user_id: userId },
          '-last_analyzed',
          1
        );
        profile = profiles[0];
      } catch (error) {
        console.log(`No profile found for user ${userId}`);
        continue;
      }

      // Apply each compliance rule
      for (const rule of rules) {
        const detection = evaluateRule(rule, events, profile); // Removed 'await' here
        
        if (detection) {
          detections.push({
            user_id: userId,
            rule_id: rule.id,
            ...detection
          });
        }
      }

      // Check for dark pattern interactions
      const darkPatternSignals = detectDarkPatternInteraction(events, profile);
      if (darkPatternSignals.length > 0) {
        darkPatternDetections.push(...darkPatternSignals.map(signal => ({
          ...signal,
          affected_user_id: userId
        })));
      }
    }

    // Create alerts if auto-creation is enabled
    const createdAlerts = [];
    if (auto_create_alerts) {
      for (const detection of detections) {
        try {
          const alert = await base44.entities.BehavioralIntegrityAlert.create({
            user_id: detection.user_id,
            alert_type: detection.alert_type,
            severity: detection.severity,
            confidence_score: detection.confidence_score,
            detection_reasoning: detection.reasoning,
            policy_violated: detection.policy_violated,
            recommended_interventions: detection.interventions,
            status: 'pending_review'
          });
          createdAlerts.push(alert);
        } catch (error) {
          console.error('Failed to create alert:', error);
        }
      }

      // Create dark pattern detections
      for (const darkPattern of darkPatternDetections) {
        try {
          await base44.entities.DarkPatternDetection.create({
            pattern_type: darkPattern.pattern_type,
            detected_in_element: darkPattern.element,
            detection_method: 'user_behavior_analysis',
            affected_users_count: 1,
            manipulation_score: darkPattern.manipulation_score,
            evidence: darkPattern.evidence,
            recommended_fix: darkPattern.recommended_fix,
            status: 'detected'
          });
        } catch (error) {
          console.error('Failed to create dark pattern detection:', error);
        }
      }
    }

    return Response.json({
      success: true,
      time_window_hours,
      users_analyzed: Object.keys(eventsByUser).length,
      rules_evaluated: rules.length,
      detections_found: detections.length,
      alerts_created: createdAlerts.length,
      dark_patterns_detected: darkPatternDetections.length,
      detections: auto_create_alerts ? [] : detections // Only return raw detections if not creating alerts
    });

  } catch (error) {
    console.error('Error monitoring behavioral integrity:', error);
    return Response.json({ 
      error: 'Failed to monitor behavioral integrity',
      details: error.message 
    }, { status: 500 });
  }
});

/**
 * Evaluate a single compliance rule against user events and profile
 * (Removed async keyword since function doesn't use await)
 */
function evaluateRule(rule, events, profile) { // Removed 'async' keyword here
  const criteria = rule.detection_criteria;
  
  if (rule.rule_type === 'frequency_threshold') {
    return evaluateFrequencyThreshold(criteria, events, profile, rule);
  } else if (rule.rule_type === 'behavioral_sequence') {
    return evaluateBehavioralSequence(criteria, events, profile, rule);
  } else if (rule.rule_type === 'psychographic_risk') {
    return evaluatePsychographicRisk(criteria, events, profile, rule);
  } else if (rule.rule_type === 'combined') {
    return evaluateCombinedLogic(criteria, events, profile, rule);
  }
  
  return null;
}

/**
 * Evaluate frequency threshold rules
 */
function evaluateFrequencyThreshold(criteria, events, profile, rule) {
  if (!criteria.frequency_limit) return null;
  
  const { event_type, max_occurrences, time_window_seconds } = criteria.frequency_limit;
  const cutoff = Date.now() - time_window_seconds * 1000;
  
  const matchingEvents = events.filter(e => 
    e.event_type === event_type &&
    new Date(e.timestamp).getTime() > cutoff
  );
  
  if (matchingEvents.length > max_occurrences) {
    // Check psychographic context for intent assessment
    const intent = assessIntent(profile, 'rate_limit_abuse');
    
    return {
      alert_type: 'rate_limit_abuse',
      severity: rule.severity,
      confidence_score: 0.85,
      policy_violated: rule.name,
      reasoning: {
        behavioral_evidence: [
          `User exceeded ${event_type} frequency limit: ${matchingEvents.length} events in ${time_window_seconds}s (max: ${max_occurrences})`,
          `Events occurred at: ${matchingEvents.map(e => new Date(e.timestamp).toISOString()).join(', ')}`
        ],
        psychographic_context: profile ? {
          risk_profile: profile.risk_profile,
          cognitive_style: profile.cognitive_style,
          impulsivity_signals: profile.personality_traits?.neuroticism > 0.7 ? ['high'] : []
        } : {},
        intent_assessment: intent,
        supporting_event_ids: matchingEvents.map(e => e.id)
      },
      interventions: generateInterventions(intent, 'rate_limit_abuse', profile)
    };
  }
  
  return null;
}

/**
 * Evaluate behavioral sequence rules
 */
function evaluateBehavioralSequence(criteria, events, profile, rule) {
  if (!criteria.event_sequence || criteria.event_sequence.length === 0) return null;
  
  const sequence = criteria.event_sequence;
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Look for the sequence in recent events
  for (let i = 0; i <= sortedEvents.length - sequence.length; i++) {
    let matchFound = true;
    const matchingEvents = [];
    
    for (let j = 0; j < sequence.length; j++) {
      if (sortedEvents[i + j]?.event_type !== sequence[j]) {
        matchFound = false;
        break;
      }
      matchingEvents.push(sortedEvents[i + j]);
    }
    
    if (matchFound) {
      const intent = assessIntent(profile, 'suspicious_behavior');
      
      return {
        alert_type: 'suspicious_behavior',
        severity: rule.severity,
        confidence_score: 0.75,
        policy_violated: rule.name,
        reasoning: {
          behavioral_evidence: [
            `Detected suspicious event sequence: ${sequence.join(' → ')}`,
            `Sequence completed at ${new Date(matchingEvents[matchingEvents.length - 1].timestamp).toISOString()}`
          ],
          psychographic_context: profile ? {
            risk_profile: profile.risk_profile,
            cognitive_style: profile.cognitive_style
          } : {},
          intent_assessment: intent,
          supporting_event_ids: matchingEvents.map(e => e.id)
        },
        interventions: generateInterventions(intent, 'suspicious_behavior', profile)
      };
    }
  }
  
  return null;
}

/**
 * Evaluate psychographic risk rules
 */
function evaluatePsychographicRisk(criteria, events, profile, rule) {
  if (!profile || !criteria.psychographic_conditions) return null;
  
  let allConditionsMet = true;
  const matchedConditions = [];
  
  for (const condition of criteria.psychographic_conditions) {
    const value = getProfileValue(profile, condition.trait);
    const met = evaluateCondition(value, condition.operator, condition.value);
    
    if (met) {
      matchedConditions.push(`${condition.trait} ${condition.operator} ${condition.value}`);
    } else {
      allConditionsMet = false;
    }
  }
  
  if (allConditionsMet) {
    return {
      alert_type: 'psychographic_risk',
      severity: rule.severity,
      confidence_score: 0.7,
      policy_violated: rule.name,
      reasoning: {
        behavioral_evidence: [
          `User exhibits high-risk psychographic profile`,
          `Matched conditions: ${matchedConditions.join(', ')}`
        ],
        psychographic_context: {
          risk_profile: profile.risk_profile,
          motivation_stack: profile.motivation_stack_v2?.map(m => m.label).slice(0, 3) || [],
          cognitive_style: profile.cognitive_style,
          personality_traits: profile.personality_traits
        },
        intent_assessment: 'unclear',
        supporting_event_ids: events.slice(0, 5).map(e => e.id)
      },
      interventions: generateInterventions('unclear', 'psychographic_risk', profile)
    };
  }
  
  return null;
}

/**
 * Evaluate combined logic rules
 */
function evaluateCombinedLogic(criteria, events, profile, rule) {
  // Simplified combined logic evaluation
  // In production, this would parse criteria.combined_logic more sophisticatedly
  
  const freqResult = criteria.frequency_limit ? 
    evaluateFrequencyThreshold({ frequency_limit: criteria.frequency_limit }, events, profile, rule) : null;
  const psychResult = criteria.psychographic_conditions ? 
    evaluatePsychographicRisk(criteria, events, profile, rule) : null;
  
  if (freqResult && psychResult) {
    return {
      ...freqResult,
      alert_type: 'combined_violation',
      confidence_score: Math.min(freqResult.confidence_score * 1.2, 0.95), // Higher confidence when both match
      reasoning: {
        ...freqResult.reasoning,
        behavioral_evidence: [
          ...freqResult.reasoning.behavioral_evidence,
          ...psychResult.reasoning.behavioral_evidence
        ]
      }
    };
  }
  
  return null;
}

/**
 * Detect dark pattern interactions from user behavior
 */
function detectDarkPatternInteraction(events, profile) {
  const darkPatterns = [];
  
  // Detect "roach motel" (hard to cancel/unsubscribe)
  const cancelAttempts = events.filter(e => 
    e.event_payload?.url?.includes('cancel') || 
    e.event_payload?.url?.includes('unsubscribe')
  );
  
  if (cancelAttempts.length >= 3) {
    const timeSpent = cancelAttempts.length * 30; // Estimate
    darkPatterns.push({
      pattern_type: 'roach_motel',
      element: cancelAttempts[0]?.event_payload?.url || 'cancellation_flow',
      manipulation_score: Math.min(cancelAttempts.length / 5, 1),
      evidence: {
        user_confusion_signals: [
          `User attempted cancellation ${cancelAttempts.length} times`,
          `Estimated time spent: ${timeSpent}s`
        ],
        average_time_spent: timeSpent
      },
      recommended_fix: 'Simplify cancellation process - ensure single-click cancellation is available'
    });
  }
  
  // Add more dark pattern detection logic here
  
  return darkPatterns;
}

/**
 * Helper: Assess user intent based on psychographic profile
 */
function assessIntent(profile, violationType) {
  if (!profile) return 'unclear';
  
  // High impulsivity + aggressive risk = likely intentional
  if (profile.personality_traits?.neuroticism > 0.7 && profile.risk_profile === 'aggressive') {
    return 'malicious';
  }
  
  // Analytical style + high conscientiousness = likely confused/accidental
  if (profile.cognitive_style === 'analytical' && profile.personality_traits?.conscientiousness > 0.7) {
    return 'confused';
  }
  
  // Check motivation stack for exploitation indicators
  const motivations = profile.motivation_stack_v2 || [];
  const hasExploitationMotivation = motivations.some(m => 
    m.label.toLowerCase().includes('power') || 
    m.label.toLowerCase().includes('dominance')
  );
  
  if (hasExploitationMotivation) {
    return 'exploitative';
  }
  
  return 'unclear';
}

/**
 * Helper: Generate psychologically-informed interventions
 */
function generateInterventions(intent, violationType, profile) {
  const interventions = [];
  
  if (intent === 'confused' || intent === 'accidental') {
    interventions.push({
      action_type: 'educational_nudge',
      rationale: 'User appears confused rather than malicious. Educational guidance is appropriate.',
      psychographic_alignment: profile?.cognitive_style === 'analytical' 
        ? 'Provide detailed step-by-step instructions'
        : 'Provide simple, intuitive guidance'
    });
  }
  
  if (intent === 'malicious' || intent === 'exploitative') {
    interventions.push({
      action_type: 'temporary_rate_limit',
      rationale: 'User exhibits intentional abuse patterns. Rate limiting is warranted.',
      psychographic_alignment: 'Firm boundaries appropriate for this profile'
    });
    
    interventions.push({
      action_type: 'account_review',
      rationale: 'Escalate for human review given severity and intent',
      psychographic_alignment: 'Manual review recommended'
    });
  }
  
  if (intent === 'unclear') {
    interventions.push({
      action_type: 'warning_message',
      rationale: 'Intent unclear - start with warning to gather more information',
      psychographic_alignment: 'Neutral tone appropriate'
    });
  }
  
  return interventions;
}

/**
 * Helper: Get value from profile by path
 */
function getProfileValue(profile, path) {
  const parts = path.split('.');
  let value = profile;
  for (const part of parts) {
    value = value?.[part];
  }
  return value;
}

/**
 * Helper: Evaluate condition
 */
function evaluateCondition(value, operator, expected) {
  switch (operator) {
    case 'equals':
      return value === expected;
    case 'greater_than':
      return Number(value) > Number(expected);
    case 'less_than':
      return Number(value) < Number(expected);
    case 'contains':
      return String(value).toLowerCase().includes(String(expected).toLowerCase());
    default:
      return false;
  }
}
