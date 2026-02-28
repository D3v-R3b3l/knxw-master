import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = base44.asServiceRole;

    const demoEntities = [
      'ClientApp', 'UserPsychographicProfile', 'CapturedEvent', 'PsychographicInsight',
      'EngagementRule', 'EngagementTemplate', 'EngagementDelivery',
      'BatchAnalysisReport', 'AudienceSegment',
      'ABTest', 'ABTestVariant', 'ABTestParticipant',
      'ContentRecommendation', 'FeedbackAnalysis', 'HubSpotSync',
    ];

    let totalDeleted = 0;
    const results = [];

    await Promise.all(demoEntities.map(async (entityName) => {
      try {
        const items = await service.entities[entityName].filter({ is_demo: true }, null, 500);
        if (items.length === 0) {
          results.push({ entity: entityName, deleted: 0, status: 'skipped' });
          return;
        }
        // Delete in parallel batches of 20
        let deleted = 0;
        for (let i = 0; i < items.length; i += 20) {
          const batch = items.slice(i, i + 20);
          await Promise.all(batch.map(item =>
            service.entities[entityName].delete(item.id).then(() => { deleted++; }).catch(() => {})
          ));
        }
        totalDeleted += deleted;
        results.push({ entity: entityName, deleted, status: 'success' });
      } catch (e) {
        console.warn(`Could not clear demo data for ${entityName}: ${e.message}`);
        results.push({ entity: entityName, deleted: 0, status: 'error', error: e.message });
      }
    }));

    return Response.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} demo records.`,
      total_deleted: totalDeleted,
      details: results,
    });
  } catch (error) {
    console.error('Data clearing failed:', error);
    return Response.json({ error: 'Data clearing failed', details: error.message }, { status: 500 });
  }
});