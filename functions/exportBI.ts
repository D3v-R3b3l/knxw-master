import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Convert array of objects to CSV string
 */
function toCSV(data, columns = null) {
  if (!data || data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const rows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(h => {
      let val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') val = JSON.stringify(val);
      // Escape quotes and wrap in quotes if contains comma
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    });
    rows.push(values.join(','));
  }
  
  return rows.join('\n');
}

/**
 * Flatten nested object for BI tools
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Transform psychographic profiles for BI export
 */
function transformProfilesForBI(profiles) {
  return profiles.map(p => {
    const flat = flattenObject(p);
    return {
      user_id: p.user_id,
      risk_profile: p.risk_profile,
      cognitive_style: p.cognitive_style,
      emotional_mood: p.emotional_state?.mood,
      emotional_confidence: p.emotional_state?.confidence_score,
      energy_level: p.emotional_state?.energy_level,
      openness: p.personality_traits?.openness,
      conscientiousness: p.personality_traits?.conscientiousness,
      extraversion: p.personality_traits?.extraversion,
      agreeableness: p.personality_traits?.agreeableness,
      neuroticism: p.personality_traits?.neuroticism,
      motivation_primary: p.motivation_stack_v2?.[0]?.label,
      motivation_primary_weight: p.motivation_stack_v2?.[0]?.weight,
      motivation_secondary: p.motivation_stack_v2?.[1]?.label,
      preferred_content_type: p.engagement_patterns?.preferred_content_type,
      attention_span: p.engagement_patterns?.attention_span,
      staleness_score: p.staleness_score,
      last_analyzed: p.last_analyzed,
      created_date: p.created_date,
      updated_date: p.updated_date
    };
  });
}

/**
 * Transform events for BI export
 */
function transformEventsForBI(events) {
  return events.map(e => ({
    event_id: e.id,
    user_id: e.user_id,
    session_id: e.session_id,
    event_type: e.event_type,
    url: e.event_payload?.url,
    element: e.event_payload?.element,
    duration: e.event_payload?.duration,
    timestamp: e.timestamp,
    processed: e.processed,
    user_agent: e.device_info?.user_agent,
    screen_resolution: e.device_info?.screen_resolution,
    created_date: e.created_date
  }));
}

/**
 * Transform insights for BI export
 */
function transformInsightsForBI(insights) {
  return insights.map(i => ({
    insight_id: i.id,
    user_id: i.user_id,
    insight_type: i.insight_type,
    title: i.title,
    description: i.description,
    confidence_score: i.confidence_score,
    priority: i.priority,
    recommendations_count: i.actionable_recommendations?.length || 0,
    first_recommendation: i.actionable_recommendations?.[0],
    created_date: i.created_date
  }));
}

/**
 * Transform engagements for BI export
 */
function transformEngagementsForBI(engagements) {
  return engagements.map(e => ({
    delivery_id: e.id,
    user_id: e.user_id,
    rule_id: e.rule_id,
    template_id: e.template_id,
    delivery_channel: e.delivery_channel,
    delivery_status: e.delivery_status,
    action_taken: e.response?.action_taken,
    response_time_seconds: e.response?.response_time_seconds,
    page_url: e.delivery_context?.page_url,
    created_date: e.created_date
  }));
}

/**
 * Generate Tableau-specific format (TDE-compatible JSON)
 */
function formatForTableau(data, dataType) {
  return {
    metadata: {
      source: 'knXw Psychographic Intelligence',
      data_type: dataType,
      exported_at: new Date().toISOString(),
      record_count: data.length
    },
    schema: Object.keys(data[0] || {}).map(key => ({
      name: key,
      type: typeof data[0]?.[key] === 'number' ? 'float' : 'string'
    })),
    data
  };
}

/**
 * Generate Power BI-specific format
 */
function formatForPowerBI(data, dataType) {
  return {
    '@odata.context': `knxw://api/$metadata#${dataType}`,
    value: data,
    exportedAt: new Date().toISOString()
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { 
      action, 
      client_app_id, 
      config_id,
      data_sources = ['psychographic_profiles'],
      format = 'json',
      platform = 'generic',
      filters = {}
    } = await req.json();

    switch (action) {
      case 'export': {
        const exportData = {};
        const dateFilter = filters.date_range_days ? 
          new Date(Date.now() - filters.date_range_days * 24 * 60 * 60 * 1000).toISOString() : null;

        // Fetch requested data sources
        if (data_sources.includes('psychographic_profiles')) {
          let profiles = await base44.entities.UserPsychographicProfile.filter(
            filters.include_demo_data ? {} : { is_demo: false },
            '-last_analyzed',
            500
          );
          if (dateFilter) {
            profiles = profiles.filter(p => p.last_analyzed >= dateFilter);
          }
          exportData.psychographic_profiles = transformProfilesForBI(profiles);
        }

        if (data_sources.includes('events')) {
          let events = await base44.entities.CapturedEvent.filter(
            filters.include_demo_data ? {} : { is_demo: false },
            '-timestamp',
            1000
          );
          if (dateFilter) {
            events = events.filter(e => e.timestamp >= dateFilter);
          }
          exportData.events = transformEventsForBI(events);
        }

        if (data_sources.includes('insights')) {
          let insights = await base44.entities.PsychographicInsight.filter(
            filters.include_demo_data ? {} : { is_demo: false },
            '-created_date',
            500
          );
          if (dateFilter) {
            insights = insights.filter(i => i.created_date >= dateFilter);
          }
          exportData.insights = transformInsightsForBI(insights);
        }

        if (data_sources.includes('engagements')) {
          const engagements = await base44.entities.EngagementDelivery.filter({}, '-created_date', 500);
          exportData.engagements = transformEngagementsForBI(engagements);
        }

        // Format based on target platform
        let formattedData;
        let contentType = 'application/json';
        let filename = `knxw_export_${new Date().toISOString().split('T')[0]}`;

        if (format === 'csv') {
          // For CSV, export each data source as separate section
          const csvSections = [];
          for (const [source, data] of Object.entries(exportData)) {
            if (data.length > 0) {
              csvSections.push(`# ${source.toUpperCase()}`);
              csvSections.push(toCSV(data));
              csvSections.push('');
            }
          }
          formattedData = csvSections.join('\n');
          contentType = 'text/csv';
          filename += '.csv';
        } else if (platform === 'tableau') {
          formattedData = {};
          for (const [source, data] of Object.entries(exportData)) {
            formattedData[source] = formatForTableau(data, source);
          }
          filename += '_tableau.json';
        } else if (platform === 'powerbi') {
          formattedData = {};
          for (const [source, data] of Object.entries(exportData)) {
            formattedData[source] = formatForPowerBI(data, source);
          }
          filename += '_powerbi.json';
        } else {
          formattedData = {
            exported_at: new Date().toISOString(),
            filters_applied: filters,
            data: exportData
          };
          filename += '.json';
        }

        // Update export config if provided
        if (config_id) {
          const totalRecords = Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0);
          await base44.entities.BIExportConfig.update(config_id, {
            last_export: new Date().toISOString(),
            last_export_records: totalRecords
          });
        }

        return new Response(
          format === 'csv' ? formattedData : JSON.stringify(formattedData, null, 2),
          {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`
            }
          }
        );
      }

      case 'get_schema': {
        // Return data schema for BI tool configuration
        const schemas = {
          psychographic_profiles: {
            fields: [
              { name: 'user_id', type: 'string', description: 'Unique user identifier' },
              { name: 'risk_profile', type: 'enum', values: ['conservative', 'moderate', 'aggressive'] },
              { name: 'cognitive_style', type: 'enum', values: ['analytical', 'intuitive', 'systematic', 'creative'] },
              { name: 'emotional_mood', type: 'enum', values: ['positive', 'neutral', 'negative', 'excited', 'anxious', 'confident', 'uncertain'] },
              { name: 'openness', type: 'float', range: [0, 1] },
              { name: 'conscientiousness', type: 'float', range: [0, 1] },
              { name: 'extraversion', type: 'float', range: [0, 1] },
              { name: 'agreeableness', type: 'float', range: [0, 1] },
              { name: 'neuroticism', type: 'float', range: [0, 1] },
              { name: 'motivation_primary', type: 'string' },
              { name: 'last_analyzed', type: 'datetime' }
            ]
          },
          events: {
            fields: [
              { name: 'event_id', type: 'string' },
              { name: 'user_id', type: 'string' },
              { name: 'session_id', type: 'string' },
              { name: 'event_type', type: 'enum', values: ['page_view', 'click', 'scroll', 'form_submit', 'hover', 'exit_intent', 'time_on_page'] },
              { name: 'url', type: 'string' },
              { name: 'timestamp', type: 'datetime' }
            ]
          },
          insights: {
            fields: [
              { name: 'insight_id', type: 'string' },
              { name: 'user_id', type: 'string' },
              { name: 'insight_type', type: 'enum', values: ['behavioral_pattern', 'emotional_trigger', 'motivation_shift', 'engagement_optimization', 'risk_assessment'] },
              { name: 'confidence_score', type: 'float', range: [0, 1] },
              { name: 'priority', type: 'enum', values: ['low', 'medium', 'high', 'critical'] }
            ]
          }
        };

        return Response.json({
          status: 'success',
          data: schemas
        });
      }

      case 'preview': {
        // Return sample data for preview
        const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 5);
        const transformed = transformProfilesForBI(profiles);

        return Response.json({
          status: 'success',
          data: {
            sample_records: transformed,
            total_available: profiles.length,
            columns: Object.keys(transformed[0] || {})
          }
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('BI Export error:', error);
    return Response.json({ 
      status: 'error', 
      message: 'Failed to process BI export request',
      error: error.message 
    }, { status: 500 });
  }
});