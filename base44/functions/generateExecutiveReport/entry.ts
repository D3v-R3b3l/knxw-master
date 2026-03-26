import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { jsPDF } from 'npm:jspdf@2.5.1';

function toCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => {
      const v = r[h] ?? '';
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      return `"${String(s).replace(/"/g, '""')}"`;
    }).join(','));
  }
  return lines.join('\n');
}

async function computeMetrics(base44) {
  const profiles = await base44.entities.UserPsychographicProfile.filter({ is_demo: false });
  const insights = await base44.entities.PsychographicInsight.filter({ is_demo: false }, '-created_date', 200);
  const conversions = await base44.entities.Conversion.filter({}, '-ts', 1000);
  const totalUsers = profiles.length;

  // Motive segmentation
  const motiveCounts = {};
  profiles.forEach(p => {
    (Array.isArray(p.motivation_stack) ? p.motivation_stack : []).forEach(m => {
      motiveCounts[m] = (motiveCounts[m] || 0) + 1;
    });
  });

  // Map user -> top motive (first in stack)
  const topMotiveByUser = {};
  profiles.forEach(p => {
    const top = Array.isArray(p.motivation_stack) && p.motivation_stack.length > 0 ? p.motivation_stack[0] : 'unknown';
    topMotiveByUser[p.user_id] = top || 'unknown';
  });

  // Conversion by motive
  const convByMotive = {};
  conversions.forEach(c => {
    const motive = topMotiveByUser[c.user_id] || 'unknown';
    convByMotive[motive] = (convByMotive[motive] || 0) + 1;
  });

  // Top 5 insights by priority then recency
  const priorityRank = { critical: 3, high: 2, medium: 1, low: 0 };
  const topInsights = insights
    .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) || (new Date(b.created_date) - new Date(a.created_date)))
    .slice(0, 5);

  // Churn risk heuristic
  const flagged = profiles.filter(p => {
    const mood = p.emotional_state?.mood;
    return mood === 'anxious' || mood === 'negative' || mood === 'uncertain';
  }).length;
  const churnRiskPct = totalUsers > 0 ? Math.round((flagged / totalUsers) * 100) : 0;

  // Trend by day (last 30 days)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
  const trend = {};
  days.forEach(d => { trend[d] = 0; });
  conversions.forEach(c => {
    const day = new Date(c.ts).toISOString().split('T')[0];
    if (trend[day] !== undefined) trend[day] += 1;
  });

  return {
    totalUsers,
    motiveCounts,
    convByMotive,
    topInsights,
    churnRiskPct,
    totalConversions: conversions.length,
    totalInsights: insights.length,
    trendData: days.map(d => ({ date: d, conversions: trend[d] }))
  };
}

function generatePDF(metrics) {
  const doc = new jsPDF();
  const now = new Date();

  // Header with branding
  doc.setFontSize(24);
  doc.setTextColor(0, 212, 255); // knXw blue
  doc.text('knXw', 20, 25);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Dashboard Report', 20, 35);
  doc.setFontSize(10);
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, 45);

  let yPos = 60;

  // Key Metrics Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Key Metrics', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total Users: ${metrics.totalUsers.toLocaleString()}`, 25, yPos);
  yPos += 8;
  doc.text(`Total Conversions: ${metrics.totalConversions.toLocaleString()}`, 25, yPos);
  yPos += 8;
  doc.text(`Total AI Insights: ${metrics.totalInsights.toLocaleString()}`, 25, yPos);
  yPos += 8;
  doc.text(`Churn Risk: ${metrics.churnRiskPct}%`, 25, yPos);
  yPos += 15;

  // Top User Motivations
  doc.setFontSize(16);
  doc.text('Top User Motivations', 20, yPos);
  yPos += 10;
  
  const topMotives = Object.entries(metrics.motiveCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  doc.setFontSize(12);
  topMotives.forEach(([motive, count]) => {
    doc.text(`${motive}: ${count} users (${Math.round((count / metrics.totalUsers) * 100)}%)`, 25, yPos);
    yPos += 8;
  });
  yPos += 10;

  // Conversion by Motive
  doc.setFontSize(16);
  doc.text('Conversions by Motivation', 20, yPos);
  yPos += 10;

  const topConvMotives = Object.entries(metrics.convByMotive)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  doc.setFontSize(12);
  topConvMotives.forEach(([motive, count]) => {
    doc.text(`${motive}: ${count} conversions`, 25, yPos);
    yPos += 8;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Priority Insights
  doc.setFontSize(16);
  doc.text('Priority Insights', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  metrics.topInsights.forEach((insight, i) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${i + 1}. ${insight.title} (${insight.priority})`, 25, yPos);
    yPos += 6;
    const wrapped = doc.splitTextToSize(insight.description, 160);
    doc.text(wrapped, 30, yPos);
    yPos += (wrapped.length * 4) + 8;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount} | knXw Executive Report`, 20, 285);
    doc.text(`Confidential & Proprietary`, 150, 285);
  }

  return doc.output('arraybuffer');
}

function generateCSV(metrics) {
  const rows = [
    { metric: 'Total Users', value: metrics.totalUsers },
    { metric: 'Total Conversions', value: metrics.totalConversions },
    { metric: 'Total Insights', value: metrics.totalInsights },
    { metric: 'Churn Risk %', value: metrics.churnRiskPct }
  ];

  // Add motivation data
  Object.entries(metrics.motiveCounts).forEach(([motive, count]) => {
    rows.push({ metric: `Motivation: ${motive}`, value: count });
  });

  // Add conversion by motive data
  Object.entries(metrics.convByMotive).forEach(([motive, count]) => {
    rows.push({ metric: `Conversions: ${motive}`, value: count });
  });

  // Add insights
  metrics.topInsights.forEach((insight, i) => {
    rows.push({
      metric: `Insight ${i + 1}`,
      value: `${insight.title} (${insight.priority}): ${insight.description}`
    });
  });

  return toCsv(rows);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format = 'pdf' } = await req.json();
    const metrics = await computeMetrics(base44);

    if (format === 'csv') {
      const csvData = generateCSV(metrics);
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=executive_report.csv'
        }
      });
    } else {
      const pdfData = generatePDF(metrics);
      return new Response(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=executive_report.pdf'
        }
      });
    }
  } catch (error) {
    console.error('Error generating executive report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});