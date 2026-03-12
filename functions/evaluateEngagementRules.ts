import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
  });
}

function evaluatePsychographicConditions(profile, conditions) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const { field, operator, value } = condition;
    const profileValue = field.split('.').reduce((obj, part) => {
      return obj && obj[part] !== undefined ? obj[part] : null;
    }, profile);

    if (profileValue === undefined || profileValue === null) return false;

    switch (operator) {
      case 'equals':
        return String(profileValue) === String(value);
      case 'not_equals':
        return String(profileValue) !== String(value);
      case 'greater_than':
        return parseFloat(profileValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(profileValue) < parseFloat(value);
      case 'contains':
        return String(profileValue).toLowerCase().includes(String(value).toLowerCase());
      case 'not_contains':
        return !String(profileValue).toLowerCase().includes(String(value).toLowerCase());
      default:
        return false;
    }
  });
}

function evaluateBehavioralConditions(recentEvents, conditions) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const { event_type, frequency, event_payload_conditions } = condition;
    const matchingEvents = recentEvents.filter((event) => {
      if (event.event_type !== event_type) return false;

      if (event_payload_conditions && event_payload_conditions.length > 0) {
        return event_payload_conditions.every((payloadCondition) => {
          const { field, operator, value } = payloadCondition;
          const payloadValue = event.event_payload && event.event_payload[field];

          if (payloadValue === undefined) return false;

          switch (operator) {
            case 'equals':
              return String(payloadValue) === String(value);
            case 'contains':
              return String(payloadValue).toLowerCase().includes(String(value).toLowerCase());
            default:
              return false;
          }
        });
      }

      return true;
    });

    switch (frequency) {
      case 'once':
        return matchingEvents.length >= 1;
      case 'multiple':
        return matchingEvents.length >= 2;
      case 'never':
        return matchingEvents.length === 0;
      default:
        return false;
    }
  });
}

function evaluateTimingConditions(context, conditions) {
  if (!conditions) return true;

  const now = new Date();
  const { idle_time_seconds, time_on_page_seconds, session_duration_seconds } = conditions;

  if (idle_time_seconds && context.last_activity) {
    const idleTime = (now.getTime() - new Date(context.last_activity).getTime()) / 1000;
    if (idleTime < idle_time_seconds) return false;
  }

  if (time_on_page_seconds && context.page_start_time) {
    const timeOnPage = (now.getTime() - new Date(context.page_start_time).getTime()) / 1000;
    if (timeOnPage < time_on_page_seconds) return false;
  }

  if (session_duration_seconds && context.session_start_time) {
    const sessionDuration = (now.getTime() - new Date(context.session_start_time).getTime()) / 1000;
    if (sessionDuration < session_duration_seconds) return false;
  }

  return true;
}

async function checkFrequencyLimits(svc, userId, ruleId, maxFrequency) {
  if (!maxFrequency) return true;

  const { limit, period } = maxFrequency;
  const now = new Date();
  let timeThreshold;

  switch (period) {
    case 'hour':
      timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return true;
  }

  const recentDeliveries = await svc.entities.EngagementDelivery.filter({ user_id: userId, rule_id: ruleId });
  const recentCount = recentDeliveries.filter((delivery) => new Date(delivery.created_date).getTime() > timeThreshold.getTime()).length;
  return recentCount < limit;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders() });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const apiKey = body?.apiKey || req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    const user_id = body?.user_id;
    const context = body?.context;

    if (!apiKey || !user_id || !context) {
      return json({ error: 'apiKey, user_id, and context are required' }, 400);
    }

    const clientApps = await svc.entities.ClientApp.filter({ api_key: apiKey, status: 'active' }, null, 1);
    const clientApp = clientApps?.[0] || null;
    if (!clientApp) {
      return json({ error: 'Invalid or inactive API key' }, 403);
    }

    const profiles = await svc.entities.UserPsychographicProfile.filter({ user_id }, '-updated_date', 1);
    const profile = profiles?.[0] || null;
    if (!profile) {
      return json({ triggered_engagements: [] });
    }

    const recentEvents = await svc.entities.CapturedEvent.filter({ user_id }, '-timestamp', 50);
    const activeRules = await svc.entities.EngagementRule.filter({ client_app_id: clientApp.id, status: 'active' });
    const triggeredEngagements = [];

    for (const rule of activeRules) {
      const triggerConditions = rule.trigger_conditions || {};
      const engagementAction = rule.engagement_action || {};

      const withinFrequencyLimits = await checkFrequencyLimits(svc, user_id, rule.id, engagementAction.max_frequency);
      if (!withinFrequencyLimits) continue;

      const psychographicMatch = evaluatePsychographicConditions(profile, triggerConditions.psychographic_conditions);
      const behavioralMatch = evaluateBehavioralConditions(recentEvents, triggerConditions.behavioral_conditions);
      const timingMatch = evaluateTimingConditions(context, triggerConditions.timing_conditions);

      if (!(psychographicMatch && behavioralMatch && timingMatch)) continue;

      const templates = await svc.entities.EngagementTemplate.filter({ id: engagementAction.template_id }, null, 1);
      const template = templates?.[0] || null;
      if (!template) continue;

      const delivery = await svc.entities.EngagementDelivery.create({
        user_id,
        rule_id: rule.id,
        template_id: template.id,
        client_app_id: clientApp.id,
        session_id: context.session_id,
        delivery_context: {
          page_url: context.page_url,
          user_psychographic_state: profile,
          trigger_events: recentEvents.slice(0, 5).map((event) => event.id),
          conditions_met: [
            psychographicMatch ? 'psychographic' : null,
            behavioralMatch ? 'behavioral' : null,
            timingMatch ? 'timing' : null
          ].filter(Boolean)
        },
        delivery_status: 'pending'
      });

      let renderedContent = template.content;
      if (template.personalization?.use_psychographic_data) {
        try {
          const personalizationPrompt = `Personalize this engagement content for a user with the following psychographic profile:\n${JSON.stringify(profile, null, 2)}\n\nOriginal content:\n${JSON.stringify(template.content, null, 2)}\n\nReturn the same JSON structure with more relevant copy.`;
          const personalized = await svc.integrations.Core.InvokeLLM({
            prompt: personalizationPrompt,
            response_json_schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                message: { type: 'string' },
                questions: { type: 'array', items: { type: 'string' }, default: [] },
                buttons: { type: 'array', items: { type: 'object' }, default: [] },
                style: { type: 'object' }
              }
            }
          });

          if (personalized) {
            renderedContent = personalized;
          }
        } catch (error) {
          console.error('evaluateEngagementRules personalization failed:', error);
        }
      }

      await svc.entities.EngagementDelivery.update(delivery.id, {
        rendered_content: renderedContent,
        delivery_status: 'delivered'
      });

      const currentAnalytics = rule.analytics || {};
      await svc.entities.EngagementRule.update(rule.id, {
        analytics: {
          ...currentAnalytics,
          triggered_count: (currentAnalytics.triggered_count || 0) + 1,
          last_triggered: new Date().toISOString()
        }
      });

      triggeredEngagements.push({
        delivery_id: delivery.id,
        rule_name: rule.name,
        engagement_type: engagementAction.type,
        priority: engagementAction.priority,
        content: renderedContent,
        style: renderedContent?.style || {}
      });
    }

    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    triggeredEngagements.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    return json({ triggered_engagements: triggeredEngagements.slice(0, 3), unsupported_action_types: Array.from(unsupportedActionTypes) });
  } catch (error) {
    console.error('Error in evaluateEngagementRules:', error);
    return json({ error: 'Internal Server Error', details: error.message }, 500);
  }
});