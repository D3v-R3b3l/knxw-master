import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Idempotent migration function to backfill motivation_stack_v2 from legacy motivation_stack
 * Processes profiles in batches to avoid memory issues
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const requestData = await req.json();
    const { batch_size = 50, dry_run = false } = requestData;

    console.log(`Starting motivation v2 backfill migration (dry_run: ${dry_run})`);

    let totalProcessed = 0;
    let totalMigrated = 0;
    let hasMore = true;
    let lastId = null;

    while (hasMore) {
      // Find profiles that need migration:
      // - Have legacy motivation_stack
      // - Missing or empty motivation_stack_v2
      const filters = {
        is_demo: false
      };

      if (lastId) {
        filters.id = { "$gt": lastId };
      }

      const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter(
        filters,
        'id',
        batch_size
      );

      if (profiles.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`Processing batch of ${profiles.length} profiles starting from ID: ${lastId || 'beginning'}`);

      for (const profile of profiles) {
        totalProcessed++;
        lastId = profile.id;

        // Check if migration is needed
        const needsMigration = (
          profile.motivation_stack && 
          profile.motivation_stack.length > 0 &&
          (!profile.motivation_stack_v2 || profile.motivation_stack_v2.length === 0)
        );

        if (needsMigration) {
          console.log(`Migrating profile ${profile.id} for user ${profile.user_id}`);
          
          if (!dry_run) {
            // Convert legacy motivations to v2 format with equal weights
            const equalWeight = 1.0 / profile.motivation_stack.length;
            const motivation_stack_v2 = profile.motivation_stack.map(label => ({
              label: String(label),
              weight: equalWeight
            }));

            // Set motivation_labels to legacy labels
            const motivation_labels = [...profile.motivation_stack];

            // Update the profile with v2 data
            await base44.asServiceRole.entities.UserPsychographicProfile.update(profile.id, {
              motivation_stack_v2: motivation_stack_v2,
              motivation_labels: motivation_labels,
              schema_version: profile.schema_version || "v1.3.0",
              // Set validity period if not present
              valid_from: profile.valid_from || profile.last_analyzed || profile.created_date,
              valid_to: profile.valid_to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              staleness_score: profile.staleness_score ?? 0,
            });

            console.log(`✓ Migrated ${profile.motivation_stack.length} motivations for user ${profile.user_id}`);
          } else {
            console.log(`[DRY RUN] Would migrate ${profile.motivation_stack.length} motivations for user ${profile.user_id}`);
          }

          totalMigrated++;
        }
      }

      // If we got fewer profiles than batch_size, we're done
      if (profiles.length < batch_size) {
        hasMore = false;
      }

      // Small delay between batches to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const result = {
      success: true,
      dry_run: dry_run,
      total_profiles_processed: totalProcessed,
      profiles_migrated: totalMigrated,
      profiles_skipped: totalProcessed - totalMigrated,
      timestamp: new Date().toISOString()
    };

    console.log('Migration completed:', result);
    return Response.json(result);

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      success: false,
      error: 'Migration failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});