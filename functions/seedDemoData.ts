import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { faker } from 'npm:@faker-js/faker@8.4.1';

// Helper to add delay between operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper with retry logic for rate limits
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('Rate limit') || error.response?.status === 429) {
        if (i === maxRetries - 1) throw error;
        const delayMs = baseDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delayMs}ms...`);
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
}

// Helper to generate a random date in the last N days
const randomDateInLastNDays = (days = 7) => {
  return new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000));
};

// Helper to generate realistic user IDs
const generateUserId = () => faker.string.alphanumeric(16);

// Helper to generate API key
const generateApiKey = () => `demo_${faker.string.alphanumeric(24)}`;

// Helper to generate Secret key
const generateSecretKey = () => `sk_demo_${faker.string.alphanumeric(32)}`;

// Helper to generate Client Event Signing Secret
const generateSigningSecret = () => faker.string.alphanumeric(64);

// Helper to generate realistic psychographic profiles (simplified, no LLM)
const generatePsychographicProfile = (userId) => {
  const riskProfiles = ['conservative', 'moderate', 'aggressive'];
  const cognitiveStyles = ['analytical', 'intuitive', 'systematic', 'creative'];
  const moods = ['positive', 'neutral', 'negative', 'excited', 'anxious', 'confident', 'uncertain'];
  const motivations = ['achievement', 'security', 'learning', 'social_connection', 'autonomy', 'recognition'];

  return {
    user_id: userId,
    schema_version: 'v1.3.0',
    model_version: 'demo-v1.0',
    motivation_stack_v2: faker.helpers.arrayElements(motivations, { min: 2, max: 4 }).map(m => ({
      label: m,
      weight: faker.number.float({ min: 0.3, max: 1.0, fractionDigits: 2 })
    })),
    emotional_state: {
      mood: faker.helpers.arrayElement(moods),
      confidence_score: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
      energy_level: faker.helpers.arrayElement(['low', 'medium', 'high'])
    },
    risk_profile: faker.helpers.arrayElement(riskProfiles),
    cognitive_style: faker.helpers.arrayElement(cognitiveStyles),
    personality_traits: {
      openness: faker.number.float({ min: 0.2, max: 0.9, fractionDigits: 2 }),
      conscientiousness: faker.number.float({ min: 0.3, max: 0.95, fractionDigits: 2 }),
      extraversion: faker.number.float({ min: 0.1, max: 0.8, fractionDigits: 2 }),
      agreeableness: faker.number.float({ min: 0.4, max: 0.9, fractionDigits: 2 }),
      neuroticism: faker.number.float({ min: 0.1, max: 0.7, fractionDigits: 2 })
    },
    motivation_confidence_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
    emotional_state_confidence_score: faker.number.float({ min: 0.6, max: 0.9, fractionDigits: 2 }),
    risk_profile_confidence_score: faker.number.float({ min: 0.65, max: 0.9, fractionDigits: 2 }),
    cognitive_style_confidence_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
    personality_confidence_score: faker.number.float({ min: 0.6, max: 0.85, fractionDigits: 2 }),
    last_analyzed: randomDateInLastNDays(3),
    is_demo: true
  };
};

Deno.serve(async (req) => {
  const base44Client = createClientFromRequest(req); // User-scoped client
  const base44Service = base44Client.asServiceRole; // Service-role client for creating entities

  try {
    const user = await base44Client.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario, reset = false } = await req.json();
    console.log(`Starting demo data seeding for user: ${user.id}, scenario: ${scenario}, reset: ${reset}`);

    // Create or get Demo Client Application
    const demoAppName = `${user.full_name || user.email || 'Demo'}'s Demo App`; // Fallback for name
    let demoApp;

    try {
      // Find existing demo app for this user
      const existingDemoApps = await base44Service.entities.ClientApp.filter({
        owner_id: user.id,
        is_demo: true
      });

      if (existingDemoApps && existingDemoApps.length > 0) {
        demoApp = existingDemoApps[0];
        console.log(`Using existing Demo Application: ${demoApp.name} (ID: ${demoApp.id}) for user ${user.id}`);
        // If reset is true, you might want to delete all associated demo data here
        // For this implementation, 'reset' currently means re-seeding into the existing app.
      } else {
        // Create a new demo app for this user
        demoApp = await withRetry(() => base44Service.entities.ClientApp.create({
          name: demoAppName,
          api_key: generateApiKey(),
          secret_key: generateSecretKey(),
          client_event_signing_secret: generateSigningSecret(),
          owner_id: user.id,
          authorized_domains: ['https://demo.knxw.ai', 'http://localhost'],
          status: 'active',
          is_demo: true  // Mark as demo app
        }));
        console.log(`Created new Demo Application: ${demoApp.name} (ID: ${demoApp.id}) for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error creating/finding demo app:', error);
      return Response.json({ error: 'Failed to setup demo application' }, { status: 500 });
    }

    const counts = {
      profiles: 0,
      events: 0,
      insights: 0,
      rules: 0,
      templates: 0,
      deliveries: 0,
      reports: 0,
      hubspot: 0,
      segments: 0,
      journeys: 0,
      tests: 0,
      trends: 0,
      feedback: 0,
      logs: 0
    };

    switch (scenario) {
      case 'growth_marketing_orchestration':
        await seedGrowthMarketingScenario(base44Service, demoApp, counts, user.id);
        break;
      case 'conversion_optimization_lab':
        await seedConversionOptimizationScenario(base44Service, demoApp, counts, user.id);
        break;
      case 'strategic_intelligence_governance':
        await seedStrategicIntelligenceScenario(base44Service, demoApp, counts, user.id);
        break;
      default:
        return Response.json({ error: 'Unknown scenario' }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: `Demo data seeded successfully for ${scenario}`,
      scenario,
      counts,
      demo_app: {
        id: demoApp.id,
        name: demoApp.name,
        api_key: demoApp.api_key
      }
    });

  } catch (error) {
    console.error('Demo data seeding failed:', error);
    return Response.json({ 
      error: 'Seeding failed', 
      details: error.message 
    }, { status: 500 });
  }
});

// Scenario 1: Growth Marketing Orchestration (OPTIMIZED)
async function seedGrowthMarketingScenario(base44Service, demoApp, counts, ownerId) {
  console.log('Seeding Growth Marketing Orchestration scenario...');

  // 1. Generate users and psychographic profiles (REDUCED to 50 for faster seeding)
  const userIds = [];
  const BATCH_SIZE = 10; // Process in smaller batches
  
  for (let i = 0; i < 50; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < 50; j++) {
      const userId = generateUserId();
      userIds.push(userId);
      batch.push(generatePsychographicProfile(userId));
    }
    
    // Bulk create profiles with retry
    await withRetry(() => base44Service.entities.UserPsychographicProfile.bulkCreate(batch));
    counts.profiles += batch.length;
    
    // Small delay between batches to avoid rate limits
    await delay(100);
  }

  // 2. Generate events (REDUCED volume)
  const eventTypes = ['page_view', 'click', 'scroll', 'form_submit', 'sign_up', 'feature_usage', 'pricing_view'];
  
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const eventBatch = [];
    
    for (let j = 0; j < BATCH_SIZE && (i + j) < userIds.length; j++) {
      const userId = userIds[i + j];
      const numEvents = faker.number.int({ min: 3, max: 10 }); // Reduced from 5-25
      
      for (let k = 0; k < numEvents; k++) {
        eventBatch.push({
          user_id: userId,
          session_id: faker.string.alphanumeric(24),
          event_type: faker.helpers.arrayElement(eventTypes),
          event_payload: {
            url: faker.helpers.arrayElement([
              'https://demo.knxw.com/',
              'https://demo.knxw.com/pricing',
              'https://demo.knxw.com/features'
            ]),
            element: faker.helpers.arrayElement(['signup-button', 'pricing-link', 'feature-card']),
            duration: faker.number.int({ min: 10, max: 300 })
          },
          timestamp: randomDateInLastNDays(14),
          processed: faker.datatype.boolean(),
          is_demo: true
        });
      }
    }
    
    // Bulk create events with retry
    if (eventBatch.length > 0) {
      await withRetry(() => base44Service.entities.CapturedEvent.bulkCreate(eventBatch));
      counts.events += eventBatch.length;
    }
    
    await delay(100);
  }

  // 3. Create Engagement Templates (no change needed)
  const templates = [
    {
      name: 'Welcome Onboarding Modal',
      type: 'modal',
      content: {
        title: 'Welcome to knXw!',
        message: 'Let\'s get you started with understanding your users\' psychology.',
        buttons: [
          { text: 'Get Started', action: 'redirect', action_value: '/onboarding' },
          { text: 'Skip for now', action: 'dismiss' }
        ],
        style: { theme: 'dark', position: 'center' }
      },
      personalization: { use_psychographic_data: true }
    },
    {
      name: 'Feature Announcement',
      type: 'notification',
      content: {
        title: 'New Feature: AI Market Intelligence',
        message: 'Analyze competitor psychology and market trends automatically.',
        buttons: [
          { text: 'Learn More', action: 'redirect', action_value: '/market-intelligence' },
          { text: 'Dismiss', action: 'dismiss' }
        ],
        style: { theme: 'dark', position: 'top-center', auto_dismiss_seconds: 10 }
      },
      personalization: { use_psychographic_data: false }
    }
  ];

  const templateIds = [];
  for (const template of templates) {
    const created = await withRetry(() => base44Service.entities.EngagementTemplate.create({
      ...template,
      owner_id: ownerId,
      client_app_id: demoApp.id,
      is_demo: true
    }));
    templateIds.push(created.id);
    counts.templates++;
    await delay(50);
  }

  // 4. Create Engagement Rules (simplified)
  const rules = [
    {
      name: 'New User Welcome',
      description: 'Show welcome modal to analytical users who just signed up',
      trigger_conditions: {
        psychographic_conditions: [
          { field: 'cognitive_style', operator: 'equals', value: 'analytical' }
        ],
        behavioral_conditions: [
          { event_type: 'sign_up', frequency: 'once', time_window: 'session' }
        ]
      },
      engagement_action: {
        type: 'modal',
        template_id: templateIds[0],
        priority: 'high'
      },
      status: 'active'
    }
  ];

  for (const rule of rules) {
    await withRetry(() => base44Service.entities.EngagementRule.create({
      ...rule,
      owner_id: ownerId,
      client_app_id: demoApp.id,
      analytics: {
        triggered_count: faker.number.int({ min: 5, max: 50 }),
        conversion_count: faker.number.int({ min: 1, max: 15 }),
        last_triggered: randomDateInLastNDays(2)
      },
      is_demo: true
    }));
    counts.rules++;
    await delay(50);
  }

  console.log('Growth Marketing Orchestration scenario seeded successfully');
}

// Scenario 2: Conversion & Optimization Lab (OPTIMIZED)
async function seedConversionOptimizationScenario(base44Service, demoApp, counts, ownerId) {
  console.log('Seeding Conversion & Optimization Lab scenario...');

  // Reduced volume for faster seeding
  const userIds = [];
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < 50; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < 50; j++) {
      const userId = generateUserId();
      userIds.push(userId);
      const profile = generatePsychographicProfile(userId);
      profile.segment_labels = faker.helpers.arrayElements([
        'high_intent', 'price_sensitive', 'feature_focused'
      ], { min: 1, max: 2 });
      batch.push(profile);
    }
    
    await withRetry(() => base44Service.entities.UserPsychographicProfile.bulkCreate(batch));
    counts.profiles += batch.length;
    await delay(100);
  }

  // Create segments
  const segments = [
    {
      name: 'High-Propensity Converters',
      description: 'Users with analytical cognitive style',
      filter_conditions: {
        operator: 'AND',
        conditions: [
          { type: 'trait', field: 'cognitive_style', operator: 'equals', value: 'analytical' }
        ]
      },
      estimated_size: 25,
      last_calculated: randomDateInLastNDays(1),
      tags: ['conversion', 'high-value'],
      status: 'active',
      is_demo: true,
      owner_id: ownerId, // Add owner_id
      client_app_id: demoApp.id, // Add client_app_id
    }
  ];

  for (const segment of segments) {
    await withRetry(() => base44Service.entities.AudienceSegment.create(segment));
    counts.segments++;
    await delay(50);
  }

  console.log('Conversion & Optimization Lab scenario seeded successfully');
}

// Scenario 3: Strategic Intelligence & Data Governance (OPTIMIZED)
async function seedStrategicIntelligenceScenario(base44Service, demoApp, counts, ownerId) {
  console.log('Seeding Strategic Intelligence & Data Governance scenario...');

  // Market Trends (minimal, no LLM required)
  const marketTrends = [
    {
      source: 'news',
      title: 'The Rise of Privacy-First Analytics in 2024',
      content_snippet: 'Companies are increasingly adopting privacy-focused analytics solutions...',
      content_url: `https://example.com/article-${faker.string.alphanumeric(8)}`,
      psychographic_analysis: {
        primary_motivations: ['security', 'autonomy', 'trust'],
        cognitive_style_appeal: 'analytical',
        emotional_triggers: ['privacy_concern', 'data_control'],
        risk_profile_target: 'conservative',
        psychological_insights: 'Appeals to security-minded decision makers'
      },
      industry_category: 'analytics',
      confidence_score: 0.85,
      published_date: randomDateInLastNDays(7),
      analyzed_at: randomDateInLastNDays(6),
      is_demo: true,
      owner_id: ownerId, // Add owner_id
      client_app_id: demoApp.id, // Add client_app_id
    }
  ];

  for (const trend of marketTrends) {
    await withRetry(() => base44Service.entities.MarketTrend.create(trend));
    counts.trends++;
    await delay(50);
  }

  console.log('Strategic Intelligence & Data Governance scenario seeded successfully');
}