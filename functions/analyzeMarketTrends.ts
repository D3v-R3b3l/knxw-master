import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, industry_category } = await req.json();

    if (!topic?.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    console.log('[analyzeMarketTrends] Starting analysis for:', topic);

    // Fetch live content from the web with proper rendering
    let contentData = null;
    let isLiveUrl = false;

    // Check if topic is a URL
    try {
      const url = new URL(topic);
      isLiveUrl = true;
      
      console.log('[analyzeMarketTrends] Detected URL, fetching live content...');
      
      // Use InvokeLLM with add_context_from_internet to get live web data
      const webDataResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract and summarize the full content from this webpage: ${topic}
        
        Provide:
        1. Page title
        2. Full text content (all paragraphs, headings, key information)
        3. Main topics discussed
        4. Key data points or statistics mentioned
        5. Author or company information if available
        
        Be comprehensive - extract ALL meaningful text content from the page.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            full_content: { type: "string" },
            main_topics: { type: "array", items: { type: "string" } },
            key_data: { type: "array", items: { type: "string" } },
            author_info: { type: "string" }
          }
        }
      });

      contentData = webDataResponse;
      console.log('[analyzeMarketTrends] Live content extracted successfully');

    } catch (urlError) {
      // Not a URL, treat as topic search
      isLiveUrl = false;
      console.log('[analyzeMarketTrends] Not a URL, performing topic search');
    }

    // Generate psychographic analysis
    const analysisPrompt = isLiveUrl && contentData
      ? `Perform deep psychographic analysis of this content:

TITLE: ${contentData.title}

FULL CONTENT:
${contentData.full_content}

TOPICS: ${contentData.main_topics?.join(', ')}
KEY DATA: ${contentData.key_data?.join(', ')}

Analyze from a psychographic marketing intelligence perspective:
1. What psychological motivations does this content appeal to?
2. Which cognitive styles would find this compelling?
3. What emotional triggers are being used?
4. What risk profile does this target?
5. Competitive psychological positioning
6. Strategic recommendations for marketing based on psychological insights

Provide actionable intelligence for psychographic-driven marketing strategy.`
      : `Analyze market trends and competitive intelligence for: "${topic}"${industry_category ? ` in the ${industry_category} industry` : ''}.

Use real-time web search and analysis to provide:
1. Current market trends and psychological patterns
2. Competitor psychographic strategies
3. Emotional triggers being used in the market
4. Target cognitive styles and risk profiles
5. Strategic recommendations

Focus on actionable psychographic insights.`;

    const analysisResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: !isLiveUrl, // Only search if not already fetched
      response_json_schema: {
        type: "object",
        properties: {
          confidence_score: { type: "number" },
          psychological_insights: { type: "string" },
          primary_motivations: {
            type: "array",
            items: { type: "string" }
          },
          emotional_triggers: {
            type: "array",
            items: { type: "string" }
          },
          cognitive_style_appeal: {
            type: "string",
            enum: ["analytical", "intuitive", "systematic", "creative"]
          },
          risk_profile_target: {
            type: "string",
            enum: ["conservative", "moderate", "aggressive"]
          },
          competitive_intelligence: {
            type: "object",
            properties: {
              market_opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    opportunity: { type: "string" },
                    psychological_segment: { type: "string" }
                  }
                }
              },
              strategic_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    recommendation: { type: "string" },
                    expected_impact: {
                      type: "string",
                      enum: ["high", "medium", "low"]
                    },
                    implementation_timeline: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Save to database
    const trendData = {
      source: isLiveUrl ? 'competitor_content' : 'market_trends',
      content_url: isLiveUrl ? topic : '#',
      title: contentData?.title || topic,
      content_snippet: contentData?.full_content?.substring(0, 500) || '',
      psychographic_analysis: analysisResponse,
      industry_category: industry_category || 'general',
      confidence_score: analysisResponse.confidence_score || 0.8,
      competitor_name: isLiveUrl ? (contentData?.author_info || 'Unknown Competitor') : null,
      published_date: new Date().toISOString(),
      analyzed_at: new Date().toISOString(),
      is_demo: false
    };

    const savedTrend = await base44.asServiceRole.entities.MarketTrend.create(trendData);

    console.log('[analyzeMarketTrends] Analysis complete, saved with ID:', savedTrend.id);

    return Response.json({ 
      success: true, 
      analysis_id: savedTrend.id,
      message: 'Market intelligence analysis completed successfully'
    });

  } catch (error) {
    console.error('[analyzeMarketTrends] Error:', error);
    return Response.json({ 
      error: error.message || 'Analysis failed',
      details: error.stack
    }, { status: 500 });
  }
});