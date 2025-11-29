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

    // Get app details for branding
    const app = await base44.entities.ClientApp.get(report.client_app_id);
    
    // Generate comprehensive HTML report
    const htmlContent = generateReportHTML(report, app);
    
    // For now, return HTML that can be used client-side
    // In production, this would use puppeteer or similar to generate actual PDF
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="knxw-report-${report.analysis_type}-${new Date().toISOString().split('T')[0]}.html"`
      }
    });
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateReportHTML(report, app) {
  const results = report.results;
  const analysisType = report.analysis_type;
  const timestamp = new Date(report.created_date).toLocaleString();
  
  let reportContent = '';
  
  switch (analysisType) {
    case 'professional_report':
      reportContent = generateProfessionalReportHTML(results);
      break;
    case 'psychographic_clustering':
      reportContent = generateClusteringReportHTML(results);
      break;
    case 'behavioral_trend_analysis':
      reportContent = generateTrendReportHTML(results);
      break;
    case 'churn_prediction_analysis':
      reportContent = generateChurnReportHTML(results);
      break;
    case 'psychographic_comparison':
      reportContent = generateComparisonReportHTML(results);
      break;
    default:
      reportContent = generateGenericReportHTML(results);
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>knXw Analytics Report - ${analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background: #ffffff;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 3px solid #00d4ff;
        }
        .logo { 
            display: flex; 
            align-items: center; 
            gap: 1rem;
        }
        .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
        }
        .logo-text {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
        }
        .tagline {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        .report-meta {
            text-align: right;
            color: #6b7280;
            font-size: 0.875rem;
        }
        .report-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        .report-subtitle {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 3rem;
        }
        .section {
            margin-bottom: 3rem;
            background: #f8fafc;
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
        }
        .section-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .section-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .metric-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: 800;
            color: #00d4ff;
            margin-bottom: 0.5rem;
        }
        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
        }
        .segment {
            background: white;
            margin: 1.5rem 0;
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        .segment-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }
        .segment-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        .segment-badge {
            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .segment-description {
            color: #6b7280;
            margin-bottom: 1.5rem;
            font-size: 1rem;
        }
        .trait-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        .trait-section {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
        }
        .trait-title {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.75rem;
            font-size: 1rem;
        }
        .trait-list {
            list-style: none;
        }
        .trait-list li {
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
            color: #4b5563;
        }
        .trait-list li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .insight {
            background: white;
            margin: 1rem 0;
            padding: 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #00d4ff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .insight-title {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        .insight-impact {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        .impact-high { background: #fef2f2; color: #dc2626; }
        .impact-medium { background: #fefbf2; color: #d97706; }
        .impact-low { background: #f0fdf4; color: #16a34a; }
        .action-list {
            list-style: none;
            margin-top: 1rem;
        }
        .action-list li {
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
            color: #4b5563;
        }
        .action-list li:before {
            content: '→';
            position: absolute;
            left: 0;
            color: #00d4ff;
            font-weight: bold;
        }
        .footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
        }
        @media print {
            .container { max-width: none; padding: 1rem; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <div class="logo-icon">🧠</div>
                <div>
                    <div class="logo-text">knXw</div>
                    <div class="tagline">Psychographic Analytics Platform</div>
                </div>
            </div>
            <div class="report-meta">
                <div><strong>Generated:</strong> ${timestamp}</div>
                <div><strong>Application:</strong> ${app?.name || 'N/A'}</div>
                <div><strong>Report Type:</strong> ${analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
            </div>
        </header>
        
        <div class="report-title">${analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report</div>
        <div class="report-subtitle">Comprehensive psychographic analysis and business intelligence insights</div>
        
        ${reportContent}
        
        <footer class="footer">
            <p>Generated by knXw Psychographic Analytics Platform | Confidential Business Intelligence</p>
            <p>This report contains proprietary analysis and should be treated as confidential business information.</p>
        </footer>
    </div>
</body>
</html>`;
}

function generateProfessionalReportHTML(results) {
  const { executive_summary, key_metrics, user_segments, strategic_insights, next_steps, methodology_notes } = results;
  
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">📋</span>
            Executive Summary
        </h2>
        <p style="font-size: 1.125rem; line-height: 1.8; color: #374151;">${executive_summary}</p>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            Key Metrics
        </h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${key_metrics?.total_users_analyzed?.toLocaleString() || 0}</div>
                <div class="metric-label">Users Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${key_metrics?.segments_identified || 0}</div>
                <div class="metric-label">Segments Identified</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${((key_metrics?.confidence_score || 0) * 100).toFixed(0)}%</div>
                <div class="metric-label">Analysis Confidence</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.25rem;">${key_metrics?.primary_opportunity || 'N/A'}</div>
                <div class="metric-label">Primary Opportunity</div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">👥</span>
            User Segments
        </h2>
        ${(user_segments || []).map(segment => `
            <div class="segment">
                <div class="segment-header">
                    <h3 class="segment-name">${segment.segment_name}</h3>
                    <div class="segment-badge">${segment.size_percentage} (${segment.user_count?.toLocaleString()} users)</div>
                </div>
                <p class="segment-description">${segment.description}</p>
                <div class="trait-grid">
                    <div class="trait-section">
                        <h4 class="trait-title">Key Characteristics</h4>
                        <ul class="trait-list">
                            ${(segment.key_traits || []).map(trait => `<li>${trait}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Business Value</h4>
                        <p style="color: #4b5563;">${segment.business_value}</p>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Marketing Strategy</h4>
                        <p style="color: #4b5563;">${segment.marketing_strategy}</p>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Product Recommendations</h4>
                        <ul class="trait-list">
                            ${(segment.product_recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🎯</span>
            Strategic Insights
        </h2>
        ${(strategic_insights || []).map(insight => `
            <div class="insight">
                <h4 class="insight-title">${insight.insight}</h4>
                <span class="insight-impact impact-${insight.impact || 'medium'}">${(insight.impact || 'medium').toUpperCase()} IMPACT</span>
                <p style="margin: 0.75rem 0; color: #4b5563;">${insight.rationale}</p>
                <div>
                    <strong style="color: #1f2937;">Action Items:</strong>
                    <ul class="action-list">
                        ${(insight.action_items || []).map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🚀</span>
            Recommended Next Steps
        </h2>
        <ul class="action-list" style="font-size: 1.125rem;">
            ${(next_steps || []).map((step, index) => `<li><strong>Step ${index + 1}:</strong> ${step}</li>`).join('')}
        </ul>
    </section>

    ${methodology_notes ? `
    <section class="section" style="background: #f9fafb; border: 1px solid #d1d5db;">
        <h2 class="section-title">
            <span class="section-icon">🔬</span>
            Methodology
        </h2>
        <p style="color: #6b7280; font-size: 0.875rem;">${methodology_notes}</p>
    </section>
    ` : ''}
  `;
}

function generateClusteringReportHTML(results) {
  const clusters = Object.values(results.clusters || {});
  
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🔄</span>
            Cluster Analysis Overview
        </h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${results.total_profiles_analyzed?.toLocaleString() || 0}</div>
                <div class="metric-label">Profiles Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${results.segment_count || 0}</div>
                <div class="metric-label">Clusters Identified</div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">👥</span>
            Psychographic Clusters
        </h2>
        ${clusters.map((cluster, index) => `
            <div class="segment">
                <div class="segment-header">
                    <h3 class="segment-name">${cluster.ai_insights?.cluster_name || `Cluster ${index + 1}`}</h3>
                    <div class="segment-badge">${cluster.percentage} (${cluster.size?.toLocaleString()} users)</div>
                </div>
                <p class="segment-description">${cluster.ai_insights?.archetype_description || ''}</p>
                <div class="trait-grid">
                    <div class="trait-section">
                        <h4 class="trait-title">Key Characteristics</h4>
                        <ul class="trait-list">
                            ${(cluster.ai_insights?.key_characteristics || []).map(trait => `<li>${trait}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Business Value</h4>
                        <p style="color: #4b5563;">${cluster.ai_insights?.business_value || ''}</p>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Marketing Recommendations</h4>
                        <ul class="trait-list">
                            ${(cluster.ai_insights?.marketing_recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Product Insights</h4>
                        <ul class="trait-list">
                            ${(cluster.ai_insights?.product_insights || []).map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('')}
    </section>
  `;
}

function generateTrendReportHTML(results) {
  const trend = results.trend_analysis || {};
  
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">📈</span>
            Trend Analysis Summary
        </h2>
        <p style="font-size: 1.125rem; line-height: 1.8; color: #374151;">${trend.summary || 'No summary available'}</p>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🎯</span>
            Key Trends
        </h2>
        ${(trend.key_trends || []).map(t => `
            <div class="insight">
                <h4 class="insight-title">${t.trend_name}</h4>
                <span class="insight-impact impact-${t.impact || 'medium'}">${(t.impact || 'medium').toUpperCase()} IMPACT</span>
                <p style="margin: 0.75rem 0; color: #4b5563;">${t.description}</p>
                <div>
                    <strong style="color: #1f2937;">Recommendation:</strong>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${t.recommendation}</p>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🔄</span>
            Behavioral Shifts
        </h2>
        <div class="trait-grid">
            <div class="trait-section">
                <h4 class="trait-title">Increasing Behaviors</h4>
                <ul class="trait-list">
                    ${(trend.behavioral_shifts?.increasing_behaviors || []).map(behavior => `<li>${behavior}</li>`).join('')}
                </ul>
            </div>
            <div class="trait-section">
                <h4 class="trait-title">Decreasing Behaviors</h4>
                <ul class="trait-list">
                    ${(trend.behavioral_shifts?.decreasing_behaviors || []).map(behavior => `<li>${behavior}</li>`).join('')}
                </ul>
            </div>
            <div class="trait-section">
                <h4 class="trait-title">Emerging Patterns</h4>
                <ul class="trait-list">
                    ${(trend.behavioral_shifts?.emerging_patterns || []).map(pattern => `<li>${pattern}</li>`).join('')}
                </ul>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🔮</span>
            Predictions
        </h2>
        ${(trend.predictions || []).map(pred => `
            <div class="insight">
                <h4 class="insight-title">${pred.prediction}</h4>
                <div style="margin: 0.75rem 0;">
                    <span style="background: #f0fdf4; color: #16a34a; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-right: 1rem;">
                        ${((pred.confidence || 0) * 100).toFixed(0)}% CONFIDENCE
                    </span>
                    <span style="background: #fefbf2; color: #d97706; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                        ${pred.timeframe || 'Unknown timeframe'}
                    </span>
                </div>
            </div>
        `).join('')}
    </section>
  `;
}

function generateChurnReportHTML(results) {
  const churn = results.churn_analysis || {};
  
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">⚠️</span>
            Churn Risk Overview
        </h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value" style="color: ${churn.overall_risk_level === 'high' ? '#dc2626' : churn.overall_risk_level === 'medium' ? '#d97706' : '#16a34a'}">
                    ${(churn.overall_risk_level || 'unknown').toUpperCase()}
                </div>
                <div class="metric-label">Overall Risk Level</div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🎯</span>
            Risk Segments
        </h2>
        ${(churn.risk_segments || []).map(segment => `
            <div class="segment">
                <div class="segment-header">
                    <h3 class="segment-name">${segment.segment_name}</h3>
                    <div class="segment-badge" style="background: ${segment.risk_level === 'high' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : segment.risk_level === 'medium' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'}">
                        ${segment.size_percentage} - ${(segment.risk_level || 'unknown').toUpperCase()} RISK
                    </div>
                </div>
                <div class="trait-grid">
                    <div class="trait-section">
                        <h4 class="trait-title">Churn Indicators</h4>
                        <ul class="trait-list">
                            ${(segment.churn_indicators || []).map(indicator => `<li>${indicator}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="trait-section">
                        <h4 class="trait-title">Prevention Strategies</h4>
                        <ul class="trait-list">
                            ${(segment.prevention_strategies || []).map(strategy => `<li>${strategy}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🚨</span>
            Early Warning Signals
        </h2>
        ${(churn.early_warning_signals || []).map(signal => `
            <div class="insight">
                <h4 class="insight-title">${signal.signal}</h4>
                <span class="insight-impact impact-${signal.severity === 'critical' ? 'high' : signal.severity === 'warning' ? 'medium' : 'low'}">${(signal.severity || 'unknown').toUpperCase()}</span>
                <p style="margin: 0.75rem 0; color: #4b5563;">${signal.detection_method}</p>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🛡️</span>
            Retention Recommendations
        </h2>
        <ul class="action-list" style="font-size: 1.125rem;">
            ${(churn.retention_recommendations || []).map((rec, index) => `<li><strong>Strategy ${index + 1}:</strong> ${rec}</li>`).join('')}
        </ul>
    </section>
  `;
}

function generateComparisonReportHTML(results) {
  const comparison = results.comparison_analysis || {};
  
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">⚖️</span>
            Segment Comparison
        </h2>
        <p style="font-size: 1.125rem; margin-bottom: 1.5rem;">
            Comparing: <strong>${(comparison.segments_compared || []).join(' vs ')}</strong>
        </p>
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🔍</span>
            Key Differences
        </h2>
        ${(comparison.key_differences || []).map(diff => `
            <div class="insight">
                <h4 class="insight-title">${diff.dimension?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Difference'}</h4>
                <div class="trait-grid">
                    <div class="trait-section">
                        <h5 style="color: #00d4ff; font-weight: 600;">${comparison.segments_compared?.[0] || 'Segment 1'}</h5>
                        <p style="color: #4b5563;">${diff.segment1_trait}</p>
                    </div>
                    <div class="trait-section">
                        <h5 style="color: #ec4899; font-weight: 600;">${comparison.segments_compared?.[1] || 'Segment 2'}</h5>
                        <p style="color: #4b5563;">${diff.segment2_trait}</p>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <strong style="color: #1f2937;">Business Implication:</strong>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${diff.business_implication}</p>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">💡</span>
            Opportunities
        </h2>
        ${(comparison.opportunities || []).map(opp => `
            <div class="insight">
                <h4 class="insight-title">${opp.opportunity}</h4>
                <div style="margin: 0.75rem 0;">
                    <span style="background: #f0fdf4; color: #16a34a; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                        TARGET: ${opp.target_segment}
                    </span>
                </div>
                <div>
                    <strong style="color: #1f2937;">Strategy:</strong>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${opp.strategy}</p>
                </div>
            </div>
        `).join('')}
    </section>

    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">🚀</span>
            Recommendations
        </h2>
        <ul class="action-list" style="font-size: 1.125rem;">
            ${(comparison.recommendations || []).map((rec, index) => `<li><strong>Action ${index + 1}:</strong> ${rec}</li>`).join('')}
        </ul>
    </section>
  `;
}

function generateGenericReportHTML(results) {
  return `
    <section class="section">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            Analysis Results
        </h2>
        <pre style="background: white; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; color: #4b5563;">${JSON.stringify(results, null, 2)}</pre>
    </section>
  `;
}