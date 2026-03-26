import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trend_ids } = await req.json();

    if (!trend_ids || trend_ids.length < 2) {
      return Response.json({ error: 'At least two trends are required for comparison' }, { status: 400 });
    }

    console.log('[compareMarketTrends] Comparing trends:', trend_ids);

    // Fetch the trend data
    // Since there's no "in" filter in SDK likely, we fetch one by one or list all and filter.
    // Assuming we can fetch by ID.
    const trends = [];
    for (const id of trend_ids) {
      try {
        const trend = await base44.entities.MarketTrend.get(id);
        if (trend) trends.push(trend);
      } catch (e) {
        console.warn(`Trend ${id} not found`);
      }
    }

    if (trends.length < 2) {
      return Response.json({ error: 'Could not find enough valid trends to compare' }, { status: 404 });
    }

    const trendContexts = trends.map(t => `
    TOPIC: ${t.title}
    INDUSTRY: ${t.industry_category}
    SUMMARY: ${t.psychographic_analysis?.executive_summary || t.content_snippet || 'N/A'}
    MARKET DYNAMICS: ${JSON.stringify(t.psychographic_analysis?.market_dynamics || {})}
    SWOT: ${JSON.stringify(t.psychographic_analysis?.swot_analysis || {})}
    CONSUMER INSIGHTS: ${JSON.stringify(t.psychographic_analysis?.consumer_insights || {})}
    `).join('\n\n-------------------\n\n');

    const prompt = `Perform a strategic "Head-to-Head" comparative analysis between the following subjects.
    
    SUBJECTS DATA:
    ${trendContexts}

    Your task is to compare them deeply.
    Provide a JSON response with:
    1. "executive_summary": A synthesis of the comparison.
    2. "market_positioning": Who is winning? How do they differ?
    3. "feature_comparison": Key differentiators.
    4. "psychographic_divergence": How their target audiences differ psychologically.
    5. "winner_prediction": Who is better positioned for the future and why?

    Output JSON schema:
    {
      "executive_summary": "string",
      "market_positioning": "string",
      "feature_comparison": [
        { "feature": "string", "subject_1_val": "string", "subject_2_val": "string", "winner": "string" }
      ],
      "psychographic_divergence": "string",
      "winner_prediction": "string"
    }
    `;

    const comparisonResponse = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: false, // We already have the deep research data
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          market_positioning: { type: "string" },
          feature_comparison: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feature: { type: "string" },
                subject_1_val: { type: "string" },
                subject_2_val: { type: "string" },
                winner: { type: "string" }
              }
            }
          },
          psychographic_divergence: { type: "string" },
          winner_prediction: { type: "string" }
        }
      }
    });

    const title = `Comparison: ${trends.map(t => t.title).join(' vs ')}`;

    // Save comparison
    const comparison = await base44.asServiceRole.entities.MarketComparison.create({
      title: title.substring(0, 100),
      trend_ids: trend_ids,
      comparison_data: comparisonResponse,
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      comparison_id: comparison.id,
      data: comparison
    });

  } catch (error) {
    console.error('[compareMarketTrends] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});