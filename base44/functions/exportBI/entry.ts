import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { config_id, format = 'csv' } = await req.json();

    if (!config_id) {
      return Response.json({ error: 'config_id is required' }, { status: 400 });
    }

    // Fetch the export configuration
    const configs = await base44.asServiceRole.entities.BIExportConfig.filter({ id: config_id });
    if (!configs || configs.length === 0) {
      return Response.json({ error: 'Export configuration not found' }, { status: 404 });
    }

    const config = configs[0];

    // Gather data based on config.data_sources
    const data = {};
    
    if (config.data_sources.includes('psychographic_profiles')) {
      const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({
        is_demo: config.filters?.include_demo_data === true ? undefined : false
      });
      data.profiles = profiles || [];
    }

    if (config.data_sources.includes('events')) {
      const events = await base44.asServiceRole.entities.CapturedEvent.filter({
        is_demo: config.filters?.include_demo_data === true ? undefined : false
      });
      data.events = events || [];
    }

    if (config.data_sources.includes('insights')) {
      const insights = await base44.asServiceRole.entities.PsychographicInsight.filter({
        is_demo: config.filters?.include_demo_data === true ? undefined : false
      });
      data.insights = insights || [];
    }

    // Format data based on requested format
    let output;
    let contentType;

    if (format === 'csv') {
      // Simple CSV conversion for profiles
      const profileData = data.profiles || [];
      if (profileData.length === 0) {
        output = 'No data available';
      } else {
        const headers = Object.keys(profileData[0]).join(',');
        const rows = profileData.map(p => Object.values(p).map(v => JSON.stringify(v)).join(',')).join('\n');
        output = headers + '\n' + rows;
      }
      contentType = 'text/csv';
    } else if (format === 'json') {
      output = JSON.stringify(data, null, 2);
      contentType = 'application/json';
    } else {
      // Parquet not supported in simple implementation
      return Response.json({ error: 'Format not supported' }, { status: 400 });
    }

    // Update last export timestamp
    await base44.asServiceRole.entities.BIExportConfig.update(config_id, {
      last_export: new Date().toISOString(),
      last_export_records: (data.profiles?.length || 0) + (data.events?.length || 0) + (data.insights?.length || 0)
    });

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="knxw-export-${Date.now()}.${format}"`
      }
    });
  } catch (error) {
    console.error('BI Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});