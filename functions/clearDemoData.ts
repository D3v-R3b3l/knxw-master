import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = base44.asServiceRole;

    // Use bulkDelete for fast cleanup - much faster than individual deletes
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
        // Get all demo IDs
        const items = await service.entities[entityName].filter({ is_demo: true }, null, 500);
        const ids = items.map(item => item.id);
        
        if (ids.length > 0) {
          // Bulk delete - much faster!
          await service.entities[entityName].bulkDelete(ids);
          totalDeleted += ids.length;
          results.push({ entity: entityName, deleted: ids.length, status: 'success' });
        } else {
          results.push({ entity: entityName, deleted: 0, status: 'skipped' });
        }
      } catch (e) {
        console.warn(`Could not clear demo data for ${entityName}: ${e.message}`);
        results.push({ entity: entityName, deleted: 0, status: 'error', error: e.message });
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