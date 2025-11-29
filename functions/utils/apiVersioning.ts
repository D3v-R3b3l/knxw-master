// API Versioning utilities and middleware
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
};

export const CURRENT_VERSION = API_VERSIONS.V3;
export const SUPPORTED_VERSIONS = [API_VERSIONS.V1, API_VERSIONS.V2, API_VERSIONS.V3];
export const DEPRECATED_VERSIONS = [API_VERSIONS.V1];

export function extractVersionFromRequest(req) {
  const headerVersion = req.headers.get('api-version');
  if (headerVersion) {
    return headerVersion.toLowerCase();
  }

  const url = new URL(req.url);
  const queryVersion = url.searchParams.get('version');
  if (queryVersion) {
    return queryVersion.toLowerCase();
  }

  const pathMatch = req.url.match(/\/v(\d+)\//);
  if (pathMatch) {
    return `v${pathMatch[1]}`;
  }

  return CURRENT_VERSION;
}

export function validateVersion(version) {
  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new Error(`Unsupported API version: ${version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`);
  }

  if (DEPRECATED_VERSIONS.includes(version)) {
    console.warn(`API version ${version} is deprecated. Please upgrade to ${CURRENT_VERSION}.`);
  }

  return true;
}

export function withVersioning(handlers) {
  return async (req) => {
    const version = extractVersionFromRequest(req);
    
    try {
      validateVersion(version);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Unsupported API Version',
        message: error.message,
        supported_versions: SUPPORTED_VERSIONS,
        current_version: CURRENT_VERSION
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'API-Version': CURRENT_VERSION,
          'Supported-Versions': SUPPORTED_VERSIONS.join(', '),
          'Deprecated-Versions': DEPRECATED_VERSIONS.join(', ')
        }
      });
    }

    const handler = handlers[version] || handlers[CURRENT_VERSION];
    
    if (!handler) {
      return new Response(JSON.stringify({
        error: 'No Handler for Version',
        message: `No handler available for version ${version}`,
        available_versions: Object.keys(handlers)
      }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      req.apiVersion = version;
      req.isDeprecatedVersion = DEPRECATED_VERSIONS.includes(version);
      
      const response = await handler(req);
      
      if (response instanceof Response) {
        response.headers.set('API-Version', version);
        response.headers.set('Current-Version', CURRENT_VERSION);
        response.headers.set('Supported-Versions', SUPPORTED_VERSIONS.join(', '));
        
        if (DEPRECATED_VERSIONS.includes(version)) {
          response.headers.set('Deprecation', 'true');
          response.headers.set('Sunset', '2024-12-31');
          response.headers.set('Link', `</functions/migration-guide>; rel="successor-version"`);
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error in ${version} handler:`, error);
      throw error;
    }
  };
}

export class ResponseTransformer {
  static transformUserProfile(profile, version) {
    switch (version) {
      case API_VERSIONS.V1:
        return this.transformUserProfileV1(profile);
      case API_VERSIONS.V2:
        return this.transformUserProfileV2(profile);
      case API_VERSIONS.V3:
      default:
        return this.transformUserProfileV3(profile);
    }
  }

  static transformUserProfileV1(profile) {
    return {
      user_id: profile.user_id,
      motivations: profile.motivation_stack || [],
      emotional_state: profile.emotional_state?.mood || 'neutral',
      risk_profile: profile.risk_profile || 'moderate',
      last_updated: profile.last_analyzed,
    };
  }

  static transformUserProfileV2(profile) {
    return {
      user_id: profile.user_id,
      motivations: profile.motivation_stack || [],
      motivation_weights: profile.motivation_stack_v2 || [],
      emotional_state: profile.emotional_state || {},
      risk_profile: profile.risk_profile || 'moderate',
      cognitive_style: profile.cognitive_style || 'analytical',
      personality_traits: profile.personality_traits || {},
      confidence_scores: {
        motivation: profile.motivation_confidence || 0,
        emotional_state: profile.emotional_state_confidence || 0,
        risk_profile: profile.risk_profile_confidence || 0,
        cognitive_style: profile.cognitive_style_confidence || 0,
        personality: profile.personality_confidence || 0
      },
      last_analyzed: profile.last_analyzed,
      schema_version: profile.schema_version || 'v2.0.0'
    };
  }

  static transformUserProfileV3(profile) {
    return {
      ...profile,
      primary_motivations: profile.motivation_stack_v2 || [],
      motivation_stack: undefined,
      motivation_stack_v2: undefined
    };
  }

  static transformCapturedEvent(event, version) {
    switch (version) {
      case API_VERSIONS.V1:
        return {
          user_id: event.user_id,
          type: event.event_type,
          data: event.event_payload,
          timestamp: event.timestamp
        };
      case API_VERSIONS.V2:
      case API_VERSIONS.V3:
      default:
        return event;
    }
  }

  static transformInsight(insight, version) {
    switch (version) {
      case API_VERSIONS.V1:
        return {
          user_id: insight.user_id,
          type: insight.insight_type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence_score,
          recommendations: insight.actionable_recommendations || []
        };
      case API_VERSIONS.V2:
      case API_VERSIONS.V3:
      default:
        return insight;
    }
  }
}