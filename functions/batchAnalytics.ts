import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let payload = {};
  
  try {
    const me = await base44.auth.me();
    if (!me) {
      return Response.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    payload = await req.json().catch(() => ({}));
    const {
      client_app_id,
      analysis_type = 'professional_report',
      segment_count = 5,
      time_window_days = 30,
      include_reasoning = true,
      comparison_segments = []
    } = payload || {};

    // Enhanced input validation
    if (!client_app_id || typeof client_app_id !== 'string') {
      return Response.json({ status: 'error', message: 'client_app_id is required' }, { status: 400 });
    }
    
    const validAnalysisTypes = ['professional_report', 'psychographic_clustering', 'behavioral_trend_analysis', 'churn_prediction_analysis', 'psychographic_comparison', 'cohort_analysis'];
    if (!validAnalysisTypes.includes(analysis_type)) {
      return Response.json({ status: 'error', message: 'Invalid analysis_type' }, { status: 400 });
    }

    if (typeof segment_count !== 'number' || segment_count < 2 || segment_count > 20) {
      return Response.json({ status: 'error', message: 'segment_count must be between 2 and 20' }, { status: 400 });
    }

    if (typeof time_window_days !== 'number' || time_window_days < 1 || time_window_days > 365) {
      return Response.json({ status: 'error', message: 'time_window_days must be between 1 and 365' }, { status: 400 });
    }

    // Verify access to ClientApp
    let app;
    try {
      app = await base44.entities.ClientApp.get(client_app_id);
      if (!app || (app.owner_id !== me.id && me.role !== 'admin')) {
        return Response.json({ status: 'error', message: 'Access denied for this client application' }, { status: 403 });
      }
    } catch {
      return Response.json({ status: 'error', message: 'Client application not found' }, { status: 404 });
    }

    const start = Date.now();
    const cutoff = new Date(Date.now() - time_window_days * 24 * 60 * 60 * 1000).toISOString();

    // Load comprehensive data
    const [profiles, events, insights] = await Promise.all([
      base44.asServiceRole.entities.UserPsychographicProfile.filter(
        { is_demo: false, created_date: { $gte: cutoff } },
        '-last_analyzed',
        2000
      ),
      base44.asServiceRole.entities.CapturedEvent.filter(
        { is_demo: false, timestamp: { $gte: cutoff } },
        '-timestamp',
        10000
      ),
      base44.asServiceRole.entities.PsychographicInsight.filter(
        { is_demo: false, created_date: { $gte: cutoff } },
        '-created_date',
        1000
      )
    ]);

    // Generate analysis based on type
    const analysisResult = await generateAnalysis(
      analysis_type,
      profiles,
      events,
      insights,
      app,
      segment_count,
      time_window_days,
      comparison_segments,
      base44
    );

    const execution_time = Math.round((Date.now() - start) / 1000);

    // Save report
    const report = await base44.entities.BatchAnalysisReport.create({
      analysis_type,
      client_app_id,
      is_demo: false,
      parameters: {
        client_app_id,
        segment_count,
        time_window_days,
        include_reasoning,
        comparison_segments
      },
      results: analysisResult,
      execution_time_seconds: execution_time,
      status: 'completed'
    });

    return Response.json({
      status: 'success',
      message: 'Analysis completed successfully',
      report_id: report.id,
      execution_time_seconds: execution_time,
      total_profiles_analyzed: profiles.length,
      total_events_analyzed: events.length
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    
    try {
      await base44.entities.BatchAnalysisReport.create({
        analysis_type: payload.analysis_type || 'unknown',
        client_app_id: payload.client_app_id || null,
        is_demo: false,
        parameters: payload,
        results: { error: error?.message || 'Unknown error', stack: error?.stack },
        execution_time_seconds: 0,
        status: 'failed'
      });
    } catch (saveError) {
      console.error('Failed to save error report:', saveError);
    }
    
    return Response.json({ 
      status: 'error', 
      message: 'Batch analysis failed', 
      error: error?.message 
    }, { status: 500 });
  }
});

async function generateAnalysis(analysisType, profiles, events, insights, app, segmentCount, timeWindow, comparisonSegments, base44) {
  const now = new Date().toISOString();
  
  // Prepare comprehensive data summary
  const dataSummary = {
    app_name: app.name,
    analysis_date: now,
    time_period_days: timeWindow,
    total_profiles: profiles.length,
    total_events: events.length,
    total_insights: insights.length,
    requested_segments: segmentCount,
    profiles_sample: profiles.slice(0, 50).map(p => ({
      personality_traits: p.personality_traits || {},
      risk_profile: p.risk_profile,
      cognitive_style: p.cognitive_style,
      emotional_state: p.emotional_state || {},
      motivation_stack_v2: p.motivation_stack_v2 || []
    })),
    event_types_distribution: events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {}),
    top_insights: insights.slice(0, 20).map(i => ({
      type: i.insight_type,
      title: i.title,
      description: i.description,
      confidence: i.confidence_score,
      priority: i.priority
    }))
  };

  switch (analysisType) {
    case 'professional_report':
      return await generateProfessionalReport(dataSummary, base44);
    
    case 'psychographic_clustering':
      return await generateClusteringAnalysis(dataSummary, segmentCount, base44);
    
    case 'behavioral_trend_analysis':
      return await generateTrendAnalysis(dataSummary, base44);
    
    case 'churn_prediction_analysis':
      return await generateChurnAnalysis(dataSummary, base44);
    
    case 'psychographic_comparison':
      return await generateComparisonAnalysis(dataSummary, comparisonSegments, base44);
    
    case 'cohort_analysis':
      return generateCohortAnalysis(dataSummary, base44);
    
    default:
      throw new Error(`Unsupported analysis type: ${analysisType}`);
  }
}

async function generateProfessionalReport(dataSummary, base44) {
  const prompt = `You are a senior psychographic analyst creating an executive-level business intelligence report.

APP DATA: ${dataSummary.app_name}
ANALYSIS PERIOD: ${dataSummary.time_period_days} days
PROFILES ANALYZED: ${dataSummary.total_profiles}
EVENTS CAPTURED: ${dataSummary.total_events}
INSIGHTS GENERATED: ${dataSummary.total_insights}

USER DATA SAMPLE:
${JSON.stringify(dataSummary.profiles_sample.slice(0, 20), null, 2)}

EVENT DISTRIBUTION:
${JSON.stringify(dataSummary.event_types_distribution, null, 2)}

TOP INSIGHTS:
${JSON.stringify(dataSummary.top_insights, null, 2)}

Generate a comprehensive professional report with these EXACT sections:

{
  "executive_summary": "Clear, concise 2-3 sentence summary of the most important findings",
  "key_metrics": {
    "total_users_analyzed": number,
    "segments_identified": number,
    "confidence_score": number (0-1),
    "primary_opportunity": "string describing biggest opportunity"
  },
  "user_segments": [
    {
      "segment_name": "Memorable, descriptive name (e.g. 'Trust-Seeking Achievers')",
      "user_count": estimated_count,
      "size_percentage": "XX%",
      "description": "Clear description of this segment",
      "key_traits": ["trait1", "trait2", "trait3"],
      "business_value": "Why this segment matters to the business",
      "marketing_strategy": "How to market to this segment",
      "product_recommendations": ["rec1", "rec2", "rec3"],
      "conversion_potential": "high" | "medium" | "low"
    }
  ],
  "strategic_insights": [
    {
      "insight": "Key strategic insight",
      "impact": "high" | "medium" | "low",
      "rationale": "Why this insight matters",
      "action_items": ["action1", "action2"]
    }
  ],
  "next_steps": ["step1", "step2", "step3"],
  "methodology_notes": "Brief explanation of analysis approach"
}

Requirements:
- Create 4-6 distinct user segments with memorable names
- Each segment should represent 10-30% of users
- Focus on actionable business insights
- Use professional, executive-level language
- Base segments on actual personality/behavioral data provided`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        key_metrics: {
          type: "object",
          properties: {
            total_users_analyzed: { type: "number" },
            segments_identified: { type: "number" },
            confidence_score: { type: "number" },
            primary_opportunity: { type: "string" }
          }
        },
        user_segments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              segment_name: { type: "string" },
              user_count: { type: "number" },
              size_percentage: { type: "string" },
              description: { type: "string" },
              key_traits: { type: "array", items: { type: "string" } },
              business_value: { type: "string" },
              marketing_strategy: { type: "string" },
              product_recommendations: { type: "array", items: { type: "string" } },
              conversion_potential: { type: "string" }
            }
          }
        },
        strategic_insights: {
          type: "array",
          items: {
            type: "object",
            properties: {
              insight: { type: "string" },
              impact: { type: "string" },
              rationale: { type: "string" },
              action_items: { type: "array", items: { type: "string" } }
            }
          }
        },
        next_steps: { type: "array", items: { type: "string" } },
        methodology_notes: { type: "string" }
      }
    }
  });

  return {
    ...result,
    analysis_metadata: {
      generated_at: dataSummary.analysis_date,
      data_quality_score: Math.min(0.95, dataSummary.total_profiles / 100),
      analysis_type: "professional_report"
    }
  };
}

async function generateClusteringAnalysis(dataSummary, segmentCount, base44) {
  const prompt = `Analyze user psychographic data to identify ${segmentCount} distinct behavioral clusters.

DATA SUMMARY:
${JSON.stringify(dataSummary, null, 2)}

Generate clustering analysis with this structure:
{
  "clusters": {
    "0": {
      "cluster_id": 0,
      "size": estimated_user_count,
      "percentage": "XX%",
      "ai_insights": {
        "cluster_name": "Descriptive name",
        "archetype_description": "Clear description",
        "key_characteristics": ["trait1", "trait2", "trait3"],
        "business_value": "Why this cluster matters",
        "marketing_recommendations": ["rec1", "rec2"],
        "product_insights": ["insight1", "insight2"]
      },
      "avg_personality_traits": {
        "openness": 0.0-1.0,
        "conscientiousness": 0.0-1.0,
        "extraversion": 0.0-1.0,
        "agreeableness": 0.0-1.0,
        "neuroticism": 0.0-1.0
      }
    }
  },
  "total_profiles_analyzed": ${dataSummary.total_profiles},
  "segment_count": ${segmentCount},
  "generated_at": "${dataSummary.analysis_date}"
}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        clusters: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              cluster_id: { type: "number" },
              size: { type: "number" },
              percentage: { type: "string" },
              ai_insights: {
                type: "object",
                properties: {
                  cluster_name: { type: "string" },
                  archetype_description: { type: "string" },
                  key_characteristics: { type: "array", items: { type: "string" } },
                  business_value: { type: "string" },
                  marketing_recommendations: { type: "array", items: { type: "string" } },
                  product_insights: { type: "array", items: { type: "string" } }
                }
              },
              avg_personality_traits: {
                type: "object",
                properties: {
                  openness: { type: "number" },
                  conscientiousness: { type: "number" },
                  extraversion: { type: "number" },
                  agreeableness: { type: "number" },
                  neuroticism: { type: "number" }
                }
              }
            }
          }
        },
        total_profiles_analyzed: { type: "number" },
        segment_count: { type: "number" },
        generated_at: { type: "string" }
      }
    }
  });

  return result;
}

async function generateTrendAnalysis(dataSummary, base44) {
  const prompt = `Analyze behavioral trends over the ${dataSummary.time_period_days}-day period.

EVENT DISTRIBUTION:
${JSON.stringify(dataSummary.event_types_distribution, null, 2)}

INSIGHTS DATA:
${JSON.stringify(dataSummary.top_insights, null, 2)}

Generate trend analysis:
{
  "behavioral_trend_analysis": {
    "summary": "Overall trend summary",
    "key_trends": [
      {
        "trend_name": "Name of trend",
        "description": "What's happening",
        "impact": "high" | "medium" | "low",
        "recommendation": "What to do about it"
      }
    ],
    "behavioral_shifts": {
      "increasing_behaviors": ["behavior1", "behavior2"],
      "decreasing_behaviors": ["behavior1", "behavior2"],
      "emerging_patterns": ["pattern1", "pattern2"]
    },
    "predictions": [
      {
        "prediction": "Future prediction",
        "confidence": 0.0-1.0,
        "timeframe": "1-3 months | 3-6 months | 6+ months"
      }
    ]
  },
  "generated_at": "${dataSummary.analysis_date}"
}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        behavioral_trend_analysis: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend_name: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            behavioral_shifts: {
              type: "object",
              properties: {
                increasing_behaviors: { type: "array", items: { type: "string" } },
                decreasing_behaviors: { type: "array", items: { type: "string" } },
                emerging_patterns: { type: "array", items: { type: "string" } }
              }
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prediction: { type: "string" },
                  confidence: { type: "number" },
                  timeframe: { type: "string" }
                }
              }
            }
          }
        },
        generated_at: { type: "string" }
      }
    }
  });

  return result;
}

async function generateChurnAnalysis(dataSummary, base44) {
  const prompt = `Analyze psychographic and behavioral patterns to predict churn risk.

USER DATA:
${JSON.stringify(dataSummary.profiles_sample, null, 2)}

INSIGHTS:
${JSON.stringify(dataSummary.top_insights.slice(0, 10), null, 2)}

Generate churn prediction analysis:
{
  "churn_analysis": {
    "overall_risk_level": "low" | "medium" | "high",
    "risk_segments": [
      {
        "segment_name": "High Risk Segment Name",
        "risk_level": "high" | "medium" | "low",
        "size_percentage": "XX%",
        "churn_indicators": ["indicator1", "indicator2"],
        "prevention_strategies": ["strategy1", "strategy2"]
      }
    ],
    "early_warning_signals": [
      {
        "signal": "Warning signal",
        "severity": "critical" | "warning" | "watch",
        "detection_method": "How to detect this"
      }
    ],
    "retention_recommendations": ["rec1", "rec2", "rec3"]
  },
  "generated_at": "${dataSummary.analysis_date}"
}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        churn_analysis: {
          type: "object",
          properties: {
            overall_risk_level: { type: "string" },
            risk_segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment_name: { type: "string" },
                  risk_level: { type: "string" },
                  size_percentage: { type: "string" },
                  churn_indicators: { type: "array", items: { type: "string" } },
                  prevention_strategies: { type: "array", items: { type: "string" } }
                }
              }
            },
            early_warning_signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  signal: { type: "string" },
                  severity: { type: "string" },
                  detection_method: { type: "string" }
                }
              }
            },
            retention_recommendations: { type: "array", items: { type: "string" } }
          }
        },
        generated_at: { type: "string" }
      }
    }
  });

  return result;
}

async function generateComparisonAnalysis(dataSummary, comparisonSegments, base44) {
  const prompt = `Compare different psychographic segments to identify key differences and opportunities.

COMPARISON SEGMENTS: ${comparisonSegments.join(', ') || 'Auto-detect top 2 segments'}
USER DATA: ${JSON.stringify(dataSummary.profiles_sample, null, 2)}

Generate comparison analysis:
{
  "comparison_analysis": {
    "segments_compared": ["segment1", "segment2"],
    "key_differences": [
      {
        "dimension": "personality_traits | motivation | behavior",
        "segment1_trait": "Description for segment 1",
        "segment2_trait": "Description for segment 2",
        "business_implication": "What this difference means"
      }
    ],
    "opportunities": [
      {
        "opportunity": "Business opportunity",
        "target_segment": "Which segment to target",
        "strategy": "How to capitalize"
      }
    ],
    "recommendations": ["rec1", "rec2", "rec3"]
  },
  "generated_at": "${dataSummary.analysis_date}"
}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        comparison_analysis: {
          type: "object",
          properties: {
            segments_compared: { type: "array", items: { type: "string" } },
            key_differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dimension: { type: "string" },
                  segment1_trait: { type: "string" },
                  segment2_trait: { type: "string" },
                  business_implication: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  target_segment: { type: "string" },
                  strategy: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        },
        generated_at: { type: "string" }
      }
    }
  });

  return result;
}

function generateCohortAnalysis(dataSummary, base44) {
  // For future implementation
  return {
    cohort_analysis: {
      message: "Cohort analysis coming soon",
      placeholder_data: true
    },
    generated_at: dataSummary.analysis_date
  };
}