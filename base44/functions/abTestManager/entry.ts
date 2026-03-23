import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function calculateZScore(successA, totalA, successB, totalB) {
    if (!totalA || !totalB) return 0;
    const pA = successA / totalA;
    const pB = successB / totalB;
    const pooledP = (successA + successB) / (totalA + totalB);
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / totalA + 1 / totalB));
    if (!standardError) return 0;
    return (pB - pA) / standardError;
}

function calculatePValue(zScore) {
    const absZ = Math.abs(zScore);
    if (absZ > 6) return 0;
    const p = 0.5 * Math.exp(-0.717 * absZ - 0.416 * absZ * absZ);
    return 2 * p;
}

function calculateConfidenceInterval(success, total, confidenceLevel = 0.95) {
    if (!total) {
        return { lower: 0, upper: 0, rate: 0 };
    }
    const rate = success / total;
    const z = confidenceLevel >= 0.99 ? 2.58 : 1.96;
    const margin = z * Math.sqrt((rate * (1 - rate)) / total);
    return {
        lower: Math.max(0, rate - margin),
        upper: Math.min(1, rate + margin),
        rate
    };
}

function getStatisticalSettings(test) {
    return {
        confidence_level: test?.statistical_settings?.confidence_level || 0.95,
        minimum_sample_size: test?.statistical_settings?.minimum_sample_size || 100,
        minimum_duration_hours: test?.statistical_settings?.minimum_duration_hours || 24,
        maximum_duration_days: test?.statistical_settings?.maximum_duration_days || 30,
        early_stopping_enabled: test?.statistical_settings?.early_stopping_enabled !== false
    };
}

function generateRecommendations(variantStats, settings) {
    const recommendations = [];
    const variants = Object.values(variantStats);
    const minSample = settings.minimum_sample_size;
    const underSized = variants.filter((variant) => variant.participants < minSample);

    if (underSized.length > 0) {
        recommendations.push({
            type: 'sample_size',
            message: `${underSized.length} variant(s) need more participants before statistical analysis is reliable.`,
            action: 'continue_test'
        });
    }

    const control = variants.find((variant) => variant.variant.is_control) || variants[0];
    const testVariants = variants.filter((variant) => variant.variant.id !== control?.variant.id);
    if (control && testVariants.length > 0) {
        const bestVariant = testVariants.reduce((best, current) => current.conversion_rate > best.conversion_rate ? current : best, testVariants[0]);
        if (control.conversion_rate > 0 && bestVariant.conversion_rate > control.conversion_rate * 1.1) {
            recommendations.push({
                type: 'potential_winner',
                message: `${bestVariant.variant.name} is outperforming ${control.variant.name} by ${((bestVariant.conversion_rate / control.conversion_rate - 1) * 100).toFixed(1)}%.`,
                action: 'consider_promotion'
            });
        }
    }

    return recommendations;
}

async function analyzeTest(base44, ab_test_id) {
    const test = await base44.asServiceRole.entities.ABTest.get(ab_test_id);
    const variants = await base44.asServiceRole.entities.ABTestVariant.filter({ ab_test_id });
    const participants = await base44.asServiceRole.entities.ABTestParticipant.filter({ ab_test_id });
    const settings = getStatisticalSettings(test);

    const variantStats = {};
    variants.forEach((variant, index) => {
        variantStats[variant.id] = {
            variant: {
                ...variant,
                is_control: variant.is_control || index === 0
            },
            participants: 0,
            conversions: 0,
            conversion_rate: 0,
            avg_engagement_score: 0,
            total_value: 0,
            total_events: 0
        };
    });

    participants.forEach((participant) => {
        const stats = variantStats[participant.variant_id];
        if (!stats) return;
        stats.participants += 1;
        if (participant.converted) {
            stats.conversions += 1;
        }
        const conversionEvents = participant.conversion_events || [];
        stats.total_events += conversionEvents.length;
        stats.total_value += conversionEvents.reduce((sum, event) => sum + Number(event.value || 0), 0);
    });

    for (const [variantId, stats] of Object.entries(variantStats)) {
        stats.conversion_rate = stats.participants > 0 ? stats.conversions / stats.participants : 0;
        stats.avg_engagement_score = stats.total_events > 0 ? stats.total_value / stats.total_events : 0;
        await base44.asServiceRole.entities.ABTestVariant.update(variantId, {
            is_control: stats.variant.is_control,
            metrics: {
                ...(stats.variant.metrics || {}),
                impressions: stats.participants,
                conversions: stats.conversions,
                conversion_rate: parseFloat(stats.conversion_rate.toFixed(4)),
                avg_engagement_score: parseFloat(stats.avg_engagement_score.toFixed(4))
            }
        });
    }

    const allStats = Object.values(variantStats);
    const controlVariant = allStats.find((stats) => stats.variant.is_control) || allStats[0] || null;
    const comparisonVariants = allStats.filter((stats) => stats.variant.id !== controlVariant?.variant.id);

    const results = {
        test_id: ab_test_id,
        status: test.status,
        total_participants: participants.length,
        control: controlVariant ? {
            id: controlVariant.variant.id,
            name: controlVariant.variant.name,
            participants: controlVariant.participants,
            conversions: controlVariant.conversions,
            conversion_rate: controlVariant.conversion_rate,
            confidence_interval: controlVariant.participants > 0 ? calculateConfidenceInterval(controlVariant.conversions, controlVariant.participants, settings.confidence_level) : null
        } : null,
        variants: comparisonVariants.map((stats) => {
            let lift = null;
            let statistical_significance = null;
            if (controlVariant && controlVariant.participants >= settings.minimum_sample_size && stats.participants >= settings.minimum_sample_size) {
                const zScore = calculateZScore(controlVariant.conversions, controlVariant.participants, stats.conversions, stats.participants);
                const pValue = calculatePValue(zScore);
                lift = controlVariant.conversion_rate > 0 ? ((stats.conversion_rate - controlVariant.conversion_rate) / controlVariant.conversion_rate) * 100 : 0;
                statistical_significance = {
                    z_score: zScore,
                    p_value: pValue,
                    is_significant: pValue < (1 - settings.confidence_level),
                    confidence_level: settings.confidence_level
                };
            }
            return {
                id: stats.variant.id,
                name: stats.variant.name,
                participants: stats.participants,
                conversions: stats.conversions,
                conversion_rate: stats.conversion_rate,
                lift_percentage: lift,
                statistical_significance,
                confidence_interval: stats.participants > 0 ? calculateConfidenceInterval(stats.conversions, stats.participants, settings.confidence_level) : null
            };
        }),
        recommendations: generateRecommendations(variantStats, settings)
    };

    await base44.asServiceRole.entities.ABTest.update(ab_test_id, {
        results_summary: results
    });

    return results;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, ...params } = await req.json();

        switch (action) {
            case 'assign_variant': {
                const response = await base44.functions.invoke('psychographicABAssign', params);
                return Response.json(response?.data || {});
            }

            case 'record_conversion': {
                const response = await base44.functions.invoke('recordABTestConversion', {
                    user_id: params.user_id,
                    ab_test_id: params.ab_test_id,
                    metric_name: params.metric_name || 'conversion',
                    value: params.value || 1
                });
                return Response.json(response?.data || {});
            }

            case 'analyze_test': {
                const results = await analyzeTest(base44, params.ab_test_id);
                return Response.json(results);
            }

            case 'stop_test': {
                const { ab_test_id, winner_variant_id } = params;
                await base44.asServiceRole.entities.ABTest.update(ab_test_id, {
                    status: 'completed',
                    end_date: new Date().toISOString(),
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