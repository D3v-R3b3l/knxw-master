import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

    let contextData = "";
    let isUrl = false;
    let fetchSuccessful = false;

    // Helper to normalize URL
    let urlToFetch = topic.trim();
    // Loose check if it looks like a URL (e.g. "knxw.app" or "google.com" or "https://...")
    const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/i;
    
    if (urlRegex.test(urlToFetch)) {
        isUrl = true;
        if (!urlToFetch.startsWith('http')) {
            urlToFetch = 'https://' + urlToFetch;
        }
    }

    if (isUrl) {
        try {
            console.log('[analyzeMarketTrends] Fetching content for URL:', urlToFetch);
            const res = await fetch(urlToFetch, { 
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (compatible; knXw-Market-Bot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                signal: AbortSignal.timeout(15000) // Increased timeout
            });
            
            if (res.ok) {
                const html = await res.text();
                // Simple but robust HTML stripping
                const text = html
                                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                                .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                                .replace(/<!--[\s\S]*?-->/gm, "")
                                .replace(/<[^>]+>/g, "\n") // Replace tags with newlines to preserve structure
                                .replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
                                .trim()
                                .slice(0, 25000); // Increased limit
                
                if (text.length > 100) {
                    contextData = `\n\n--- START WEBSITE CONTENT SOURCE (${urlToFetch}) ---\n${text}\n--- END WEBSITE CONTENT SOURCE ---\n\n`;
                    fetchSuccessful = true;
                } else {
                    console.log('[analyzeMarketTrends] Fetched content too short/empty');
                }
            } else {
                 console.log('[analyzeMarketTrends] Fetch failed with status:', res.status);
            }
        } catch (e) {
            console.log('[analyzeMarketTrends] Fetch error:', e.message);
        }
    }

    console.log('[analyzeMarketTrends] Starting DEEP research for:', topic, 'Is URL:', isUrl, 'Fetch Success:', fetchSuccessful);

    // Extract domain name for explicit grounding
    let domainName = '';
    if (isUrl) {
      try {
        const parsedUrl = new URL(urlToFetch);
        domainName = parsedUrl.hostname;
      } catch {}
    }

    // 1. Gather Intelligence (Web Search)
    const researchPrompt = `Perform a comprehensive "Deep Market Research" on the topic: "${topic}"${industry_category ? ` in the ${industry_category} industry` : ''}.

${fetchSuccessful ? `
###############################################################################
# MANDATORY INSTRUCTION - READ CAREFULLY
###############################################################################
The user is asking about a SPECIFIC WEBSITE: ${urlToFetch} (domain: ${domainName})

I have fetched the actual content of this website for you below. 

YOU MUST:
1. Analyze ONLY the company/product described in the WEBSITE CONTENT SOURCE below
2. The website "${domainName}" is NOT related to "KNX home automation protocol" or "KNX Association" - those are COMPLETELY DIFFERENT things
3. If the website content mentions "psychographic", "intelligence", "AI", "behavioral analytics" - that is what this company does
4. Base your ENTIRE analysis on what the website actually says

DO NOT:
- Confuse this with KNX home automation (that is a building automation protocol, NOT this company)
- Use any external knowledge that contradicts the website content
- Hallucinate features or services not mentioned on the website
###############################################################################
` : ''}
    
${!fetchSuccessful && isUrl ? `
###############################################################################
# CRITICAL - URL PROVIDED BUT CONTENT NOT FETCHED
###############################################################################
The user wants analysis of: ${urlToFetch} (domain: ${domainName})

I could NOT fetch the content directly. You MUST:
1. Search specifically for "${domainName}" to find what this website/company actually is
2. DO NOT assume it's related to "KNX home automation" - verify the actual domain first
3. Look for recent information about this specific domain
###############################################################################
` : ''}

${contextData}

You must use your internet access to find REAL, CURRENT data. Do not hallucinate numbers. If exact numbers aren't found, provide realistic estimates based on available data.

    I need a complete strategic market analysis covering:
    1. Executive Summary: High-level state of the market.
    2. Market Dynamics: Market size (TAM/SAM/SOM if possible), growth rates (CAGR), and major shifts.
    3. Competitive Landscape: Who are the top players? What are their strategies?
    4. SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats for a new entrant or the subject of the query.
    5. Consumer Psychographics: Deep dive into WHY people buy. Motivations, fears, triggers.
    6. Strategic Recommendations: Actionable advice.

    Output MUST be a valid JSON object matching the schema provided.`;

    // Only use internet if we didn't successfully fetch the content ourselves, OR if we want supplementary info.
    // However, given the user's complaint about hallucination, if we have the source, we should be careful.
    // But we still need internet for market size/competitors which might not be on the landing page.
    // So we keep it true, but the prompt instructions above are now very strict.
    
    const analysisResponse = await base44.integrations.Core.InvokeLLM({
      prompt: researchPrompt,
      add_context_from_internet: true, // We keep this for market context, but rely on prompt engineering to ground the entity
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string", description: "A concise 2-3 paragraph executive summary of the market situation." },
          market_dynamics: {
            type: "object",
            properties: {
              market_size: { type: "string", description: "Current market size with currency (e.g. $50B)" },
              growth_rate: { type: "string", description: "Projected growth rate (e.g. 12% CAGR)" },
              outlook: { type: "string", enum: ["Positive", "Neutral", "Negative", "Volatile"] },
              key_trends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    trend: { type: "string" },
                    impact_level: { type: "string", enum: ["Critical", "High", "Medium"] },
                    description: { type: "string" }
                  }
                }
              }
            }
          },
          competitive_landscape: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                market_share_est: { type: "string", description: "Estimated share or 'High', 'Medium', 'Low'" },
                strategy: { type: "string" },
                strengths: { type: "string" }
              }
            }
          },
          swot_analysis: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } }
            }
          },
          consumer_insights: {
            type: "object",
            properties: {
              primary_motivations: { type: "array", items: { type: "string" } },
              pain_points: { type: "array", items: { type: "string" } },
              unmet_needs: { type: "array", items: { type: "string" } },
              emotional_triggers: { type: "array", items: { type: "string" } },
              psychographic_profile: { type: "string", description: "Narrative description of the ideal customer persona." }
            }
          },
          strategic_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                action: { type: "string" },
                priority: { type: "string", enum: ["Immediate", "Short-term", "Long-term"] }
              }
            }
          },
          market_forecast: {
             type: "object",
             description: "Projected market data for visualization",
             properties: {
               years: { type: "array", items: { type: "string" }, description: "Future years, e.g. 2025, 2026..." },
               market_size_values: { type: "array", items: { type: "number" }, description: "Projected values in billions/millions corresponding to years" },
               growth_trend: { type: "array", items: { type: "number" }, description: "YoY growth percentage" }
             }
          },
          sources_used: {
            type: "array",
            items: { type: "string" },
            description: "List of domains or sources where data was found."
          }
        },
        required: ["executive_summary", "market_dynamics", "swot_analysis", "consumer_insights", "strategic_recommendations"]
      }
    });

    // Save to database with the new rich structure
    // We'll map it to the existing 'psychographic_analysis' field for compatibility, but structure it well.
    const trendData = {
      title: topic,
      source: 'deep_research',
      content_url: '#', // Not a specific URL analysis
      content_snippet: analysisResponse.executive_summary,
      industry_category: industry_category || 'General',
      
      // We store the FULL complex object in 'psychographic_analysis'
      psychographic_analysis: {
        ...analysisResponse,
        confidence_score: 0.9 // High confidence due to internet search
      },
      
      competitor_name: analysisResponse.competitive_landscape?.[0]?.name || null,
      confidence_score: 0.9,
      analyzed_at: new Date().toISOString(),
      is_demo: false
    };

    const savedTrend = await base44.asServiceRole.entities.MarketTrend.create(trendData);

    console.log('[analyzeMarketTrends] Deep Research complete, saved ID:', savedTrend.id);

    return Response.json({ 
      success: true, 
      analysis_id: savedTrend.id,
      data: trendData,
      message: 'Deep market research completed successfully'
    });

  } catch (error) {
    console.error('[analyzeMarketTrends] Error:', error);
    return Response.json({ 
      error: error.message || 'Analysis failed',
      details: error.stack
    }, { status: 500 });
  }
});