import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { faker } from 'npm:@faker-js/faker@8.4.1';

// Helper to add delay between operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic for rate limits
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

// Generate realistic user IDs
const generateUserId = () => faker.string.alphanumeric(16);

// Generate realistic date in last N days
const randomDateInLastNDays = (days = 30) => {
  return new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000));
};

// Psychographic profile generator with realistic distributions
const generatePsychographicProfile = (userId, scenario) => {
  const riskProfiles = ['conservative', 'moderate', 'aggressive'];
  const cognitiveStyles = ['analytical', 'intuitive', 'systematic', 'creative'];
  const moods = ['positive', 'neutral', 'negative', 'excited', 'anxious', 'confident', 'uncertain'];
  const motivations = ['achievement', 'security', 'learning', 'social_connection', 'autonomy', 'recognition'];

  // Scenario-specific persona distributions
  let persona;
  if (scenario === 'enterprise_saas') {
    persona = {
      risk_profile: faker.helpers.weightedArrayElement([
        { weight: 0.5, value: 'conservative' },
        { weight: 0.3, value: 'moderate' },
        { weight: 0.2, value: 'aggressive' }
      ]),
      cognitive_style: faker.helpers.weightedArrayElement([
        { weight: 0.6, value: 'analytical' },
        { weight: 0.2, value: 'systematic' },
        { weight: 0.15, value: 'intuitive' },
        { weight: 0.05, value: 'creative' }
      ]),
      primary_motivations: ['security', 'achievement', 'recognition']
    };
  } else if (scenario === 'consumer_app') {
    persona = {
      risk_profile: faker.helpers.weightedArrayElement([
        { weight: 0.3, value: 'conservative' },
        { weight: 0.4, value: 'moderate' },
        { weight: 0.3, value: 'aggressive' }
      ]),
      cognitive_style: faker.helpers.weightedArrayElement([
        { weight: 0.3, value: 'analytical' },
        { weight: 0.3, value: 'intuitive' },
        { weight: 0.2, value: 'creative' },
        { weight: 0.2, value: 'systematic' }
      ]),
      primary_motivations: ['social_connection', 'learning', 'autonomy']
    };
  } else {
    persona = {
      risk_profile: faker.helpers.arrayElement(riskProfiles),
      cognitive_style: faker.helpers.arrayElement(cognitiveStyles),
      primary_motivations: faker.helpers.arrayElements(motivations, { min: 2, max: 3 })
    };
  }

  return {
    user_id: userId,
    schema_version: 'v1.4.0',
    model_version: 'realistic-demo-v1.0',
    motivation_stack_v2: persona.primary_motivations.map((m, idx) => ({
      label: m,
      weight: faker.number.float({ min: 0.5, max: 0.95, fractionDigits: 2 }) - (idx * 0.1)
    })),
    motivation_labels: persona.primary_motivations,
    emotional_state: {
      mood: faker.helpers.arrayElement(moods),
      confidence_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      energy_level: faker.helpers.arrayElement(['low', 'medium', 'high'])
    },
    risk_profile: persona.risk_profile,
    cognitive_style: persona.cognitive_style,
    personality_traits: {
      openness: faker.number.float({ min: 0.3, max: 0.9, fractionDigits: 2 }),
      conscientiousness: faker.number.float({ min: 0.4, max: 0.95, fractionDigits: 2 }),
      extraversion: faker.number.float({ min: 0.2, max: 0.8, fractionDigits: 2 }),
      agreeableness: faker.number.float({ min: 0.5, max: 0.9, fractionDigits: 2 }),
      neuroticism: faker.number.float({ min: 0.1, max: 0.6, fractionDigits: 2 })
    },
    motivation_confidence_score: faker.number.float({ min: 0.75, max: 0.95, fractionDigits: 2 }),
    emotional_state_confidence_score: faker.number.float({ min: 0.7, max: 0.9, fractionDigits: 2 }),
    risk_profile_confidence_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
    cognitive_style_confidence_score: faker.number.float({ min: 0.75, max: 0.95, fractionDigits: 2 }),
    personality_confidence_score: faker.number.float({ min: 0.65, max: 0.85, fractionDigits: 2 }),
    last_analyzed: randomDateInLastNDays(7),
    is_demo: true
  };
};

// Realistic event generator
const generateRealisticEvents = (userId, scenario, count = 20) => {
  const events = [];
  const eventTypes = scenario === 'enterprise_saas' 
    ? ['page_view', 'click', 'feature_usage', 'pricing_view', 'sign_up', 'form_submit']
    : ['page_view', 'click', 'scroll', 'add_to_cart', 'checkout_start', 'purchase'];

  const urls = scenario === 'enterprise_saas'
    ? ['https://demo.knxw.com/', 'https://demo.knxw.com/features', 'https://demo.knxw.com/pricing', 'https://demo.knxw.com/docs']
    : ['https://shop.demo.com/', 'https://shop.demo.com/products', 'https://shop.demo.com/cart', 'https://shop.demo.com/checkout'];

  for (let i = 0; i < count; i++) {
    events.push({
      user_id: userId,
      session_id: faker.string.alphanumeric(24),
      event_type: faker.helpers.arrayElement(eventTypes),
      event_payload: {
        url: faker.helpers.arrayElement(urls),
        element: faker.helpers.arrayElement(['cta-button', 'nav-link', 'feature-card', 'pricing-table']),
        duration: faker.number.int({ min: 5, max: 300 })
      },
      timestamp: randomDateInLastNDays(30),
      processed: faker.datatype.boolean({ probability: 0.7 }),
      is_demo: true
    });
  }
  
  return events;
};

// Realistic insights generator
const generateRealisticInsights = (userId, profile) => {
  const insightTemplates = [
    {
      type: 'behavioral_pattern',
      title: `${profile.cognitive_style.charAt(0).toUpperCase() + profile.cognitive_style.slice(1)} decision-making detected`,
      description: `User exhibits ${profile.cognitive_style} cognitive patterns with ${Math.round(profile.cognitive_style_confidence_score * 100)}% confidence. Recommend ${profile.cognitive_style === 'analytical' ? 'data-driven content and detailed documentation' : 'visual storytelling and intuitive interfaces'}.`
    },
    {
      type: 'motivation_shift',
      title: `Primary motivation: ${profile.motivation_labels[0]}`,
      description: `Strong ${profile.motivation_labels[0]} motivation detected. Consider personalizing messaging to emphasize ${profile.motivation_labels[0] === 'security' ? 'trust, compliance, and reliability' : profile.motivation_labels[0] === 'achievement' ? 'results, success metrics, and competitive advantages' : 'flexibility and user empowerment'}.`
    },
    {
      type: 'engagement_optimization',
      title: `${profile.risk_profile.charAt(0).toUpperCase() + profile.risk_profile.slice(1)} risk profile identified`,
      description: `User shows ${profile.risk_profile} risk tolerance. ${profile.risk_profile === 'conservative' ? 'Emphasize security, testimonials, and proven track record.' : profile.risk_profile === 'aggressive' ? 'Highlight innovation, early access, and cutting-edge features.' : 'Balance innovation with stability messaging.'}`
    }
  ];

  return insightTemplates.map(template => ({
    user_id: userId,
    insight_type: template.type,
    title: template.title,
    description: template.description,
    confidence_score: faker.number.float({ min: 0.75, max: 0.95, fractionDigits: 2 }),
    actionable_recommendations: [
      `Personalize content based on ${profile.cognitive_style} cognitive style`,
      `Emphasize ${profile.motivation_labels[0]} in messaging`,
      `Adjust risk communication for ${profile.risk_profile} profile`
    ],
    supporting_events: [],
    priority: faker.helpers.arrayElement(['medium', 'high', 'critical']),
    is_demo: true
  }));
};

Deno.serve(async (req) => {
  const base44Client = createClientFromRequest(req);
  const base44Service = base44Client.asServiceRole;

  try {
    const user = await base44Client.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario = 'enterprise_saas', userCount = 50, clearExisting = true } = await req.json();
    console.log(`Starting realistic demo data seeding for user: ${user.id}, scenario: ${scenario}, clearExisting: ${clearExisting}`);

    const counts = {
      profiles: 0,
      events: 0,
      insights: 0,
      clientApp: 0
    };

    // Step 1: Optionally clear existing demo data
    if (clearExisting) {
      console.log('Clearing existing demo data...');
      try {
        const demoProfiles = await base44Service.entities.UserPsychographicProfile.filter({ is_demo: true });
        const demoEvents = await base44Service.entities.CapturedEvent.filter({ is_demo: true });
        const demoInsights = await base44Service.entities.PsychographicInsight.filter({ is_demo: true });

        for (const profile of demoProfiles) {
          await base44Service.entities.UserPsychographicProfile.delete(profile.id);
        }
        for (const event of demoEvents) {
          await base44Service.entities.CapturedEvent.delete(event.id);
        }
        for (const insight of demoInsights) {
          await base44Service.entities.PsychographicInsight.delete(insight.id);
        }
        console.log('Demo data cleared successfully');
      } catch (error) {
        console.error('Error clearing demo data:', error);
      }
    }

    // Step 2: Create or get Demo Client Application
    let demoApp;
    try {
      const existingDemoApps = await base44Service.entities.ClientApp.filter({
        owner_id: user.id,
        is_demo: true
      });

      if (existingDemoApps && existingDemoApps.length > 0) {
        demoApp = existingDemoApps[0];
        console.log(`Using existing Demo Application: ${demoApp.name}`);
      } else {
        demoApp = await withRetry(() => base44Service.entities.ClientApp.create({
          name: `${user.full_name || user.email || 'Demo'}'s Demo App`,
          api_key: `demo_${faker.string.alphanumeric(24)}`,
          secret_key: `sk_demo_${faker.string.alphanumeric(32)}`,
          client_event_signing_secret: faker.string.alphanumeric(64),
          owner_id: user.id,
          authorized_domains: ['https://demo.knxw.com', 'http://localhost'],
          status: 'active',
          is_demo: true
        }));
        counts.clientApp = 1;
        console.log(`Created Demo Application: ${demoApp.name}`);
      }
    } catch (error) {
      console.error('Error creating/finding demo app:', error);
      return Response.json({ error: 'Failed to setup demo application' }, { status: 500 });
    }

    // Step 3: Generate realistic users and data
    const BATCH_SIZE = 10;
    for (let i = 0; i < userCount; i += BATCH_SIZE) {
      const profileBatch = [];
      const eventBatch = [];
      const insightBatch = [];

      for (let j = 0; j < BATCH_SIZE && (i + j) < userCount; j++) {
        const userId = generateUserId();
        
        // Generate profile
        const profile = generatePsychographicProfile(userId, scenario);
        profileBatch.push(profile);
        
        // Generate events
        const events = generateRealisticEvents(userId, scenario, faker.number.int({ min: 10, max: 30 }));
        eventBatch.push(...events);
        
        // Generate insights
        const insights = generateRealisticInsights(userId, profile);
        insightBatch.push(...insights);
      }

      // Bulk create with retry
      await withRetry(() => base44Service.entities.UserPsychographicProfile.bulkCreate(profileBatch));
      counts.profiles += profileBatch.length;

      await withRetry(() => base44Service.entities.CapturedEvent.bulkCreate(eventBatch));
      counts.events += eventBatch.length;

      await withRetry(() => base44Service.entities.PsychographicInsight.bulkCreate(insightBatch));
      counts.insights += insightBatch.length;

      await delay(200); // Small delay between batches
    }

    return Response.json({
      success: true,
      message: `Realistic demo data seeded successfully for ${scenario}`,
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