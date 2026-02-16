import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { faker } from 'npm:@faker-js/faker@8.4.1';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const generateUserId = () => faker.string.alphanumeric(16);

const randomDateInLastNDays = (days = 30) => {
  return new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000));
};

const pickWeighted = (options) => {
  // options: [{value, weight}, ...]
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let rand = Math.random() * total;
  for (const opt of options) {
    rand -= opt.weight;
    if (rand <= 0) return opt.value;
  }
  return options[options.length - 1].value;
};

const generatePsychographicProfile = (userId, scenario) => {
  const moods = ['positive', 'neutral', 'negative', 'excited', 'anxious', 'confident', 'uncertain'];
  const allMotivations = ['achievement', 'security', 'learning', 'social_connection', 'autonomy', 'recognition'];

  let riskProfile, cognitiveStyle, primaryMotivations;

  if (scenario === 'enterprise_saas') {
    riskProfile = pickWeighted([
      { value: 'conservative', weight: 5 },
      { value: 'moderate', weight: 3 },
      { value: 'aggressive', weight: 2 }
    ]);
    cognitiveStyle = pickWeighted([
      { value: 'analytical', weight: 6 },
      { value: 'systematic', weight: 2 },
      { value: 'intuitive', weight: 1.5 },
      { value: 'creative', weight: 0.5 }
    ]);
    primaryMotivations = ['security', 'achievement', 'recognition'];
  } else if (scenario === 'consumer_app') {
    riskProfile = pickWeighted([
      { value: 'conservative', weight: 3 },
      { value: 'moderate', weight: 4 },
      { value: 'aggressive', weight: 3 }
    ]);
    cognitiveStyle = pickWeighted([
      { value: 'analytical', weight: 3 },
      { value: 'intuitive', weight: 3 },
      { value: 'creative', weight: 2 },
      { value: 'systematic', weight: 2 }
    ]);
    primaryMotivations = ['social_connection', 'learning', 'autonomy'];
  } else {
    riskProfile = faker.helpers.arrayElement(['conservative', 'moderate', 'aggressive']);
    cognitiveStyle = faker.helpers.arrayElement(['analytical', 'intuitive', 'systematic', 'creative']);
    primaryMotivations = faker.helpers.arrayElements(allMotivations, { min: 2, max: 3 });
  }

  return {
    user_id: userId,
    schema_version: 'v1.4.0',
    model_version: 'realistic-demo-v1.0',
    motivation_stack_v2: primaryMotivations.map((m, idx) => ({
      label: m,
      weight: parseFloat((faker.number.float({ min: 0.5, max: 0.95, fractionDigits: 2 }) - (idx * 0.1)).toFixed(2))
    })),
    motivation_labels: primaryMotivations,
    emotional_state: {
      mood: faker.helpers.arrayElement(moods),
      confidence_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      energy_level: faker.helpers.arrayElement(['low', 'medium', 'high'])
    },
    risk_profile: riskProfile,
    cognitive_style: cognitiveStyle,
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

const generateRealisticEvents = (userId, scenario, count = 20) => {
  const events = [];
  const eventTypes = scenario === 'enterprise_saas'
    ? ['page_view', 'click', 'form_submit', 'scroll', 'time_on_page']
    : ['page_view', 'click', 'scroll', 'form_submit', 'hover', 'time_on_page'];

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
      timestamp: randomDateInLastNDays(30).toISOString(),
      processed: faker.datatype.boolean({ probability: 0.7 }),
      is_demo: true
    });
  }

  return events;
};

const generateRealisticInsights = (userId, profile) => {
  const insightTemplates = [
    {
      type: 'behavioral_pattern',
      title: `${profile.cognitive_style.charAt(0).toUpperCase() + profile.cognitive_style.slice(1)} decision-making detected`,
      description: `User exhibits ${profile.cognitive_style} cognitive patterns with ${Math.round(profile.cognitive_style_confidence_score * 100)}% confidence.`
    },
    {
      type: 'motivation_shift',
      title: `Primary motivation: ${profile.motivation_labels[0]}`,
      description: `Strong ${profile.motivation_labels[0]} motivation detected with high confidence.`
    },
    {
      type: 'engagement_optimization',
      title: `${profile.risk_profile.charAt(0).toUpperCase() + profile.risk_profile.slice(1)} risk profile identified`,
      description: `User shows ${profile.risk_profile} risk tolerance in behavioral patterns.`
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
  const service = base44Client.asServiceRole;

  try {
    const user = await base44Client.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario = 'enterprise_saas', userCount = 50, clearExisting = true } = await req.json();
    console.log(`Starting demo seed: user=${user.id}, scenario=${scenario}, count=${userCount}, clear=${clearExisting}`);

    const counts = { profiles: 0, events: 0, insights: 0, clientApp: 0 };

    // Step 1: Clear existing demo data (filter by is_demo only, not created_by)
    if (clearExisting) {
      console.log('Clearing existing demo data...');
      const entitiesToClear = ['UserPsychographicProfile', 'CapturedEvent', 'PsychographicInsight'];
      for (const entityName of entitiesToClear) {
        try {
          const demoRecords = await service.entities[entityName].filter({ is_demo: true }, null, 500);
          console.log(`Found ${demoRecords.length} demo ${entityName} to delete`);
          for (const record of demoRecords) {
            try {
              await service.entities[entityName].delete(record.id);
            } catch (delErr) {
              console.warn(`Failed to delete ${entityName} ${record.id}: ${delErr.message}`);
            }
          }
        } catch (error) {
          console.warn(`Could not clear ${entityName}: ${error.message}`);
        }
      }
      console.log('Demo data cleared');
    }

    // Step 2: Create or get Demo Client Application
    let demoApp;
    try {
      const existingDemoApps = await service.entities.ClientApp.filter({
        owner_id: user.id,
        is_demo: true
      });

      if (existingDemoApps && existingDemoApps.length > 0) {
        demoApp = existingDemoApps[0];
        console.log(`Using existing Demo App: ${demoApp.name}`);
      } else {
        demoApp = await withRetry(() => service.entities.ClientApp.create({
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
        console.log(`Created Demo App: ${demoApp.name}`);
      }
    } catch (error) {
      console.error('Error creating/finding demo app:', error.message);
      return Response.json({ error: 'Failed to setup demo application', details: error.message }, { status: 500 });
    }

    // Step 3: Generate realistic users and data in batches
    const BATCH_SIZE = 10;
    const actualCount = Math.min(userCount, 100); // Cap at 100 to avoid timeouts

    for (let i = 0; i < actualCount; i += BATCH_SIZE) {
      const profileBatch = [];
      const eventBatch = [];
      const insightBatch = [];

      for (let j = 0; j < BATCH_SIZE && (i + j) < actualCount; j++) {
        const userId = generateUserId();

        const profile = generatePsychographicProfile(userId, scenario);
        profileBatch.push(profile);

        const eventCount = faker.number.int({ min: 8, max: 25 });
        const events = generateRealisticEvents(userId, scenario, eventCount);
        eventBatch.push(...events);

        const insights = generateRealisticInsights(userId, profile);
        insightBatch.push(...insights);
      }

      // Bulk create with retry
      try {
        await withRetry(() => service.entities.UserPsychographicProfile.bulkCreate(profileBatch));
        counts.profiles += profileBatch.length;
      } catch (err) {
        console.error(`Failed to create profile batch: ${err.message}`);
      }

      try {
        // Split large event batches into sub-batches of 50
        for (let eb = 0; eb < eventBatch.length; eb += 50) {
          const subBatch = eventBatch.slice(eb, eb + 50);
          await withRetry(() => service.entities.CapturedEvent.bulkCreate(subBatch));
          counts.events += subBatch.length;
        }
      } catch (err) {
        console.error(`Failed to create event batch: ${err.message}`);
      }

      try {
        await withRetry(() => service.entities.PsychographicInsight.bulkCreate(insightBatch));
        counts.insights += insightBatch.length;
      } catch (err) {
        console.error(`Failed to create insight batch: ${err.message}`);
      }

      await delay(200);
    }

    console.log(`Seeding complete: ${counts.profiles} profiles, ${counts.events} events, ${counts.insights} insights`);

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