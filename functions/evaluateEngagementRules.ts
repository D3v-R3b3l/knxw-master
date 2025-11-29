import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const getCorsHeaders = () => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

// Helper function to evaluate psychographic conditions
function evaluatePsychographicConditions(profile, conditions) {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
        const { field, operator, value } = condition;
        let profileValue;
        
        // Handle nested field access (e.g., "emotional_state.mood")
        const fieldParts = field.split('.');
        profileValue = fieldParts.reduce((obj, part) => {
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

// Helper function to evaluate behavioral conditions
function evaluateBehavioralConditions(recentEvents, conditions) {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
        const { event_type, frequency, event_payload_conditions } = condition;
        
        const matchingEvents = recentEvents.filter(event => {
            if (event.event_type !== event_type) return false;
            
            // Check event payload conditions if specified
            if (event_payload_conditions && event_payload_conditions.length > 0) {
                return event_payload_conditions.every(payloadCondition => {
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

// Helper function to evaluate timing conditions
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

// Helper function to check engagement frequency limits
async function checkFrequencyLimits(base44, userId, ruleId, maxFrequency) {
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
    
    const recentDeliveries = await base44.entities.EngagementDelivery.filter({
        user_id: userId,
        rule_id: ruleId
    });
    
    const recentCount = recentDeliveries.filter(delivery => 
        new Date(delivery.created_date).getTime() > timeThreshold.getTime()
    ).length;
    
    return recentCount < limit;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders() });
    }

    try {
        const base44 = createClientFromRequest(req);
        const { apiKey, user_id, context } = await req.json();
        
        if (!apiKey || !user_id || !context) {
            return new Response(JSON.stringify({ error: 'apiKey, user_id, and context are required' }), {
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
            });
        }

        // Validate API Key and get ClientApp
        const clientApps = await base44.entities.ClientApp.filter({ api_key: apiKey });
        const clientApp = clientApps && clientApps.length > 0 ? clientApps[0] : null;
        
        if (!clientApp || clientApp.status !== 'active') {
            return new Response(JSON.stringify({ error: 'Invalid or inactive API Key' }), {
                status: 403, 
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
            });
        }

        // Get user's psychographic profile
        const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
            
        if (!profile) {
            return new Response(JSON.stringify({ triggered_engagements: [] }), {
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
            });
        }

        // Get recent user events for behavioral analysis
        const recentEvents = await base44.entities.CapturedEvent.filter({ user_id }, '-timestamp', 50);

        // Get all active engagement rules for this client app
        const activeRules = await base44.entities.EngagementRule.filter({
            client_app_id: clientApp.id,
            status: 'active'
        });

        const triggeredEngagements = [];

        // Evaluate each rule
        for (const rule of activeRules) {
            const { trigger_conditions, engagement_action } = rule;
            
            // Check frequency limits first
            const withinFrequencyLimits = await checkFrequencyLimits(
                base44,
                user_id, 
                rule.id, 
                engagement_action.max_frequency
            );
            
            if (!withinFrequencyLimits) continue;
            
            // Evaluate all trigger conditions
            const psychographicMatch = evaluatePsychographicConditions(
                profile, 
                trigger_conditions.psychographic_conditions
            );
            
            const behavioralMatch = evaluateBehavioralConditions(
                recentEvents, 
                trigger_conditions.behavioral_conditions
            );
            
            const timingMatch = evaluateTimingConditions(
                context, 
                trigger_conditions.timing_conditions
            );
            
            // If all conditions are met, prepare the engagement
            if (psychographicMatch && behavioralMatch && timingMatch) {
                // Get the engagement template
                const templates = await base44.entities.EngagementTemplate.filter({ 
                    id: engagement_action.template_id 
                });
                const template = templates && templates.length > 0 ? templates[0] : null;
                
                if (template) {
                    // Create delivery record
                    const deliveryRecord = {
                        user_id,
                        rule_id: rule.id,
                        template_id: template.id,
                        client_app_id: clientApp.id,
                        session_id: context.session_id,
                        delivery_context: {
                            page_url: context.page_url,
                            user_psychographic_state: profile,
                            trigger_events: recentEvents.slice(0, 5).map(e => e.id),
                            conditions_met: [
                                psychographicMatch ? 'psychographic' : null,
                                behavioralMatch ? 'behavioral' : null,
                                timingMatch ? 'timing' : null
                            ].filter(Boolean)
                        },
                        delivery_status: 'pending'
                    };
                    
                    const delivery = await base44.entities.EngagementDelivery.create(deliveryRecord);
                    
                    // Personalize content if needed
                    let renderedContent = template.content;
                    
                    if (template.personalization && template.personalization.use_psychographic_data) {
                        // Use AI to personalize the content based on psychographic data
                        try {
                            const personalizationPrompt = `
                                Personalize this engagement content for a user with the following psychographic profile:
                                ${JSON.stringify(profile, null, 2)}
                                
                                Original content: ${JSON.stringify(template.content, null, 2)}
                                
                                Make the content more relevant and engaging for this specific user while maintaining the core message and structure. Return the personalized content in the same JSON structure.
                            `;
                            
                            const personalizedContent = await base44.integrations.Core.InvokeLLM({
                                prompt: personalizationPrompt,
                                response_json_schema: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        message: { type: "string" },
                                        questions: { 
                                            type: "array", 
                                            items: { type: "string" },
                                            default: []
                                        },
                                        buttons: { 
                                            type: "array", 
                                            items: { type: "object" },
                                            default: []
                                        },
                                        style: { type: "object" }
                                    }
                                }
                            });
                            
                            if (personalizedContent) {
                                renderedContent = personalizedContent;
                            }
                        } catch (error) {
                            console.error('Personalization failed, using original content:', error);
                        }
                    }
                    
                    // Update delivery record with rendered content
                    await base44.entities.EngagementDelivery.update(delivery.id, {
                        rendered_content: renderedContent,
                        delivery_status: 'delivered'
                    });
                    
                    // Update rule analytics
                    const currentAnalytics = rule.analytics || {};
                    await base44.entities.EngagementRule.update(rule.id, {
                        analytics: {
                            ...currentAnalytics,
                            triggered_count: (currentAnalytics.triggered_count || 0) + 1,
                            last_triggered: new Date().toISOString()
                        }
                    });
                    
                    triggeredEngagements.push({
                        delivery_id: delivery.id,
                        rule_name: rule.name,
                        engagement_type: engagement_action.type,
                        priority: engagement_action.priority,
                        content: renderedContent,
                        style: renderedContent.style || {}
                    });
                }
            }
        }

        // Sort by priority (critical > high > medium > low)
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        triggeredEngagements.sort((a, b) => 
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );

        return new Response(JSON.stringify({ 
            triggered_engagements: triggeredEngagements.slice(0, 3) // Limit to 3 simultaneous engagements
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
        });

    } catch (error) {
        console.error('Error in evaluateEngagementRules function:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error', 
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders() }
        });
    }
});