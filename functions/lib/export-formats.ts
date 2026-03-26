/**
 * Export format handlers for different data types and file formats
 * Supports JSON, CSV, and Excel exports with proper encoding
 */

/**
 * Export user psychographic profiles to various formats
 * @param {Array} profiles - Array of UserPsychographicProfile objects
 * @param {string} format - Export format ('json', 'csv', 'excel')
 * @returns {object} Formatted export data with content and metadata
 */
export function exportProfiles(profiles, format = 'json') {
  if (!Array.isArray(profiles)) {
    throw new Error('Profiles must be an array');
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `knxw-profiles-export-${timestamp}`;
  
  switch (format.toLowerCase()) {
    case 'json':
      return {
        data: JSON.stringify({
          export_metadata: {
            type: 'psychographic_profiles',
            generated_at: new Date().toISOString(),
            record_count: profiles.length,
            knxw_version: '1.0.0'
          },
          profiles: profiles.map(profile => ({
            user_id: profile.user_id,
            personality_traits: profile.personality_traits,
            emotional_state: profile.emotional_state,
            risk_profile: profile.risk_profile,
            cognitive_style: profile.cognitive_style,
            motivation_stack: profile.motivation_stack,
            engagement_patterns: profile.engagement_patterns,
            last_analyzed: profile.last_analyzed,
            created_date: profile.created_date,
            updated_date: profile.updated_date
          }))
        }, null, 2),
        contentType: 'application/json',
        filename: `${filename}.json`,
        size: 0 // Will be calculated after stringification
      };
      
    case 'csv':
      const csvHeaders = [
        'user_id',
        'openness',
        'conscientiousness', 
        'extraversion',
        'agreeableness',
        'neuroticism',
        'emotional_mood',
        'emotional_confidence',
        'emotional_energy',
        'risk_profile',
        'cognitive_style',
        'motivation_primary',
        'motivation_secondary',
        'last_analyzed',
        'created_date'
      ];
      
      const csvRows = profiles.map(profile => {
        const traits = profile.personality_traits || {};
        const emotional = profile.emotional_state || {};
        const motivations = profile.motivation_stack || [];
        
        return [
          profile.user_id || '',
          traits.openness || '',
          traits.conscientiousness || '',
          traits.extraversion || '',
          traits.agreeableness || '',
          traits.neuroticism || '',
          emotional.mood || '',
          emotional.confidence || '',
          emotional.energy_level || '',
          profile.risk_profile || '',
          profile.cognitive_style || '',
          motivations[0] || '',
          motivations[1] || '',
          profile.last_analyzed || '',
          profile.created_date || ''
        ].map(field => {
          // Escape commas and quotes in CSV
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      });
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      return {
        data: csvContent,
        contentType: 'text/csv',
        filename: `${filename}.csv`,
        size: csvContent.length
      };
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Export captured events to various formats
 * @param {Array} events - Array of CapturedEvent objects  
 * @param {string} format - Export format ('json', 'csv')
 * @returns {object} Formatted export data
 */
export function exportEvents(events, format = 'json') {
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `knxw-events-export-${timestamp}`;
  
  switch (format.toLowerCase()) {
    case 'json':
      return {
        data: JSON.stringify({
          export_metadata: {
            type: 'captured_events',
            generated_at: new Date().toISOString(), 
            record_count: events.length,
            knxw_version: '1.0.0'
          },
          events: events.map(event => ({
            id: event.id,
            user_id: event.user_id,
            session_id: event.session_id,
            event_type: event.event_type,
            event_payload: event.event_payload,
            device_info: event.device_info,
            timestamp: event.timestamp,
            processed: event.processed,
            created_date: event.created_date
          }))
        }, null, 2),
        contentType: 'application/json',
        filename: `${filename}.json`,
        size: 0
      };
      
    case 'csv':
      const csvHeaders = [
        'id',
        'user_id', 
        'session_id',
        'event_type',
        'timestamp',
        'url',
        'element',
        'coordinates_x',
        'coordinates_y',
        'duration',
        'user_agent',
        'screen_resolution',
        'processed',
        'created_date'
      ];
      
      const csvRows = events.map(event => {
        const payload = event.event_payload || {};
        const coordinates = payload.coordinates || {};
        const device = event.device_info || {};
        
        return [
          event.id || '',
          event.user_id || '',
          event.session_id || '',
          event.event_type || '',
          event.timestamp || '',
          payload.url || '',
          payload.element || '',
          coordinates.x || '',
          coordinates.y || '',
          payload.duration || '',
          device.user_agent || '',
          device.screen_resolution || '',
          event.processed || false,
          event.created_date || ''
        ].map(field => {
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      });
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      return {
        data: csvContent,
        contentType: 'text/csv',
        filename: `${filename}.csv`,
        size: csvContent.length
      };
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Export psychographic insights to various formats
 * @param {Array} insights - Array of PsychographicInsight objects
 * @param {string} format - Export format ('json', 'csv')
 * @returns {object} Formatted export data
 */
export function exportInsights(insights, format = 'json') {
  if (!Array.isArray(insights)) {
    throw new Error('Insights must be an array');
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `knxw-insights-export-${timestamp}`;
  
  switch (format.toLowerCase()) {
    case 'json':
      return {
        data: JSON.stringify({
          export_metadata: {
            type: 'psychographic_insights',
            generated_at: new Date().toISOString(),
            record_count: insights.length,
            knxw_version: '1.0.0'
          },
          insights: insights.map(insight => ({
            id: insight.id,
            user_id: insight.user_id,
            insight_type: insight.insight_type,
            title: insight.title,
            description: insight.description,
            confidence_score: insight.confidence_score,
            priority: insight.priority,
            actionable_recommendations: insight.actionable_recommendations,
            supporting_events: insight.supporting_events,
            created_date: insight.created_date,
            updated_date: insight.updated_date
          }))
        }, null, 2),
        contentType: 'application/json',
        filename: `${filename}.json`,
        size: 0
      };
      
    case 'csv':
      const csvHeaders = [
        'id',
        'user_id',
        'insight_type',
        'title', 
        'description',
        'confidence_score',
        'priority',
        'recommendations_count',
        'supporting_events_count',
        'created_date'
      ];
      
      const csvRows = insights.map(insight => {
        return [
          insight.id || '',
          insight.user_id || '',
          insight.insight_type || '',
          insight.title || '',
          insight.description || '',
          insight.confidence_score || '',
          insight.priority || '',
          Array.isArray(insight.actionable_recommendations) ? insight.actionable_recommendations.length : 0,
          Array.isArray(insight.supporting_events) ? insight.supporting_events.length : 0,
          insight.created_date || ''
        ].map(field => {
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      });
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      return {
        data: csvContent,
        contentType: 'text/csv',
        filename: `${filename}.csv`,
        size: csvContent.length
      };
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Validate export parameters
 * @param {object} params - Export parameters to validate
 * @returns {object} Validation result
 */
export function validateExportParams(params) {
  const errors = [];
  
  if (!params) {
    errors.push('Export parameters are required');
    return { valid: false, errors };
  }
  
  if (!params.dataType || !['profiles', 'events', 'insights'].includes(params.dataType)) {
    errors.push('dataType must be one of: profiles, events, insights');
  }
  
  if (!params.format || !['json', 'csv'].includes(params.format.toLowerCase())) {
    errors.push('format must be one of: json, csv');
  }
  
  if (params.limit && (typeof params.limit !== 'number' || params.limit < 1 || params.limit > 10000)) {
    errors.push('limit must be a number between 1 and 10000');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate estimated file size before export
 * @param {number} recordCount - Number of records to export
 * @param {string} dataType - Type of data being exported
 * @param {string} format - Export format
 * @returns {number} Estimated size in bytes
 */
export function estimateExportSize(recordCount, dataType, format) {
  // Rough estimates based on average record sizes
  const averageSizes = {
    profiles: {
      json: 800, // bytes per profile in JSON
      csv: 200   // bytes per profile in CSV
    },
    events: {
      json: 400,
      csv: 150
    },
    insights: {
      json: 600,
      csv: 180
    }
  };
  
  const baseSize = averageSizes[dataType]?.[format] || 500;
  const metadataSize = format === 'json' ? 200 : 100; // JSON metadata overhead
  
  return (recordCount * baseSize) + metadataSize;
}