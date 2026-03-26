
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// HTML template for professional PDF reports
function generateReportHTML(analysis, user) {
  const {
    title,
    psychographic_analysis,
    competitor_name,
    industry_category,
    content_url,
    analyzed_at,
  } = analysis;

  const isCompetitorAnalysis = competitor_name || (content_url && content_url !== '#');
  const competitiveIntelligence = psychographic_analysis?.competitive_intelligence;
  const marketIntelligence = psychographic_analysis?.market_intelligence;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>knXw Market Intelligence Report - ${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            font-size: 14px;
        }
        
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 40px 30px;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        
        .header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 4px solid #00d4ff;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            padding: 30px;
            border-radius: 20px;
            color: white;
        }
        
        .logo-section { 
            display: flex; 
            align-items: center; 
            gap: 20px;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0a0a0a;
            font-weight: 800;
            font-size: 24px;
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        
        .brand-info h1 {
            font-size: 32px;
            font-weight: 800;
            color: white;
            margin-bottom: 5px;
        }
        
        .tagline {
            font-size: 16px;
            color: #a3a3a3;
            font-weight: 500;
        }
        
        .report-meta {
            text-align: right;
            color: #a3a3a3;
            font-size: 14px;
        }
        
        .report-title {
            font-size: 48px;
            font-weight: 800;
            background: linear-gradient(135deg, #00d4ff, #0ea5e9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
            line-height: 1.2;
        }
        
        .report-subtitle {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 50px;
            font-weight: 500;
        }
        
        .section {
            margin-bottom: 50px;
            background: white;
            padding: 40px;
            border-radius: 20px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .section-title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .section-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }
        
        .executive-summary {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #0a0a0a;
        }
        
        .psychographic-profile {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
        }
        
        .strategic-intelligence {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        .content-block {
            font-size: 16px;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 25px;
        }
        
        .badge-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        
        .badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
        }
        
        .badge-primary { background: rgba(0, 212, 255, 0.1); color: #0ea5e9; border: 1px solid rgba(0, 212, 255, 0.3); }
        .badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-warning { background: rgba(251, 191, 36, 0.1); color: #f59e0b; border: 1px solid rgba(251, 191, 36, 0.3); }
        .badge-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.3); }
        
        .opportunity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .opportunity-card {
            background: #f8fafc;
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #00d4ff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .opportunity-title {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .opportunity-desc {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .recommendation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .recommendation-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 30px;
            border-radius: 15px;
            border: 1px solid #e5e7eb;
            position: relative;
            overflow: hidden;
        }
        
        .recommendation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00d4ff, #10b981, #f59e0b);
        }
        
        .rec-category {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 12px;
            font-size: 18px;
        }
        
        .rec-description {
            color: #4b5563;
            margin-bottom: 15px;
            line-height: 1.7;
        }
        
        .rec-impact {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .impact-high { background: rgba(16, 185, 129, 0.2); color: #059669; }
        .impact-medium { background: rgba(251, 191, 36, 0.2); color: #d97706; }
        .impact-low { background: rgba(59, 130, 246, 0.2); color: #2563eb; }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 48px;
            font-weight: 800;
            color: #00d4ff;
            z-index: -1;
            transform: rotate(-15deg);
        }
        
        @media print {
            .container { max-width: none; padding: 20px; box-shadow: none; }
            .section { break-inside: avoid; }
            .watermark { display: none; }
        }
    </style>
</head>
<body>
    <div class="watermark">knXw</div>
    <div class="container">
        <header class="header">
            <div class="logo-section">
                <div class="logo-icon">🧠</div>
                <div class="brand-info">
                    <h1>knXw</h1>
                    <div class="tagline">Psychographic Intelligence Platform</div>
                </div>
            </div>
            <div class="report-meta">
                <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                <div><strong>Analyst:</strong> ${user.full_name || user.email}</div>
                <div><strong>Report Type:</strong> ${isCompetitorAnalysis ? 'Competitive Intelligence' : 'Market Intelligence'}</div>
            </div>
        </header>
        
        <div class="report-title">${title}</div>
        <div class="report-subtitle">
            ${isCompetitorAnalysis ? 
              `Deep competitive intelligence analysis of ${competitor_name}` : 
              `Strategic market intelligence for ${industry_category || 'market trends'}`
            }
        </div>
        
        ${psychographic_analysis?.psychological_insights ? `
        <section class="section">
            <h2 class="section-title">
                <span class="section-icon executive-summary">📋</span>
                Executive Intelligence Summary
            </h2>
            <div class="content-block" style="font-size: 18px; font-weight: 500;">
                ${psychographic_analysis.psychological_insights.replace(/\n/g, '<br>')}
            </div>
        </section>
        ` : ''}

        <section class="section">
            <h2 class="section-title">
                <span class="section-icon psychographic-profile">🧠</span>
                Psychographic Profile
            </h2>
            
            ${psychographic_analysis?.primary_motivations?.length > 0 ? `
            <h3 style="color: #8b5cf6; font-size: 20px; font-weight: 700; margin: 25px 0 15px 0;">Primary Motivations</h3>
            <div class="badge-grid">
                ${psychographic_analysis.primary_motivations.map(m => 
                  `<div class="badge badge-purple">${typeof m === 'string' ? m : m.motivation || m}</div>`
                ).join('')}
            </div>
            ` : ''}

            ${psychographic_analysis?.emotional_triggers?.length > 0 ? `
            <h3 style="color: #ec4899; font-size: 20px; font-weight: 700; margin: 25px 0 15px 0;">Emotional Triggers</h3>
            <div class="badge-grid">
                ${psychographic_analysis.emotional_triggers.map(t => 
                  `<div class="badge badge-warning">${typeof t === 'string' ? t : t.trigger || t}</div>`
                ).join('')}
            </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 30px;">
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
                    <h4 style="color: #4b5563; font-size: 14px; font-weight: 600; margin-bottom: 8px;">COGNITIVE STYLE</h4>
                    <p style="color: #1f2937; font-size: 18px; font-weight: 700; text-transform: capitalize;">
                        ${psychographic_analysis?.cognitive_style_appeal || 'Analytical'}
                    </p>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
                    <h4 style="color: #4b5563; font-size: 14px; font-weight: 600; margin-bottom: 8px;">RISK PROFILE</h4>
                    <p style="color: #1f2937; font-size: 18px; font-weight: 700; text-transform: capitalize;">
                        ${psychographic_analysis?.risk_profile_target || 'Moderate'}
                    </p>
                </div>
            </div>
        </section>

        ${(isCompetitorAnalysis && competitiveIntelligence?.market_opportunities?.length > 0) || 
          (marketIntelligence?.strategic_opportunities?.market_opportunities?.length > 0) ? `
        <section class="section">
            <h2 class="section-title">
                <span class="section-icon strategic-intelligence">💡</span>
                Strategic Intelligence & Opportunities
            </h2>
            <div class="opportunity-grid">
                ${isCompetitorAnalysis ? 
                  competitiveIntelligence.market_opportunities.slice(0, 6).map(opp => `
                    <div class="opportunity-card">
                        <div class="opportunity-title">${opp.opportunity}</div>
                        <div class="opportunity-desc">${opp.psychological_segment}</div>
                    </div>
                  `).join('') :
                  marketIntelligence.strategic_opportunities.market_opportunities.slice(0, 6).map(opp => `
                    <div class="opportunity-card">
                        <div class="opportunity-title">${opp.opportunity_title}</div>
                        <div class="opportunity-desc">${opp.market_size} • ${opp.expected_roi} ROI</div>
                    </div>
                  `).join('')
                }
            </div>
        </section>
        ` : ''}

        ${isCompetitorAnalysis && competitiveIntelligence?.strategic_recommendations?.length > 0 ? `
        <section class="section">
            <h2 class="section-title">
                <span class="section-icon strategic-intelligence">🚀</span>
                Strategic Recommendations
            </h2>
            <div class="recommendation-grid">
                ${competitiveIntelligence.strategic_recommendations.slice(0, 8).map(rec => `
                    <div class="recommendation-card">
                        <div class="rec-category">${rec.category}</div>
                        <div class="rec-description">${rec.recommendation}</div>
                        <div class="rec-impact impact-${rec.expected_impact || 'medium'}">
                            ${rec.expected_impact || 'medium'} impact • ${rec.implementation_timeline || 'TBD'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <footer class="footer">
            <p><strong>Generated by knXw Psychographic Intelligence Platform</strong></p>
            <p>This report contains proprietary analysis and should be treated as confidential business intelligence.</p>
            <p style="margin-top: 15px; color: #9ca3af;">
                Confidence Score: ${((psychographic_analysis?.confidence_score || 0) * 100).toFixed(0)}% • 
                Analysis Date: ${analyzed_at ? new Date(analyzed_at).toLocaleDateString() : 'N/A'}
            </p>
        </footer>
    </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id, format, recipient_email } = await req.json();
    
    if (!analysis_id) {
      return Response.json({ error: 'analysis_id is required' }, { status: 400 });
    }

    // Get the analysis
    const analysis = await base44.entities.MarketTrend.get(analysis_id);
    
    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (format === 'email') {
      if (!recipient_email) {
        return Response.json({ error: 'recipient_email is required for email format' }, { status: 400 });
      }

      // Generate the HTML report
      const htmlContent = generateReportHTML(analysis, user);
      
      // Send email using Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        return Response.json({ error: 'Email service not configured' }, { status: 500 });
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'knXw Intelligence <reports@knxw.app>',
          to: [recipient_email],
          subject: `knXw Market Intelligence Report: ${analysis.title}`,
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0a0a0a, #1a1a1a); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 10px;">📊 knXw Market Intelligence</h1>
                <p style="color: #a3a3a3; font-size: 16px; margin: 0;">Professional market analysis report</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin-bottom: 15px;">${analysis.title}</h2>
                <p style="color: #6b7280; margin-bottom: 20px;">
                  ${analysis.competitor_name ? 
                    `Competitive intelligence analysis of ${analysis.competitor_name}` : 
                    `Market intelligence report for ${analysis.industry_category || 'your industry'}`
                  }
                </p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-bottom: 10px;">📋 Report Highlights</h3>
                  <ul style="color: #6b7280; line-height: 1.6;">
                    <li>Deep psychographic profile analysis</li>
                    <li>Strategic market opportunities</li>
                    <li>Competitive intelligence insights</li>
                    <li>Actionable recommendations</li>
                  </ul>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                  <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Confidence Score:</strong> ${((analysis.psychographic_analysis?.confidence_score || 0) * 100).toFixed(0)}%<br>
                  <strong>Shared by:</strong> ${user.full_name || user.email}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  This report was generated by <strong style="color: #00d4ff;">knXw</strong> - Psychographic Intelligence Platform
                </p>
              </div>
            </div>
          `,
          attachments: [{
            filename: `knxw-market-intelligence-${analysis.id.slice(0, 8)}.html`,
            content: btoa(htmlContent),
            type: 'text/html'
          }]
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Resend API error:', errorData);
        return Response.json({ error: 'Failed to send email' }, { status: 500 });
      }

      return Response.json({ success: true, message: `Report sent to ${recipient_email}` });
    } else {
      // Return HTML for PDF generation (client-side)
      const htmlContent = generateReportHTML(analysis, user);
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="knxw-market-intelligence-${analysis.id.slice(0, 8)}.html"`
        }
      });
    }
    
  } catch (error) {
    console.error('Export failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
