import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Statistical functions for A/B test analysis
function calculateZScore(successA, totalA, successB, totalB) {
    const pA = successA / totalA;
    const pB = successB / totalB;
    const pooledP = (successA + successB) / (totalA + totalB);
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / totalA + 1 / totalB));
    return (pB - pA) / standardError;
}

function calculatePValue(zScore) {
    // Approximate two-tailed p-value calculation
    const absZ = Math.abs(zScore);
    if (absZ > 6) return 0;
    const p = 0.5 * Math.exp(-0.717 * absZ - 0.416 * absZ * absZ);
    return 2 * p;
}

function calculateConfidenceInterval(success, total, confidenceLevel = 0.95) {
    const rate = success / total;
    const z = confidenceLevel === 0.95 ? 1.96 : 2.58; // 95% or 99%
    const margin = z * Math.sqrt((rate * (1 - rate)) / total);
    return {
        lower: Math.max(0, rate - margin),
        upper: Math.min(1, rate + margin),
        rate
    };
}

// Hash user ID for consistent variant assignment
async function hashUserId(userId, testId) {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + testId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return hashArray[0] / 255; // Convert to 0-1 range
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, ...params } = await req.json();

        switch (action) {
            case 'assign_variant': {
                const { ab_test_id, user_id, client_app_id } = params;

                // Check if user already assigned
                const existingParticipant = await base44.entities.ABTestParticipant.filter({
                    ab_test_id,
                    user_id
                });

                if (existingParticipant.length > 0) {
                    const participant = existingParticipant[0];
                    const variant = await base44.entities.ABTestVariant.get(participant.variant_id);
                    return Response.json({
                        assigned: true,
                        variant_id: participant.variant_id,
                        variant_name: variant.name,
                        configuration: variant.configuration
                    });
                }

                // Get test and variants
                const test = await base44.entities.ABTest.get(ab_test_id);
                if (test.status !== 'running') {
                    return Response.json({ assigned: false, reason: 'test_not_running' });
                }

                const variants = await base44.entities.ABTestVariant.filter({ ab_test_id });
                if (variants.length === 0) {
                    return Response.json({ assigned: false, reason: 'no_variants' });
                }

                // Check traffic allocation
                const userHash = await hashUserId(user_id, ab_test_id);
                if (userHash > test.traffic_allocation) {
                    return Response.json({ assigned: false, reason: 'excluded_from_traffic' });
                }

                // Assign variant based on weights
                const totalWeight = variants.reduce((sum, v) => sum + v.traffic_weight, 0);
                let cumulativeWeight = 0;
                let assignedVariant = variants[0]; // Default fallback

                const variantHash = await hashUserId(user_id + '_variant', ab_test_id);
                for (const variant of variants) {
                    cumulativeWeight += variant.traffic_weight / totalWeight;
                    if (variantHash <= cumulativeWeight) {
                        assignedVariant = variant;
                        break;
                    }
                }

                // Record participation
                await base44.entities.ABTestParticipant.create({
                    ab_test_id,
                    variant_id: assignedVariant.id,
                    user_id,
                    client_app_id,
                    assigned_at: new Date().toISOString(),
                    first_exposure_at: new Date().toISOString()
                });

                return Response.json({
                    assigned: true,
                    variant_id: assignedVariant.id,
                    variant_name: assignedVariant.name,
                    configuration: assignedVariant.configuration
                });
            }

            case 'record_conversion': {
                const { ab_test_id, user_id, metric_name, event_type, value = 1 } = params;

                const participant = await base44.entities.ABTestParticipant.filter({
                    ab_test_id,
                    user_id
                });

                if (participant.length === 0) {
                    return Response.json({ recorded: false, reason: 'not_participant' });
                }

                const p = participant[0];
                const conversionEvent = {
                    metric_name,
                    event_type,
                    value,
                    timestamp: new Date().toISOString()
                };

                // Update participant
                await base44.entities.ABTestParticipant.update(p.id, {
                    converted: true,
                    last_interaction_at: new Date().toISOString(),
                    conversion_events: [...(p.conversion_events || []), conversionEvent]
                });

                // Update variant metrics
                const variant = await base44.entities.ABTestVariant.get(p.variant_id);
                const updatedMetrics = {
                    ...variant.performance_metrics,
                    conversions: (variant.performance_metrics.conversions || 0) + 1,
                    total_events: (variant.performance_metrics.total_events || 0) + value
                };
                
                // Recalculate conversion rate
                if (updatedMetrics.participants > 0) {
                    updatedMetrics.conversion_rate = updatedMetrics.conversions / updatedMetrics.participants;
                }

                await base44.entities.ABTestVariant.update(p.variant_id, {
                    performance_metrics: updatedMetrics
                });

                return Response.json({ recorded: true });
            }

            case 'analyze_test': {
                const { ab_test_id } = params;

                const test = await base44.entities.ABTest.get(ab_test_id);
                const variants = await base44.entities.ABTestVariant.filter({ ab_test_id });
                const participants = await base44.entities.ABTestParticipant.filter({ ab_test_id });

                // Update participant counts
                const variantStats = {};
                variants.forEach(v => {
                    variantStats[v.id] = {
                        variant: v,
                        participants: 0,
                        conversions: 0,
                        conversion_rate: 0
                    };
                });

                participants.forEach(p => {
                    if (variantStats[p.variant_id]) {
                        variantStats[p.variant_id].participants += 1;
                        if (p.converted) {
                            variantStats[p.variant_id].conversions += 1;
                        }
                    }
                });

                // Calculate conversion rates and update variants
                for (const [variantId, stats] of Object.entries(variantStats)) {
                    stats.conversion_rate = stats.participants > 0 ? stats.conversions / stats.participants : 0;
                    
                    await base44.entities.ABTestVariant.update(variantId, {
                        performance_metrics: {
                            participants: stats.participants,
                            conversions: stats.conversions,
                            conversion_rate: stats.conversion_rate,
                            total_events: stats.conversions // Simplified
                        }
                    });
                }

                // Statistical analysis
                const controlVariant = Object.values(variantStats).find(s => s.variant.is_control);
                const testVariants = Object.values(variantStats).filter(s => !s.variant.is_control);

                const results = {
                    test_id: ab_test_id,
                    status: test.status,
                    total_participants: participants.length,
                    control: controlVariant ? {
                        name: controlVariant.variant.name,
                        participants: controlVariant.participants,
                        conversions: controlVariant.conversions,
                        conversion_rate: controlVariant.conversion_rate,
                        confidence_interval: controlVariant.participants >= 30 ? 
                            calculateConfidenceInterval(controlVariant.conversions, controlVariant.participants, test.statistical_settings.confidence_level) : null
                    } : null,
                    variants: testVariants.map(v => {
                        let statistical_significance = null;
                        let lift = null;

                        if (controlVariant && controlVariant.participants >= test.statistical_settings.minimum_sample_size && 
                            v.participants >= test.statistical_settings.minimum_sample_size) {
                            
                            const zScore = calculateZScore(
                                controlVariant.conversions, controlVariant.participants,
                                v.conversions, v.participants
                            );
                            const pValue = calculatePValue(zScore);
                            const isSignificant = pValue < (1 - test.statistical_settings.confidence_level);
                            
                            lift = controlVariant.conversion_rate > 0 ? 
                                ((v.conversion_rate - controlVariant.conversion_rate) / controlVariant.conversion_rate) * 100 : 0;

                            statistical_significance = {
                                z_score: zScore,
                                p_value: pValue,
                                is_significant: isSignificant,
                                confidence_level: test.statistical_settings.confidence_level
                            };
                        }

                        return {
                            name: v.variant.name,
                            participants: v.participants,
                            conversions: v.conversions,
                            conversion_rate: v.conversion_rate,
                            lift_percentage: lift,
                            statistical_significance,
                            confidence_interval: v.participants >= 30 ? 
                                calculateConfidenceInterval(v.conversions, v.participants, test.statistical_settings.confidence_level) : null
                        };
                    }),
                    recommendations: generateRecommendations(variantStats, test)
                };

                // Update test with results
                await base44.entities.ABTest.update(ab_test_id, {
                    results_summary: results
                });

                return Response.json(results);
            }

            case 'stop_test': {
                const { ab_test_id, winner_variant_id } = params;

                await base44.entities.ABTest.update(ab_test_id, {
                    status: 'completed',
                    ended_at: new Date().toISOString(),
                    winner_variant_id: winner_variant_id || null
                });

                return Response.json({ stopped: true });
            }

            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }

    } catch (error) {
        console.error('A/B Test Manager Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateRecommendations(variantStats, test) {
    const recommendations = [];
    const variants = Object.values(variantStats);
    
    // Check sample sizes
    const minSample = test.statistical_settings.minimum_sample_size;
    const underSized = variants.filter(v => v.participants < minSample);
    
    if (underSized.length > 0) {
        recommendations.push({
            type: 'sample_size',
            message: `${underSized.length} variant(s) need more participants before statistical analysis is reliable.`,
            action: 'continue_test'
        });
    }

    // Look for clear winner
    const control = variants.find(v => v.variant.is_control);
    const testVariants = variants.filter(v => !v.variant.is_control);
    
    if (control && testVariants.length > 0) {
        const bestVariant = testVariants.reduce((best, current) => 
            current.conversion_rate > best.conversion_rate ? current : best
        );

        if (bestVariant.conversion_rate > control.conversion_rate * 1.1) { // 10% improvement threshold
            recommendations.push({
                type: 'potential_winner',
                message: `${bestVariant.variant.name} is outperforming control by ${((bestVariant.conversion_rate / control.conversion_rate - 1) * 100).toFixed(1)}%.`,
                action: 'consider_promotion'
            });
        }
    }

    return recommendations;
}