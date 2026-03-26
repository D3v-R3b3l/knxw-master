import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    
    if (!me) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_id } = await req.json();
    
    if (!report_id) {
      return Response.json({ error: 'report_id is required' }, { status: 400 });
    }

    // Get the report
    const report = await base44.entities.BatchAnalysisReport.get(report_id);
    
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate AI explanation
    const explanationPrompt = `You are a senior business consultant explaining a knXw psychographic analytics report to a business executive.

REPORT DATA:
${JSON.stringify(report.results, null, 2)}

CONTEXT:
- Report Type: ${report.analysis_type}
- Generated: ${report.created_date}
- Analysis Status: ${report.status}

INSTRUCTIONS:
Provide a clear, executive-level explanation that:
1. Summarizes what this report tells us about the user base
2. Highlights the most important business insights
3. Explains what actions should be taken based on these findings
4. Uses plain business language (no technical jargon)
5. Focuses on ROI and growth opportunities
6. Keep it concise but comprehensive (3-4 paragraphs max)

Make this valuable for someone who needs to make business decisions based on this data.`;

    const explanation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: explanationPrompt
    });

    return Response.json({
      report_id,
      explanation,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Report explanation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});