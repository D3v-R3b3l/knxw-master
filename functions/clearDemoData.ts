import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function deleteWithRetry(entity, id, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await entity.delete(id);
      return true;
    } catch (error) {
      if ((error.status === 429 || error.message?.includes('Rate limit')) && i < maxRetries - 1) {
        const waitMs = 1000 * Math.pow(2, i);
        await delay(waitMs);
      } else {
        throw error;
      }
    }
  }
  return false;
}

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
        for (let i = 0; i < items.length; i++) {
          try {
            await deleteWithRetry(service.entities[entityName], items[i].id);
            deleted++;
          } catch (e) {
            console.warn(`Failed to delete ${entityName} ${items[i].id}: ${e.message}`);
          }
          // Throttle every 5 deletes
          if ((i + 1) % 5 === 0) {
            await delay(500);
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