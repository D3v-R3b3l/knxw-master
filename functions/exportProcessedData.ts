import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { export_type, filters = {} } = await req.json();
    
    let data, filename, contentType;
    
    switch (export_type) {
      case 'profiles_csv': {
        const profiles = await base44.entities.UserPsychographicProfile.filter(filters);
        data = convertProfilesToCSV(profiles);
        filename = `psychographic_profiles_${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
        break;
      }
        
      case 'insights_json': {
        const insights = await base44.entities.PsychographicInsight.filter(filters);
        data = JSON.stringify(insights, null, 2);
        filename = `insights_${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
        break;
      }
        
      case 'analysis_report': {
        data = await generateAnalysisReport(base44, filters);
        filename = `analysis_report_${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
        break;
      }
        
      default:
        return Response.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function convertProfilesToCSV(profiles) {
  if (!profiles.length) return 'No profiles found';
  
  const headers = ['user_id', 'cognitive_style', 'risk_profile', 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'motivation_stack', 'last_analyzed'];
  
  const rows = profiles.map(p => [
    p.user_id,
    p.cognitive_style,
    p.risk_profile,
    p.personality_traits?.openness || '',
    p.personality_traits?.conscientiousness || '',
    p.personality_traits?.extraversion || '',
    p.personality_traits?.agreeableness || '',
    p.personality_traits?.neuroticism || '',
    Array.isArray(p.motivation_stack) ? p.motivation_stack.join(';') : '',
    p.last_analyzed
  ]);
  
  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

async function generateAnalysisReport(base44, filters) {
  const profiles = await base44.entities.UserPsychographicProfile.filter(filters);
  const insights = await base44.entities.PsychographicInsight.filter(filters);
  
  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_profiles: profiles.length,
      total_insights: insights.length,
      cognitive_styles: getDistribution(profiles, 'cognitive_style'),
      risk_profiles: getDistribution(profiles, 'risk_profile'),
      top_motivations: getTopMotivations(profiles)
    },
    profiles,
    insights,
    recommendations: generateRecommendations(profiles, insights)
  };
}

function getDistribution(profiles, field) {
  const dist = {};
  profiles.forEach(p => {
    const val = p[field] || 'unknown';
    dist[val] = (dist[val] || 0) + 1;
  });
  return dist;
}

function getTopMotivations(profiles) {
  const motivations = {};
  profiles.forEach(p => {
    if (Array.isArray(p.motivation_stack)) {
      p.motivation_stack.forEach(m => {
        motivations[m] = (motivations[m] || 0) + 1;
      });
    }
  });
  return Object.entries(motivations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([motivation, count]) => ({ motivation, count }));
}

function generateRecommendations(profiles, insights) {
  return [
    `Focus on ${profiles.length > 0 ? profiles[0].cognitive_style : 'analytical'} messaging for primary audience`,
    `${insights.filter(i => i.priority === 'high').length} high-priority insights require immediate attention`,
    `Consider A/B testing different approaches for the ${getDistribution(profiles, 'risk_profile')['conservative'] || 0} conservative users`,
    `Leverage top motivations in engagement strategies`
  ];
}