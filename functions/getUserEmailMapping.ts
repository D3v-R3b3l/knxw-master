import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        // Authentication validation
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized: Missing Authorization header', { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const appUser = await base44.auth.me();
        if (!appUser) {
            return new Response('Unauthorized: Invalid token', { status: 401 });
        }

        const { user_id, client_app_id } = await req.json();

        if (!user_id) {
            return new Response(JSON.stringify({ 
                error: 'user_id is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Strategy 1: Check if user_id is already an email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(user_id)) {
            return new Response(JSON.stringify({
                user_id,
                email: user_id,
                mapping_method: 'direct_email_format',
                confidence: 'high'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Strategy 2: Look for explicit identification events where email was captured
        const identifyEvents = await base44.entities.CapturedEvent.filter({
            user_id,
            event_type: 'identify'
        }, '-timestamp', 10);

        for (const event of identifyEvents) {
            if (event.event_payload?.user_traits?.email) {
                return new Response(JSON.stringify({
                    user_id,
                    email: event.event_payload.user_traits.email,
                    mapping_method: 'identify_event',
                    confidence: 'high'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Strategy 3: Check if Base44 User entity has additional email data
        try {
            const base44Users = await base44.entities.User.filter({
                id: user_id
            }, null, 1);

            if (base44Users.length > 0 && base44Users[0].email) {
                return new Response(JSON.stringify({
                    user_id,
                    email: base44Users[0].email,
                    mapping_method: 'base44_user_lookup',
                    confidence: 'high'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } catch (userLookupError) {
            console.log('Base44 user lookup failed (this is normal for non-Base44 users):', userLookupError.message);
        }

        // Strategy 4: Look for form submission events that might contain email
        const formEvents = await base44.entities.CapturedEvent.filter({
            user_id,
            event_type: 'form_submit'
        }, '-timestamp', 20);

        for (const event of formEvents) {
            if (event.event_payload?.email) {
                return new Response(JSON.stringify({
                    user_id,
                    email: event.event_payload.email,
                    mapping_method: 'form_submission',
                    confidence: 'medium'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Strategy 5: Pattern matching for common user ID formats that might encode email
        // Example: user_john.doe@company.com or user_johndoe_company_com
        const patterns = [
            /user_(.+@.+\..+)$/,                    // user_email@domain.com
            /^(.+@.+\..+)_user$/,                   // email@domain.com_user
            /user_(.+)_(.+)_(.+)$/                  // user_name_domain_com -> name@domain.com
        ];

        for (const pattern of patterns) {
            const match = user_id.match(pattern);
            if (match) {
                let potentialEmail;
                if (pattern === patterns[2]) {
                    // Reconstruct email from parts: user_john_company_com -> john@company.com
                    potentialEmail = `${match[1]}@${match[2]}.${match[3]}`;
                } else {
                    potentialEmail = match[1];
                }

                if (emailRegex.test(potentialEmail)) {
                    return new Response(JSON.stringify({
                        user_id,
                        email: potentialEmail,
                        mapping_method: 'pattern_inference',
                        confidence: 'low'
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            }
        }

        // No email mapping found
        return new Response(JSON.stringify({
            user_id,
            email: null,
            mapping_method: 'none',
            confidence: 'none',
            error: 'Unable to resolve email address for user_id'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in getUserEmailMapping function:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error', 
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});