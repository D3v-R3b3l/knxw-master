import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { test_id, winner_variant_id } = await req.json();

    if (!test_id || !winner_variant_id) {
      return Response.json({ 
        error: 'Missing required fields: test_id, winner_variant_id' 
      }, { status: 400 });
    }

    // Fetch the test
    const test = await base44.entities.ABTest.filter({ id: test_id }, null, 1);
    if (!test || test.length === 0) {
      return Response.json({ error: 'Test not found' }, { status: 404 });
    }

    const testData = test[0];

    // Verify user owns this test
    if (testData.owner_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch the winning variant
    const variant = await base44.entities.ABTestVariant.filter({ id: winner_variant_id }, null, 1);
    if (!variant || variant.length === 0) {
      return Response.json({ error: 'Variant not found' }, { status: 404 });
    }

    const winnerData = variant[0];

    // Update the test to mark it as completed with winner
    await base44.entities.ABTest.update(test_id, {
      status: 'completed',
      winner_variant_id,
      ended_at: new Date().toISOString(),
      results_summary: {
        winner_name: winnerData.name,
        winner_conversion_rate: winnerData.performance_metrics?.conversion_rate || 0,
        participants: winnerData.performance_metrics?.participants || 0,
        promoted_at: new Date().toISOString()
      }
    });

    // If auto-promote is enabled, apply the winning configuration
    if (testData.auto_promote_winner) {
      // Logic depends on test_type:
      if (testData.test_type === 'engagement_template' && winnerData.configuration?.engagement_template_id) {
        // Update engagement rules to use winner template
        // This would require updating EngagementRule entities
        console.log(`Auto-promoting winner template: ${winnerData.configuration.engagement_template_id}`);
      } else if (testData.test_type === 'engagement_rule' && winnerData.configuration?.engagement_rule_config) {
        // Apply winning rule configuration
        console.log(`Auto-promoting winner rule config`);
      }
      // Additional test types can be handled here
    }

    return Response.json({
      success: true,
      message: `Successfully promoted ${winnerData.name} as the winner`,
      test: {
        id: test_id,
        status: 'completed',
        winner_variant_id,
        winner_name: winnerData.name
      }
    });
  } catch (error) {
    console.error('Error promoting A/B test winner:', error);
    return Response.json({ 
      error: error.message || 'Failed to promote winner' 
    }, { status: 500 });
  }
});