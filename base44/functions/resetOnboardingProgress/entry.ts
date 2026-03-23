import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset onboarding state completely
    await base44.asServiceRole.entities.User.update(user.id, {
      onboarding_state: {
        onboarding_progress: 0,
        onboarding_completed_steps: [],
        visited_dashboard: false,
        visited_profiles: false,
        visited_events: false,
        visited_insights: false,
        visited_segments: false,
        visited_documentation: false,
        sdk_integrated: false,
        tour_completed: false,
        assistant_dismissed: false,
        last_onboarding_interaction: new Date().toISOString()
      }
    });

    return Response.json({ 
      success: true,
      message: 'Onboarding progress reset successfully'
    });
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});