import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can bulk delete
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden - admin access required' }, { status: 403 });
    }

    const { filter_condition } = await req.json();

    // Validate that we have a filter (prevent accidental full delete)
    if (!filter_condition || typeof filter_condition !== 'object') {
      return Response.json({ 
        error: 'Invalid request: filter_condition required' 
      }, { status: 400 });
    }

    // Fetch all matching events in batches
    let deleted_count = 0;
    let hasMore = true;
    const BATCH_SIZE = 100;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // Prevent infinite loops

    while (hasMore && attempts < MAX_ATTEMPTS) {
      attempts++;
      
      try {
        // Fetch a batch of events
        const events = await base44.asServiceRole.entities.CapturedEvent.filter(
          filter_condition,
          '-created_date',
          BATCH_SIZE
        );

        if (!events || events.length === 0) {
          hasMore = false;
          break;
        }

        // Delete this batch
        const deletePromises = events.map(event => 
          base44.asServiceRole.entities.CapturedEvent.delete(event.id).catch(err => {
            console.error(`Failed to delete event ${event.id}:`, err);
            return null;
          })
        );
        
        await Promise.all(deletePromises);
        deleted_count += events.length;

        // If we got fewer than BATCH_SIZE, we're done
        if (events.length < BATCH_SIZE) {
          hasMore = false;
        }

        // Small delay to prevent rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (batchError) {
        console.error('Error processing batch:', batchError);
        // Continue to next batch even if one fails
        hasMore = false;
      }
    }

    return Response.json({
      deleted_count,
      message: `Successfully deleted ${deleted_count} events`,
      batches_processed: attempts
    });
  } catch (error) {
    console.error('Error bulk deleting events:', error);
    return Response.json({ 
      error: error.message || 'Failed to bulk delete events',
      details: error.stack
    }, { status: 500 });
  }
});