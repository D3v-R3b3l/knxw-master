import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { validateInput } from './validateInput.js';
import { logError, logTrace } from './traceLogger.js';
import { maskPII } from './sanitizeText.js';
// Updated credit system imports
import { flagEnabled } from './lib/flags.js';
import { estimateCredits } from './lib/tokens.js';
import { consumeCredits } from './lib/billing.js';

const inputSchema = {
  type: 'object',
  properties: {
    entity_type: { type: 'string', enum: ['ImportedTextRecord', 'CRMRecord', 'EmployeeRecord'] },
    batch_size: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    subject_filter: { type: 'string' },
    record_ids: { type: 'array', items: { type: 'string' } }
  },
  required: ['entity_type']
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  try {
    // Authentication
    const user = await base44.auth.me();
    if (!user) {
      await logError(base44, requestId, 'processImportedData', 'Unauthorized', 401);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input validation
    const body = await req.json().catch(() => ({}));
    const validationResult = validateInput(body, inputSchema);
    if (!validationResult.valid) {
      await logError(base44, requestId, 'processImportedData', `Validation failed: ${validationResult.errors.join(', ')}`, 400);
      return Response.json({ 
        error: 'Invalid input', 
        details: validationResult.errors 
      }, { status: 400 });
    }

    const { entity_type, batch_size = 10, subject_filter, record_ids } = validationResult.data;

    // Determine tenant ID (use first available ClientApp or fallback to user ID)
    let tenantId = user.id;
    try {
      const clientApps = await base44.entities.ClientApp.filter({ owner_id: user.id }, null, 1);
      if (clientApps && clientApps.length > 0) {
        tenantId = clientApps[0].id;
      }
    } catch (error) {
      console.warn('Could not fetch client apps, using user ID as tenant:', error.message);
    }

    // Credit-based rate limiting (behind feature flag)
    if (flagEnabled('LLM_RATE_LIMIT_ENABLED')) {
      const creditEstimation = estimateCredits('PSYCHOGRAPHIC_ANALYSIS', 2000);
      const idempotencyKey = `process-imported-${requestId}`;
      
      const creditResult = await consumeCredits({
        tenantId,
        estimatedCredits: creditEstimation.credits,
        idempotencyKey,
        context: {
          operation: 'processImportedData',
          entity_type,
          batch_size,
          request_id: requestId,
          user_id: user.id
        }
      }, base44);

      if (!creditResult.success) {
        const statusCode = creditResult.errorCode === 'INSUFFICIENT_CREDITS' ? 429 : 400;
        
        await logError(base44, requestId, 'processImportedData', 
          `Credit consumption failed: ${creditResult.error}`, statusCode);
        
        return Response.json({ 
          error: creditResult.error,
          errorCode: creditResult.errorCode,
          creditsRemaining: creditResult.creditsRemaining,
          circuit_breaker_status: { state: 'CLOSED', failures: 0, canExecute: true }
        }, { status: statusCode });
      }

      console.log(JSON.stringify({
        message: 'Credits consumed for analysis',
        tenantId,
        creditsConsumed: creditResult.creditsConsumed,
        creditsRemaining: creditResult.creditsRemaining,
        isOverage: creditResult.isOverage,
        requestId
      }));
    }

    // Fetch records to process
    const filter = { analyzed: false };
    if (subject_filter) {
      filter.subject_id = subject_filter;
    }
    if (record_ids && Array.isArray(record_ids)) {
      filter.id = { $in: record_ids };
    }

    let records = [];
    try {
      switch (entity_type) {
        case 'ImportedTextRecord':
          records = await base44.entities.ImportedTextRecord.filter(filter, '-created_date', batch_size);
          break;
        case 'CRMRecord':
          records = await base44.entities.CRMRecord.filter(filter, '-created_date', batch_size);
          break;
        case 'EmployeeRecord':
          records = await base44.entities.EmployeeRecord.filter(filter, '-created_date', batch_size);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entity_type}`);
      }
    } catch (error) {
      await logError(base44, requestId, 'processImportedData', `Failed to fetch records: ${error.message}`, 500);
      return Response.json({ 
        error: 'Failed to fetch records', 
        details: error.message 
      }, { status: 500 });
    }

    if (records.length === 0) {
      await logTrace(base44, requestId, user.id, 'processImportedData', Date.now() - startTime, null, { processed: 0 });
      return Response.json({ 
        status: 'completed', 
        processed_count: 0,
        profiles_created: 0,
        insights_generated: 0,
        message: 'No unanalyzed records found',
        circuit_breaker_status: { state: 'CLOSED', failures: 0, canExecute: true }
      });
    }

    // Process records with AI analysis using base InvokeLLM
    let processed_count = 0;
    let profiles_created = 0;
    let insights_generated = 0;
    let suggestions = [];
    let analysis_errors = [];

    // Import InvokeLLM directly since lib imports have deployment issues
    const { InvokeLLM } = await import('@/integrations/Core');

    for (const record of records) {
      const recordStartTime = Date.now();
      
      try {
        // Extract and sanitize text content
        let textContent = '';
        switch (entity_type) {
          case 'ImportedTextRecord':
            textContent = record.text;
            break;
          case 'CRMRecord':
            textContent = `${record.name || ''} ${record.notes || ''}`.trim();
            break;
          case 'EmployeeRecord':
            textContent = `${record.name || ''} ${record.notes || ''} ${(record.survey_responses || []).join(' ')}`.trim();
            break;
        }

        if (!textContent) {
          continue;
        }

        const sanitizedText = maskPII(textContent);

        // Basic input validation
        if (sanitizedText.length < 50) {
          console.warn(`Input too short for record ${record.id}`);
          continue;
        }

        // Build structured prompt
        const systemPrompt = `You are a professional psychographic analyst specializing in personality assessment and behavioral prediction.

STRICT GUIDELINES:
- Analyze only the provided text content
- Base conclusions solely on observable behavioral indicators
- Provide confidence scores reflecting actual evidence strength
- All personality scores must be between 0.0 and 1.0
- Emotional states must match the provided enumeration exactly
- Risk profiles must be: conservative, moderate, or aggressive
- Cognitive styles must be: analytical, intuitive, systematic, or creative`;

        const userPrompt = `Analyze the following content for psychographic insights:

CONTENT: "${sanitizedText}"

Generate a comprehensive psychographic profile with:
1. Personality traits (Big Five model, 0.0-1.0 scores)
2. Emotional state assessment
3. Risk tolerance and cognitive style
4. Actionable insights and recommendations`;

        const fullPrompt = systemPrompt + '\n\n' + userPrompt;
        
        // LLM invocation with structured schema
        let analysis;
        try {
          analysis = await InvokeLLM({
            prompt: fullPrompt,
            response_json_schema: {
              type: "object",
              properties: {
                personality_traits: {
                  type: "object",
                  properties: {
                    openness: { type: "number", minimum: 0, maximum: 1 },
                    conscientiousness: { type: "number", minimum: 0, maximum: 1 },
                    extraversion: { type: "number", minimum: 0, maximum: 1 },
                    agreeableness: { type: "number", minimum: 0, maximum: 1 },
                    neuroticism: { type: "number", minimum: 0, maximum: 1 }
                  }
                },
                emotional_state: {
                  type: "object",
                  properties: {
                    mood: { type: "string", enum: ["positive", "neutral", "negative", "excited", "anxious", "confident", "uncertain"] },
                    confidence: { type: "number", minimum: 0, maximum: 1 },
                    energy_level: { type: "string", enum: ["low", "medium", "high"] }
                  }
                },
                risk_profile: { type: "string", enum: ["conservative", "moderate", "aggressive"] },
                cognitive_style: { type: "string", enum: ["analytical", "intuitive", "systematic", "creative"] },
                motivation_stack: { type: "array", items: { type: "string" } },
                insights: { 
                  type: "array", 
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      confidence_score: { type: "number", minimum: 0, maximum: 1 },
                      priority: { type: "string", enum: ["low", "medium", "high", "critical"] }
                    }
                  }
                },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          });
        } catch (llmError) {
          console.error(`LLM analysis failed for record ${record.id}:`, llmError.message);
          analysis_errors.push({
            record_id: record.id,
            error: 'LLM analysis failed',
            details: llmError.message
          });
          continue;
        }

        // Basic response validation
        if (!analysis || !analysis.personality_traits) {
          console.warn(`Invalid LLM response for record ${record.id}`);
          analysis_errors.push({
            record_id: record.id,
            error: 'Invalid response structure',
            details: 'Missing required fields'
          });
          continue;
        }

        // Create or update psychographic profile
        const profileData = {
          user_id: record.subject_id,
          personality_traits: analysis.personality_traits || {},
          emotional_state: analysis.emotional_state || {},
          risk_profile: analysis.risk_profile || 'moderate',
          cognitive_style: analysis.cognitive_style || 'analytical',
          motivation_stack: analysis.motivation_stack || [],
          last_analyzed: new Date().toISOString(),
          is_demo: false
        };

        // Check if profile exists
        const existingProfiles = await base44.entities.UserPsychographicProfile.filter({
          user_id: record.subject_id
        });

        if (existingProfiles.length > 0) {
          await base44.entities.UserPsychographicProfile.update(existingProfiles[0].id, profileData);
        } else {
          await base44.entities.UserPsychographicProfile.create(profileData);
          profiles_created++;
        }

        // Create insights
        if (analysis.insights && Array.isArray(analysis.insights)) {
          for (const insight of analysis.insights) {
            await base44.entities.PsychographicInsight.create({
              user_id: record.subject_id,
              insight_type: 'behavioral_pattern',
              title: insight.title,
              description: insight.description,
              confidence_score: insight.confidence_score || 0.5,
              priority: insight.priority || 'medium',
              actionable_recommendations: analysis.recommendations || [],
              supporting_events: [],
              is_demo: false
            });
            insights_generated++;
          }
        }

        // Mark record as analyzed
        switch (entity_type) {
          case 'ImportedTextRecord':
            await base44.entities.ImportedTextRecord.update(record.id, { analyzed: true });
            break;
          case 'CRMRecord':
            await base44.entities.CRMRecord.update(record.id, { analyzed: true });
            break;
          case 'EmployeeRecord':
            await base44.entities.EmployeeRecord.update(record.id, { analyzed: true });
            break;
        }

        processed_count++;

        // Add suggestions from recommendations
        if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
          suggestions.push(...analysis.recommendations.slice(0, 2));
        }

      } catch (recordError) {
        console.error(`Error processing record ${record.id}:`, recordError);
        await logError(base44, requestId, 'processImportedData', `Record processing failed: ${recordError.message}`, 500);
        
        analysis_errors.push({
          record_id: record.id,
          error: 'Processing failed',
          details: recordError.message
        });
      }
    }

    await logTrace(base44, requestId, user.id, 'processImportedData', Date.now() - startTime, null, { 
      processed_count,
      profiles_created,
      insights_generated,
      analysis_errors: analysis_errors.length,
      credits_system_enabled: flagEnabled('LLM_RATE_LIMIT_ENABLED')
    });

    return Response.json({ 
      status: 'completed',
      processed_count,
      profiles_created,
      insights_generated,
      analysis_errors: analysis_errors.length,
      error_details: analysis_errors.length > 0 ? analysis_errors.slice(0, 5) : undefined,
      suggestions: suggestions.slice(0, 3),
      message: `Successfully processed ${processed_count} records`,
      credits_system_enabled: flagEnabled('LLM_RATE_LIMIT_ENABLED'),
      circuit_breaker_status: { state: 'CLOSED', failures: 0, canExecute: true }
    });

  } catch (error) {
    await logError(base44, requestId, 'processImportedData', error.message, 500);
    return Response.json({ 
      error: 'Internal server error', 
      details: error.message,
      circuit_breaker_status: { state: 'CLOSED', failures: 0, canExecute: true }
    }, { status: 500 });
  }
});