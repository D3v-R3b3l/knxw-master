import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

        results[entityName] = { found: demoRecords.length, deleted: 0 };
        totalFound += demoRecords.length;

        if (!dry_run && confirm && demoRecords.length > 0) {
          try {
            for (const record of demoRecords) {
              try {
                await service.entities[entityName].delete(record.id);
                results[entityName].deleted++;
                totalDeleted++;
              } catch (delErr) {
                console.warn(`Failed to delete ${entityName} ${record.id}: ${delErr.message}`);
              }
            }
          } catch (error) {
            console.error(`Failed to delete ${entityName}:`, error.message);
            results[entityName].error = error.message;
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