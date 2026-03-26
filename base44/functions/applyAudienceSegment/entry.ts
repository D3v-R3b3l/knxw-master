import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { segmentId, segment, preview = false } = body;

    let targetSegment = segment;

    // If segmentId provided, fetch the segment
    if (segmentId) {
      targetSegment = await base44.entities.AudienceSegment.get(segmentId);
      if (!targetSegment) {
        return Response.json({ error: 'Segment not found' }, { status: 404 });
      }
    }

    if (!targetSegment?.filter_conditions?.conditions) {
      return Response.json({ error: 'Invalid segment conditions' }, { status: 400 });
      }

    // Build filters for UserPsychographicProfile based on segment conditions
    const profileFilters = { is_demo: false };
    const conditions = targetSegment.filter_conditions.conditions;

    // Convert segment conditions to entity filters
    conditions.forEach(condition => {
      if (condition.type === "trait" && condition.field && condition.operator && condition.value !== "") {
        switch (condition.operator) {
          case "equals":
            profileFilters[condition.field] = condition.value;
            break;
          case "not_equals":
            profileFilters[condition.field] = { "$ne": condition.value };
            break;
          case "greater_than":
            profileFilters[condition.field] = { "$gt": parseFloat(condition.value) };
            break;
          case "less_than":
            profileFilters[condition.field] = { "$lt": parseFloat(condition.value) };
            break;
          case "in":
            profileFilters[condition.field] = { "$in": Array.isArray(condition.value) ? condition.value : [condition.value] };
            break;
          case "not_in":
            profileFilters[condition.field] = { "$nin": Array.isArray(condition.value) ? condition.value : [condition.value] };
            break;
          case "exists":
            profileFilters[condition.field] = { "$exists": true };
            break;
          case "not_exists":
            profileFilters[condition.field] = { "$exists": false };
            break;
          case "contains":
            profileFilters[condition.field] = { "$ilike": `%${condition.value}%` };
            break;
          case "not_contains":
            profileFilters[condition.field] = { "$not": { "$ilike": `%${condition.value}%` } };
            break;
        }
      }
    });

    // Compute count via paging (safe cap)
    const PAGE_SIZE = 500;
    const MAX_CAP = 5000;
    let count = 0;
    let offset = 0;
    let hasMore = false;

    while (true) {
      const batch = await base44.entities.UserPsychographicProfile.filter(
        profileFilters,
        '-last_analyzed',
        PAGE_SIZE,
        offset
      );
      if (!Array.isArray(batch) || batch.length === 0) break;

      count += batch.length;
      offset += PAGE_SIZE;

      if (batch.length < PAGE_SIZE) break;
      if (count >= MAX_CAP) { hasMore = true; break; }
    }
    
    const result = { 
      count, 
      has_more: hasMore,
      segmentName: targetSegment.name || "Preview",
      appliedFilters: profileFilters
    };

    if (preview) {
      // Get sample users for preview
      const sampleUsers = await base44.entities.UserPsychographicProfile.filter(
        profileFilters, 
        '-last_analyzed', 
        5
      );
      
      result.sampleUsers = sampleUsers.map(u => ({
        id: u.user_id,
        riskProfile: u.risk_profile || 'unknown',
        cognitiveStyle: u.cognitive_style || 'unknown',
        lastAnalyzed: u.last_analyzed
      }));
    } else {
      // Get user IDs for application (cap for safety)
      const users = await base44.entities.UserPsychographicProfile.filter(
        profileFilters,
        '-last_analyzed',
        1000 // Reasonable limit for bulk operations
      );
      
      result.userIds = users.map(u => u.user_id);
    }

    // Update segment estimated size if it's a real segment and size changed significantly
    if (segmentId && targetSegment && Math.abs(count - (targetSegment.estimated_size || 0)) > Math.max(10, (targetSegment.estimated_size || 0) * 0.1)) {
      await base44.entities.AudienceSegment.update(segmentId, {
        estimated_size: count,
        last_calculated: new Date().toISOString()
      });
    }

    return Response.json(result);

  } catch (error) {
    console.error('Apply audience segment error:', error);
    return Response.json({ 
      error: 'Failed to apply audience segment', 
      details: error.message 
    }, { status: 500 });
  }
});