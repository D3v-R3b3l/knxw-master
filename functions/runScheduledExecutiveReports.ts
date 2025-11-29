
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { jsPDF } from 'npm:jspdf@2.5.1';

// This function would be called by a Deno Deploy cron job daily
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all enabled weekly schedules
    const schedules = await base44.asServiceRole.entities.ScheduledReportConfig.filter({
      enabled: true,
      frequency: 'weekly'
    });

    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    const reportsRun = [];

    for (const schedule of schedules) {
      // Check if it's time to run this schedule
      if (schedule.day_of_week !== currentDay) continue;
      if (schedule.hour_utc !== currentHour) continue;
      if (Math.abs(schedule.minute_utc - currentMinute) > 5) continue; // 5-minute tolerance

      // Check if we've already run this schedule recently (avoid duplicates)
      const lastRun = schedule.last_run_at ? new Date(schedule.last_run_at) : null;
      const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000));
      if (lastRun && lastRun > sixHoursAgo) {
        console.log(`Skipping schedule ${schedule.id} - already run recently`);
        continue;
      }

      try {
        // Generate the report
        const reportData = await generateReport(base44, schedule.format);
        
        // Send the report
        if (schedule.destination_type === 'email') {
          await sendEmailReport(base44, schedule, reportData);
        } else if (schedule.destination_type === 's3') {
          await uploadToS3(schedule, reportData);
        }

        // Update last run time
        await base44.asServiceRole.entities.ScheduledReportConfig.update(schedule.id, {
          last_run_at: now.toISOString()
        });

        reportsRun.push({
          schedule_id: schedule.id,
          name: schedule.name,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error running schedule ${schedule.id}:`, error);
        reportsRun.push({
          schedule_id: schedule.id,
          name: schedule.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      reports_processed: reportsRun.length,
      reports: reportsRun
    });

  } catch (error) {
    console.error('Error in runScheduledExecutiveReports:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateReport(base44, format) {
  // Use same logic as generateExecutiveReport.js
  const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({ is_demo: false });
  const insights = await base44.asServiceRole.entities.PsychographicInsight.filter({ is_demo: false }, '-created_date', 200);
  const conversions = await base44.asServiceRole.entities.Conversion.filter({}, '-ts', 1000);
  
  const metrics = computeMetrics(profiles, insights, conversions);

  if (format === 'csv' || format === 'both') {
    const csvData = generateCSV(metrics);
    if (format === 'csv') return { type: 'csv', data: csvData };
  }
  
  if (format === 'pdf' || format === 'both') {
    const pdfData = generatePDF(metrics);
    if (format === 'pdf') return { type: 'pdf', data: pdfData };
  }

  if (format === 'both') {
    return {
      type: 'both',
      pdf: generatePDF(metrics),
      csv: generateCSV(metrics)
    };
  }
}

function computeMetrics(profiles, insights, conversions) {
  // Same logic as in generateExecutiveReport.js
  const totalUsers = profiles.length;
  const motiveCounts = {};
  profiles.forEach(p => {
    (Array.isArray(p.motivation_stack) ? p.motivation_stack : []).forEach(m => {
      motiveCounts[m] = (motiveCounts[m] || 0) + 1;
    });
  });

  const topMotiveByUser = {};
  profiles.forEach(p => {
    const top = Array.isArray(p.motivation_stack) && p.motivation_stack.length > 0 ? p.motivation_stack[0] : 'unknown';
    topMotiveByUser[p.user_id] = top || 'unknown';
  });

  const convByMotive = {};
  conversions.forEach(c => {
    const motive = topMotiveByUser[c.user_id] || 'unknown';
    convByMotive[motive] = (convByMotive[motive] || 0) + 1;
  });

  const priorityRank = { critical: 3, high: 2, medium: 1, low: 0 };
  const topInsights = insights
    .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) || (new Date(b.created_date) - new Date(a.created_date)))
    .slice(0, 5);

  const flagged = profiles.filter(p => {
    const mood = p.emotional_state?.mood;
    return mood === 'anxious' || mood === 'negative' || mood === 'uncertain';
  }).length;
  const churnRiskPct = totalUsers > 0 ? Math.round((flagged / totalUsers) * 100) : 0;

  return {
    totalUsers,
    motiveCounts,
    convByMotive,
    topInsights,
    churnRiskPct,
    totalConversions: conversions.length,
    totalInsights: insights.length
  };
}

function generatePDF(metrics) {
  const doc = new jsPDF();
  const now = new Date();

  // Header with branding
  doc.setFontSize(24);
  doc.setTextColor(0, 212, 255);
  doc.text('knXw', 20, 25);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Weekly Executive Report', 20, 35);
  doc.setFontSize(10);
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, 45);

  let yPos = 60;

  // Key Metrics
  doc.setFontSize(16);
  doc.text('Key Metrics', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total Users: ${metrics.totalUsers.toLocaleString()}`, 25, yPos); yPos += 8;
  doc.text(`Total Conversions: ${metrics.totalConversions.toLocaleString()}`, 25, yPos); yPos += 8;
  doc.text(`Total AI Insights: ${metrics.totalInsights.toLocaleString()}`, 25, yPos); yPos += 8;
  doc.text(`Churn Risk: ${metrics.churnRiskPct}%`, 25, yPos); yPos += 15;

  // Top Motivations
  doc.setFontSize(16);
  doc.text('Top User Motivations', 20, yPos); yPos += 10;
  
  const topMotives = Object.entries(metrics.motiveCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  doc.setFontSize(12);
  topMotives.forEach(([motive, count]) => {
    doc.text(`${motive}: ${count} users`, 25, yPos);
    yPos += 8;
  });

  return doc.output('arraybuffer');
}

function generateCSV(metrics) {
  const rows = [
    { metric: 'Total Users', value: metrics.totalUsers },
    { metric: 'Total Conversions', value: metrics.totalConversions },
    { metric: 'Churn Risk %', value: metrics.churnRiskPct }
  ];

  Object.entries(metrics.motiveCounts).forEach(([motive, count]) => {
    rows.push({ metric: `Motivation: ${motive}`, value: count });
  });

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => `"${r[h]}"`).join(','));
  }
  return lines.join('\n');
}

async function sendEmailReport(base44, schedule, reportData) {
  const attachments = [];
  
  if (reportData.type === 'pdf') {
    attachments.push({
      filename: `knxw_executive_report_${new Date().toISOString().slice(0,10)}.pdf`,
      content: btoa(String.fromCharCode(...new Uint8Array(reportData.data))),
      type: 'application/pdf'
    });
  } else if (reportData.type === 'csv') {
    attachments.push({
      filename: `knxw_executive_report_${new Date().toISOString().slice(0,10)}.csv`,
      content: btoa(reportData.data),
      type: 'text/csv'
    });
  } else if (reportData.type === 'both') {
    attachments.push({
      filename: `knxw_executive_report_${new Date().toISOString().slice(0,10)}.pdf`,
      content: btoa(String.fromCharCode(...new Uint8Array(reportData.pdf))),
      type: 'application/pdf'
    });
    attachments.push({
      filename: `knxw_executive_report_${new Date().toISOString().slice(0,10)}.csv`,
      content: btoa(reportData.csv),
      type: 'text/csv'
    });
  }

  // Use base44 SendEmail integration
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: schedule.email_to,
    subject: `knXw Executive Report - ${new Date().toLocaleDateString()}`,
    body: `Dear Executive Team,

Please find attached your weekly knXw Executive Dashboard report.

This automated report contains:
- Key user and conversion metrics
- Psychographic insights and motivations
- Churn risk analysis
- Priority AI-generated recommendations

For questions or to customize this report, please contact your account manager.

Best regards,
The knXw Analytics Team

---
This is an automated email from knXw. To modify your report schedule, please log into your dashboard.`,
    attachments
  });
}

async function uploadToS3(schedule, reportData) { // Changed to async
  // Implementation would depend on having S3 credentials and using AWS SDK
  // For now, we'll log that this would happen
  console.log(`Would upload report to s3://${schedule.s3_bucket}/${schedule.s3_key_prefix}/`);
  
  // In a real implementation:
  // const s3 = new AWS.S3();
  // await s3.putObject({
  //   Bucket: schedule.s3_bucket,
  //   Key: `${schedule.s3_key_prefix}/executive_report_${new Date().toISOString().slice(0,10)}.pdf`,
  //   Body: reportData.data,
  //   ContentType: reportData.type === 'pdf' ? 'application/pdf' : 'text/csv'
  // }).promise();
}
