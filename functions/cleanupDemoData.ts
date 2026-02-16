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
        console.log(`Rate limited on delete, waiting ${waitMs}ms...`);
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
    const body = await req.json().catch(() => ({}));
    const confirm = body.confirm ?? false;
    const dry_run = body.dry_run ?? true;

    if (!confirm && !dry_run) {
      return Response.json({
        error: 'Must set confirm=true to perform actual cleanup or dry_run=true to preview'
      }, { status: 400 });
    }

    const demoEntities = [
      'UserPsychographicProfile',
      'CapturedEvent',
      'PsychographicInsight',
      'ContentRecommendation',
      'FeedbackAnalysis',
      'MarketTrend',
      'ClientApp',
      'EngagementRule',
      'EngagementTemplate',
      'EngagementDelivery',
      'BatchAnalysisReport',
      'HubSpotSync',
      'ABTest',
      'ABTestVariant',
      'ABTestParticipant',
      'AudienceSegment',
      'Journey',
      'JourneyVersion',
      'JourneyTask',
      'ImportedTextRecord',
      'CRMRecord',
      'EmployeeRecord'
    ];

    const results = {};
    let totalFound = 0;
    let totalDeleted = 0;

    for (const entityName of demoEntities) {
      try {
        let demoRecords = [];
        try {
          demoRecords = await service.entities[entityName].filter({ is_demo: true }, null, 500);
        } catch (filterError) {
          console.warn(`Skipping ${entityName}: ${filterError.message}`);
          results[entityName] = { found: 0, deleted: 0, skipped: true };
          continue;
        }

        results[entityName] = { found: demoRecords.length, deleted: 0, errors: 0 };
        totalFound += demoRecords.length;

        if (!dry_run && confirm && demoRecords.length > 0) {
          // Delete with throttling to avoid rate limits
          for (let i = 0; i < demoRecords.length; i++) {
            try {
              await deleteWithRetry(service.entities[entityName], demoRecords[i].id);
              results[entityName].deleted++;
              totalDeleted++;
            } catch (deleteError) {
              console.error(`Failed to delete ${entityName} ${demoRecords[i].id}:`, deleteError.message);
              results[entityName].errors++;
            }
            // Throttle: pause every 5 deletes
            if ((i + 1) % 5 === 0) {
              await delay(500);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process ${entityName}:`, error.message);
        results[entityName] = { error: error.message };
      }
    }

    return Response.json({
      success: true,
      dry_run,
      confirmed: confirm,
      total_demo_records_found: totalFound,
      total_records_deleted: totalDeleted,
      results,
      message: dry_run
        ? `Found ${totalFound} demo records across ${Object.keys(results).length} entities (dry run)`
        : `Cleaned up ${totalDeleted} demo records`
    });

  } catch (error) {
    console.error('Cleanup failed:', error);
    return Response.json({
      error: 'Cleanup failed',
      details: error.message
    }, { status: 500 });
  }
});