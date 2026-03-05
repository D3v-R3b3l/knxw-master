import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = base44.asServiceRole;

    // Process entities sequentially to avoid CPU limit and rate limiting
    // High-volume entities first, then supporting ones
    const demoEntities = [
      'CapturedEvent',
      'UserPsychographicProfile',
      'PsychographicInsight',
      'BatchAnalysisReport',
      'ContentRecommendation',
      'FeedbackAnalysis',
      'HubSpotSync',
      'EngagementDelivery',
      'EngagementRule',
      'EngagementTemplate',
      'ABTestParticipant',
      'ABTestVariant',
      'ABTest',
      'AudienceSegment',
      'ClientApp',
    ];

    let totalDeleted = 0;
    const results = [];

    for (const entityName of demoEntities) {
      try {
        const items = await service.entities[entityName].filter({ is_demo: true }, null, 500);
        if (!items || items.length === 0) {
          results.push({ entity: entityName, deleted: 0, status: 'skipped' });
          continue;
        }

        let deleted = 0;
        // Delete in small sequential batches of 5 with a pause between each
        for (let i = 0; i < items.length; i += 5) {
          const batch = items.slice(i, i + 5);
          await Promise.all(batch.map(item =>
            service.entities[entityName].delete(item.id)
              .then(() => { deleted++; })
              .catch(() => {})
          ));
          if (i + 5 < items.length) {
            await sleep(300);
          }
        }

        totalDeleted += deleted;
        results.push({ entity: entityName, deleted, status: 'success' });
        // Pause between entity types
        await sleep(500);
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