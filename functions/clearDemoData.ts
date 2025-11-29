import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;

    const deletionPromises = [
      'Org', 'OrgUser', 'TenantWorkspace', 'Document', 'DocumentEmbedding', 
      'SystemEvent', 'MetricsHour', 'Dashboard', 'DashboardWidget',
      'ClientApp', 'UserPsychographicProfile', 'CapturedEvent', 'PsychographicInsight'
    ].map(async (entityName) => {
      try {
        const items = await base44.entities[entityName].filter({ is_demo: true });
        for (const item of items) {
          await base44.entities[entityName].delete(item.id);
        }
        return { entity: entityName, count: items.length, status: 'success' };
      } catch (e) {
        console.warn(`Could not clear demo data for ${entityName}: ${e.message}`);
        return { entity: entityName, count: 0, status: 'failed', error: e.message };
      }
    });

    const results = await Promise.all(deletionPromises);
    const totalCount = results.reduce((sum, r) => sum + r.count, 0);

    return Response.json({
      success: true,
      message: `Successfully deleted ${totalCount} demo records.`,
      details: results,
    });
  } catch (error) {
    console.error('Data clearing failed:', error);
    return Response.json({ error: 'Data clearing failed', details: error.message }, { status: 500 });
  }
});