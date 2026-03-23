import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function err(message, status = 400) {
  return ok({ error: message }, status);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return err('Unauthorized', 401);
    }

    const body = req.method === 'GET' ? {} : await req.json().catch(() => ({}));
    const action = body.action || 'executive_summary';
    const timeWindow = Number(body.time_period_days || 90);

    if (action !== 'executive_summary') {
      return err('Unsupported action', 400);
    }

    // Simulated, stable-ish demo metrics (no external deps)
    const seed = (n) => {
      const x = Math.sin(n * 9973) * 10000;
      return x - Math.floor(x);
    };
    const s = seed(timeWindow || 90);

    const motives = ['value', 'trust', 'speed', 'innovation', 'support', 'status', 'security'];
    const cltv_uplift = motives.reduce((acc, m, i) => {
      const base = (s * 100 + i * 7) % 32 - 10; // -10%..+22%
      acc[m] = {
        uplift_percentage: Math.round((base + 12) * 10) / 10, // a little optimistic
        customer_count: Math.floor(180 + (s * 50 + i * 23) % 220),
        total_value: Math.floor(200000 + (s * 1_000_000 + i * 17_000) % 1_200_000)
      };
      return acc;
    }, {});

    const roi_analysis = motives.reduce((acc, m, i) => {
      acc[m] = {
        roi_percentage: Math.round(((s * 50 + i * 9) % 70 + 10) * 10) / 10,
        attributed_revenue: Math.floor(250000 + (s * 900000 + i * 15000) % 1_000_000),
        net_profit: Math.floor(90000 + (s * 250000 + i * 9000) % 300000)
      };
      return acc;
    }, {});

    const revenue_attribution = motives.reduce((acc, m, i) => {
      const revenue = Math.floor(120000 + (s * 700000 + i * 11000) % 820000);
      const pct = Math.round((revenue / (motives.length * 600000)) * 1000) / 10;
      acc[m] = {
        attributed_revenue: revenue,
        revenue_percentage: Math.min(50, Math.max(2, pct))
      };
      return acc;
    }, {});

    const topMotive = motives[(Math.floor(s * 1000) % motives.length)];

    const summary = {
      total_customers_analyzed: 2500 + Math.floor(s * 1500),
      average_cltv_uplift: Math.round((10 + s * 8) * 10) / 10, // %
      total_roi_impact: 1_200_000 + Math.floor(s * 800_000),
      attribution_coverage: Math.round((48 + s * 8) * 10) / 10 // %
    };

    const insights = motives.slice(0, 4).map((m, i) => ({
      motive: m,
      impact: ['CLTV', 'Retention', 'Activation', 'Upsell'][i % 4],
      description: `Users driven by ${m} show a noticeable lift in ${i % 2 ? 'retention and LTV' : 'activation and conversion'} within ${timeWindow} days.`
    }));

    const recommendations = [
      { priority: 'high', category: 'pricing', action: 'Introduce Value-First variant', details: 'Highlight total cost-of-ownership savings for value-seeking users.' },
      { priority: 'medium', category: 'onboarding', action: 'Fast-Track Setup', details: 'Offer a 90-second guided setup for speed-motivated cohorts.' },
      { priority: 'low', category: 'advocacy', action: 'Trust Badges A/B test', details: 'Experiment with security/trust badges in the hero for trust-motivated traffic.' }
    ];

    const data = {
      summary,
      detailed_metrics: {
        cltv_uplift,
        roi_analysis,
        revenue_attribution
      },
      insights,
      recommendations,
      top_performing_motive: topMotive
    };

    // Return in axios-like shape
    return ok(data, 200);
  } catch (e) {
    console.error('executiveMetrics error:', e);
    return err(e.message || 'Internal server error', 500);
  }
});