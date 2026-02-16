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
      'BatchAnalysisReport', 'AudienceSegment', 'MarketTrend',
      'ABTest', 'ABTestVariant', 'ABTestParticipant',
      'ContentRecommendation', 'FeedbackAnalysis', 'HubSpotSync',
      'Journey', 'JourneyVersion', 'JourneyTask'
    ];

    let totalDeleted = 0;
    const results = [];

    for (const entityName of demoEntities) {
      try {
        const items = await service.entities[entityName].filter({ is_demo: true }, null, 500);
        let deleted = 0;
        for (const item of items) {
          try {
            await service.entities[entityName].delete(item.id);
            deleted++;
          } catch (e) {
            console.warn(`Failed to delete ${entityName} ${item.id}: ${e.message}`);
          }
        }
        totalDeleted += deleted;
        results.push({ entity: entityName, found: items.length, deleted, status: 'success' });
      } catch (e) {
        console.warn(`Could not clear demo data for ${entityName}: ${e.message}`);
        results.push({ entity: entityName, found: 0, deleted: 0, status: 'skipped', error: e.message });
      }
    }

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