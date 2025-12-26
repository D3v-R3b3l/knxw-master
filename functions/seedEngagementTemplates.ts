import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const officialTemplates = [
      {
        template_name: 'E-commerce Cart Abandonment',
        category: 'conversion',
        industry: 'e-commerce',
        description: 'Re-engage users who added items to cart but didn\'t complete purchase. Personalized based on risk profile.',
        rule_config: {
          name: 'Cart Abandonment Recovery',
          trigger_conditions: {
            psychographic_conditions: [],
            behavioral_conditions: [
              { event_type: 'add_to_cart', frequency: 'once', time_window: 'session' }
            ],
            timing_conditions: { idle_time_seconds: 300 }
          },
          engagement_action: { type: 'modal', priority: 'high' }
        },
        engagement_template_config: {
          type: 'modal',
          content: {
            title: 'Still thinking it over?',
            message: 'We saved your cart! Complete your order and get free shipping.',
            buttons: [
              { text: 'Complete Order', action: 'redirect', action_value: '/checkout' },
              { text: 'Keep Shopping', action: 'dismiss' }
            ],
            style: { theme: 'dark', position: 'center' }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.23,
          avg_engagement_rate: 0.67,
          usage_count: 142
        },
        tags: ['cart', 'conversion', 'retention', 'e-commerce'],
        is_featured: true,
        is_official: true
      },
      {
        template_name: 'SaaS Feature Discovery',
        category: 'onboarding',
        industry: 'SaaS',
        description: 'Guide analytical users through advanced features with contextual tooltips.',
        rule_config: {
          name: 'Advanced Feature Tour',
          trigger_conditions: {
            psychographic_conditions: [
              { field: 'cognitive_style', operator: 'equals', value: 'analytical' }
            ],
            behavioral_conditions: [
              { event_type: 'page_view', frequency: 'multiple', time_window: 'session' }
            ],
            timing_conditions: { time_on_page_seconds: 30 }
          },
          engagement_action: { type: 'tooltip', priority: 'medium' }
        },
        engagement_template_config: {
          type: 'tooltip',
          content: {
            title: 'Pro tip for power users',
            message: 'Did you know you can bulk-edit using keyboard shortcuts? Press ? to see all shortcuts.',
            buttons: [{ text: 'Got it', action: 'dismiss' }],
            style: { theme: 'dark', position: 'bottom-right', auto_dismiss_seconds: 10 }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.41,
          avg_engagement_rate: 0.78,
          usage_count: 89
        },
        tags: ['onboarding', 'features', 'tooltips', 'SaaS'],
        is_featured: true,
        is_official: true
      },
      {
        template_name: 'Healthcare Patient Check-in',
        category: 'support',
        industry: 'healthcare',
        description: 'Empathetic check-in for patients showing signs of anxiety or uncertainty.',
        rule_config: {
          name: 'Patient Wellness Check',
          trigger_conditions: {
            psychographic_conditions: [
              { field: 'emotional_state.mood', operator: 'equals', value: 'anxious' }
            ],
            behavioral_conditions: [],
            timing_conditions: { time_on_page_seconds: 60 }
          },
          engagement_action: { type: 'checkin', priority: 'high' }
        },
        engagement_template_config: {
          type: 'checkin',
          content: {
            title: 'How are you feeling?',
            message: 'We noticed you might need some support. Let us know how we can help.',
            questions: [
              'I have questions about my treatment',
              'I need to reschedule an appointment',
              'I\'m feeling anxious',
              'Everything is fine'
            ],
            buttons: [{ text: 'Get Support', action: 'redirect', action_value: '/support' }],
            style: { theme: 'light', position: 'center' }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.58,
          avg_engagement_rate: 0.82,
          usage_count: 67
        },
        tags: ['healthcare', 'empathy', 'support', 'wellness'],
        is_featured: true,
        is_official: true
      },
      {
        template_name: 'Finance Risk-Appropriate Upsell',
        category: 'upsell',
        industry: 'finance',
        description: 'Tailored investment product recommendations based on user risk profile.',
        rule_config: {
          name: 'Investment Product Recommendation',
          trigger_conditions: {
            psychographic_conditions: [
              { field: 'risk_profile', operator: 'equals', value: 'aggressive' }
            ],
            behavioral_conditions: [
              { event_type: 'page_view', frequency: 'multiple', time_window: 'session' }
            ],
            timing_conditions: { time_on_page_seconds: 45 }
          },
          engagement_action: { type: 'notification', priority: 'medium' }
        },
        engagement_template_config: {
          type: 'notification',
          content: {
            title: 'High-growth opportunities',
            message: 'Based on your profile, these investment products align with your goals.',
            buttons: [
              { text: 'Explore Options', action: 'redirect', action_value: '/investments' },
              { text: 'Not Now', action: 'dismiss' }
            ],
            style: { theme: 'dark', position: 'bottom-right', auto_dismiss_seconds: 12 }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.34,
          avg_engagement_rate: 0.71,
          usage_count: 53
        },
        tags: ['finance', 'upsell', 'personalization', 'risk-based'],
        is_featured: true,
        is_official: true
      },
      {
        template_name: 'Gaming Player Retention',
        category: 'retention',
        industry: 'gaming',
        description: 'Re-engage players showing early churn signals with personalized rewards.',
        rule_config: {
          name: 'Churn Prevention Reward',
          trigger_conditions: {
            psychographic_conditions: [
              { field: 'emotional_state.energy_level', operator: 'equals', value: 'low' }
            ],
            behavioral_conditions: [
              { event_type: 'game_session_end', frequency: 'multiple', time_window: 'last_day' }
            ],
            timing_conditions: {}
          },
          engagement_action: { type: 'modal', priority: 'critical' }
        },
        engagement_template_config: {
          type: 'modal',
          content: {
            title: 'We miss you!',
            message: 'Here\'s a special reward to get you back in the game. Claim your bonus now!',
            buttons: [
              { text: 'Claim Reward', action: 'track_event', action_value: 'reward_claimed' },
              { text: 'Maybe Later', action: 'dismiss' }
            ],
            style: { theme: 'dark', position: 'center' }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.49,
          avg_engagement_rate: 0.85,
          usage_count: 201
        },
        tags: ['gaming', 'retention', 'churn', 'rewards'],
        is_featured: true,
        is_official: true
      },
      {
        template_name: 'Education Adaptive Learning Path',
        category: 'onboarding',
        industry: 'education',
        description: 'Recommend personalized learning content based on cognitive style.',
        rule_config: {
          name: 'Personalized Learning Recommendation',
          trigger_conditions: {
            psychographic_conditions: [
              { field: 'cognitive_style', operator: 'equals', value: 'visual' }
            ],
            behavioral_conditions: [
              { event_type: 'course_start', frequency: 'once', time_window: 'session' }
            ],
            timing_conditions: {}
          },
          engagement_action: { type: 'notification', priority: 'medium' }
        },
        engagement_template_config: {
          type: 'notification',
          content: {
            title: 'Recommended for you',
            message: 'Based on your learning style, these video courses will help you master this topic faster.',
            buttons: [
              { text: 'View Courses', action: 'redirect', action_value: '/courses/recommended' },
              { text: 'Dismiss', action: 'dismiss' }
            ],
            style: { theme: 'light', position: 'bottom-right', auto_dismiss_seconds: 15 }
          }
        },
        performance_stats: {
          avg_conversion_rate: 0.62,
          avg_engagement_rate: 0.88,
          usage_count: 178
        },
        tags: ['education', 'personalization', 'learning', 'onboarding'],
        is_featured: true,
        is_official: true
      }
    ];

    // Create all templates
    const created = [];
    for (const template of officialTemplates) {
      const result = await base44.asServiceRole.entities.EngagementRuleTemplate.create(template);
      created.push(result);
    }

    return Response.json({
      success: true,
      templates_created: created.length,
      templates: created,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error seeding templates:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});