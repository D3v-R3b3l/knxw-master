import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { faker } from 'npm:@faker-js/faker@8.4.1';

// This function is a redirect to seedRealisticDemoData for backwards compatibility.
// The DemoData page uses seedRealisticDemoData directly now.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('Rate limit') || error.response?.status === 429) {
        if (i === maxRetries - 1) throw error;
        await delay(baseDelay * Math.pow(2, i));
      } else {
        throw error;
      }
    }
  }
}

Deno.serve(async (req) => {
  const base44Client = createClientFromRequest(req);
  const service = base44Client.asServiceRole;

  try {
    const user = await base44Client.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const scenario = body.scenario || 'growth_marketing_orchestration';
    const reset = body.reset || false;

    console.log(`seedDemoData called: scenario=${scenario}, forwarding to seedRealisticDemoData logic`);

    // Map old scenario names to new ones
    const scenarioMap = {
      'growth_marketing_orchestration': 'enterprise_saas',
      'conversion_optimization_lab': 'consumer_app',
      'strategic_intelligence_governance': 'mixed'
    };

    const mappedScenario = scenarioMap[scenario] || scenario;

    // Forward to seedRealisticDemoData via SDK
    const result = await service.functions.invoke('seedRealisticDemoData', {
      scenario: mappedScenario,
      userCount: 50,
      clearExisting: reset
    });

    return Response.json(result);

  } catch (error) {
    console.error('seedDemoData failed:', error);
    return Response.json({ error: 'Seeding failed', details: error.message }, { status: 500 });
  }
});