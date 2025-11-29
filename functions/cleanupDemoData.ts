import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    
    const { confirm = false, dry_run = true } = await req.json();
    
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
      'EmployeeRecord',
      'MetaPage',
      'MetaPost',
      'MetaComment',
      'MetaPageAnalysis'
    ];
    
    const results = {};
    
    for (const entityName of demoEntities) {
      try {
        const demoRecords = await base44.entities[entityName].filter({ is_demo: true });
        results[entityName] = {
          found: demoRecords.length,
          deleted: 0,
          errors: 0
        };
        
        if (!dry_run && confirm) {
          for (const record of demoRecords) {
            try {
              await base44.entities[entityName].delete(record.id);
              results[entityName].deleted++;
            } catch (deleteError) {
              console.error(`Failed to delete ${entityName} ${record.id}:`, deleteError);
              results[entityName].errors++;
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process ${entityName}:`, error);
        results[entityName] = { error: error.message };
      }
    }
    
    const totalFound = Object.values(results).reduce((sum, r) => sum + (r.found || 0), 0);
    const totalDeleted = Object.values(results).reduce((sum, r) => sum + (r.deleted || 0), 0);
    
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